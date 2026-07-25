import { H1 } from "@/components/common/h1"
import { ProductsSection } from "@/components/catalogue/sections/products-section"
import { CatalogView } from "@/components/catalogue/catalog-view"

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

export default function CatalogProductsPage() {
  return (
    <main className="px-4 my-20 xl:px-0 max-w-6xl mx-auto">
      <H1 className="mb-2">Catálogo</H1>
      <ProductsSection>
        <CatalogView />
      </ProductsSection>
    </main>
  )
}
