"use client"

import { useAuth } from "@/hooks/auth/use-auth"
import { AuthContext } from "@/types/auth/auth"
import { createContext } from "react"

export const authContext = createContext<AuthContext>({
  loading: true,
  user: null
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth()

  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  )
}