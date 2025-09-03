"use client"

import { useState, useCallback } from "react"

interface UseLoadingReturn {
  isLoading: boolean
  error: string | null
  startLoading: () => void
  stopLoading: () => void
  setError: (error: string | null) => void
  withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T | null>
}

/**
 * Hook customizado para gerenciar estados de loading e erro
 * @param initialLoading - Estado inicial de loading
 * @returns {UseLoadingReturn} Estado e funções para gerenciar loading
 */
export const useLoading = (initialLoading: boolean = false): UseLoadingReturn => {
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setError(null)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleSetError = useCallback((error: string | null) => {
    setError(error)
    setIsLoading(false)
  }, [])

  const withLoading = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
    startLoading()
    try {
      const result = await asyncFn()
      stopLoading()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      handleSetError(errorMessage)
      console.error("Erro na operação:", err)
      return null
    }
  }, [startLoading, stopLoading, handleSetError])

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError: handleSetError,
    withLoading,
  }
}