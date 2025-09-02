"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, MessageCircle, Send, Bot, User, X, Minimize2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { loadChatHistory } from "@/lib/chat-history"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

interface ChatWidgetProps {
  subject: string
  subjectName: string
  isOpen: boolean
  onToggle: () => void
}

export function ChatWidget({ subject, subjectName, isOpen, onToggle }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    const loadHistory = async () => {
      if (isOpen && user && messages.length === 0) {
        setIsLoadingHistory(true)
        try {
          const history = await loadChatHistory(user.uid, subject, 20)
          if (history.length > 0) {
            const historyMessages: Message[] = history.map(msg => ({
              id: msg.id,
              text: msg.text,
              sender: msg.sender as "user" | "bot",
              timestamp: msg.timestamp.toDate(),
            }))
            setMessages(historyMessages)
          } else {
            // Add welcome message if no history
            const welcomeMessage: Message = {
              id: "welcome",
              text: `Olá! Sou seu assistente especializado em ${subjectName}. Como posso ajudar você hoje?`,
              sender: "bot",
              timestamp: new Date(),
            }
            setMessages([welcomeMessage])
          }
        } catch (error) {
          console.error('Erro ao carregar histórico:', error)
          // Add welcome message on error
          const welcomeMessage: Message = {
            id: "welcome",
            text: `Olá! Sou seu assistente especializado em ${subjectName}. Como posso ajudar você hoje?`,
            sender: "bot",
            timestamp: new Date(),
          }
          setMessages([welcomeMessage])
        } finally {
          setIsLoadingHistory(false)
        }
      }
    }

    loadHistory()
  }, [isOpen, user, subject, subjectName, messages.length])

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      // Get Firebase auth token
      const token = await user.getIdToken()
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: inputMessage,
          subject,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
      } else {
        throw new Error("Falha na comunicação")
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Desculpe, houve um problema. Tente novamente em alguns instantes.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-24 right-4 z-50 rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-24 right-4 z-50 w-80 h-96 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
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

      <CardContent className="flex flex-col h-full p-3 pt-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-3">
          <div className="space-y-3">
            {isLoadingHistory && (
              <div className="flex gap-2 justify-center">
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
                  className={`flex items-start gap-2 max-w-[85%] ${
                    message.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-full flex-shrink-0 ${
                      message.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                    }`}
                  >
                    {message.sender === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                  </div>
                  <div
                    className={`p-2 rounded-lg text-xs ${
                      message.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-900 rounded-bl-sm"
                    }`}
                  >
                    <p className="leading-relaxed">{message.text}</p>
                    <span className="text-xs opacity-70 mt-1 block">
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
              <div className="flex gap-2 justify-start">
                <div className="flex items-start gap-2">
                  <div className="p-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                    <Bot className="h-3 w-3" />
                  </div>
                  <div className="bg-gray-100 p-2 rounded-lg rounded-bl-sm">
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

        <div className="mt-3 pt-3 border-t">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua dúvida..."
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              disabled={isLoading}
              className="flex-1 text-xs h-8"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 h-8 w-8 p-0"
            >
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
