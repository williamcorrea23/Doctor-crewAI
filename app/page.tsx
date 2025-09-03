"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  User,
  PenTool,
  BarChart3,
  MessageSquare,
  Trophy,
  TrendingUp,
  Calendar,
  Target,
  LogOut,
} from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { PerformanceChart } from "@/components/performance-chart"
import { EvolutionChart } from "@/components/evolution-chart"
import { RecentEssays } from "@/components/recent-essays"
import { useAuth } from "@/hooks/use-auth"
import { logout } from "@/lib/auth"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useRouter } from "next/navigation"

interface UserData {
  firstName: string
  lastName: string
  email: string
  photo: string
  saldo_mens: number
  mensagensRest: number
  redacoesRest: number
}

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  const [stats, setStats] = useState({
    totalCorretas: 0,
    totalErradas: 0,
    streak: 0,
    studyTime: 0,
  })

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      try {
        // Buscar dados do Firebase
        const userRef = doc(db, "Users", user.uid)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
          const data = userDoc.data() as UserData
          setUserData(data)

          // Buscar estatísticas reais do usuário
          const statsRef = doc(db, "Users", user.uid, "Stats", "general")
          const statsDoc = await getDoc(statsRef)

          if (statsDoc.exists()) {
            setStats(statsDoc.data() as typeof stats)
          } else {
            setStats({
              totalCorretas: 0,
              totalErradas: 0,
              streak: 1,
              studyTime: 0,
            })
          }
        } else {
          const defaultData = {
            firstName: user.displayName?.split(" ")[0] || "Usuário",
            lastName: user.displayName?.split(" ").slice(1).join(" ") || "Exemplo",
            email: user.email || "exemplo@email.com",
            photo: user.photoURL || "",
            saldo_mens: 50,
            mensagensRest: 25,
            redacoesRest: 10,
          }

          setUserData(defaultData)
          setStats({
            totalCorretas: 0,
            totalErradas: 0,
            streak: 1,
            studyTime: 0,
          })
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error)

        setUserData({
          firstName: user.displayName?.split(" ")[0] || "Usuário",
          lastName: user.displayName?.split(" ").slice(1).join(" ") || "Exemplo",
          email: user.email || "exemplo@email.com",
          photo: user.photoURL || "",
          saldo_mens: 50,
          mensagensRest: 25,
          redacoesRest: 10,
        })

        setStats({
          totalCorretas: 0,
          totalErradas: 0,
          streak: 1,
          studyTime: 0,
        })
      } finally {
        setLoadingData(false)
      }
    }

    if (user) {
      fetchUserData()
    }
  }, [user])

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      router.push("/login")
    }
  }

  const handleAnalyzePerformance = async () => {
    if (!user) return

    try {
      // Simular análise de performance
      alert("Analisando sua performance... Esta funcionalidade será implementada em breve!")
    } catch (error) {
      console.error("Erro ao analisar performance:", error)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Carregando seus dados...</p>
        </div>
      </div>
    )
  }

  if (!user || !userData) {
    return null // AuthProvider já redireciona para login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      <div className="container mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
        {/* Header com saudação e logout */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row">
          <div className="flex-1">
            <h1 className="mb-2 font-serif text-2xl font-bold text-gray-900 sm:text-3xl">
              Olá, {userData.firstName}! 👋
            </h1>
            <p className="text-sm text-gray-600 sm:text-base">
              Pronto para mais um dia de estudos?
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex shrink-0 items-center gap-2 bg-transparent"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>

        {/* Card de Perfil */}
        <Card className="mb-6 border-0 bg-white/80 shadow-lg backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Seu Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row">
              <Avatar className="h-16 w-16 shrink-0">
                <AvatarImage src={userData.photo || undefined} />
                <AvatarFallback className="bg-blue-100 text-lg font-semibold text-blue-600">
                  {userData.firstName[0]}
                  {userData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">
                  {userData.firstName} {userData.lastName}
                </h3>
                <p className="text-sm break-all text-gray-600 sm:text-base">{userData.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <div className="rounded-lg bg-blue-50 p-2 text-center sm:p-3">
                <MessageSquare className="mx-auto mb-1 h-5 w-5 text-blue-600 sm:mb-2 sm:h-6 sm:w-6" />
                <p className="text-xs text-gray-600 sm:text-sm">Mensagens</p>
                <p className="text-sm font-bold text-blue-600 sm:text-lg">
                  {userData.mensagensRest || userData.saldo_mens}
                </p>
              </div>
              <div className="rounded-lg bg-red-50 p-2 text-center sm:p-3">
                <PenTool className="mx-auto mb-1 h-5 w-5 text-red-600 sm:mb-2 sm:h-6 sm:w-6" />
                <p className="text-xs text-gray-600 sm:text-sm">Redações</p>
                <p className="text-sm font-bold text-red-600 sm:text-lg">{userData.redacoesRest}</p>
              </div>
              <div className="rounded-lg bg-green-50 p-2 text-center sm:p-3">
                <Trophy className="mx-auto mb-1 h-5 w-5 text-green-600 sm:mb-2 sm:h-6 sm:w-6" />
                <p className="text-xs text-gray-600 sm:text-sm">Sequência</p>
                <p className="text-sm font-bold text-green-600 sm:text-lg">{stats.streak} dias</p>
              </div>
              <div className="rounded-lg bg-purple-50 p-2 text-center sm:p-3">
                <Target className="mx-auto mb-1 h-5 w-5 text-purple-600 sm:mb-2 sm:h-6 sm:w-6" />
                <p className="text-xs text-gray-600 sm:text-sm">Acertos</p>
                <p className="text-sm font-bold text-purple-600 sm:text-lg">
                  {stats.totalCorretas}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid principal */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Gráfico de Performance */}
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Pontuação por Área
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceChart userId={user.uid} />
              <Button
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleAnalyzePerformance}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Analisar Performance
              </Button>
            </CardContent>
          </Card>

          {/* Gráfico de Evolução */}
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Evolução do Desempenho
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EvolutionChart userId={user.uid} />
            </CardContent>
          </Card>
        </div>

        {/* Grid para Redações e Progresso */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Redações Recentes */}
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <PenTool className="h-4 w-4 text-red-600 sm:h-5 sm:w-5" />
                Redações Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecentEssays userId={user.uid} />
            </CardContent>
          </Card>

          {/* Progresso Semanal */}
          <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
                Progresso da Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 sm:text-sm">
                      Meta de Estudos
                    </span>
                    <span className="text-xs text-gray-500 sm:text-sm">
                      {stats.studyTime}/180 min
                    </span>
                  </div>
                  <Progress value={(stats.studyTime / 180) * 100} className="h-2" />
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
                    <div key={index} className="text-center">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium sm:h-8 sm:w-8 ${
                          index < stats.streak
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {day}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation currentPage="dashboard" />
    </div>
  )
}
