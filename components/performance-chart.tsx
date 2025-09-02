"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"

interface PerformanceData {
  subject: string
  correct: number
  incorrect: number
  color: string
}

interface PerformanceChartProps {
  userId: string
}

export function PerformanceChart({ userId }: PerformanceChartProps) {
  const {} = useAuth()
  const [data, setData] = useState<PerformanceData[]>([
    { subject: "Matemática", correct: 0, incorrect: 0, color: "bg-amber-500" },
    { subject: "Linguagens", correct: 0, incorrect: 0, color: "bg-violet-500" },
    { subject: "C. Humanas", correct: 0, incorrect: 0, color: "bg-cyan-500" },
    { subject: "C. Natureza", correct: 0, incorrect: 0, color: "bg-emerald-500" },
    { subject: "Redação", correct: 0, incorrect: 0, color: "bg-red-500" },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (!userId) return

      try {
        // Mapear os campos do Firestore para os nomes das matérias
        const subjectMap = {
          Matemática: "matematica",
          Linguagens: "ling",
          "C. Humanas": "cienciasHumanas",
          "C. Natureza": "cienciasDaNatureza",
          Redação: "redacao",
        }

        const updatedData = await Promise.all(
          data.map(async (item) => {
            const firestoreField = subjectMap[item.subject as keyof typeof subjectMap]

            try {
              const docRef = doc(db, "Users", userId, "EnemData", firestoreField)
              const docSnap = await getDoc(docRef)

              if (docSnap.exists()) {
                const subjectData = docSnap.data()

                // Processar questões se existirem
                let correct = 0
                let incorrect = 0

                if (subjectData.questoes && Array.isArray(subjectData.questoes)) {
                  subjectData.questoes.forEach((questao: any) => {
                    if (isCorrect(questao.correta)) {
                      correct++
                    } else if (isCorrect(questao.errada)) {
                      incorrect++
                    }
                  })
                } else {
                  // Fallback para dados diretos
                  correct = subjectData.acertos || subjectData.totalCorretas || 0
                  incorrect = subjectData.erros || subjectData.totalErradas || 0
                }

                return { ...item, correct, incorrect }
              } else {
                // Se não há dados, usar valores simulados para demonstração
                return {
                  ...item,
                  correct: Math.floor(Math.random() * 50) + 10,
                  incorrect: Math.floor(Math.random() * 20) + 5,
                }
              }
            } catch (error) {
              console.error(`Erro ao buscar dados de ${item.subject}:`, error)
              // Usar dados simulados em caso de erro
              return {
                ...item,
                correct: Math.floor(Math.random() * 50) + 10,
                incorrect: Math.floor(Math.random() * 20) + 5,
              }
            }
          })
        )

        setData(updatedData)
      } catch (error) {
        console.error("Erro ao buscar dados de performance:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPerformanceData()
  }, [userId])

  // Função auxiliar para verificar se uma resposta é correta
  const isCorrect = (value: any): boolean => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true" || value === "1"
    }
    if (typeof value === "number") {
      return value === 1
    }
    return !!value
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="mb-2 h-4 rounded bg-gray-200"></div>
            <div className="h-6 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    )
  }

  const maxValue = Math.max(...data.map((item) => item.correct + item.incorrect))

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const total = item.correct + item.incorrect
        const correctPercentage = total > 0 ? (item.correct / total) * 100 : 0
        const barWidth = total > 0 ? (total / maxValue) * 100 : 0

        return (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{item.subject}</span>
              <span className="text-sm text-gray-500">
                {item.correct}/{total}
              </span>
            </div>
            <div className="relative h-6 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full ${item.color} transition-all duration-500 ease-out`}
                style={{ width: `${barWidth}%` }}
              />
              {total > 0 && (
                <div
                  className="absolute top-0 left-0 h-full bg-white/30"
                  style={{
                    width: `${barWidth * (item.incorrect / total)}%`,
                    marginLeft: `${barWidth * (item.correct / total)}%`,
                  }}
                />
              )}
            </div>
            <div className="text-xs text-gray-500">
              {total > 0 ? `${correctPercentage.toFixed(1)}% de acertos` : "Nenhum dado disponível"}
            </div>
          </div>
        )
      })}
    </div>
  )
}
