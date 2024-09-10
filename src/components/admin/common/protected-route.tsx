"use client"

import { useAuthContext } from "@/hooks/auth/use-auth-context"
import { Spinner } from "../../common/icons"
import { redirect } from "next/navigation"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center py-10 px-4">
        <Spinner />
      </main>
    )
  }

  if (!user) {
    return redirect("/admin")
  }

  return (
    <>
      {children}
    </>
  )
}