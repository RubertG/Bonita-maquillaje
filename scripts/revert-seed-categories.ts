import { config } from "dotenv"
config({ path: ".env.local" })

import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore, FieldValue } from "firebase-admin/firestore"
import { ROUTES_COLLECTIONS } from "../src/consts/db/db"

const CATEGORIES_TO_REMOVE = [
  "liquidacion",
  "combos",
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

async function revertSeedCategories() {
  const dryRun = process.argv.includes("--dry-run")
  const collection = db.collection(ROUTES_COLLECTIONS.CATEGORIES)
  const existing = await collection.get()
  const existingIds = new Set(existing.docs.map(doc => doc.id))

  const idsToRemove = CATEGORIES_TO_REMOVE.filter(id => existingIds.has(id))
  console.log(`Found ${idsToRemove.length} seeded categories to remove out of ${CATEGORIES_TO_REMOVE.length}`)
  idsToRemove.forEach(id => {
    console.log(`  - ${id}`)
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
  console.log(`Removed ${idsToRemove.length} seeded categories and reverted ${backfillDocs.length} categories`)
}

revertSeedCategories().catch(error => {
  console.error(error)
  process.exit(1)
})
