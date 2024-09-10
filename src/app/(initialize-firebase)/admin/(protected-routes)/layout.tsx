import { Nav } from "@/components/admin/common/nav"
import { ProtectedRoute } from "@/components/admin/common/protected-route"
import { ReactNode } from "react"

function AdminLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <ProtectedRoute>
      <Nav />
      {
        children
      }
    </ProtectedRoute >
  )
}

export default AdminLayout