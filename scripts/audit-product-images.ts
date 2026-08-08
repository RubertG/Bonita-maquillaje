import { config } from "dotenv"
config({ path: ".env.local" })

import { readdirSync, statSync } from "node:fs"
import { join, resolve, extname } from "node:path"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { ROUTES_COLLECTIONS } from "../src/consts/db/db"
import { FileStateItem } from "../src/types/admin/admin"

// Read-only audit. Matches the folders under imagenes-nuevas/imagenes-productos
// against the products collection and reports every mismatch, so the replacement
// run can start from a known-good mapping instead of guessing.
//
// Nothing is written to Firestore or Storage by this script.
//
// Folder names are slugs of the product name as written in the inventory sheet,
// which is not always what Firestore holds ("base astenea" vs "Base Atenea"), so
// matching runs in three passes of decreasing confidence and reports each tier
// separately for a human to confirm.
const IMAGES_ROOT = resolve(process.cwd(), "imagenes-nuevas/imagenes-productos")
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"])

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Missing Firebase Admin SDK credentials. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local."
  )
  process.exit(1)
}

const app = getApps().at(0) || initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
const db = getFirestore(app)

const slugify = (input: string) =>
  input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const tokens = (slug: string) => new Set(slug.split("-").filter(Boolean))

// Jaccard over word tokens. Word-level rather than character-level because the
// real differences here are dropped or added words ("Miis Cosmetics"), not typos.
function similarity(a: string, b: string) {
  const ta = tokens(a)
  const tb = tokens(b)
  if (ta.size === 0 || tb.size === 0) return 0
  let shared = 0
  ta.forEach(token => {
    if (tb.has(token)) shared++
  })
  return shared / (ta.size + tb.size - shared)
}

interface Folder {
  name: string
  files: string[]
}

interface DbProduct {
  id: string
  name: string
  slug: string
  imgs: FileStateItem[]
}

function readFolders(): Folder[] {
  return readdirSync(IMAGES_ROOT, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => ({
      name: entry.name,
      files: readdirSync(join(IMAGES_ROOT, entry.name))
        .filter(file => IMAGE_EXTENSIONS.has(extname(file).toLowerCase()))
        .filter(file => statSync(join(IMAGES_ROOT, entry.name, file)).isFile())
        .sort()
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

async function audit() {
  const folders = readFolders()
  const snapshot = await db.collection(ROUTES_COLLECTIONS.PRODUCTS).get()

  const products: DbProduct[] = snapshot.docs.map(doc => {
    const data = doc.data()
    const name = String(data.name ?? "")
    return { id: doc.id, name, slug: slugify(name), imgs: (data.imgs ?? []) as FileStateItem[] }
  })

  const takenProducts = new Set<string>()
  const exact: { folder: Folder; product: DbProduct }[] = []
  const contained: { folder: Folder; product: DbProduct }[] = []
  const fuzzy: { folder: Folder; product: DbProduct; score: number }[] = []
  const unmatchedFolders: Folder[] = []

  // Pass 1 — identical slugs.
  const pendingFolders: Folder[] = []
  for (const folder of folders) {
    const hit = products.find(p => p.slug === folder.name && !takenProducts.has(p.id))
    if (hit) {
      takenProducts.add(hit.id)
      exact.push({ folder, product: hit })
    } else {
      pendingFolders.push(folder)
    }
  }

  // Pass 2 — one slug is a prefix/substring of the other, which covers the
  // "product name lost or gained a trailing brand" case.
  const stillPending: Folder[] = []
  for (const folder of pendingFolders) {
    const candidates = products.filter(
      p => !takenProducts.has(p.id) && (p.slug.includes(folder.name) || folder.name.includes(p.slug))
    )
    if (candidates.length === 1) {
      takenProducts.add(candidates[0].id)
      contained.push({ folder, product: candidates[0] })
    } else {
      stillPending.push(folder)
    }
  }

  // Pass 3 — best token overlap above a floor. Reported, never auto-applied.
  for (const folder of stillPending) {
    const scored = products
      .filter(p => !takenProducts.has(p.id))
      .map(p => ({ product: p, score: similarity(folder.name, p.slug) }))
      .sort((a, b) => b.score - a.score)

    const best = scored.at(0)
    if (best && best.score >= 0.5) {
      takenProducts.add(best.product.id)
      fuzzy.push({ folder, product: best.product, score: best.score })
    } else {
      unmatchedFolders.push(folder)
    }
  }

  const unmatchedProducts = products.filter(p => !takenProducts.has(p.id))
  const totalImages = folders.reduce((sum, f) => sum + f.files.length, 0)

  console.log("=".repeat(72))
  console.log("AUDIT — product images vs Firestore")
  console.log("=".repeat(72))
  console.log(`Folders on disk:        ${folders.length} (${totalImages} image file(s))`)
  console.log(`Products in Firestore:  ${products.length}`)
  console.log("")
  console.log(`  exact name match:     ${exact.length}`)
  console.log(`  matched by substring: ${contained.length}   <- review`)
  console.log(`  matched by similarity:${String(fuzzy.length).padStart(4)}   <- review carefully`)
  console.log(`  folders with NO product: ${unmatchedFolders.length}`)
  console.log(`  products with NO folder: ${unmatchedProducts.length}`)

  if (contained.length > 0) {
    console.log(`\n--- MATCHED BY SUBSTRING (${contained.length}) — confirm each one ---`)
    contained.forEach(({ folder, product }) => {
      console.log(`  folder "${folder.name}" (${folder.files.length} img)`)
      console.log(`      -> ${product.id}  "${product.name}"`)
    })
  }

  if (fuzzy.length > 0) {
    console.log(`\n--- MATCHED BY SIMILARITY (${fuzzy.length}) — confirm each one ---`)
    fuzzy.forEach(({ folder, product, score }) => {
      console.log(`  folder "${folder.name}" (${folder.files.length} img)  [score ${score.toFixed(2)}]`)
      console.log(`      -> ${product.id}  "${product.name}"`)
    })
  }

  if (unmatchedFolders.length > 0) {
    console.log(`\n--- FOLDERS WITH NO PRODUCT IN FIRESTORE (${unmatchedFolders.length}) ---`)
    console.log("    These images would be uploaded for nothing. Either the product was")
    console.log("    deleted, or it is named very differently in the database.")
    unmatchedFolders.forEach(folder => {
      console.log(`  ! ${folder.name} (${folder.files.length} img)`)
      const near = products
        .map(p => ({ p, score: similarity(folder.name, p.slug) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .filter(c => c.score > 0)
      near.forEach(c => console.log(`        closest: "${c.p.name}" [${c.score.toFixed(2)}]`))
    })
  }

  if (unmatchedProducts.length > 0) {
    console.log(`\n--- PRODUCTS WITH NO FOLDER ON DISK (${unmatchedProducts.length}) ---`)
    console.log("    These keep whatever images they have today.")
    unmatchedProducts.forEach(p => {
      console.log(`  ! ${p.id}  "${p.name}"  (${p.imgs.length} current image(s))`)
    })
  }

  const noImagesToday = products.filter(p => p.imgs.length === 0)
  if (noImagesToday.length > 0) {
    console.log(`\n--- PRODUCTS WITH NO IMAGES IN FIRESTORE TODAY (${noImagesToday.length}) ---`)
    noImagesToday.forEach(p => console.log(`  - ${p.id}  "${p.name}"`))
  }

  const emptyFolders = folders.filter(f => f.files.length === 0)
  if (emptyFolders.length > 0) {
    console.log(`\n--- EMPTY FOLDERS (${emptyFolders.length}) ---`)
    emptyFolders.forEach(f => console.log(`  - ${f.name}`))
  }

  const matched = exact.length + contained.length + fuzzy.length
  const imagesToUpload = [...exact, ...contained, ...fuzzy].reduce((sum, m) => sum + m.folder.files.length, 0)
  const imagesToDelete = [...exact, ...contained, ...fuzzy].reduce((sum, m) => sum + m.product.imgs.length, 0)

  console.log("\n" + "=".repeat(72))
  console.log(`Would update ${matched} product(s): upload ${imagesToUpload} new image(s), delete ${imagesToDelete} old one(s).`)
  console.log("=".repeat(72))
}

audit().catch(error => {
  console.error(error)
  process.exit(1)
})
