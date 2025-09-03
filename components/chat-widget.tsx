"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, MessageCircle, Send, Bot, User, X, Minimize2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useChatHistory } from "@/hooks/use-chat-history"
import { useLoading } from "@/hooks/use-loading"
import { getCurrentUserToken } from "@/lib/auth"

interface ChatWidgetProps {
  subject: string
  subjectName: string
  isOpen: boolean
  onToggle: () => void
}

export function ChatWidget({ subject, subjectName, isOpen, onToggle }: ChatWidgetProps) {
  const [inputMessage, setInputMessage] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const { messages, isLoading: isLoadingHistory, addMessage } = useChatHistory(subject)
  const { isLoading, withLoading } = useLoading()

  useEffect(() => {
    // Add welcome message if no history loaded
    if (isOpen && messages.length === 0 && !isLoadingHistory) {
      const welcomeMessage = {
        text: `Olá! Sou seu assistente especializado em ${subjectName}. Como posso ajudar você hoje?`,
        sender: "bot" as const,
      }
      addMessage(welcomeMessage)
    }
  }, [isOpen, messages.length, isLoadingHistory, subjectName, addMessage])

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return

    const userMessage = {
      text: inputMessage,
      sender: "user" as const,
    }

    addMessage(userMessage)
    const currentMessage = inputMessage
    setInputMessage("")

    await withLoading(async () => {
      try {
        const token = await getCurrentUserToken()
        
        if (!token) {
          throw new Error('Token de autenticação não disponível')
        }

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: currentMessage,
            subject,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const botMessage = {
            text: data.response,
            sender: "bot" as const,
          }
          addMessage(botMessage)
        } else {
          throw new Error("Falha na comunicação")
        }
      } catch (error) {
        console.error("Erro no chat:", error)
        
        let errorMessage = "Desculpe, houve um problema. Tente novamente em alguns instantes."
        
        if (error instanceof Error) {
          if (error.message.includes('Token de autenticação')) {
            errorMessage = "Sessão expirada. Por favor, faça login novamente."
          } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage = "Erro de conexão. Verifique sua internet e tente novamente."
          } else if (error.message.includes('401')) {
            errorMessage = "Acesso não autorizado. Faça login novamente."
          } else if (error.message.includes('500')) {
            errorMessage = "Erro interno do servidor. Tente novamente em alguns minutos."
          }
        }
        
        const botErrorMessage = {
          text: errorMessage,
          sender: "bot" as const,
        }
        addMessage(botErrorMessage)
      }
    })
  }

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed right-4 bottom-24 z-50 h-14 w-14 rounded-full bg-blue-600 shadow-lg hover:bg-blue-700"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed right-4 bottom-24 z-50 h-96 w-80 border-0 bg-white/95 shadow-xl backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bot className="h-4 w-4 text-blue-600" />
            Chat - {subjectName}
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onToggle} className="h-6 w-6 p-0">
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggle} className="h-6 w-6 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex h-full flex-col p-3 pt-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-3">
          <div className="space-y-3">
            {isLoadingHistory && (
              <div className="flex justify-center gap-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs">Carregando histórico...</span>
                </div>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[85%] items-start gap-2 ${
                    message.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 rounded-full p-1.5 ${
                      message.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <User className="h-3 w-3" />
                    ) : (
                      <Bot className="h-3 w-3" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-2 text-xs ${
                      message.sender === "user"
                        ? "rounded-br-sm bg-blue-600 text-white"
                        : "rounded-bl-sm bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="leading-relaxed">{message.text}</p>
                    <span className="mt-1 block text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start gap-2">
                <div className="flex items-start gap-2">
                  <div className="rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-1.5 text-white">
                    <Bot className="h-3 w-3" />
                  </div>
                  <div className="rounded-lg rounded-bl-sm bg-gray-100 p-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs text-gray-600">Pensando...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="mt-3 border-t pt-3">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua dúvida..."
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              disabled={isLoading}
              className="h-8 flex-1 text-xs"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="sm"
              className="h-8 w-8 bg-blue-600 p-0 hover:bg-blue-700"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
