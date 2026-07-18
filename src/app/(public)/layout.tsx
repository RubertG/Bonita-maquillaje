import { Nav } from "@/components/catalogue/nav"
import { Footer } from "@/components/common/footer"
import WhatsappButton from "@/components/common/whatsapp-button"
import { poppins } from "@/fonts/poppins/poppins"

export default function PublicLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Nav />
      <main className={`${poppins.className} min-h-[90vh]`}>
        {children}
      </main>
      <Footer />
      <WhatsappButton />
    </>
  )
}
