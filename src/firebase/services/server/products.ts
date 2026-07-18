import "server-only"

import { adminDb } from "@/firebase/server"
import { ROUTES_COLLECTIONS } from "@/consts/db/db"
import { Id, Product } from "@/types/db/db"
import { CatalogProduct } from "@/types/server/catalog"

interface GetProductsOptions {
  category?: Id
  search?: string
}

export function toCatalogProduct(product: Product): CatalogProduct {
  const { stock: _stock, ...rest } = product
  return { ...rest, id: product.id }
}

export async function getProducts({
  category,
  search
}: GetProductsOptions = {}): Promise<CatalogProduct[]> {
  const snapshot = await adminDb.collection(ROUTES_COLLECTIONS.PRODUCTS).get()
  const products = snapshot.docs.map(
    doc => ({ ...doc.data(), id: doc.id }) as Product
  )

  const lowerSearch = search?.toLowerCase()

  return products
    .filter(product => {
      if (category && product.category !== category) return false
      if (lowerSearch && !product.name.toLowerCase().includes(lowerSearch)) return false
      return true
    })
    .map(toCatalogProduct)
}

export async function getProduct(id: Id): Promise<CatalogProduct | null> {
  const doc = await adminDb.collection(ROUTES_COLLECTIONS.PRODUCTS).doc(id).get()
  if (!doc.exists) return null

  return toCatalogProduct({ ...doc.data(), id: doc.id } as Product)
}

export async function createProduct(product: Product): Promise<void> {
  await adminDb
    .collection(ROUTES_COLLECTIONS.PRODUCTS)
    .doc(product.id)
    .set(product)
}

export async function updateProduct(product: Product): Promise<void> {
  await adminDb
    .collection(ROUTES_COLLECTIONS.PRODUCTS)
    .doc(product.id)
    .set(product, { merge: true })
}

export async function deleteProduct(id: Id): Promise<void> {
  await adminDb.collection(ROUTES_COLLECTIONS.PRODUCTS).doc(id).delete()
}
