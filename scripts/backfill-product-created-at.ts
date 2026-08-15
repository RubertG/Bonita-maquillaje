import { config } from "dotenv"
config({ path: ".env.local" })

import { initializeApp, cert, getApps } from "firebase-admin/app"
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore"
import { ROUTES_COLLECTIONS } from "../src/consts/db/db"

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

async function backfill() {
  const dryRun = process.argv.includes("--dry-run")
  const snapshot = await db.collection(ROUTES_COLLECTIONS.PRODUCTS).get()
  const missing: string[] = []

  snapshot.docs.forEach((doc) => {
    const createdAt = doc.get("createdAt")
    if (!createdAt || !(createdAt instanceof Timestamp)) {
      missing.push(doc.id)
    }
  })

  console.log(`Found ${missing.length} products without a valid createdAt`)
  if (missing.length > 0) {
    console.log("First 10 affected IDs:", missing.slice(0, 10).join(", "))
  }

  if (dryRun) {
    console.log("Dry run complete. No writes were committed.")
    return
  }

  if (missing.length === 0) return

  const batchSize = 500
  for (let i = 0; i < missing.length; i += batchSize) {
    const chunk = missing.slice(i, i + batchSize)
    const batch = db.batch()
    chunk.forEach((id) => {
      const docRef = db.collection(ROUTES_COLLECTIONS.PRODUCTS).doc(id)
      batch.update(docRef, { createdAt: FieldValue.serverTimestamp() })
    })
    await batch.commit()
    console.log(`Committed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(missing.length / batchSize)} (${chunk.length} docs)`)
  }

  console.log(`Backfilled ${missing.length} documents with createdAt`)
}

backfill().catch((error) => {
  console.error(error)
  process.exit(1)
})