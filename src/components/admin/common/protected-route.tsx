"use client"

import { useAuthContext } from "@/hooks/auth/use-auth-context"
import { Spinner } from "../../common/icons"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { verifyAdminTokenAction } from "@/app/actions/admin/auth"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext()
  const [verified, setVerified] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace("/admin")
      return
    }

    user.getIdToken().then(async (token: string) => {
      const result = await verifyAdminTokenAction(token)
      if (result.ok) {
        setVerified(true)
      } else {
        router.replace("/admin")
      }
    })
  }, [user, loading, router])

  if (loading || !verified) {
    return (
      <main className="flex min-h-dvh items-center justify-center py-10 px-4">
        <Spinner />
      </main>
    )
  }

  return (
    <>
      {children}
    </>
  )
}