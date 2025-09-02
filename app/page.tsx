"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { User, PenTool, BarChart3, MessageSquare, Trophy, TrendingUp, Calendar, Target, LogOut } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { PerformanceChart } from "@/components/performance-chart"
import { EvolutionChart } from "@/components/evolution-chart"
import { RecentEssays } from "@/components/recent-essays"
import { useAuth } from "@/components/auth-provider"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header com saudação e logout */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Olá, {userData.firstName}! 👋
            </h1>
            <p className="text-gray-600">Pronto para mais um dia de estudos?</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        {/* Card de Perfil */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Seu Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userData.photo || undefined} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                  {userData.firstName[0]}
                  {userData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {userData.firstName} {userData.lastName}
                </h3>
                <p className="text-gray-600">{userData.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Mensagens</p>
                <p className="text-lg font-bold text-blue-600">{userData.mensagensRest || userData.saldo_mens}</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <PenTool className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Redações</p>
                <p className="text-lg font-bold text-red-600">{userData.redacoesRest}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Sequência</p>
                <p className="text-lg font-bold text-green-600">{stats.streak} dias</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Target className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Acertos</p>
                <p className="text-lg font-bold text-purple-600">{stats.totalCorretas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Performance */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Pontuação por Área
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart userId={user.uid} />
            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" onClick={handleAnalyzePerformance}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Analisar Performance
            </Button>
          </CardContent>
        </Card>

        {/* Gráfico de Evolução */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
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

        {/* Redações Recentes */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-red-600" />
              Redações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentEssays userId={user.uid} />
          </CardContent>
        </Card>

        {/* Progresso Semanal */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Progresso da Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Meta de Estudos</span>
                  <span>{stats.studyTime}/180 min</span>
                </div>
                <Progress value={(stats.studyTime / 180) * 100} className="h-2" />
              </div>
              <div className="grid grid-cols-7 gap-2">
                {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
                  <div
                    key={index}
                    className={`text-center p-2 rounded-lg text-sm font-medium ${
                      index < stats.streak ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation currentPage="dashboard" />
    </div>
  )
}
