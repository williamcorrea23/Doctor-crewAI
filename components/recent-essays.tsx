"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, ChevronDown, ChevronUp } from "lucide-react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"

interface Essay {
  id: number
  title: string
  score: number
  feedback: string
  date: string
  userText?: string
}

interface RecentEssaysProps {
  userId: string
}

export function RecentEssays({ userId }: RecentEssaysProps) {
  const {} = useAuth()
  const [essays, setEssays] = useState<Essay[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedEssay, setExpandedEssay] = useState<number | null>(null)
  const [viewingEssay, setViewingEssay] = useState<number | null>(null)

  useEffect(() => {
    const fetchEssays = async () => {
      if (!userId) return

      try {
        const redacaoDocRef = doc(db, "Users", userId, "EnemData", "Redacoes")
        const docSnapshot = await getDoc(redacaoDocRef)

        if (docSnapshot.exists()) {
          const data = docSnapshot.data()
          const redacoesArray = data.Redacao || []

          const formattedEssays: Essay[] = redacoesArray.map((redacao: any, index: number) => ({
            id: index + 1,
            title: `Redação ${index + 1}`,
            score: redacao.nota || Math.floor(Math.random() * 400) + 600,
            feedback: redacao.feedback || "Feedback não disponível.",
            date: redacao.date || new Date().toISOString().split("T")[0],
            userText: redacao.userText || "Texto da redação não disponível.",
          }))

          setEssays(formattedEssays.slice(0, 3)) // Mostrar apenas as 3 mais recentes
        } else {
          // Se não há redações, mostrar dados de exemplo
          setEssays([
            {
              id: 1,
              title: "Redação de Exemplo",
              score: 750,
              feedback:
                "Esta é uma redação de exemplo. Faça sua primeira redação para ver o feedback personalizado aqui!",
              date: new Date().toISOString().split("T")[0],
            },
          ])
        }
      } catch (error) {
        console.error("Erro ao carregar redações:", error)
        // Mostrar dados de exemplo em caso de erro
        setEssays([
          {
            id: 1,
            title: "Erro ao carregar",
            score: 0,
            feedback: "Não foi possível carregar suas redações. Tente novamente mais tarde.",
            date: new Date().toISOString().split("T")[0],
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchEssays()
  }, [userId])

  const getScoreColor = (score: number) => {
    if (score >= 800) return "bg-green-100 text-green-800"
    if (score >= 600) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const toggleExpanded = (essayId: number) => {
    setExpandedEssay(expandedEssay === essayId ? null : essayId)
  }

  const toggleViewEssay = (essayId: number) => {
    setViewingEssay(viewingEssay === essayId ? null : essayId)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="mb-2 h-4 rounded bg-gray-200"></div>
                <div className="mb-3 h-3 rounded bg-gray-200"></div>
                <div className="flex gap-2">
                  <div className="h-8 w-20 rounded bg-gray-200"></div>
                  <div className="h-8 w-24 rounded bg-gray-200"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (essays.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="mb-4 text-gray-500">Você ainda não fez nenhuma redação.</p>
        <Button className="bg-red-600 hover:bg-red-700">Fazer Primeira Redação</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {essays.map((essay) => (
        <Card key={essay.id} className="border border-gray-200">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h4 className="font-medium text-gray-900">{essay.title}</h4>
                <Badge className={getScoreColor(essay.score)}>
                  {essay.score > 0 ? `${essay.score} pts` : "Sem nota"}
                </Badge>
              </div>
              <span className="text-sm text-gray-500">{essay.date}</span>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-600">
                {expandedEssay === essay.id
                  ? essay.feedback
                  : `${essay.feedback.substring(0, 100)}...`}
              </p>
            </div>

            {viewingEssay === essay.id && essay.userText && (
              <div className="mb-3 rounded-lg bg-gray-50 p-3">
                <h5 className="mb-2 font-medium text-gray-900">Texto da Redação:</h5>
                <p className="text-sm whitespace-pre-wrap text-gray-700">{essay.userText}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleExpanded(essay.id)}
                className="flex items-center gap-1"
              >
                {expandedEssay === essay.id ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Ver Mais
                  </>
                )}
              </Button>
              {essay.userText && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 bg-transparent"
                  onClick={() => toggleViewEssay(essay.id)}
                >
                  <Eye className="h-4 w-4" />
                  {viewingEssay === essay.id ? "Ocultar Redação" : "Ver Redação"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
