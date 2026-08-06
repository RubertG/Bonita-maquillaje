import { config } from "dotenv"
config({ path: ".env.local" })

import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore, Timestamp } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"
import { ROUTES_COLLECTIONS } from "../src/consts/db/db"
import { FileStateItem } from "../src/types/admin/admin"

// Source of truth: "INVENTARIO PAGINA WEB (2).xlsx" (Lidia's inventory sheet).
// The sheet lists product name + target category; ids below were resolved by
// matching those names against the products collection.
//
// This script does three things, in order:
//   1. writes a verified backup of the whole products collection to disk,
//      including a local copy of every image it is about to delete. Nothing is
//      written to Firestore until that backup reads back byte-for-byte.
//   2. rewrites `category` on every product the sheet classifies, moving the live
//      catalog from cat1/cat2/cat3 to the new taxonomy.
//   3. hard-deletes the products absent from the sheet, together with their
//      Storage images.
//
// Run `pnpm seed-categories` first — the target categories must already exist.
// To undo: pnpm restore-products-backup <path-to-backup.json>
const BACKUPS_DIR = resolve(process.cwd(), "backups")
const BACKUP_VERSION = 1
const PRODUCT_STAGING_CATEGORIES = [
  // accesorios-de-maquillaje
  { id: "70c3488c-baca-424a-8d56-6da642bb17de", category: "accesorios-de-maquillaje", name: "Blender diamond set beauty blender x 3 Bloomshell" },
  { id: "ac1042ab-7b08-41b4-8d51-2ceb2c8d6b0d", category: "accesorios-de-maquillaje", name: "BORLA TRIANGULAR PARA POLVO X2" },
  { id: "885fdaa7-1459-4464-8ca2-9ab298442c0b", category: "accesorios-de-maquillaje", name: "Borlas Ani-K" },
  { id: "71b2eece-7386-42e8-a23c-81e1eb13cb6e", category: "accesorios-de-maquillaje", name: "Encrespador Tornasol Bloomshell" },

  // bases-y-correctores
  { id: "5b609a1f-7c18-488a-850f-e861de2011eb", category: "bases-y-correctores", name: "Base Atenea 50 ML" },
  { id: "279fad20-1833-4b44-b862-be731521a889", category: "bases-y-correctores", name: "Base Bonita Anik" },
  { id: "0ac836a3-1684-4af2-9c1d-981a9b41a7ab", category: "bases-y-correctores", name: "Base De Maquillaje Líquido 1ST SCENE MINI 30 ML" },
  { id: "67e0b38c-6118-41e3-b84c-fee6fba2cc40", category: "bases-y-correctores", name: "Corrector Colección Celestial Miis Cosmetics" },
  { id: "91202f9f-bddd-4d5f-a0b3-e75890ed810e", category: "bases-y-correctores", name: "Corrector De Ojeras Anik" },
  { id: "83365c5b-c030-4e73-9a71-f8265b1361f9", category: "bases-y-correctores", name: "Corrector de Ojeras Bloomshell" },
  { id: "6ff2b709-3469-4324-ae64-d71f06012313", category: "bases-y-correctores", name: "CORRECTOR LIQUIDO 1ST SCENE ATENEA" },
  { id: "e7ccf94f-e2bb-48a3-be04-c5d409fd92d6", category: "bases-y-correctores", name: "TINTA DE MAQUILLAJE/ SERUM TINTED" },

  // brochas
  { id: "2bac44da-4c11-4aeb-81df-87d936faa2e8", category: "brochas", name: "Brocha Abanico Ushas" },
  { id: "fcd633bd-7ab1-4c43-ba99-c7738dcb5d5a", category: "brochas", name: "Brocha Para Cejas 2 En 1 Colores Escarcha" },
  { id: "3bfbe6d0-c860-4032-ba1f-e09b2c6883b9", category: "brochas", name: "Brocha Para Cejas 2 En 1 Cosmos Miis Cosmetics" },
  { id: "5ae5c394-5fe7-415a-ae12-58961d0f99d5", category: "brochas", name: "Brocha Profesional Lengua De Gato Miis Cosmetics" },
  { id: "90f26be0-1ef3-465d-8122-9a791f03c43c", category: "brochas", name: "Brocha Profesional Para Corrector Miis Cosmetics" },
  { id: "2d290d6a-02e2-47f8-b6f3-02a71bd5d4c4", category: "brochas", name: "Brocha Profesional Para Rostro Miis Cosmetics" },
  { id: "5cad99b8-76b5-4f70-b0f6-141edd13e962", category: "brochas", name: "BROCHAS ROSE ELEGANCE KIT X 10" },
  { id: "31e39fdd-9ebf-4d7d-8561-b61527d97dc1", category: "brochas", name: "Set de brochas kabuki x 10" },
  { id: "7ad1c6be-37cd-452f-920b-c416ef9c080a", category: "brochas", name: "Set de brochas mini viajeras" },

  // bronzer-y-contornos
  { id: "2514eaa9-75be-431a-9789-43dd60ac0b1e", category: "bronzer-y-contornos", name: "Bronzer stick atenea toasted coconut contorno en barra" },
  { id: "4376c5b8-cb2b-43ff-be16-e593fcb33538", category: "bronzer-y-contornos", name: "Contorno Bloom Cream" },
  { id: "86d69e91-9473-405c-9856-4f22de27f92e", category: "bronzer-y-contornos", name: "CONTORNO EN STICK SUBLIME ATENEA" },

  // cajas-de-maquillaje
  { id: "0ebe3597-8e1a-41d8-bff6-61b418cfbce2", category: "cajas-de-maquillaje", name: "KIT CORPORAL BIOAQUA" },
  { id: "211f74fd-71da-4004-bec3-1c24dc806523", category: "cajas-de-maquillaje", name: "KIT SKINCARE BIOAQUA" },

  // cuidado-facial
  { id: "59658a5d-33d5-4d1e-b9ed-9c0b18f83705", category: "cuidado-facial", name: "Aceite Desmaquillante Trendy REF ADT862" },
  { id: "535a1946-aa17-4a42-ab20-ab48da4b2ee8", category: "cuidado-facial", name: "Bloom Cleanser" },
  { id: "56ce75d9-988d-4772-b2c9-309eae89738b", category: "cuidado-facial", name: "Bloom Essential Cream" },
  { id: "559059fb-0c41-4de6-bef2-163e03d86bbf", category: "cuidado-facial", name: "Bloom Mist Repair" },
  { id: "7e581ce7-41ac-49c4-b30b-65262b3b8ead", category: "cuidado-facial", name: "Bloom Repair Cream" },
  { id: "2d18187d-89e2-45f8-91e3-9f502ff6879b", category: "cuidado-facial", name: "Bloom Serum Balance" },
  { id: "a5a50377-b5e7-4e92-9121-2852ad5e67fd", category: "cuidado-facial", name: "Colágeno Para Labios Miis Cosmetics" },
  { id: "1592445e-1071-4a48-98b5-366b7321f2fc", category: "cuidado-facial", name: "Colágeno Para Ojos Miis Cosmetics" },
  { id: "a9c3bb65-f464-4ccc-b37e-75de024e1e4f", category: "cuidado-facial", name: "Contorno De Ojos Miis Cosmetics" },
  { id: "8efb683e-feb8-4912-892c-e60627509d9e", category: "cuidado-facial", name: "Jabón Facial Trendy Skincare 120ml Ref JLF682" },
  { id: "fe00a288-8136-473c-a882-d26ed10fe886", category: "cuidado-facial", name: "Protector Solar Facial Hombre Trendy" },
  { id: "ef671a33-0421-462a-b93a-589d4d9b408d", category: "cuidado-facial", name: "Protector Solar Miis Cosmetics" },
  { id: "7c37cb28-84d8-41c4-b9ee-bd1f1554a8c4", category: "cuidado-facial", name: "Removedor De Maquillaje Skin Care Miis Cosmetics" },

  // fijador-y-primer — sheet calls it "PRIMER Y FIJADOR"; same category, existing id kept
  { id: "c9be0af0-f212-46d0-8d21-76f911a50bce", category: "fijador-y-primer", name: "Fijador de Maquillaje - Holy Fix" },
  { id: "b24f6849-3e18-4526-a5b8-c0f5d4d487c7", category: "fijador-y-primer", name: "Fijador De Maquillaje Everlast Miis Cosmetics" },
  { id: "a176113a-a8c8-45c5-999a-71cb4fbcded0", category: "fijador-y-primer", name: "Primer Matificante Samy 30 gr" },
  { id: "3141ad45-02cb-475e-a049-37c0ffc1f28b", category: "fijador-y-primer", name: "Primer Siliconado Perfection Miis" },
  { id: "ee244464-13f8-4dbd-947c-42d24bdc0061", category: "fijador-y-primer", name: "Primer Spray MyK" },

  // labios
  { id: "a176cd19-f1ed-482a-9cc9-88e6ecf46471", category: "labios", name: "Bloom Dulce Destello Bloomshell" },
  { id: "d2f91b10-1924-4737-b99d-2a329770d15c", category: "labios", name: "Bloom sublime xl" },
  { id: "2d5b9775-742a-45cf-8ee1-05813ddae8ef", category: "labios", name: "BUBBLE TINT BLOOMSHELL" },
  { id: "d393a3fa-9a17-46ba-b68b-b7ba4cfc3761", category: "labios", name: "Duo nude + mini gloss hidratante – Bloomshell" },
  { id: "44a84962-1e9e-4ef0-84bc-49d288c4fedd", category: "labios", name: "Hidratante de Labios Lip Balm Anik" },
  { id: "9cd56b7e-165a-4398-a4b0-965145638489", category: "labios", name: "Lápiz de Labios Signature Bloomshell" },
  { id: "83f0a1b1-e39d-409a-a583-20b8083ed7e6", category: "labios", name: "LAPIZ DELINEADOR ATENEA" },
  { id: "b6e457d2-f472-4424-be27-62c62b9f03ef", category: "labios", name: "Lápiz Delineador De Labios Nude Lips Miis Cosmetics" },
  { id: "5c6bbea1-122a-42f1-8208-63698294f311", category: "labios", name: "LIP LINER ANIK" },
  { id: "105cfff9-8416-4e1d-9f36-799ba68c4a37", category: "labios", name: "lipgloss Bonita" },
  { id: "fe7053f2-a3c6-4ffa-9ba9-2fdfb0bc701e", category: "labios", name: "Mimosa (brillo labial/ lip gloss)" },

  // ojos
  { id: "35ba782b-4b31-43e4-9cd7-e49d8a1135b2", category: "ojos", name: "DELINEADOR RADIANTE ANIK" },
  { id: "523f4898-a81f-4049-8909-bb0ceafe3707", category: "ojos", name: "Gel de cejas bloomshell" },
  { id: "226e4f17-9fba-4f3a-af72-c9f9956918af", category: "ojos", name: "Pegante Dark Tone Pfiffery" },
  { id: "46d02332-45e7-494e-9aed-cd6b8011ef3d", category: "ojos", name: "PESTAÑINA 1ST SCENE LINE ATENEA" },
  { id: "b95cac83-cfd8-41d7-907a-7c6998be7103", category: "ojos", name: "Pestañina Prosa" },

  // polvos-sueltos-y-compactos
  { id: "1d833985-1af9-42cf-b969-cc263d09e5b0", category: "polvos-sueltos-y-compactos", name: "Bloom filter Linea Premium (polvo suelto)" },
  { id: "9a09b0f9-699d-4c80-9c59-fe085b95c720", category: "polvos-sueltos-y-compactos", name: "Polvo Suelto Raquel" },

  // rubor-e-iluminador
  { id: "a08c1764-3176-41c2-af29-2080f69822ff", category: "rubor-e-iluminador", name: "ILUMINADOR COMPACTO 1ST SCENE" },
  { id: "7df6decb-c4fb-42ee-ad56-70feabc0750a", category: "rubor-e-iluminador", name: "Iluminador Shine Bomb Melu" },
  { id: "ecf58956-85b4-425f-9d54-4f88a5c6f0b1", category: "rubor-e-iluminador", name: "Rubor Compacto Ani-k" },
  { id: "41ce6307-f751-44dc-8579-e781e4a3e635", category: "rubor-e-iluminador", name: "RUBOR COMPACTO SUBLIME" },
  { id: "da12ec03-2e06-4bfa-ae77-c26ab412c53a", category: "rubor-e-iluminador", name: "Rubor Cremoso En Barra Collection" },
  { id: "45e9b9a9-bee4-4032-90fa-3c6deb666736", category: "rubor-e-iluminador", name: "RUBOR CREMOSO EN BARRA SUBLIME ATENEA" },
  { id: "68e060bc-d989-4205-9ee7-3dad9733ddfa", category: "rubor-e-iluminador", name: "RUBOR E ILUMINADOR LULA" },
  { id: "ce876052-2a23-401d-aee9-22d7b24cd3ff", category: "rubor-e-iluminador", name: "Rubor Líquido Bonita" },
  // The sheet lists "rubor mágico bloomshell" twice, under RUBOR E ILUMINADOR (row 37)
  // and under LABIOS (row 47), but only one product carries that name. Row 37 wins.
  { id: "74d5c32f-574b-438c-a088-75b098093e6e", category: "rubor-e-iluminador", name: "Rubor mágico Bloomshell" },
  { id: "226369d3-d8b2-4c55-9e08-36d58eac97e1", category: "rubor-e-iluminador", name: "Velvet rubor x 3 (rubor/blush highlight)(Terracota) tono 3" },

  // sombras
  { id: "d14346ea-2689-46be-84d2-d19007b9f11b", category: "sombras", name: "Paleta de sombras Luxury tono 2" },
  { id: "aa2d611c-45b1-417d-b515-2af31da89e31", category: "sombras", name: "Sombra 9 Tonos Romantic Ushas Tonos A" }
]

// Products that exist in Firestore but have no row in the sheet, so they are
// discontinued. Both the document and its Storage images are removed.
const PRODUCTS_TO_DELETE = [
  { id: "47c4e56f-8f7c-4b75-a07c-b6fe9215a79d", name: "BRONZER COMPACTO SUBLIME ATENEA" },
  { id: "ade33ffa-0cdb-4dc1-9d66-bfc1e3bb6212", name: "RAMO DE MAQUILLAJE" }
]

// Storage folder the admin panel uploads product images into. See
// use-create-product-form.ts and options-product.tsx.
const PRODUCTS_STORAGE_FOLDER = "products"

const BATCH_LIMIT = 400

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")
const storageBucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Missing Firebase Admin SDK credentials. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local."
  )
  process.exit(1)
}

if (!storageBucket) {
  console.error("Missing NEXT_PUBLIC_STORAGE_BUCKET in .env.local — product images cannot be deleted without it.")
  process.exit(1)
}

const existingApp = getApps().at(0)
const app = existingApp || initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
  storageBucket
})

const db = getFirestore(app)
const bucket = getStorage(app).bucket()

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

interface BackupEntry {
  id: string
  data: Record<string, unknown>
}

interface BackupImage {
  productId: string
  storagePath: string
  localFile: string
  size: number
  md5: string
}

interface BackupPayload {
  version: number
  createdAt: string
  projectId: string
  bucket: string
  collection: string
  count: number
  products: BackupEntry[]
  images: BackupImage[]
}

// Firestore Timestamps do not survive JSON, so they are tagged on the way out and
// rebuilt by restore-products-backup.ts. Everything else round-trips as-is.
function encodeValue(value: unknown): unknown {
  if (value instanceof Timestamp) {
    return { __type__: "timestamp", value: value.toDate().toISOString() }
  }
  if (Array.isArray(value)) return value.map(encodeValue)
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, encodeValue(item)])
    )
  }
  return value
}

// Key order is normalized so the same document always hashes the same way, which
// is what makes the read-back comparison meaningful.
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b)
    )
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(",")}}`
  }
  return JSON.stringify(value) ?? "null"
}

const hashOf = (value: unknown) => createHash("sha256").update(stableStringify(value)).digest("hex")

async function writeVerifiedBackup(
  entries: BackupEntry[],
  imagesToCopy: { productId: string; storagePath: string }[]
): Promise<string> {
  mkdirSync(BACKUPS_DIR, { recursive: true })

  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const backupPath = join(BACKUPS_DIR, `products-${stamp}.json`)
  const imagesDir = join(BACKUPS_DIR, `products-${stamp}-images`)

  // Images come down first: a backup that claims to hold them must actually hold
  // them before Firestore is touched.
  const images: BackupImage[] = []
  if (imagesToCopy.length > 0) {
    mkdirSync(imagesDir, { recursive: true })

    for (const image of imagesToCopy) {
      const file = bucket.file(image.storagePath)
      const [exists] = await file.exists()
      if (!exists) {
        console.warn(`  ! ${image.storagePath} is not in Storage — nothing to back up`)
        continue
      }

      const [contents] = await file.download()
      const localName = image.storagePath.replace(/[\\/]/g, "_")
      const localFile = join(imagesDir, localName)
      writeFileSync(localFile, contents)

      const [metadata] = await file.getMetadata()
      const localSize = statSync(localFile).size
      const localMd5 = createHash("md5").update(readFileSync(localFile)).digest("base64")

      // Storage exposes the object's md5, so the copy is compared by content and
      // not merely by length — a same-size corruption would slip past a size check.
      if (metadata.md5Hash && metadata.md5Hash !== localMd5) {
        throw new Error(
          `backup of ${image.storagePath} does not match Storage: md5 ${localMd5} vs ${metadata.md5Hash}`
        )
      }
      if (!metadata.md5Hash && Number(metadata.size ?? 0) !== localSize) {
        throw new Error(
          `backup of ${image.storagePath} is truncated: Storage reports ${metadata.size} bytes, local copy has ${localSize}`
        )
      }

      images.push({
        productId: image.productId,
        storagePath: image.storagePath,
        localFile: localName,
        size: localSize,
        md5: localMd5
      })
      console.log(`  saved ${image.storagePath} -> ${localName} (${localSize} bytes, md5 verified)`)
    }
  }

  const payload: BackupPayload = {
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    projectId: projectId!,
    bucket: storageBucket!,
    collection: ROUTES_COLLECTIONS.PRODUCTS,
    count: entries.length,
    products: entries,
    images
  }

  writeFileSync(backupPath, JSON.stringify(payload, null, 1), "utf8")

  // Read it back off disk and prove it matches what was read from Firestore.
  // A backup nobody verified is not a backup.
  const reloaded = JSON.parse(readFileSync(backupPath, "utf8")) as BackupPayload

  if (reloaded.count !== entries.length || reloaded.products.length !== entries.length) {
    throw new Error(
      `backup verification failed: expected ${entries.length} products, file holds ${reloaded.products.length}`
    )
  }

  const reloadedById = new Map(reloaded.products.map(entry => [entry.id, entry]))
  for (const entry of entries) {
    const found = reloadedById.get(entry.id)
    if (!found) throw new Error(`backup verification failed: product ${entry.id} is missing from the file`)
    if (hashOf(found.data) !== hashOf(entry.data)) {
      throw new Error(`backup verification failed: product ${entry.id} does not match what was read from Firestore`)
    }
  }

  for (const image of images) {
    const localFile = join(imagesDir, image.localFile)
    if (!existsSync(localFile)) {
      throw new Error(`backup verification failed: image copy ${image.localFile} is missing`)
    }
    const md5 = createHash("md5").update(readFileSync(localFile)).digest("base64")
    if (md5 !== image.md5) {
      throw new Error(`backup verification failed: image copy ${image.localFile} does not match its recorded md5`)
    }
  }

  console.log(`\nBackup verified: ${backupPath}`)
  console.log(`  ${reloaded.products.length} product document(s), ${images.length} image file(s)`)
  return backupPath
}

async function syncProductsFromInventory() {
  const dryRun = process.argv.includes("--dry-run")
  const confirmDelete = process.argv.includes("--confirm-delete")
  const backupOnly = process.argv.includes("--backup-only")
  const products = db.collection(ROUTES_COLLECTIONS.PRODUCTS)
  const categories = db.collection(ROUTES_COLLECTIONS.CATEGORIES)

  const [productSnapshot, categorySnapshot] = await Promise.all([products.get(), categories.get()])

  const productDocs = new Map(productSnapshot.docs.map(doc => [doc.id, doc]))
  const categoryIds = new Set(categorySnapshot.docs.map(doc => doc.id))
  const errors: string[] = []
  const warnings: string[] = []

  // 1. No product may appear twice, nor be reclassified and deleted at once.
  const seen = new Set<string>()
  PRODUCT_STAGING_CATEGORIES.forEach(entry => {
    if (seen.has(entry.id)) errors.push(`duplicate mapping for product ${entry.id} (${entry.name})`)
    seen.add(entry.id)
  })
  PRODUCTS_TO_DELETE.forEach(entry => {
    if (seen.has(entry.id)) errors.push(`product ${entry.id} (${entry.name}) is both reclassified and deleted`)
  })

  // 2. Every target category must already exist — run `pnpm seed-categories` first.
  const missingCategories = [
    ...new Set(PRODUCT_STAGING_CATEGORIES.map(entry => entry.category))
  ].filter(id => !categoryIds.has(id))
  missingCategories.forEach(id =>
    errors.push(`target category "${id}" does not exist — run "pnpm seed-categories" first`)
  )

  // 3. A mapped product that is gone has nothing left to reclassify, so it is only
  //    reported. Its name must still match the sheet though — a renamed product
  //    means this mapping was built against older data.
  PRODUCT_STAGING_CATEGORIES.forEach(entry => {
    const doc = productDocs.get(entry.id)
    if (!doc) {
      warnings.push(`product ${entry.id} (${entry.name}) no longer exists in Firestore — skipped`)
      return
    }
    const actual = String(doc.data().name ?? "")
    if (normalize(actual) !== normalize(entry.name)) {
      warnings.push(`product ${entry.id} renamed: sheet "${entry.name}" vs Firestore "${actual}"`)
    }
  })

  // 4. Deleting the wrong document is unrecoverable, so the name must match too.
  PRODUCTS_TO_DELETE.forEach(entry => {
    const doc = productDocs.get(entry.id)
    if (!doc) {
      warnings.push(`product ${entry.id} (${entry.name}) is already gone — nothing to delete`)
      return
    }
    const actual = String(doc.data().name ?? "")
    if (normalize(actual) !== normalize(entry.name)) {
      errors.push(
        `refusing to delete ${entry.id}: expected "${entry.name}" but Firestore holds "${actual}"`
      )
    }
  })

  // 5. Fail closed on products this script knows nothing about, so anything added
  //    after the sheet was exported is never silently skipped — or deleted.
  const knownIds = new Set([
    ...PRODUCT_STAGING_CATEGORIES.map(entry => entry.id),
    ...PRODUCTS_TO_DELETE.map(entry => entry.id)
  ])
  productSnapshot.docs
    .filter(doc => !knownIds.has(doc.id))
    .forEach(doc =>
      errors.push(
        `product ${doc.id} ("${doc.data().name}") is not in the mapping nor in PRODUCTS_TO_DELETE`
      )
    )

  const pending = PRODUCT_STAGING_CATEGORIES.filter(entry => {
    const doc = productDocs.get(entry.id)
    return doc !== undefined && doc.data().category !== entry.category
  })

  const deletable = PRODUCTS_TO_DELETE.map(entry => {
    const doc = productDocs.get(entry.id)
    const imgs = (doc?.data().imgs ?? []) as FileStateItem[]
    return { ...entry, exists: doc !== undefined, imgs }
  }).filter(entry => entry.exists)

  // The plan is printed before the checks so a dry run stays useful even when the
  // categories have not been seeded yet.
  console.log(`Products in Firestore: ${productSnapshot.size}`)
  console.log(`\n${pending.length} product(s) to reclassify:`)
  pending.forEach(entry => {
    const current = productDocs.get(entry.id)?.data()
    console.log(`  - ${entry.name}: ${current?.category} -> ${entry.category}`)
  })

  console.log(`\n${deletable.length} product(s) to DELETE:`)
  deletable.forEach(entry => {
    console.log(`  - ${entry.id} "${entry.name}" (${entry.imgs.length} image(s))`)
    entry.imgs.forEach(img => console.log(`      ${PRODUCTS_STORAGE_FOLDER}/${img.name}`))
    if (entry.imgs.length === 0) console.log("      (no images recorded on the document)")
  })

  // --backup-only writes and verifies the backup, then stops. It reads Firestore
  // and Storage but never writes to either, so it is safe to run at any time — and
  // it is how the backup path gets exercised before the real run.
  if (backupOnly) {
    console.log("\nWriting backup only — Firestore and Storage will not be modified.")
    const path = await writeVerifiedBackup(
      productSnapshot.docs.map(doc => ({ id: doc.id, data: encodeValue(doc.data()) as Record<string, unknown> })),
      deletable.flatMap(entry =>
        entry.imgs.map(img => ({ productId: entry.id, storagePath: `${PRODUCTS_STORAGE_FOLDER}/${img.name}` }))
      )
    )
    console.log(`\nTo check it restores cleanly: pnpm restore-products-backup ${path} --dry-run`)
    return
  }

  if (warnings.length > 0) {
    console.warn(`\n${warnings.length} warning(s):`)
    warnings.forEach(warning => console.warn(`  ! ${warning}`))
  }

  if (errors.length > 0) {
    console.error(`\n${errors.length} error(s) — nothing was written:`)
    errors.forEach(error => console.error(`  x ${error}`))
    process.exit(1)
  }

  if (dryRun) {
    console.log("\nDry run complete. No writes were committed.")
    return
  }

  if (deletable.length > 0 && !confirmDelete) {
    console.error(
      `\nRefusing to run: ${deletable.length} product(s) would be permanently deleted along with their images.` +
      "\nRe-run with --confirm-delete once the list above is correct."
    )
    process.exit(1)
  }

  if (pending.length === 0 && deletable.length === 0) {
    console.log("\nEverything is already in sync. Nothing to do.")
    return
  }

  // Everything below overwrites or destroys data, so the backup goes first and its
  // failure aborts the run. The snapshot backed up is the exact one the plan above
  // was computed from.
  console.log("\nWriting backup before touching anything...")
  const backupPath = await writeVerifiedBackup(
    productSnapshot.docs.map(doc => ({ id: doc.id, data: encodeValue(doc.data()) as Record<string, unknown> })),
    deletable.flatMap(entry =>
      entry.imgs.map(img => ({ productId: entry.id, storagePath: `${PRODUCTS_STORAGE_FOLDER}/${img.name}` }))
    )
  )

  for (let start = 0; start < pending.length; start += BATCH_LIMIT) {
    const chunk = pending.slice(start, start + BATCH_LIMIT)
    const batch = db.batch()
    chunk.forEach(entry => {
      batch.update(products.doc(entry.id), { category: entry.category })
    })
    await batch.commit()
    console.log(`Reclassified ${chunk.length} product(s)`)
  }

  for (const entry of deletable) {
    // The document goes first, mirroring the admin panel: a failed delete never
    // leaves a product pointing at images that are already gone.
    await products.doc(entry.id).delete()
    console.log(`Deleted document ${entry.id} "${entry.name}"`)

    for (const img of entry.imgs) {
      const path = `${PRODUCTS_STORAGE_FOLDER}/${img.name}`
      try {
        await bucket.file(path).delete()
        console.log(`  removed ${path}`)
      } catch (error) {
        // A missing object is not a failure — the document is already gone and
        // re-running would otherwise abort on it forever.
        const code = (error as { code?: number }).code
        if (code === 404) {
          console.warn(`  ! ${path} was already missing from Storage`)
          continue
        }
        console.error(`  x could not remove ${path}: ${(error as Error).message}`)
      }
    }
  }

  console.log(`\nDone. Reclassified ${pending.length} product(s), deleted ${deletable.length}.`)
  console.log(`To undo: pnpm restore-products-backup ${backupPath}`)
}

syncProductsFromInventory().catch(error => {
  console.error(error)
  process.exit(1)
})
