"use server"

import { verifyAdminToken } from "@/firebase/server"
import {
  createCategory as createCategoryServer,
  updateCategory as updateCategoryServer,
  deleteCategory as deleteCategoryServer
} from "@/firebase/services/server/categories"
import { Category, Id } from "@/types/db/db"

type ActionResult =
  | { ok: true }
  | { ok: false; error: string }

export async function createCategory(
  token: string,
  category: Category
): Promise<ActionResult> {
  try {
    await verifyAdminToken(token)
    await createCategoryServer(category)
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
    return { ok: true }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}
