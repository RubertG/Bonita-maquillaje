import { Nav } from "@/components/catalogue/nav"
import WhatsappButton from "@/components/common/whatsapp-button"

export default function CatalogueLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
      <WhatsappButton />
    </>
  )
}