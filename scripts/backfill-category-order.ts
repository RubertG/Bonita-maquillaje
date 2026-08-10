import { config } from "dotenv"
config({ path: ".env.local" })

import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { ROUTES_COLLECTIONS } from "../src/consts/db/db"
import { CANONICAL_CATEGORIES } from "./canonical-categories"

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
  const force = process.argv.includes("--force")

  // Printed first, and printed on --dry-run too: the guard against backfilling
  // the wrong project.
  console.log(`Target Firebase project: ${projectId}`)

  const collection = db.collection(ROUTES_COLLECTIONS.CATEGORIES)
  const snapshot = await collection.get()

  // Legacy documents outside CANONICAL_CATEGORIES (e.g. cat1/cat2/cat3) get
  // CANONICAL_CATEGORIES.length + i, sorted by id, so they land after the
  // canonical twelve deterministically.
  const legacyIds = snapshot.docs
    .map(doc => doc.id)
    .filter(id => !CANONICAL_CATEGORIES.some(entry => entry.id === id))
    .sort((a, b) => a.localeCompare(b))

  const orderOf = (id: string): number => {
    const canonicalIndex = CANONICAL_CATEGORIES.findIndex(entry => entry.id === id)
    if (canonicalIndex !== -1) return canonicalIndex

    return CANONICAL_CATEGORIES.length + legacyIds.indexOf(id)
  }

  const plan: { id: string; order: number }[] = []
  const skipped: { id: string; current: number; canonical: number }[] = []

  snapshot.docs.forEach(doc => {
    const currentOrder = doc.get("order")

    // Re-running never overwrites an order an admin already set by hand, unless
    // --force is passed (the rollback path, which restores canonical values).
    if (typeof currentOrder === "number" && !force) {
      skipped.push({ id: doc.id, current: currentOrder, canonical: orderOf(doc.id) })
      return
    }

    plan.push({ id: doc.id, order: orderOf(doc.id) })
  })

  console.log(`\n${plan.length} category(ies) to update out of ${snapshot.size}:`)
  plan.forEach(({ id, order }) => console.log(`  - ${id}: order ${order}`))

  if (skipped.length > 0) {
    console.log(`\n${skipped.length} category(ies) skipped (already have a numeric order):`)
    skipped.forEach(({ id, current, canonical }) => {
      const mark = current === canonical ? "matches canonical" : "DIFFERS from canonical"
      console.log(`  - ${id}: order ${current} (canonical ${canonical}) — ${mark}`)
    })

    // A skipped document whose order diverges from the canonical one is the
    // signature of an order that was never set deliberately. The admin reorder UI
    // writes an order to EVERY visible category on a single move, so one drag
    // performed before this backfill runs makes the script skip everything and
    // leaves the canonical order permanently unapplied. Silence here is exactly
    // how that failure hides, so it is shouted instead.
    const diverging = skipped.filter(entry => entry.current !== entry.canonical)

    if (diverging.length > 0) {
      console.warn(`\n!! WARNING: ${diverging.length} skipped category(ies) hold a NON-canonical order.`)
      console.warn("   One admin reorder before this backfill assigns an order to every category,")
      console.warn("   which this script then skips — so the canonical order is never applied.")
      console.warn("   If that order was not set deliberately, re-run with --force.")
    }
  }

  if (dryRun) {
    console.log("\nDry run complete. No writes were committed.")
    return
  }

  if (plan.length === 0) {
    console.log("\nNothing to commit.")
    return
  }

  const batchSize = 500
  for (let i = 0; i < plan.length; i += batchSize) {
    const chunk = plan.slice(i, i + batchSize)
    const batch = db.batch()
    chunk.forEach(({ id, order }) => {
      batch.update(collection.doc(id), { order })
    })
    await batch.commit()
    console.log(`Committed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(plan.length / batchSize)} (${chunk.length} docs)`)
  }

  console.log(`\nBackfilled ${plan.length} category(ies) with order.`)
}

backfill().catch(error => {
  console.error(error)
  process.exit(1)
})
