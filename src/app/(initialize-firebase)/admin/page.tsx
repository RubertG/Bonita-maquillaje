"use client"

import { LoginForm } from "@/components/admin/login/login-form"
import { Spinner } from "@/components/common/icons"
import { useAuthContext } from "@/hooks/auth/use-auth-context"
import { redirect } from "next/navigation"

export default function LoginPage() {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <main
        className="flex min-h-dvh items-center justify-center py-10 px-4">
        <Spinner />
      </main>
    )
  }

  if (user) {
    return redirect("/admin/productos")
  }

  return (
    <main
      className="flex min-h-dvh items-center justify-center py-10 px-4">
      <LoginForm />
    </main>
  )
}
