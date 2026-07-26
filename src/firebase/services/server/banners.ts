import "server-only"

import { adminDb } from "@/firebase/server"
import { ROUTES_COLLECTIONS } from "@/consts/db/db"
import { Banner, Id } from "@/types/db/db"

export interface BannerOrder {
  id: Id
  order: number
}

export async function getBanners(): Promise<Banner[]> {
  const snapshot = await adminDb.collection(ROUTES_COLLECTIONS.BANNERS).get()
  return snapshot.docs.map(
    doc => ({ ...doc.data(), id: doc.id }) as Banner
  )
}

export async function getActiveBanners(): Promise<Banner[]> {
  const snapshot = await adminDb
    .collection(ROUTES_COLLECTIONS.BANNERS)
    .orderBy("order", "asc")
    .get()

  return snapshot.docs
    .map(doc => ({ ...doc.data(), id: doc.id }) as Banner)
    .filter(banner => banner.active)
}

export async function createBanner(banner: Banner): Promise<void> {
  await adminDb
    .collection(ROUTES_COLLECTIONS.BANNERS)
    .doc(banner.id)
    .set(banner)
}

export async function updateBanner(banner: Banner): Promise<void> {
  await adminDb
    .collection(ROUTES_COLLECTIONS.BANNERS)
    .doc(banner.id)
    .set(banner, { merge: true })
}

export async function deleteBanner(id: Id): Promise<void> {
  await adminDb.collection(ROUTES_COLLECTIONS.BANNERS).doc(id).delete()
}

export async function reorderBanners(orders: BannerOrder[]): Promise<void> {
  if (orders.length === 0) return

  const collection = adminDb.collection(ROUTES_COLLECTIONS.BANNERS)
  const batch = adminDb.batch()

  for (const { id, order } of orders) {
    batch.update(collection.doc(id), { order })
  }

  await batch.commit()
}
