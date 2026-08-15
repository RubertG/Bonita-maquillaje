import type { Category, Product } from "@/types/db/db"

export type CatalogProduct = Omit<Product, "stock" | "createdAt"> & {
  id: string
  createdAt?: string
}

export interface CatalogResponse {
  categories: Category[]
  products: CatalogProduct[]
}
