import "server-only"

import { adminDb } from "@/firebase/server"
import { ROUTES_COLLECTIONS } from "@/consts/db/db"
import { Id, Product } from "@/types/db/db"
import { CatalogProduct } from "@/types/server/catalog"
import { FieldValue } from "firebase-admin/firestore"
import { cache } from "react"

interface GetProductsOptions {
  category?: Id
  search?: string
}

function timestampToISOString(
  timestamp: Product["createdAt"]
): string | undefined {
  if (!timestamp || typeof timestamp.toDate !== "function") return undefined
  return timestamp.toDate().toISOString()
}

export function toCatalogProduct(product: Product): CatalogProduct {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { stock: _stock, createdAt: _createdAt, ...rest } = product
  return {
    ...rest,
    id: product.id,
    createdAt: timestampToISOString(product.createdAt),
    offerPrice: product.offerPrice ?? null,
    isBestSeller: product.isBestSeller ?? false,
    isNew: product.isNew ?? false
  }
}

const getAllProducts = cache(async (): Promise<CatalogProduct[]> => {
  const snapshot = await adminDb.collection(ROUTES_COLLECTIONS.PRODUCTS).get()
  return snapshot.docs.map(doc => toCatalogProduct({ ...doc.data(), id: doc.id } as Product))
})

export async function getProducts({
  category,
  search
}: GetProductsOptions = {}): Promise<CatalogProduct[]> {
  const products = await getAllProducts()
  const lowerSearch = search?.toLowerCase()

  return products.filter(product => {
    if (category && product.category !== category) return false
    if (lowerSearch && !product.name.toLowerCase().includes(lowerSearch)) return false
    return true
  })
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
    .set({
      ...product,
      createdAt: FieldValue.serverTimestamp()
    })
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

export async function getBestSellers(): Promise<CatalogProduct[]> {
  return (await getProducts()).filter(product => product.isBestSeller)
}

export async function getNewArrivals(): Promise<CatalogProduct[]> {
  return (await getProducts()).filter(product => product.isNew)
}

export async function getOnOffer(): Promise<CatalogProduct[]> {
  return (await getProducts()).filter(
    product => product.offerPrice != null && product.offerPrice < product.price
  )
}

export async function getProductsByCreatedAt(
  order: "asc" | "desc" = "desc"
): Promise<CatalogProduct[]> {
  return (await getProducts()).sort((a, b) => {
    const aTime = a.createdAt ?? ""
    const bTime = b.createdAt ?? ""
    return order === "asc" ? aTime.localeCompare(bTime) : bTime.localeCompare(aTime)
  })
}
