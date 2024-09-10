import { ProductsContainer } from "@/components/catalogue/products-container"
import { CategoriesContainer } from "@/components/catalogue/categories-container"
import { H1 } from "@/components/common/h1"
import { Searcher } from "@/components/common/searcher"
import { Suspense } from "react"
import { CategoriesSkeletonContainer } from "@/components/admin/categories/categories-skeleton-container"

export const metadata = {
  title: "Nuestro catálogo - Bonita Maquillaje",
  description: "Catálogo de productos de Bonita Maquillaje. Encuentra los mejores productos de marcas Colombianas en maquillaje, skincare y accesorios.",
  authors: {
    name: "Rubert Gonzalez - Desarrollador web",
    url: "https://rubertweb.dev"
  },
  keywords: 'Bonita maquillaje, bonita, maquillaje, web, cucuta, tineda virtual, skincare, accesorios.',
  openGraph: {
    title: "Bonita Maquillaje",
    description: "Catálogo de productos de Bonita Maquillaje. Encuentra los mejores productos de marcas Colombianas en maquillaje, skincare y accesorios.",
    images: '/logo.webp',
    type: 'website',
    url: 'https://bonita-maquillaje.com/catalogo',
    siteName: 'Bonita Maquillaje'
  }
}

async function CataloguePage() {
  return (
    <main
      className="px-4 my-16 xl:px-0 lg:mt-20 max-w-6xl mx-auto"
    >
      <H1 className="mb-6">Nuestro Catálogo</H1>
      <Searcher className="max-w-2xl mx-auto" />

      <Suspense fallback={<CategoriesSkeletonContainer className="mt-6 lg:mt-4" />}>
        <CategoriesContainer className="mt-6 lg:mt-4" />
      </Suspense>

      <ProductsContainer className="mt-6" />
    </main>
  )
}

export default CataloguePage  