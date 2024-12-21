import { Nav } from "@/components/catalogue/nav"
import { ViewTransitions } from "next-view-transitions"

export default function CatalogueLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransitions>
      <Nav />
      {children}
    </ViewTransitions>
  )
}