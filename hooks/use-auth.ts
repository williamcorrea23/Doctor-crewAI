"use client"

import { useContext } from "react"
import { AuthContext } from "@/components/auth-provider"

/**
 * Hook customizado para acessar o contexto de autenticação
 * @returns {AuthContextType} Contexto de autenticação com user, loading e logout
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  
  return context
}