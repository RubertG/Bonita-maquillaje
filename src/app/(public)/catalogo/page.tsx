import { Suspense } from "react"

import { CategoriesSkeletonContainer } from "@/components/admin/categories/categories-skeleton-container"
import { ProductSkeleton } from "@/components/catalogue/product-skeleton"
import { CategoriesSection } from "@/components/catalogue/sections/categories-section"
import { ProductsSection } from "@/components/catalogue/sections/products-section"
import { H1 } from "@/components/common/h1"
import { Searcher } from "@/components/common/searcher"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Nuestro catálogo - Bonita Maquillaje",
  description:
    "Catálogo de productos de Bonita Maquillaje. Encuentra los mejores productos de marcas Colombianas en maquillaje, skincare y accesorios.",
  authors: {
    name: "Rubert Gonzalez - Desarrollador web",
    url: "https://rubertweb.dev"
  },
  keywords:
    "Bonita maquillaje, bonita, maquillaje, web, cucuta, tineda virtual, skincare, accesorios.",
  openGraph: {
    title: "Bonita Maquillaje",
    description:
      "Catálogo de productos de Bonita Maquillaje. Encuentra los mejores productos de marcas Colombianas en maquillaje, skincare y accesorios.",
    images: "/logo.webp",
    type: "website",
    url: "https://bonita-maquillaje.com/catalogo",
    siteName: "Bonita Maquillaje"
  }
}

export default async function CataloguePage() {
  return (
    <main className="px-4 my-16 xl:px-0 lg:mt-20 max-w-6xl mx-auto">
      <H1 className="mb-6">Nuestro Catálogo</H1>
      <Searcher className="max-w-2xl mx-auto" />

      <Suspense
        fallback={
          <CategoriesSkeletonContainer className="mt-6 lg:mt-4" />
        }
      >
        <CategoriesSection />
      </Suspense>

      <Suspense
        fallback={
          <ul className="mt-6 grid items-start grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-5 lg:gap-2">
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
          </ul>
        }
      >
        <ProductsSection />
      </Suspense>
    </main>
  )
}
