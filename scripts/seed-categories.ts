import { config } from "dotenv"
config({ path: ".env.local" })

import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { ROUTES_COLLECTIONS } from "../src/consts/db/db"

const CATEGORIES = [
  { id: "liquidacion", name: "Liquidación", img: { name: "", url: "", size: 0 }, isStagingOnly: true },
  { id: "combos", name: "Combos", img: { name: "", url: "", size: 0 }, isStagingOnly: true },
  { id: "cuidado-facial", name: "Cuidado facial", img: { name: "", url: "", size: 0 }, isStagingOnly: true },
  { id: "bases-y-correctores", name: "Bases y correctores", img: { name: "", url: "", size: 0 }, isStagingOnly: true },
  { id: "polvos-sueltos-y-compactos", name: "Polvos sueltos y compactos", img: { name: "", url: "", size: 0 }, isStagingOnly: true },
  { id: "bronzer-y-contornos", name: "Bronzer y contornos", img: { name: "", url: "", size: 0 }, isStagingOnly: true },
  { id: "sombras", name: "Sombras", img: { name: "", url: "", size: 0 }, isStagingOnly: true },
  { id: "rubor-e-iluminador", name: "Rubor e iluminador", img: { name: "", url: "", size: 0 }, isStagingOnly: true },
  { id: "labios", name: "Labios", img: { name: "", url: "", size: 0 }, isStagingOnly: true },
  { id: "ojos", name: "Ojos", img: { name: "", url: "", size: 0 }, isStagingOnly: true },
  { id: "fijador-y-primer", name: "Fijador y primer", img: { name: "", url: "", size: 0 }, isStagingOnly: true },
  { id: "brochas", name: "Brochas", img: { name: "", url: "", size: 0 }, isStagingOnly: true },
  { id: "accesorios-de-maquillaje", name: "Accesorios de maquillaje", img: { name: "", url: "", size: 0 }, isStagingOnly: true }
]

const STAGING_IDS = new Set(CATEGORIES.map(category => category.id))

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

async function seedCategories() {
  const dryRun = process.argv.includes("--dry-run")
  const collection = db.collection(ROUTES_COLLECTIONS.CATEGORIES)
  const existing = await collection.get()
  const existingIds = new Set(existing.docs.map(doc => doc.id))

  const missing = CATEGORIES.filter(category => !existingIds.has(category.id))

  console.log(`Found ${missing.length} categories to create out of ${CATEGORIES.length}`)

  if (missing.length > 0) {
    console.log("Categories to create:")
    missing.forEach(category => {
      console.log(`  - ${category.id}: ${category.name}`)
    })
  }

  const backfillDocs = existing.docs.filter(doc => doc.data().isStagingOnly === undefined)

  if (backfillDocs.length > 0) {
    console.log(`Found ${backfillDocs.length} categories to backfill isStagingOnly`)
    backfillDocs.forEach(doc => {
      const value = STAGING_IDS.has(doc.id) ? "true" : "false"
      console.log(`  - ${doc.id}: isStagingOnly = ${value}`)
    })
  }

  if (dryRun) {
    console.log("Dry run complete. No writes were committed.")
    return
  }

  const batch = db.batch()
  let writes = 0

  if (missing.length > 0) {
    missing.forEach(category => {
      const ref = collection.doc(category.id)
      batch.set(ref, category)
      writes++
    })
  }

  if (backfillDocs.length > 0) {
    backfillDocs.forEach(doc => {
      const ref = collection.doc(doc.id)
      batch.update(ref, {
        isStagingOnly: STAGING_IDS.has(doc.id)
      })
      writes++
    })
  }

  if (writes === 0) {
    console.log("All staging categories exist and all categories have isStagingOnly. Nothing to do.")
    return
  }

  await batch.commit()
  console.log(`Created ${missing.length} staging categories and backfilled ${backfillDocs.length} existing categories`)
}

seedCategories().catch(error => {
  console.error(error)
  process.exit(1)
})
