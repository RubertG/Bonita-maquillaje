import { verifyAdminSession } from "@/app/actions/admin/auth"
import { redirect } from "next/navigation"
import { ReactNode } from "react"

async function AdminLayout({
  children
}: {
  children: ReactNode
}) {
  const result = await verifyAdminSession()
  if (!result.ok) {
    redirect("/admin")
  }

  return <>{children}</>
}

export default AdminLayout
