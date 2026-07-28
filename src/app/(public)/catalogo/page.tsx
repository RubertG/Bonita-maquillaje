import { Suspense } from "react"
import { BannerSection } from "@/components/catalogue/sections/banner-section"
import { MarqueeSection } from "@/components/catalogue/sections/marquee-section"
import { OffersSection } from "@/components/catalogue/sections/offers-section"
import { NewArrivalsSection } from "@/components/catalogue/sections/new-arrivals-section"
import { CategoryShowcaseSection } from "@/components/catalogue/sections/category-showcase-section"
import { CatalogLandingSkeleton } from "@/components/catalogue/catalog-landing-skeleton"

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
    <>
      <MarqueeSection className="mt-[3.8rem]" />
      <BannerSection />

      <main className="px-4 mb-20 mt-10 xl:px-0 max-w-6xl mx-auto">
        <h1 className="sr-only">Nuestro Catálogo</h1>

        <div className="flex flex-col gap-12 lg:gap-16">
          <Suspense fallback={<CatalogLandingSkeleton />}>
            <OffersSection />
            <NewArrivalsSection />
            <CategoryShowcaseSection />
          </Suspense>
        </div>
      </main>
    </>
  )
}
