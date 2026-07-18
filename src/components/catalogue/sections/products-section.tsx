import { ProductsContainer } from "@/components/catalogue/products-container"
import { CatalogProductsProvider } from "@/contexts/catalog/catalog-products-context"
import { getProducts } from "@/firebase/services/server/products"

export async function ProductsSection() {
  const products = await getProducts()

  return (
    <CatalogProductsProvider initialProducts={products}>
      <ProductsContainer className="mt-6" />
    </CatalogProductsProvider>
  )
}
