import { config } from "dotenv"
config({ path: ".env.local" })

import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore, Timestamp } from "firebase-admin/firestore"

const DELETE_FLAG = process.argv.includes("--delete")
const COLLECTION = "orders"
const BACKUPS_DIR = resolve(process.cwd(), "backups")
const BATCH_LIMIT = 500

interface BackupDocument {
  id: string
  data: Record<string, unknown>
}

interface BackupPayload {
  version: number
  createdAt: string
  projectId: string
  collection: string
  count: number
  documents: BackupDocument[]
}

const rawProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\\\n/g, "\n")

if (!rawProjectId || !clientEmail || !privateKey) {
  console.error(
    "Missing Firebase Admin SDK credentials. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local."
  )
  process.exit(1)
}

const projectId = rawProjectId

const existingApp = getApps().at(0)
const app = existingApp || initializeApp({
  credential: cert({ projectId, clientEmail, privateKey })
})

const db = getFirestore(app)

function encodeValue(value: unknown): unknown {
  if (value instanceof Timestamp) {
    return {
      __type__: "timestamp",
      value: value.toDate().toISOString()
    }
  }

  if (Array.isArray(value)) return value.map(encodeValue)

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, encodeValue(item)])
    )
  }

  return value
}

async function backupOrders() {
  const snapshot = await db.collection(COLLECTION).get()
  const documents: BackupDocument[] = snapshot.docs.map(doc => ({
    id: doc.id,
    data: encodeValue(doc.data()) as Record<string, unknown>
  }))

  if (!existsSync(BACKUPS_DIR)) {
    mkdirSync(BACKUPS_DIR, { recursive: true })
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const backupPath = join(BACKUPS_DIR, `orders-${stamp}.json`)

  const payload: BackupPayload = {
    version: 1,
    createdAt: new Date().toISOString(),
    projectId,
    collection: COLLECTION,
    count: documents.length,
    documents
  }

  writeFileSync(backupPath, JSON.stringify(payload, null, 2))
  console.log(`Backed up ${documents.length} document(s) to ${backupPath}`)

  return { documents, backupPath }
}

async function deleteOrders(documents: BackupDocument[]) {
  if (documents.length === 0) {
    console.log("No documents to delete.")
    return
  }

  let deleted = 0
  for (let start = 0; start < documents.length; start += BATCH_LIMIT) {
    const chunk = documents.slice(start, start + BATCH_LIMIT)
    const batch = db.batch()

    chunk.forEach(document => {
      batch.delete(db.collection(COLLECTION).doc(document.id))
    })

    await batch.commit()
    deleted += chunk.length
    console.log(`Deleted ${chunk.length} document(s)`)
  }

  console.log(`Deleted ${deleted} document(s) from ${COLLECTION}`)
}

async function main() {
  const { documents, backupPath } = await backupOrders()

  if (!DELETE_FLAG) return

  if (!existsSync(backupPath)) {
    console.error("Backup file is missing. Exiting without deleting any documents.")
    process.exit(1)
  }

  await deleteOrders(documents)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
