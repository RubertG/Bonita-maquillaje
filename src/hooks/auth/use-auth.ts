"use client"

import { auth } from "@/firebase/initializeApp"
import { onAuthStateChanged, User } from "firebase/auth"
import { useEffect, useState } from "react"

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
  }, [])

  return {
    user,
    loading
  }
}