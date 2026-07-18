import { Nav } from "@/components/catalogue/nav"
import { Footer } from "@/components/common/footer"
import WhatsappButton from "@/components/common/whatsapp-button"
import { CatalogProductsProvider } from "@/contexts/catalog/catalog-products-context"
import { poppins } from "@/fonts/poppins/poppins"

export default function PublicLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <CatalogProductsProvider>
      <Nav />
      <main className={`${poppins.className} min-h-[90vh]`}>
        {children}
      </main>
      <Footer />
      <WhatsappButton />
    </CatalogProductsProvider>
  )
}
