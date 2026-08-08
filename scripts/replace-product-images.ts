import { config } from "dotenv"
config({ path: ".env.local" })

import { createHash, randomUUID } from "node:crypto"
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { basename, extname, join, resolve } from "node:path"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore, Timestamp } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"
import { ROUTES_COLLECTIONS } from "../src/consts/db/db"
import { FileStateItem } from "../src/types/admin/admin"
import { MANIFEST_VERSION, OrphanImage, PendingDeletionManifest } from "./pending-deletion-manifest"
//
// Replaces every product's images with the ones under
// imagenes-nuevas/imagenes-productos/<product-slug>/.
//
// This script NEVER deletes anything. The images a product used to point at are
// left untouched in Storage and recorded in a pending-deletion manifest, so the
// catalog can be checked with both sets still alive. Removing them is a separate,
// explicitly approved step:
//
//   pnpm delete-orphan-product-images <manifest> --confirm
//
// Order of operations:
//   1. write a verified backup of every product document plus a local copy of
//      every image that will become orphaned. Nothing is touched until it reads back.
//   2. upload the new images.
//   3. point the documents at them.
//   4. write the pending-deletion manifest.
// A failure at any step leaves products pointing at images that still exist.
//
//   pnpm replace-product-images --dry-run     plan only, no writes
//   pnpm replace-product-images --confirm     execute
//
// To undo: pnpm restore-products-backup <path-to-backup.json>
const IMAGES_ROOT = resolve(process.cwd(), "imagenes-nuevas/imagenes-productos")
const BACKUPS_DIR = resolve(process.cwd(), "backups")
const BACKUP_VERSION = 1
const PRODUCTS_STORAGE_FOLDER = "products"
const BATCH_LIMIT = 400
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"])

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif"
}

// Escape hatch for a folder whose slug does not equal the product's slug in
// Firestore. Empty because the six folders that used to need it were renamed on
// disk to the product's exact name, so every folder now matches by slug alone.
// Anything that does not match exactly and is not listed here aborts the run —
// this script never falls back to fuzzy matching.
const FOLDER_OVERRIDES: Record<string, { id: string; name: string }> = {}

// Folders with no product behind them. Empty: "bronzer-compacto-sublime-atenea"
// used to be listed here because sync-products-from-inventory.ts had deleted that
// product, but it was re-created by restore-deleted-bronzer.ts and now matches by
// slug like every other folder.
const FOLDERS_TO_IGNORE = new Set<string>()

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
  console.error("Missing NEXT_PUBLIC_STORAGE_BUCKET in .env.local — images cannot be uploaded or deleted without it.")
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

// Mirrors normalizeFileName() in src/firebase/services/storage.ts so images
// uploaded here are indistinguishable from ones the admin panel uploads.
const storageFileName = (productId: string, originalName: string, index: number) => {
  const extension = extname(originalName).toLowerCase()
  const slug = slugify(basename(originalName, extname(originalName))) || "file"
  return `${productId}-${Date.now() + index}-${slug}${extension}`
}

// Reproduces the download URL the web SDK's getDownloadURL() returns. The token
// must be written into the object's metadata for the URL to resolve.
const downloadUrl = (storagePath: string, token: string) =>
  `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`

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

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(",")}}`
  }
  return JSON.stringify(value) ?? "null"
}

const hashOf = (value: unknown) => createHash("sha256").update(stableStringify(value)).digest("hex")

interface BackupResult {
  backupPath: string
  imagesDir: string
  images: BackupImage[]
}

async function writeVerifiedBackup(
  entries: BackupEntry[],
  imagesToCopy: { productId: string; storagePath: string }[]
): Promise<BackupResult> {
  mkdirSync(BACKUPS_DIR, { recursive: true })

  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const backupPath = join(BACKUPS_DIR, `products-${stamp}.json`)
  const imagesDir = join(BACKUPS_DIR, `products-${stamp}-images`)

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

      if (metadata.md5Hash && metadata.md5Hash !== localMd5) {
        throw new Error(`backup of ${image.storagePath} does not match Storage: md5 ${localMd5} vs ${metadata.md5Hash}`)
      }
      if (!metadata.md5Hash && Number(metadata.size ?? 0) !== localSize) {
        throw new Error(`backup of ${image.storagePath} is truncated: Storage reports ${metadata.size} bytes, local copy has ${localSize}`)
      }

      images.push({ productId: image.productId, storagePath: image.storagePath, localFile: localName, size: localSize, md5: localMd5 })
    }
    console.log(`  copied ${images.length} image(s) locally, md5 verified`)
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

  const reloaded = JSON.parse(readFileSync(backupPath, "utf8")) as BackupPayload
  if (reloaded.count !== entries.length || reloaded.products.length !== entries.length) {
    throw new Error(`backup verification failed: expected ${entries.length} products, file holds ${reloaded.products.length}`)
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
    if (!existsSync(localFile)) throw new Error(`backup verification failed: image copy ${image.localFile} is missing`)
    const md5 = createHash("md5").update(readFileSync(localFile)).digest("base64")
    if (md5 !== image.md5) {
      throw new Error(`backup verification failed: image copy ${image.localFile} does not match its recorded md5`)
    }
  }

  console.log(`Backup verified: ${backupPath}`)
  console.log(`  ${reloaded.products.length} product document(s), ${images.length} image file(s)`)
  return { backupPath, imagesDir, images }
}

interface PlanEntry {
  id: string
  name: string
  folder: string
  localFiles: string[]
  oldImgs: FileStateItem[]
}

async function replaceProductImages() {
  const dryRun = process.argv.includes("--dry-run")
  const confirm = process.argv.includes("--confirm")

  if (!existsSync(IMAGES_ROOT)) {
    console.error(`Image folder not found: ${IMAGES_ROOT}`)
    process.exit(1)
  }

  const products = db.collection(ROUTES_COLLECTIONS.PRODUCTS)
  const snapshot = await products.get()

  const bySlug = new Map<string, { id: string; name: string; imgs: FileStateItem[] }>()
  const byId = new Map<string, { id: string; name: string; imgs: FileStateItem[] }>()
  snapshot.docs.forEach(doc => {
    const data = doc.data()
    const entry = { id: doc.id, name: String(data.name ?? ""), imgs: (data.imgs ?? []) as FileStateItem[] }
    byId.set(doc.id, entry)
    const slug = slugify(entry.name)
    // A duplicate slug makes exact matching ambiguous; the override table is the
    // only way to resolve it, so the automatic path must not guess.
    if (bySlug.has(slug)) bySlug.set(slug, undefined as never)
    else bySlug.set(slug, entry)
  })

  const folders = readdirSync(IMAGES_ROOT, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort()

  const errors: string[] = []
  const plan: PlanEntry[] = []
  const ignored: string[] = []
  const matchedIds = new Set<string>()

  for (const folder of folders) {
    if (FOLDERS_TO_IGNORE.has(folder)) {
      ignored.push(folder)
      continue
    }

    const override = FOLDER_OVERRIDES[folder]
    const target = override ? byId.get(override.id) : bySlug.get(folder)

    if (override && !target) {
      errors.push(`override for "${folder}" points at product ${override.id}, which does not exist in Firestore`)
      continue
    }
    // A renamed product means the pinned mapping was built against older data.
    if (override && target && slugify(target.name) !== slugify(override.name)) {
      errors.push(`override for "${folder}": expected product named "${override.name}" but Firestore holds "${target.name}"`)
      continue
    }
    if (!target) {
      errors.push(`folder "${folder}" matches no product — add it to FOLDER_OVERRIDES or FOLDERS_TO_IGNORE`)
      continue
    }
    if (matchedIds.has(target.id)) {
      errors.push(`product ${target.id} ("${target.name}") is claimed by more than one folder`)
      continue
    }

    const localFiles = readdirSync(join(IMAGES_ROOT, folder))
      .filter(file => IMAGE_EXTENSIONS.has(extname(file).toLowerCase()))
      .filter(file => statSync(join(IMAGES_ROOT, folder, file)).isFile())
      .sort()

    // Writing an empty imgs array would silently strip a product's images.
    if (localFiles.length === 0) {
      errors.push(`folder "${folder}" holds no image files — refusing to blank out ${target.id} ("${target.name}")`)
      continue
    }

    matchedIds.add(target.id)
    plan.push({ id: target.id, name: target.name, folder, localFiles, oldImgs: target.imgs })
  }

  const untouched = snapshot.docs.filter(doc => !matchedIds.has(doc.id))

  const newImageCount = plan.reduce((sum, entry) => sum + entry.localFiles.length, 0)
  const oldImageCount = plan.reduce((sum, entry) => sum + entry.oldImgs.length, 0)

  console.log(`Products in Firestore:  ${snapshot.size}`)
  console.log(`Folders on disk:        ${folders.length}`)
  console.log("")
  console.log(`${plan.length} product(s) to update: +${newImageCount} new image(s), ${oldImageCount} old one(s) left orphaned in Storage`)
  plan.forEach(entry => {
    console.log(`  - ${entry.name}`)
    console.log(`      ${entry.oldImgs.length} old -> ${entry.localFiles.length} new  (${entry.folder}/)`)
  })

  if (ignored.length > 0) {
    console.log(`\n${ignored.length} folder(s) ignored on purpose:`)
    ignored.forEach(folder => console.log(`  - ${folder}`))
  }

  if (untouched.length > 0) {
    console.log(`\n${untouched.length} product(s) left untouched (no folder on disk):`)
    untouched.forEach(doc => console.log(`  - ${doc.id} "${doc.data().name}"`))
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

  if (!confirm) {
    console.error(
      `\nRefusing to run: ${plan.length} product document(s) would be overwritten and ${oldImageCount} image(s) would stop being referenced.` +
      "\nNothing would be deleted — the old objects stay in Storage and are recorded for a separate, approved deletion step." +
      "\nRe-run with --confirm once the plan above is correct."
    )
    process.exit(1)
  }

  if (plan.length === 0) {
    console.log("\nNothing to do.")
    return
  }

  console.log("\nWriting backup before touching anything...")
  const backup = await writeVerifiedBackup(
    snapshot.docs.map(doc => ({ id: doc.id, data: encodeValue(doc.data()) as Record<string, unknown> })),
    plan.flatMap(entry =>
      entry.oldImgs.map(img => ({ productId: entry.id, storagePath: `${PRODUCTS_STORAGE_FOLDER}/${img.name}` }))
    )
  )

  // Uploads run before any document is touched, so a failure here leaves the
  // catalog exactly as it was — only orphaned objects in Storage.
  console.log("\nUploading new images...")
  const uploaded: { entry: PlanEntry; imgs: FileStateItem[] }[] = []

  for (const entry of plan) {
    const imgs: FileStateItem[] = []
    for (const [index, file] of entry.localFiles.entries()) {
      const localPath = join(IMAGES_ROOT, entry.folder, file)
      const contents = readFileSync(localPath)
      const filename = storageFileName(entry.id, file, index)
      const storagePath = `${PRODUCTS_STORAGE_FOLDER}/${filename}`
      const token = randomUUID()

      await bucket.file(storagePath).save(contents, {
        contentType: CONTENT_TYPES[extname(file).toLowerCase()] ?? "application/octet-stream",
        metadata: { metadata: { firebaseStorageDownloadTokens: token } }
      })

      imgs.push({ name: filename, url: downloadUrl(storagePath, token), size: contents.byteLength })
    }
    uploaded.push({ entry, imgs })
    console.log(`  ${entry.name}: uploaded ${imgs.length} image(s)`)
  }

  console.log("\nPointing products at the new images...")
  for (let start = 0; start < uploaded.length; start += BATCH_LIMIT) {
    const chunk = uploaded.slice(start, start + BATCH_LIMIT)
    const batch = db.batch()
    chunk.forEach(({ entry, imgs }) => batch.update(products.doc(entry.id), { imgs }))
    await batch.commit()
    console.log(`  updated ${chunk.length} product(s)`)
  }

  // Nothing is deleted here. The old objects stay in Storage, unreferenced, and
  // are recorded so they can be removed later once the catalog has been checked.
  const newPaths = new Set(uploaded.flatMap(({ imgs }) => imgs.map(img => `${PRODUCTS_STORAGE_FOLDER}/${img.name}`)))
  const backedUpByPath = new Map(backup.images.map(image => [image.storagePath, image]))

  const orphans: OrphanImage[] = []
  for (const { entry } of uploaded) {
    for (const img of entry.oldImgs) {
      const storagePath = `${PRODUCTS_STORAGE_FOLDER}/${img.name}`
      // A name collision with a just-uploaded object would mean deleting a live
      // image later. Cannot happen with the timestamped naming, but recording it
      // as deletable would be the dangerous half of the mistake.
      if (newPaths.has(storagePath)) {
        console.warn(`  ! ${storagePath} is also the name of a new image — not marked for deletion`)
        continue
      }
      const backedUp = backedUpByPath.get(storagePath)
      orphans.push({
        productId: entry.id,
        productName: entry.name,
        storagePath,
        name: img.name,
        url: img.url,
        size: img.size,
        md5: backedUp?.md5 ?? null,
        localFile: backedUp?.localFile ?? null
      })
    }
  }

  const manifestPath = join(BACKUPS_DIR, `${basename(backup.backupPath, ".json")}-pending-deletion.json`)
  const manifest: PendingDeletionManifest = {
    version: MANIFEST_VERSION,
    createdAt: new Date().toISOString(),
    projectId: projectId!,
    bucket: storageBucket!,
    collection: ROUTES_COLLECTIONS.PRODUCTS,
    backupPath: backup.backupPath,
    backupImagesDir: backup.imagesDir,
    count: orphans.length,
    images: orphans
  }
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 1), "utf8")

  const reloaded = JSON.parse(readFileSync(manifestPath, "utf8")) as PendingDeletionManifest
  if (reloaded.count !== orphans.length || reloaded.images.length !== orphans.length) {
    throw new Error(`manifest verification failed: expected ${orphans.length} image(s), file holds ${reloaded.images.length}`)
  }
  const withoutLocalCopy = orphans.filter(orphan => !orphan.localFile).length

  console.log(`\nRecorded ${orphans.length} orphaned image(s) for later deletion: ${manifestPath}`)
  if (withoutLocalCopy > 0) {
    console.warn(`  ! ${withoutLocalCopy} of them had no local backup copy — they were already missing from Storage`)
  }

  console.log(`\nDone. ${plan.length} product(s) now carry ${newImageCount} new image(s).`)
  console.log("Nothing was deleted. Check the catalog, then remove the old images with:")
  console.log(`  pnpm delete-orphan-product-images ${manifestPath} --dry-run`)
  console.log(`  pnpm delete-orphan-product-images ${manifestPath} --confirm`)
  console.log(`\nTo undo the whole run: pnpm restore-products-backup ${backup.backupPath}`)
}

replaceProductImages().catch(error => {
  console.error(error)
  process.exit(1)
})
