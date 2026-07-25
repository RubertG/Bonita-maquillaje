import { CatalogProductsProvider } from "@/contexts/catalog/catalog-products-context"
import { getProducts } from "@/firebase/services/server/products"
import { ReactNode } from "react"

export async function ProductsSection({ children }: { children: ReactNode }) {
  const products = await getProducts()

  return (
    <CatalogProductsProvider initialProducts={products}>
      {children}
    </CatalogProductsProvider>
  )
}
