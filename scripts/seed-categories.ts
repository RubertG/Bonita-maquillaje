import { config } from "dotenv"
config({ path: ".env.local" })

import { randomUUID } from "node:crypto"
import { existsSync, readFileSync, statSync } from "node:fs"
import { extname, join, resolve } from "node:path"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"
import { ROUTES_COLLECTIONS } from "../src/consts/db/db"
import { FileStateItem } from "../src/types/admin/admin"
import { CANONICAL_CATEGORIES } from "./canonical-categories"

// Local folder holding the category artwork. File names are the category id,
// except where `imageFile` says otherwise.
const IMAGES_DIR = resolve(process.cwd(), "imagenes-nuevas/categorias")

// Storage folder the admin panel uploads category images into. See
// use-category-form.ts — saveFile(imgs[0], categoryId, "/categories").
const CATEGORIES_STORAGE_FOLDER = "categories"

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml"
}

const NEW_CATEGORY_IDS = new Set(CANONICAL_CATEGORIES.map(category => category.id))

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
  console.error("Missing NEXT_PUBLIC_STORAGE_BUCKET in .env.local — category images cannot be uploaded without it.")
  process.exit(1)
}

const existingApp = getApps().at(0)
const app = existingApp || initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
  storageBucket
})

const db = getFirestore(app)
const bucket = getStorage(app).bucket()

// Mirrors what getDownloadURL() returns on the web SDK, so category images carry
// the same URL shape as the product images already stored in Firestore.
function buildDownloadUrl(path: string, token: string) {
  return `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(path)}?alt=media&token=${token}`
}

async function uploadCategoryImage(
  categoryId: string,
  imageFile: string
): Promise<FileStateItem> {
  const localPath = join(IMAGES_DIR, imageFile)
  const extension = extname(imageFile).toLowerCase()
  const contentType = CONTENT_TYPES[extension]

  if (!contentType) {
    throw new Error(`unsupported image extension "${extension}" for ${imageFile}`)
  }

  // Deterministic object name: re-running overwrites the same object instead of
  // piling up orphans in Storage.
  const name = `${categoryId}${extension}`
  const path = `${CATEGORIES_STORAGE_FOLDER}/${name}`
  const token = randomUUID()

  await bucket.file(path).save(readFileSync(localPath), {
    contentType,
    metadata: {
      metadata: {
        firebaseStorageDownloadTokens: token
      }
    }
  })

  return {
    name,
    url: buildDownloadUrl(path, token),
    size: statSync(localPath).size
  }
}

async function seedCategories() {
  const dryRun = process.argv.includes("--dry-run")
  const forceImages = process.argv.includes("--force-images")
  const collection = db.collection(ROUTES_COLLECTIONS.CATEGORIES)
  const existing = await collection.get()
  const existingDocs = new Map(existing.docs.map(doc => [doc.id, doc]))

  const errors: string[] = []

  // Every category must have its artwork on disk before anything is written.
  if (!existsSync(IMAGES_DIR)) {
    errors.push(`images folder not found: ${IMAGES_DIR}`)
  } else {
    CANONICAL_CATEGORIES.forEach(category => {
      const localPath = join(IMAGES_DIR, category.imageFile)
      if (!existsSync(localPath)) errors.push(`missing image for "${category.id}": ${localPath}`)
      else if (!CONTENT_TYPES[extname(category.imageFile).toLowerCase()]) {
        errors.push(`unsupported image extension for "${category.id}": ${category.imageFile}`)
      }
    })
  }

  const missing = CANONICAL_CATEGORIES.filter(category => !existingDocs.has(category.id))

  // A category already holding an image keeps it, unless --force-images is passed.
  const needsImage = CANONICAL_CATEGORIES.filter(category => {
    if (!existingDocs.has(category.id)) return true
    if (forceImages) return true
    const img = existingDocs.get(category.id)?.data().img as FileStateItem | undefined
    return !img?.url
  })

  // The legacy categories (cat1/cat2/cat3) end up empty once products move to the
  // new taxonomy, so they are hidden from production rather than deleted. Flipping
  // the boolean back is all it takes to undo it.
  const backfillDocs = existing.docs.filter(doc => doc.data().isStagingOnly === undefined)
  const hideFromProduction = (id: string) => !NEW_CATEGORY_IDS.has(id)

  console.log(`Images folder: ${IMAGES_DIR}`)
  console.log(`\n${missing.length} category(ies) to create out of ${CANONICAL_CATEGORIES.length}:`)
  missing.forEach(category => {
    const order = CANONICAL_CATEGORIES.findIndex(entry => entry.id === category.id)
    console.log(`  - ${category.id}: ${category.name} (order: ${order})`)
  })

  console.log(`\n${needsImage.length} image(s) to upload:`)
  needsImage.forEach(category =>
    console.log(`  - ${category.imageFile} -> ${CATEGORIES_STORAGE_FOLDER}/${category.id}${extname(category.imageFile).toLowerCase()}`)
  )

  if (backfillDocs.length > 0) {
    console.log(`\n${backfillDocs.length} category(ies) to backfill isStagingOnly:`)
    backfillDocs.forEach(doc =>
      console.log(`  - ${doc.id}: isStagingOnly = ${hideFromProduction(doc.id)}`)
    )
  }

  if (errors.length > 0) {
    console.error(`\n${errors.length} error(s) — nothing was written:`)
    errors.forEach(error => console.error(`  x ${error}`))
    process.exit(1)
  }

  if (dryRun) {
    console.log("\nDry run complete. No writes were committed and no images were uploaded.")
    return
  }

  if (missing.length === 0 && needsImage.length === 0 && backfillDocs.length === 0) {
    console.log("\nEverything is already seeded. Nothing to do.")
    return
  }

  // Images go up before Firestore, so a document never points at an object that
  // does not exist yet. A failed batch leaves overwritable objects behind.
  const uploaded = new Map<string, FileStateItem>()
  for (const category of needsImage) {
    const img = await uploadCategoryImage(category.id, category.imageFile)
    uploaded.set(category.id, img)
    console.log(`Uploaded ${CATEGORIES_STORAGE_FOLDER}/${img.name} (${img.size} bytes)`)
  }

  const batch = db.batch()
  let writes = 0

  missing.forEach(category => {
    // The canonical position, never the loop index: seeding a partially seeded
    // collection would otherwise write 0..missing.length-1 and misorder every
    // category that already existed.
    const order = CANONICAL_CATEGORIES.findIndex(entry => entry.id === category.id)

    batch.set(collection.doc(category.id), {
      id: category.id,
      name: category.name,
      img: uploaded.get(category.id) ?? { name: "", url: "", size: 0 },
      isStagingOnly: category.isStagingOnly,
      order
    })
    writes++
  })

  // Categories that already existed only get their image refreshed.
  needsImage
    .filter(category => existingDocs.has(category.id))
    .forEach(category => {
      const img = uploaded.get(category.id)
      if (!img) return
      batch.update(collection.doc(category.id), { img })
      writes++
    })

  backfillDocs
    .filter(doc => !missing.some(category => category.id === doc.id))
    .forEach(doc => {
      batch.update(collection.doc(doc.id), { isStagingOnly: hideFromProduction(doc.id) })
      writes++
    })

  if (writes === 0) {
    console.log("Nothing to commit.")
    return
  }

  await batch.commit()
  console.log(
    `\nCreated ${missing.length} category(ies), uploaded ${uploaded.size} image(s), backfilled ${backfillDocs.length}.`
  )
}

seedCategories().catch(error => {
  console.error(error)
  process.exit(1)
})
