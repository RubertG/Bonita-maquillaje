"use client"

import { authContext } from "@/contexts/auth/auth-context"
import { useContext } from "react"

export const useAuthContext = () => {
  const context = useContext(authContext)
  if (context === undefined) throw new Error('useAuthContext must be used within a AuthProvider')
  return context
}