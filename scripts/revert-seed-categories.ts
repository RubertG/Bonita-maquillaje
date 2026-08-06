import { config } from "dotenv"
config({ path: ".env.local" })

import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore, FieldValue } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"
import { ROUTES_COLLECTIONS } from "../src/consts/db/db"
import { FileStateItem } from "../src/types/admin/admin"

const CATEGORIES_TO_REMOVE = [
  "cajas-de-maquillaje",
  "cuidado-facial",
  "bases-y-correctores",
  "polvos-sueltos-y-compactos",
  "bronzer-y-contornos",
  "sombras",
  "rubor-e-iluminador",
  "labios",
  "ojos",
  "fijador-y-primer",
  "brochas",
  "accesorios-de-maquillaje"
]

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Missing Firebase Admin SDK credentials. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local."
  )
  process.exit(1)
}

const existingApp = getApps().at(0)
const app = existingApp || initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET
})

const db = getFirestore(app)
const bucket = getStorage(app).bucket()

// Storage folder the seed script uploads category images into.
const CATEGORIES_STORAGE_FOLDER = "categories"

async function revertSeedCategories() {
  const dryRun = process.argv.includes("--dry-run")
  const collection = db.collection(ROUTES_COLLECTIONS.CATEGORIES)
  const existing = await collection.get()
  const existingIds = new Set(existing.docs.map(doc => doc.id))

  const idsToRemove = CATEGORIES_TO_REMOVE.filter(id => existingIds.has(id))
  console.log(`Found ${idsToRemove.length} seeded categories to remove out of ${CATEGORIES_TO_REMOVE.length}`)

  // Images uploaded by the seed script go too, otherwise reverting leaves orphans
  // in Storage. Only objects under the seed folder are considered — the legacy
  // categories point at local /public files and have nothing to clean up.
  const imagesToRemove: string[] = []
  idsToRemove.forEach(id => {
    const img = existing.docs.find(doc => doc.id === id)?.data().img as FileStateItem | undefined
    const isStoredImage = Boolean(img?.name) && img?.url?.startsWith("https://firebasestorage.googleapis.com/")
    console.log(`  - ${id}${isStoredImage ? ` (image ${CATEGORIES_STORAGE_FOLDER}/${img?.name})` : ""}`)
    if (isStoredImage && img) imagesToRemove.push(`${CATEGORIES_STORAGE_FOLDER}/${img.name}`)
  })

  const backfillDocs = existing.docs.filter(
    doc => doc.data().isStagingOnly !== undefined && !idsToRemove.includes(doc.id)
  )
  console.log(`Found ${backfillDocs.length} categories to remove isStagingOnly field from`)
  backfillDocs.forEach(doc => {
    console.log(`  - ${doc.id}`)
  })

  if (dryRun) {
    console.log("Dry run complete. No writes were committed.")
    return
  }

  const batch = db.batch()
  let writes = 0

  idsToRemove.forEach(id => {
    const ref = collection.doc(id)
    batch.delete(ref)
    writes++
  })

  backfillDocs.forEach(doc => {
    const ref = collection.doc(doc.id)
    batch.update(ref, {
      isStagingOnly: FieldValue.delete()
    })
    writes++
  })

  if (writes === 0) {
    console.log("Nothing to revert.")
    return
  }

  await batch.commit()

  // Storage is cleaned only once the documents are gone, so a failed commit never
  // leaves a category pointing at a missing image.
  for (const path of imagesToRemove) {
    try {
      await bucket.file(path).delete()
      console.log(`  removed ${path}`)
    } catch (error) {
      const code = (error as { code?: number }).code
      if (code === 404) {
        console.warn(`  ! ${path} was already missing from Storage`)
        continue
      }
      console.error(`  x could not remove ${path}: ${(error as Error).message}`)
    }
  }

  console.log(
    `Removed ${idsToRemove.length} seeded categories, ${imagesToRemove.length} image(s), and reverted ${backfillDocs.length} categories`
  )
}

revertSeedCategories().catch(error => {
  console.error(error)
  process.exit(1)
})
