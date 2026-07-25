import { CategoriesSection } from "@/components/catalogue/sections/categories-section"
import { H1 } from "@/components/common/h1"
import { ButtonWithIcon } from "@/components/common/button-with-icon"
import { Gift, SaveCart, Share } from "@/components/common/icons"

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
    "Bonita maquillaje, bonita, maquillaje, web, cucuta, tienda virtual, skincare, accesorios.",
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

export default function CataloguePage() {
  return (
    <main className="px-4 my-20 xl:px-0 max-w-6xl mx-auto">
      <H1 className="mb-6">Nuestro Catálogo</H1>

      <CategoriesSection baseHref="/catalogo/productos" />

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ButtonWithIcon href="/catalogo/productos?tipo=ofertas">
          <Gift className="stroke-text-100 w-6 h-6" />
          Ofertas
        </ButtonWithIcon>
        <ButtonWithIcon href="/catalogo/productos?tipo=mas-vendidos">
          <SaveCart className="stroke-text-100 w-6 h-6" />
          Más vendidos
        </ButtonWithIcon>
        <ButtonWithIcon href="/catalogo/productos?tipo=nuevos">
          <Share className="stroke-text-100 w-6 h-6" />
          Nuevos
        </ButtonWithIcon>
        <ButtonWithIcon href="/catalogo/productos">
          Ver todos los productos
        </ButtonWithIcon>
      </section>
    </main>
  )
}
