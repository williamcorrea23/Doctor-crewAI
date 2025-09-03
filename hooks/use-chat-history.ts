"use client"

import { useState, useEffect, useCallback } from "react"
import { loadChatHistory } from "@/lib/chat-history"
import { useAuth } from "@/hooks/use-auth"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

interface UseChatHistoryReturn {
  messages: Message[]
  isLoading: boolean
  error: string | null
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void
  clearMessages: () => void
  refreshHistory: () => Promise<void>
}

/**
 * Hook customizado para gerenciar histórico de chat
 * @param subject - Matéria do chat
 * @param limit - Limite de mensagens a carregar
 * @returns {UseChatHistoryReturn} Estado e funções para gerenciar o chat
 */
export const useChatHistory = (
  subject: string,
  limit: number = 20
): UseChatHistoryReturn => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const loadHistory = useCallback(async () => {
    if (!user || !subject) return

    setIsLoading(true)
    setError(null)

    try {
      const history = await loadChatHistory(user.uid, subject, limit)
      const historyMessages: Message[] = history.map((msg) => ({
        id: msg.id,
        text: msg.text,
        sender: msg.sender as "user" | "bot",
        timestamp: msg.timestamp.toDate(),
      }))
      setMessages(historyMessages)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar histórico")
      console.error("Erro ao carregar histórico do chat:", err)
    } finally {
      setIsLoading(false)
    }
  }, [user, subject, limit])

  const addMessage = useCallback((message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, newMessage])
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  const refreshHistory = useCallback(async () => {
    await loadHistory()
  }, [loadHistory])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  return {
    messages,
    isLoading,
    error,
    addMessage,
    clearMessages,
    refreshHistory,
  }
}