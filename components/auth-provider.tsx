"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "firebase/auth"
import { onAuthStateChange } from "@/lib/auth"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const logout = () => {
    setUser(null)
    router.push("/login")
  }

  useEffect(() => {
    // Autenticação Firebase
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)

      // Redirecionar baseado no estado de autenticação
      if (!user && pathname !== "/login" && pathname !== "/register") {
        router.push("/login")
      } else if (user && (pathname === "/login" || pathname === "/register")) {
        router.push("/")
      }
    })

    return () => unsubscribe()
  }, [router, pathname])

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>
  )
}
