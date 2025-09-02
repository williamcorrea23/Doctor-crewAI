"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface EvolutionData {
  date: string
  acertos: number
  erros: number
  percentual: number
}

interface EvolutionChartProps {
  userId: string
}

export function EvolutionChart({ userId }: EvolutionChartProps) {
  const [data, setData] = useState<EvolutionData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvolutionData = async () => {
      if (!userId) return

      try {
        // Buscar dados históricos de performance
        const evolutionRef = collection(db, "Users", userId, "Evolution")
        const evolutionQuery = query(evolutionRef, orderBy("date", "desc"), limit(30))
        const evolutionSnapshot = await getDocs(evolutionQuery)

        if (!evolutionSnapshot.empty) {
          const evolutionData = evolutionSnapshot.docs.map(doc => {
            const data = doc.data()
            return {
              date: data.date,
              acertos: data.acertos || 0,
              erros: data.erros || 0,
              percentual: data.acertos > 0 ? Math.round((data.acertos / (data.acertos + data.erros)) * 100) : 0
            }
          }).reverse() // Reverter para ordem cronológica

          setData(evolutionData)
        } else {
          // Gerar dados de exemplo para demonstração
          const mockData = generateMockEvolutionData()
          setData(mockData)
        }
      } catch (error) {
        console.error("Erro ao buscar dados de evolução:", error)
        // Em caso de erro, usar dados de exemplo
        const mockData = generateMockEvolutionData()
        setData(mockData)
      } finally {
        setLoading(false)
      }
    }

    fetchEvolutionData()
  }, [userId])

  const generateMockEvolutionData = (): EvolutionData[] => {
    const data: EvolutionData[] = []
    const today = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      const acertos = Math.floor(Math.random() * 20) + 5
      const erros = Math.floor(Math.random() * 10) + 2
      const percentual = Math.round((acertos / (acertos + erros)) * 100)
      
      data.push({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        acertos,
        erros,
        percentual
      })
    }
    
    return data
  }

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="flex space-x-4">
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#6B7280' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#6B7280' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              labelFormatter={(label) => `Data: ${label}`}
              formatter={(value, name) => {
                if (name === 'percentual') return [`${value}%`, 'Taxa de Acerto']
                if (name === 'acertos') return [value, 'Acertos']
                if (name === 'erros') return [value, 'Erros']
                return [value, name]
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="percentual" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              name="Taxa de Acerto (%)"
            />
            <Line 
              type="monotone" 
              dataKey="acertos" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
              name="Acertos"
            />
            <Line 
              type="monotone" 
              dataKey="erros" 
              stroke="#EF4444" 
              strokeWidth={2}
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
              name="Erros"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Média de Acerto</p>
          <p className="text-lg font-bold text-blue-600">
            {data.length > 0 ? Math.round(data.reduce((acc, item) => acc + item.percentual, 0) / data.length) : 0}%
          </p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600">Total de Acertos</p>
          <p className="text-lg font-bold text-green-600">
            {data.reduce((acc, item) => acc + item.acertos, 0)}
          </p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-gray-600">Total de Erros</p>
          <p className="text-lg font-bold text-red-600">
            {data.reduce((acc, item) => acc + item.erros, 0)}
          </p>
        </div>
      </div>
    </div>
  )
}