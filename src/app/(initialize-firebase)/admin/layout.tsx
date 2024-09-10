import { AuthProvider } from "@/contexts/auth/auth-context"
import { ReactNode } from "react"

function AdminLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <AuthProvider>
      {
        children
      }
    </AuthProvider>
  )
}

export default AdminLayout