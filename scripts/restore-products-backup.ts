import { config } from "dotenv"
config({ path: ".env.local" })

import { createHash } from "node:crypto"
import { existsSync, readFileSync, statSync } from "node:fs"
import { basename, dirname, join, resolve } from "node:path"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore, Timestamp } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"
import { ROUTES_COLLECTIONS } from "../src/consts/db/db"

// Restores a backup written by sync-products-from-inventory.ts: every product
// document goes back to its recorded state, and the images that were deleted are
// re-uploaded from the local copies stored next to the JSON file.
//
//   pnpm restore-products-backup backups/products-<stamp>.json [--dry-run]
//
// Products created after the backup are reported, never deleted — deciding what
// to do with them is not this script's call.

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

const SUPPORTED_VERSION = 1
const BATCH_LIMIT = 400

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  svg: "image/svg+xml"
}

const backupArg = process.argv.slice(2).find(arg => !arg.startsWith("--"))
const dryRun = process.argv.includes("--dry-run")

if (!backupArg) {
  console.error("Usage: pnpm restore-products-backup <path-to-backup.json> [--dry-run]")
  process.exit(1)
}

const backupPath = resolve(process.cwd(), backupArg)

if (!existsSync(backupPath)) {
  console.error(`Backup file not found: ${backupPath}`)
  process.exit(1)
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
  console.error("Missing NEXT_PUBLIC_STORAGE_BUCKET in .env.local — images cannot be restored without it.")
  process.exit(1)
}

const existingApp = getApps().at(0)
const app = existingApp || initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
  storageBucket
})

const db = getFirestore(app)
const bucket = getStorage(app).bucket()

// Inverse of encodeValue in sync-products-from-inventory.ts.
function decodeValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(decodeValue)
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>
    if (record.__type__ === "timestamp" && typeof record.value === "string") {
      return Timestamp.fromDate(new Date(record.value))
    }
    return Object.fromEntries(Object.entries(record).map(([key, item]) => [key, decodeValue(item)]))
  }
  return value
}

async function restoreProductsBackup() {
  const payload = JSON.parse(readFileSync(backupPath, "utf8")) as BackupPayload
  const imagesDir = join(dirname(backupPath), `${basename(backupPath, ".json")}-images`)
  const errors: string[] = []

  if (payload.version !== SUPPORTED_VERSION) {
    errors.push(`unsupported backup version ${payload.version}, expected ${SUPPORTED_VERSION}`)
  }
  if (payload.projectId !== projectId) {
    errors.push(`backup belongs to project "${payload.projectId}" but .env.local points at "${projectId}"`)
  }
  if (payload.collection !== ROUTES_COLLECTIONS.PRODUCTS) {
    errors.push(`backup is for collection "${payload.collection}", not "${ROUTES_COLLECTIONS.PRODUCTS}"`)
  }
  if (payload.count !== payload.products.length) {
    errors.push(`backup is inconsistent: header says ${payload.count} products, body holds ${payload.products.length}`)
  }

  // Every image the backup claims must be on disk with the right size before a
  // single document is written back.
  payload.images.forEach(image => {
    const localFile = join(imagesDir, image.localFile)
    if (!existsSync(localFile)) {
      errors.push(`image copy missing on disk: ${localFile}`)
      return
    }
    const size = statSync(localFile).size
    if (size !== image.size) {
      errors.push(`image copy ${image.localFile} is ${size} bytes, backup recorded ${image.size}`)
      return
    }
    // Content check, not just length: uploading a corrupted copy over a deleted
    // object would be unrecoverable.
    const md5 = createHash("md5").update(readFileSync(localFile)).digest("base64")
    if (image.md5 && md5 !== image.md5) {
      errors.push(`image copy ${image.localFile} is corrupted: md5 ${md5} vs recorded ${image.md5}`)
    }
  })

  const products = db.collection(ROUTES_COLLECTIONS.PRODUCTS)
  const current = await products.get()
  const currentIds = new Set(current.docs.map(doc => doc.id))
  const backedUpIds = new Set(payload.products.map(entry => entry.id))

  const toRecreate = payload.products.filter(entry => !currentIds.has(entry.id))
  const addedSince = current.docs.filter(doc => !backedUpIds.has(doc.id))

  console.log(`Backup: ${backupPath}`)
  console.log(`  taken ${payload.createdAt} on project ${payload.projectId}`)
  console.log(`  ${payload.products.length} product document(s), ${payload.images.length} image file(s)`)
  console.log(`\nFirestore currently holds ${current.size} product(s).`)
  console.log(`  ${payload.products.length - toRecreate.length} will be overwritten with their backed-up state`)
  console.log(`  ${toRecreate.length} will be recreated:`)
  toRecreate.forEach(entry => console.log(`    - ${entry.id} "${entry.data.name}"`))

  console.log(`\n${payload.images.length} image(s) will be re-uploaded:`)
  payload.images.forEach(image => console.log(`  - ${image.localFile} -> ${image.storagePath}`))

  if (addedSince.length > 0) {
    console.warn(`\n${addedSince.length} product(s) exist now but are not in the backup — left untouched:`)
    addedSince.forEach(doc => console.warn(`  ! ${doc.id} "${doc.data().name}"`))
  }

  if (errors.length > 0) {
    console.error(`\n${errors.length} error(s) — nothing was restored:`)
    errors.forEach(error => console.error(`  x ${error}`))
    process.exit(1)
  }

  if (dryRun) {
    console.log("\nDry run complete. Nothing was restored.")
    return
  }

  // Images first: a restored document must never point at an object that is not
  // back in Storage yet.
  for (const image of payload.images) {
    const localFile = join(imagesDir, image.localFile)
    const extension = image.storagePath.split(".").pop()?.toLowerCase() ?? ""
    await bucket.file(image.storagePath).save(readFileSync(localFile), {
      contentType: CONTENT_TYPES[extension] ?? "application/octet-stream",
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: extractToken(image.storagePath, payload)
        }
      }
    })
    console.log(`Restored ${image.storagePath}`)
  }

  for (let start = 0; start < payload.products.length; start += BATCH_LIMIT) {
    const chunk = payload.products.slice(start, start + BATCH_LIMIT)
    const batch = db.batch()
    chunk.forEach(entry => {
      batch.set(products.doc(entry.id), decodeValue(entry.data) as Record<string, unknown>)
    })
    await batch.commit()
    console.log(`Restored ${chunk.length} product document(s)`)
  }

  console.log(`\nRestored ${payload.products.length} product(s) and ${payload.images.length} image(s).`)
  if (addedSince.length > 0) {
    console.log(`${addedSince.length} product(s) added after the backup were left in place.`)
  }
}

// The download token lives inside the stored img.url, so reusing it keeps the URLs
// already saved on the restored documents working.
function extractToken(storagePath: string, payload: BackupPayload): string | undefined {
  const fileName = storagePath.split("/").pop()
  if (!fileName) return undefined

  for (const entry of payload.products) {
    const imgs = entry.data.imgs as { name?: string; url?: string }[] | undefined
    const match = imgs?.find(img => img.name === fileName)
    if (match?.url) {
      return new URL(match.url).searchParams.get("token") ?? undefined
    }
  }

  return undefined
}

restoreProductsBackup().catch(error => {
  console.error(error)
  process.exit(1)
})
