import type { Category, Product } from "@/types/db/db"

export type CatalogProduct = Omit<Product, "stock"> & { id: string }

export interface CatalogResponse {
  categories: Category[]
  products: CatalogProduct[]
}
