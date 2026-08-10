"use server"

import { verifyAdminToken } from "@/firebase/server"
import {
  createCategory as createCategoryServer,
  updateCategory as updateCategoryServer,
  deleteCategory as deleteCategoryServer,
  reorderCategories as reorderCategoriesServer,
  CategoryOrder
} from "@/firebase/services/server/categories"
import { Category, Id } from "@/types/db/db"
import { revalidatePath } from "next/cache"

type ActionResult =
  | { ok: true }
  | { ok: false; error: string }

// `/` builds as a static route and the nav in the root layout lists categories,
// so every category mutation has to invalidate that snapshot — otherwise the
// public nav keeps serving a stale list until the next deploy. Layout scope
// because the nav lives in the root layout, not in a single page.
function revalidateCategorySurfaces() {
  revalidatePath("/", "layout")
}

export async function createCategory(
  token: string,
  category: Category
): Promise<ActionResult> {
  try {
    await verifyAdminToken(token)
    await createCategoryServer(category)
    revalidateCategorySurfaces()
    return { ok: true }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}

export async function updateCategory(
  token: string,
  category: Category
): Promise<ActionResult> {
  try {
    await verifyAdminToken(token)
    await updateCategoryServer(category)
    revalidateCategorySurfaces()
    return { ok: true }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}

export async function deleteCategory(
  token: string,
  id: Id
): Promise<ActionResult> {
  try {
    await verifyAdminToken(token)
    await deleteCategoryServer(id)
    revalidateCategorySurfaces()
    return { ok: true }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}

export async function reorderCategories(
  token: string,
  orders: CategoryOrder[]
): Promise<ActionResult> {
  try {
    await verifyAdminToken(token)
    await reorderCategoriesServer(orders)
    revalidateCategorySurfaces()
    return { ok: true }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}
