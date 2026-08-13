import { Suspense } from "react"
import { H1 } from "@/components/common/h1"
import { ProductsSection } from "@/components/catalogue/sections/products-section"
import { CatalogView } from "@/components/catalogue/catalog-view"
import { CatalogFiltersProvider } from "@/contexts/catalog/catalog-filters-context"
import { ProductSkeleton } from "@/components/catalogue/product-skeleton"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Catálogo - Bonita Maquillaje",
  description: "Catálogo de productos de Bonita Maquillaje. Encuentra los mejores productos de marcas Colombianas en maquillaje, skincare y accesorios.",
  authors: {
    name: "Rubert Gonzalez - Desarrollador web",
    url: "https://rubertweb.dev"
  },
  keywords: "Bonita maquillaje, bonita, maquillaje, web, cucuta, tienda virtual, skincare, accesorios.",
  openGraph: {
    title: "Bonita Maquillaje",
    description: "Catálogo de productos de Bonita Maquillaje. Encuentra los mejores productos de marcas Colombianas en maquillaje, skincare y accesorios.",
    images: "/logo.webp",
    type: "website",
    url: "https://bonita-maquillaje.com/catalogo/productos",
    siteName: "Bonita Maquillaje"
  }
}

function ProductsSkeletonGrid() {
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-5 lg:gap-2">
      {Array(10).fill(0).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </ul>
  )
}

export default function CatalogProductsPage() {
  return (
    <main className="px-4 my-20 xl:px-0 max-w-6xl mx-auto">
      <H1 className="mb-2">Catálogo</H1>
      <Suspense fallback={<ProductsSkeletonGrid />}>
        <ProductsSection>
          <CatalogFiltersProvider>
            <CatalogView />
          </CatalogFiltersProvider>
        </ProductsSection>
      </Suspense>
    </main>
  )
}
