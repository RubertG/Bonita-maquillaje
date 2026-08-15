"use server"

import { verifyAdminToken } from "@/firebase/server"
import {
  createProduct as createProductServer,
  updateProduct as updateProductServer,
  deleteProduct as deleteProductServer
} from "@/firebase/services/server/products"
import { Id, Product } from "@/types/db/db"

type ActionResult =
  | { ok: true }
  | { ok: false; error: string }

export async function createProduct(
  token: string,
  product: Product
): Promise<ActionResult> {
  try {
    await verifyAdminToken(token)
    await createProductServer(product)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}

export async function updateProduct(
  token: string,
  product: Product
): Promise<ActionResult> {
  try {
    await verifyAdminToken(token)
    await updateProductServer(product)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}

export async function deleteProduct(
  token: string,
  id: Id
): Promise<ActionResult> {
  try {
    await verifyAdminToken(token)
    await deleteProductServer(id)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}
