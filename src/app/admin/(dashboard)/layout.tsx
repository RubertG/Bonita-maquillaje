import { Nav } from "@/components/admin/common/nav"
import { verifyAdminSession } from "@/app/actions/admin/auth"
import { ProductsAdminProvider } from "@/contexts/admin/products/products-context"
import { poppins } from "@/fonts/poppins/poppins"
import { redirect } from "next/navigation"
import { ReactNode } from "react"

export default async function AdminDashboardLayout({
  children
}: {
  children: ReactNode
}) {
  const result = await verifyAdminSession()
  if (!result.ok) {
    redirect("/admin")
  }

  return (
    <ProductsAdminProvider>
      <div className={`${poppins.className} min-h-[90vh]`}>
        <Nav />
        {children}
      </div>
    </ProductsAdminProvider>
  )
}