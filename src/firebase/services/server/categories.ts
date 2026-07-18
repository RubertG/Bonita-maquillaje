import "server-only"

import { adminDb } from "@/firebase/server"
import { ROUTES_COLLECTIONS } from "@/consts/db/db"
import { Category, Id } from "@/types/db/db"

export async function getCategories(): Promise<Category[]> {
  const snapshot = await adminDb.collection(ROUTES_COLLECTIONS.CATEGORIES).get()
  return snapshot.docs.map(
    doc => ({ ...doc.data(), id: doc.id }) as Category
  )
}

export async function getCategory(id: Id): Promise<Category | null> {
  const doc = await adminDb.collection(ROUTES_COLLECTIONS.CATEGORIES).doc(id).get()
  if (!doc.exists) return null

  return { ...doc.data(), id: doc.id } as Category
}

export async function createCategory(category: Category): Promise<void> {
  await adminDb
    .collection(ROUTES_COLLECTIONS.CATEGORIES)
    .doc(category.id)
    .set(category)
}

export async function updateCategory(category: Category): Promise<void> {
  await adminDb
    .collection(ROUTES_COLLECTIONS.CATEGORIES)
    .doc(category.id)
    .set(category, { merge: true })
}

export async function deleteCategory(id: Id): Promise<void> {
  await adminDb.collection(ROUTES_COLLECTIONS.CATEGORIES).doc(id).delete()
}
