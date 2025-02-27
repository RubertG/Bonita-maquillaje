import { Nav } from "@/components/catalogue/nav"
import { PurchaseReminder } from "@/components/catalogue/purchase-reminder"
import { Toaster } from "@/components/common/toaster"
import WhatsappButton from "@/components/common/whatsapp-button"

export default function CatalogueLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
      <WhatsappButton />
      <Toaster />
      <PurchaseReminder />
    </>
  )
}