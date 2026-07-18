import { AuthProvider } from "@/contexts/auth/auth-context"
import { ReactNode } from "react"

export default function AdminLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
