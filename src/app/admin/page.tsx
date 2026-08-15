"use client"

import { LoginForm } from "@/components/admin/login/login-form"
import { Spinner } from "@/components/common/icons"
import { useAuthContext } from "@/hooks/auth/use-auth-context"
import { verifyAdminSession } from "@/app/actions/admin/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function LoginPage() {
  const { user, loading } = useAuthContext()
  const router = useRouter()
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!user) return

    let cancelled = false
    setChecking(true)

    verifyAdminSession().then((result) => {
      if (cancelled) return
      if (result.ok) {
        router.replace("/admin/productos")
      }
      setChecking(false)
    })

    return () => {
      cancelled = true
    }
  }, [user, router])

  if (loading || checking) {
    return (
      <main
        className="flex min-h-dvh items-center justify-center py-10 px-4">
        <Spinner />
      </main>
    )
  }

  return (
    <main
      className="flex min-h-dvh items-center justify-center py-10 px-4">
      <LoginForm />
    </main>
  )
}
