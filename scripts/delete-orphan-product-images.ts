import { config } from "dotenv"
config({ path: ".env.local" })

import { createHash } from "node:crypto"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"
import { ROUTES_COLLECTIONS } from "../src/consts/db/db"
import { FileStateItem } from "../src/types/admin/admin"
import { MANIFEST_VERSION, PendingDeletionManifest } from "./pending-deletion-manifest"
//
// Deletes the Storage objects recorded in a pending-deletion manifest written by
// replace-product-images.ts. This is the only script that removes product images.
//
//   pnpm delete-orphan-product-images <manifest.json> --dry-run
//   pnpm delete-orphan-product-images <manifest.json> --confirm
//
// It refuses to delete anything unless, for every object in the manifest:
//   - no product in Firestore still references it (checked live, not from the
//     manifest — a rollback or a manual re-upload must win over this file);
//   - a verified local backup copy exists, so the deletion stays reversible;
//   - the product it belonged to currently has at least one image that really
//     exists in Storage, so no product is left with a broken gallery.
//
// Any failed check aborts the whole run. Partial deletion of a half-correct state
// is worse than no deletion at all.
const BACKUPS_DIR = resolve(process.cwd(), "backups")

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
  console.error("Missing NEXT_PUBLIC_STORAGE_BUCKET in .env.local — images cannot be deleted without it.")
  process.exit(1)
}

const manifestArg = process.argv.slice(2).find(arg => !arg.startsWith("--"))
if (!manifestArg) {
  console.error("Usage: pnpm delete-orphan-product-images <manifest.json> [--dry-run|--confirm]")
  process.exit(1)
}

const manifestPath = resolve(process.cwd(), manifestArg)
if (!existsSync(manifestPath)) {
  console.error(`Manifest not found: ${manifestPath}`)
  process.exit(1)
}

const app = getApps().at(0) || initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
  storageBucket
})

const db = getFirestore(app)
const bucket = getStorage(app).bucket()

async function deleteOrphanProductImages() {
  const dryRun = process.argv.includes("--dry-run")
  const confirm = process.argv.includes("--confirm")

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as PendingDeletionManifest

  const errors: string[] = []

  if (manifest.version !== MANIFEST_VERSION) {
    console.error(`Unsupported manifest version ${manifest.version} (expected ${MANIFEST_VERSION}).`)
    process.exit(1)
  }
  // Deleting against the wrong project or bucket is unrecoverable.
  if (manifest.projectId !== projectId) {
    console.error(`Manifest was written for project "${manifest.projectId}" but .env.local points at "${projectId}".`)
    process.exit(1)
  }
  if (manifest.bucket !== storageBucket) {
    console.error(`Manifest was written for bucket "${manifest.bucket}" but .env.local points at "${storageBucket}".`)
    process.exit(1)
  }
  if (manifest.count !== manifest.images.length) {
    console.error(`Manifest is inconsistent: count says ${manifest.count}, it holds ${manifest.images.length}.`)
    process.exit(1)
  }

  console.log(`Manifest:  ${manifestPath}`)
  console.log(`Written:   ${manifest.createdAt}`)
  console.log(`Backup:    ${manifest.backupPath}`)
  console.log(`Images recorded for deletion: ${manifest.images.length}`)

  if (manifest.images.length === 0) {
    console.log("\nNothing to delete.")
    return
  }

  // 1. Live Firestore state wins over the manifest. If anything still points at
  //    one of these objects — a rollback, a manual re-upload, an admin edit —
  //    deleting it would break a product that is currently fine.
  const snapshot = await db.collection(ROUTES_COLLECTIONS.PRODUCTS).get()
  const referenced = new Map<string, string[]>()
  snapshot.docs.forEach(doc => {
    const imgs = (doc.data().imgs ?? []) as FileStateItem[]
    imgs.forEach(img => {
      const holders = referenced.get(img.name) ?? []
      holders.push(`${doc.id} ("${doc.data().name}")`)
      referenced.set(img.name, holders)
    })
  })

  manifest.images.forEach(image => {
    const holders = referenced.get(image.name)
    if (holders) {
      errors.push(`${image.storagePath} is still referenced by ${holders.join(", ")}`)
    }
  })

  // 2. A local copy must exist and still match its recorded md5, otherwise the
  //    deletion is not reversible and this script has no business running.
  const imagesDir = existsSync(manifest.backupImagesDir)
    ? manifest.backupImagesDir
    : join(BACKUPS_DIR, manifest.backupImagesDir)

  const deletable: typeof manifest.images = []
  const alreadyGone: typeof manifest.images = []

  // Two products can reference the same Storage object, which lands in the
  // manifest twice. Deleting by path, not by record, keeps the second pass from
  // reporting a spurious 404.
  const seenPaths = new Set<string>()
  const uniqueImages = manifest.images.filter(image => {
    if (seenPaths.has(image.storagePath)) return false
    seenPaths.add(image.storagePath)
    return true
  })
  const sharedCount = manifest.images.length - uniqueImages.length

  for (const image of uniqueImages) {
    if (!image.localFile || !image.md5) {
      // Recorded as already missing from Storage when the backup ran.
      alreadyGone.push(image)
      continue
    }
    const localFile = join(imagesDir, image.localFile)
    if (!existsSync(localFile)) {
      errors.push(`backup copy missing for ${image.storagePath} (expected ${localFile})`)
      continue
    }
    const md5 = createHash("md5").update(readFileSync(localFile)).digest("base64")
    if (md5 !== image.md5) {
      errors.push(`backup copy of ${image.storagePath} is corrupted: md5 ${md5} vs recorded ${image.md5}`)
      continue
    }
    deletable.push(image)
  }

  // 3. Every affected product must currently hold at least one image that really
  //    exists in Storage. Checked per product, not per manifest entry, so a
  //    product whose new upload silently failed is caught before its old images
  //    are removed.
  const affectedProductIds = [...new Set(manifest.images.map(image => image.productId))]
  const docsById = new Map(snapshot.docs.map(doc => [doc.id, doc]))

  for (const productId of affectedProductIds) {
    const doc = docsById.get(productId)
    if (!doc) {
      errors.push(`product ${productId} no longer exists in Firestore — refusing to delete its images`)
      continue
    }
    const imgs = (doc.data().imgs ?? []) as FileStateItem[]
    if (imgs.length === 0) {
      errors.push(`product ${productId} ("${doc.data().name}") has no images left — refusing to delete its old ones`)
      continue
    }
    const checks = await Promise.all(imgs.map(img => bucket.file(`products/${img.name}`).exists()))
    const liveCount = checks.filter(([exists]) => exists).length
    if (liveCount !== imgs.length) {
      errors.push(
        `product ${productId} ("${doc.data().name}") references ${imgs.length} image(s) but only ${liveCount} exist in Storage`
      )
    }
  }

  const byProduct = new Map<string, number>()
  deletable.forEach(image => byProduct.set(image.productName, (byProduct.get(image.productName) ?? 0) + 1))

  console.log(`\n${deletable.length} object(s) ready to delete, across ${byProduct.size} product(s):`)
  ;[...byProduct.entries()].sort(([a], [b]) => a.localeCompare(b)).forEach(([name, count]) => {
    console.log(`  - ${name}: ${count}`)
  })

  if (sharedCount > 0) {
    console.log(`\n${sharedCount} record(s) point at an object another product also used — counted once.`)
  }

  if (alreadyGone.length > 0) {
    console.log(`\n${alreadyGone.length} were already missing from Storage when the backup ran — nothing to do for them.`)
  }

  if (errors.length > 0) {
    console.error(`\n${errors.length} check(s) failed — nothing was deleted:`)
    errors.forEach(error => console.error(`  x ${error}`))
    process.exit(1)
  }

  console.log("\nAll checks passed: no product references these objects, every one has a verified")
  console.log("local backup copy, and every affected product has live images in Storage.")

  if (dryRun || !confirm) {
    if (!dryRun) {
      console.error("\nRefusing to run: these objects would be permanently deleted from Storage.")
      console.error("Re-run with --confirm once the list above is correct.")
      process.exit(1)
    }
    console.log("\nDry run complete. Nothing was deleted.")
    return
  }

  console.log("\nDeleting...")
  let deleted = 0
  let missing = 0
  const failed: string[] = []

  for (const image of deletable) {
    try {
      await bucket.file(image.storagePath).delete()
      deleted++
    } catch (error) {
      const code = (error as { code?: number }).code
      if (code === 404) {
        missing++
        continue
      }
      failed.push(`${image.storagePath}: ${(error as Error).message}`)
    }
  }

  console.log(`  deleted ${deleted} object(s)${missing > 0 ? `, ${missing} were already gone` : ""}`)
  if (failed.length > 0) {
    console.error(`  ${failed.length} could not be deleted:`)
    failed.forEach(entry => console.error(`    x ${entry}`))
  }

  // The manifest is marked rather than removed, so a second run cannot silently
  // re-delete and the record of what happened stays next to the backup.
  const appliedPath = manifestPath.replace(/\.json$/, "") + ".applied.json"
  writeFileSync(
    appliedPath,
    JSON.stringify({ ...manifest, appliedAt: new Date().toISOString(), deleted, missing, failed }, null, 1),
    "utf8"
  )

  console.log(`\nDone. Record written to ${appliedPath}`)
  console.log(`The local copies are still in ${imagesDir}`)
  console.log(`To put everything back: pnpm restore-products-backup ${manifest.backupPath}`)
}

deleteOrphanProductImages().catch(error => {
  console.error(error)
  process.exit(1)
})
