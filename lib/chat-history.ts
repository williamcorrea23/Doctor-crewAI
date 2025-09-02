import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"

export interface ChatMessage {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  subject: string
  userId: string
}

export interface ChatConversation {
  id: string
  userId: string
  subject: string
  subjectName: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

// Salvar uma nova mensagem no histórico
export const saveChatMessage = async (
  userId: string,
  subject: string,
  message: string,
  sender: "user" | "bot"
): Promise<boolean> => {
  try {
    const chatRef = collection(db, "Users", userId, "ChatHistory")

    await addDoc(chatRef, {
      text: message,
      sender,
      subject,
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    })

    return true
  } catch (error) {
    console.error("Erro ao salvar mensagem do chat:", error)
    return false
  }
}

// Carregar histórico de chat por usuário e matéria
export const loadChatHistory = async (
  userId: string,
  subject: string,
  limitMessages: number = 50
): Promise<ChatMessage[]> => {
  try {
    const chatRef = collection(db, "Users", userId, "ChatHistory")
    // Usar apenas orderBy para evitar necessidade de índice composto
    const q = query(
      chatRef,
      orderBy("timestamp", "desc"),
      limit(limitMessages * 2) // Buscar mais mensagens para filtrar por subject
    )

    const querySnapshot = await getDocs(q)
    const messages: ChatMessage[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      // Filtrar por subject no código
      if (data.subject === subject) {
        messages.push({
          id: doc.id,
          text: data.text,
          sender: data.sender,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
          subject: data.subject,
          userId,
        })
      }
    })

    // Limitar ao número solicitado e retornar em ordem cronológica (mais antigas primeiro)
    return messages.slice(0, limitMessages).reverse()
  } catch (error) {
    console.error("Erro ao carregar histórico do chat:", error)
    // Retornar array vazio em caso de erro para não quebrar a aplicação
    return []
  }
}

// Carregar todas as conversas de um usuário (resumo)
export const loadUserConversations = async (
  userId: string
): Promise<
  { subject: string; lastMessage: string; lastTimestamp: Date; messageCount: number }[]
> => {
  try {
    const chatRef = collection(db, "Users", userId, "ChatHistory")
    const q = query(chatRef, orderBy("timestamp", "desc"))

    const querySnapshot = await getDocs(q)
    const conversationMap = new Map()

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      const subject = data.subject

      if (!conversationMap.has(subject)) {
        conversationMap.set(subject, {
          subject,
          lastMessage: data.text,
          lastTimestamp: data.timestamp.toDate(),
          messageCount: 1,
        })
      } else {
        const existing = conversationMap.get(subject)
        existing.messageCount++
      }
    })

    return Array.from(conversationMap.values())
  } catch (error) {
    console.error("Erro ao carregar conversas do usuário:", error)
    return []
  }
}

// Limpar histórico de uma matéria específica
export const clearSubjectHistory = async (userId: string, subject: string): Promise<boolean> => {
  try {
    const chatRef = collection(db, "Users", userId, "ChatHistory")
    const q = query(chatRef, where("subject", "==", subject))

    const querySnapshot = await getDocs(q)
    const deletePromises = querySnapshot.docs.map((doc) => doc.ref.delete())

    await Promise.all(deletePromises)
    return true
  } catch (error) {
    console.error("Erro ao limpar histórico:", error)
    return false
  }
}

// Obter estatísticas de uso do chat
export const getChatStats = async (userId: string) => {
  try {
    const chatRef = collection(db, "Users", userId, "ChatHistory")
    const querySnapshot = await getDocs(chatRef)

    const stats = {
      totalMessages: 0,
      messagesBySubject: {} as Record<string, number>,
      lastActivity: null as Date | null,
    }

    let latestTimestamp: Date | null = null

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      stats.totalMessages++

      const subject = data.subject
      stats.messagesBySubject[subject] = (stats.messagesBySubject[subject] || 0) + 1

      const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp)
      if (!latestTimestamp || timestamp > latestTimestamp) {
        latestTimestamp = timestamp
      }
    })

    stats.lastActivity = latestTimestamp
    return stats
  } catch (error) {
    console.error("Erro ao obter estatísticas do chat:", error)
    return {
      totalMessages: 0,
      messagesBySubject: {},
      lastActivity: null,
    }
  }
}
