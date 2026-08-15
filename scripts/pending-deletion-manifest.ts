// Shared shape of the pending-deletion manifest written by
// replace-product-images.ts and consumed by delete-orphan-product-images.ts.
//
// The manifest is the record of which Storage objects stopped being referenced
// by a product, so the deletion step never has to re-derive that from scratch.

export const MANIFEST_VERSION = 1

export interface OrphanImage {
  productId: string
  productName: string
  storagePath: string
  name: string
  url: string
  size: number
  // Null when the object was already missing from Storage at backup time, so
  // there is no local copy to fall back on.
  md5: string | null
  localFile: string | null
}

export interface PendingDeletionManifest {
  version: number
  createdAt: string
  projectId: string
  bucket: string
  collection: string
  backupPath: string
  backupImagesDir: string
  count: number
  images: OrphanImage[]
}
