import { config } from "dotenv"
config({ path: ".env.local" })

import { randomUUID } from "node:crypto"
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { basename, extname, join, resolve } from "node:path"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore, Timestamp } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"
import { ROUTES_COLLECTIONS } from "../src/consts/db/db"
import { FileStateItem } from "../src/types/admin/admin"
//
// Re-creates "BRONZER COMPACTO SUBLIME ATENEA", which sync-products-from-inventory.ts
// hard-deleted on the premise that it had no row in the inventory sheet. It does:
// row 29, category "BRONZER Y CONTORNOS". The premise was wrong, so the product and
// its four images were removed from a live catalog.
//
// Everything below except the category and the images comes from the pre-deletion
// backup (backups/products-2026-08-06T01-15-33-812Z.json), so the name, description,
// price, stock and createdAt are the originals rather than invented values:
//   - category moves cat1 -> bronzer-y-contornos, matching the taxonomy the rest of
//     the catalog was migrated to and what the sheet says.
//   - the four original images are gone from Storage (only local backup copies
//     remain), so the two images from the new inventory shoot are uploaded instead.
//   - offerPrice / isBestSeller / isNew are left off: only 19 of 69 products carry
//     them, and the original document had none.
//
//   pnpm restore-deleted-bronzer --dry-run
//   pnpm restore-deleted-bronzer --confirm
//
// Safe to re-run: it refuses if the product already exists.
const PRODUCT_ID = "47c4e56f-8f7c-4b75-a07c-b6fe9215a79d"
const IMAGES_FOLDER = resolve(process.cwd(), "imagenes-nuevas/imagenes-productos/bronzer-compacto-sublime-atenea")
const PRODUCTS_STORAGE_FOLDER = "products"
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"])

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif"
}

// Verbatim from the pre-deletion backup, except `category`.
const PRODUCT = {
  id: PRODUCT_ID,
  name: "BRONZER COMPACTO SUBLIME ATENEA",
  description:
    "Ideal para definir facciones, crear profundidad y aportar un efecto bronceado natural al rostro. Está diseñado para imitar la sombra real de la piel, ayudando a perfilar pómulos, mandíbula y nariz sin líneas marcadas.",
  price: 34000,
  stock: 4,
  tones: [] as { color: string; name: string }[],
  category: "bronzer-y-contornos",
  // The original createdAt, so the product keeps its place in the catalog ordering.
  createdAt: Timestamp.fromDate(new Date("2026-07-24T02:20:31.370Z"))
}

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
  console.error("Missing NEXT_PUBLIC_STORAGE_BUCKET in .env.local — images cannot be uploaded without it.")
  process.exit(1)
}

const app = getApps().at(0) || initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
  storageBucket
})

const db = getFirestore(app)
const bucket = getStorage(app).bucket()

const slugify = (input: string) =>
  input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

// Mirrors normalizeFileName() in src/firebase/services/storage.ts.
const storageFileName = (originalName: string, index: number) => {
  const extension = extname(originalName).toLowerCase()
  const slug = slugify(basename(originalName, extname(originalName))) || "file"
  return `${PRODUCT_ID}-${Date.now() + index}-${slug}${extension}`
}

const downloadUrl = (storagePath: string, token: string) =>
  `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`

async function restoreDeletedBronzer() {
  const dryRun = process.argv.includes("--dry-run")
  const confirm = process.argv.includes("--confirm")

  const errors: string[] = []
  const products = db.collection(ROUTES_COLLECTIONS.PRODUCTS)

  // Re-creating over a live document would silently overwrite whatever is there.
  const existing = await products.doc(PRODUCT_ID).get()
  if (existing.exists) {
    console.error(`Product ${PRODUCT_ID} already exists in Firestore ("${existing.data()!.name}"). Nothing to do.`)
    process.exit(1)
  }

  // A product pointing at a category that does not exist disappears from the catalog UI.
  const category = await db.collection(ROUTES_COLLECTIONS.CATEGORIES).doc(PRODUCT.category).get()
  if (!category.exists) {
    errors.push(`category "${PRODUCT.category}" does not exist — run "pnpm seed-categories" first`)
  }

  // A second product under the same name would be worse than the missing one.
  const snapshot = await products.get()
  const duplicate = snapshot.docs.find(doc => slugify(String(doc.data().name ?? "")) === slugify(PRODUCT.name))
  if (duplicate) {
    errors.push(`product "${duplicate.data().name}" (${duplicate.id}) already carries this name`)
  }

  if (!existsSync(IMAGES_FOLDER)) {
    errors.push(`image folder not found: ${IMAGES_FOLDER}`)
  }

  const localFiles = existsSync(IMAGES_FOLDER)
    ? readdirSync(IMAGES_FOLDER)
        .filter(file => IMAGE_EXTENSIONS.has(extname(file).toLowerCase()))
        .filter(file => statSync(join(IMAGES_FOLDER, file)).isFile())
        .sort()
    : []

  if (existsSync(IMAGES_FOLDER) && localFiles.length === 0) {
    errors.push(`no image files in ${IMAGES_FOLDER} — refusing to create a product with no images`)
  }

  console.log("Product to create:")
  console.log(`  id:          ${PRODUCT.id}`)
  console.log(`  name:        ${PRODUCT.name}`)
  console.log(`  category:    ${PRODUCT.category}`)
  console.log(`  price:       ${PRODUCT.price}`)
  console.log(`  stock:       ${PRODUCT.stock}`)
  console.log(`  createdAt:   ${PRODUCT.createdAt.toDate().toISOString()}`)
  console.log(`  description: ${PRODUCT.description}`)
  console.log(`  images:      ${localFiles.length}`)
  localFiles.forEach(file => console.log(`    - ${file}`))

  if (errors.length > 0) {
    console.error(`\n${errors.length} error(s) — nothing was written:`)
    errors.forEach(error => console.error(`  x ${error}`))
    process.exit(1)
  }

  if (dryRun) {
    console.log("\nDry run complete. No writes were committed.")
    return
  }

  if (!confirm) {
    console.error("\nRefusing to run: re-run with --confirm to create the product.")
    process.exit(1)
  }

  // Images first: a document pointing at images that failed to upload is the one
  // broken state worth avoiding.
  console.log("\nUploading images...")
  const imgs: FileStateItem[] = []
  for (const [index, file] of localFiles.entries()) {
    const contents = readFileSync(join(IMAGES_FOLDER, file))
    const filename = storageFileName(file, index)
    const storagePath = `${PRODUCTS_STORAGE_FOLDER}/${filename}`
    const token = randomUUID()

    await bucket.file(storagePath).save(contents, {
      contentType: CONTENT_TYPES[extname(file).toLowerCase()] ?? "application/octet-stream",
      metadata: { metadata: { firebaseStorageDownloadTokens: token } }
    })

    imgs.push({ name: filename, url: downloadUrl(storagePath, token), size: contents.byteLength })
    console.log(`  ${file} -> ${filename}`)
  }

  await products.doc(PRODUCT_ID).set({ ...PRODUCT, imgs })

  console.log(`\nCreated ${PRODUCT_ID} "${PRODUCT.name}" with ${imgs.length} image(s).`)
  console.log(`To undo: delete the document and the ${imgs.length} object(s) under ${PRODUCTS_STORAGE_FOLDER}/.`)
}

restoreDeletedBronzer().catch(error => {
  console.error(error)
  process.exit(1)
})
