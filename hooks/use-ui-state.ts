import { useState, useCallback } from 'react'

interface UIState {
  [key: string]: boolean | string | number | null
}

export function useUIState<T extends UIState>(initialState: T) {
  const [state, setState] = useState<T>(initialState)

  const updateState = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setState(prev => ({ ...prev, [key]: value }))
  }, [])

  const toggleState = useCallback((key: keyof T) => {
    setState(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const resetState = useCallback(() => {
    setState(initialState)
  }, [initialState])

  const resetKey = useCallback((key: keyof T) => {
    setState(prev => ({ ...prev, [key]: initialState[key] }))
  }, [initialState])

  return {
    state,
    updateState,
    toggleState,
    resetState,
    resetKey,
  }
}