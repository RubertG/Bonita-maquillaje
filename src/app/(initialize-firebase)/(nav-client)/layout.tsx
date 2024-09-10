import { Nav } from "@/components/catalogue/nav"

export default function CatalogueLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
    </>
  )
}