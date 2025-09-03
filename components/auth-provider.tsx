"use client"

import type React from "react"
import { createContext, useEffect, useState } from "react"
import type { User } from "firebase/auth"
import { onAuthStateChange } from "@/lib/auth"
import { useRouter, usePathname } from "next/navigation"

export interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
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

  const contextValue: AuthContextType = {
    user,
    loading,
    logout,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
