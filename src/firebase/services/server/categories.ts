import "server-only"

import { adminDb } from "@/firebase/server"
import { ROUTES_COLLECTIONS } from "@/consts/db/db"
import { Category, Id } from "@/types/db/db"
import { filterPublicCategories } from "@/lib/category-filter"
import { getAppEnv } from "@/lib/env"
import { cache } from "react"

interface GetCategoriesOptions {
  publicOnly?: boolean
}

export const getCategories = cache(
  async (options: GetCategoriesOptions = {}): Promise<Category[]> => {
    const { publicOnly = false } = options
    const snapshot = await adminDb.collection(ROUTES_COLLECTIONS.CATEGORIES).get()
    const categories = snapshot.docs.map(
      doc => ({ ...doc.data(), id: doc.id }) as Category
    )

    if (!publicOnly) return categories

    return filterPublicCategories(categories, getAppEnv())
  }
)

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
