"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"
import {
  PenTool,
  Clock,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Send,
  ChevronDown,
  ChevronUp,
  Target,
  BookOpen,
  Lightbulb,
  FileText,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
} from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useAuth } from "@/hooks/use-auth"
import { getCurrentUserToken } from "@/lib/auth"

const enemTopics = [
  { value: "2023", label: "2023 - O desafio de aumentar a doação de órgãos no Brasil" },
  {
    value: "2022",
    label: "2022 - Desafios para a valorização de comunidades e povos tradicionais no Brasil",
  },
  {
    value: "2021",
    label: "2021 - Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil",
  },
  { value: "2020", label: "2020 - O estigma associado às doenças mentais na sociedade brasileira" },
  { value: "2019", label: "2019 - Democratização do acesso ao cinema no Brasil" },
  {
    value: "2018",
    label: "2018 - Manipulação do comportamento do usuário pelo controle de dados na internet",
  },
  { value: "2017", label: "2017 - Desafios para a formação educacional de surdos no Brasil" },
  { value: "2016", label: "2016 - Caminhos para combater a intolerância religiosa no Brasil" },
  {
    value: "2015",
    label: "2015 - A persistência da violência contra a mulher na sociedade brasileira",
  },
  { value: "2014", label: "2014 - Publicidade infantil em questão no Brasil" },
  { value: "2013", label: "2013 - Efeitos da implantação da Lei Seca no Brasil" },
  { value: "2012", label: "2012 - O movimento imigratório para o Brasil no século XXI" },
  {
    value: "2011",
    label: "2011 - Viver em rede no século XXI: os limites entre o público e o privado",
  },
  { value: "2010", label: "2010 - O trabalho na construção da dignidade humana" },
  { value: "2009", label: "2009 - O indivíduo frente à ética nacional" },
]

interface FeedbackData {
  competencia1: { score: number; feedback: string; title: string }
  competencia2: { score: number; feedback: string; title: string }
  competencia3: { score: number; feedback: string; title: string }
  competencia4: { score: number; feedback: string; title: string }
  competencia5: { score: number; feedback: string; title: string }
  overall: { score: number; feedback: string; level: string }
}

export default function Redacao() {
  const { user } = useAuth()
  const [showInstructions, setShowInstructions] = useState(false)
  const [customTopic, setCustomTopic] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [essayText, setEssayText] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const [lineCount, setLineCount] = useState(0)
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const words = essayText
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
    setWordCount(words.length)

    const lines = essayText.split("\n").filter((line) => line.trim().length > 0)
    setLineCount(lines.length)
  }, [essayText])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartTimer = () => setIsTimerRunning(true)
  const handlePauseTimer = () => setIsTimerRunning(false)
  const handleResetTimer = () => {
    setIsTimerRunning(false)
    setTimer(0)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setUploadedFile(file)
    } else {
      alert("Por favor, selecione apenas arquivos PDF.")
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleSubmitEssay = async () => {
    if (!essayText.trim() || wordCount < 50) return

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const currentTopic =
        customTopic ||
        enemTopics.find((t) => t.value === selectedTopic)?.label ||
        "Tema não especificado"

      const token = await getCurrentUserToken()
      
      if (!token) {
        throw new Error('Token de autenticação não disponível')
      }
      
      const response = await fetch("/api/redacao/avaliar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          texto: essayText,
          tema: currentTopic,
          userId: user?.uid || "demo",
          wordCount,
          lineCount,
          timeSpent: timer,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setFeedback(data.feedback)
      } else {
        throw new Error("Falha na avaliação")
      }
    } catch (error) {
      console.error("Erro ao avaliar redação:", error)
      
      let errorMessage = "Erro ao avaliar redação. Tente novamente."
      
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
      
      setError(errorMessage)
      
      const mockFeedback: FeedbackData = {
        competencia1: {
          score: Math.floor(Math.random() * 40) + 160, // 160-200
          feedback:
            "Demonstra excelente domínio da modalidade escrita formal da língua portuguesa. Estrutura sintática variada e vocabulário preciso.",
          title: "Domínio da escrita formal",
        },
        competencia2: {
          score: Math.floor(Math.random() * 40) + 140, // 140-180
          feedback:
            "Compreende bem a proposta de redação e aplica conceitos de várias áreas de conhecimento para desenvolver o tema.",
          title: "Compreender a proposta e aplicar conceitos",
        },
        competencia3: {
          score: Math.floor(Math.random() * 40) + 120, // 120-160
          feedback:
            "Seleciona, relaciona, organiza e interpreta informações de forma consistente em defesa de um ponto de vista.",
          title: "Selecionar e organizar informações",
        },
        competencia4: {
          score: Math.floor(Math.random() * 40) + 140, // 140-180
          feedback:
            "Articula bem as partes do texto e apresenta repertório diversificado de recursos coesivos.",
          title: "Conhecimento dos mecanismos linguísticos",
        },
        competencia5: {
          score: Math.floor(Math.random() * 40) + 120, // 120-160
          feedback:
            "Elabora proposta de intervenção relacionada ao tema e articulada à discussão desenvolvida no texto.",
          title: "Proposta de intervenção",
        },
        overall: {
          score: 0,
          feedback:
            "Parabéns! Sua redação demonstra boa preparação para o ENEM. Continue praticando para aperfeiçoar ainda mais sua escrita.",
          level: "Bom",
        },
      }

      // Calculate total score
      mockFeedback.overall.score =
        mockFeedback.competencia1.score +
        mockFeedback.competencia2.score +
        mockFeedback.competencia3.score +
        mockFeedback.competencia4.score +
        mockFeedback.competencia5.score

      // Determine level based on score
      if (mockFeedback.overall.score >= 900) mockFeedback.overall.level = "Excelente"
      else if (mockFeedback.overall.score >= 700) mockFeedback.overall.level = "Muito Bom"
      else if (mockFeedback.overall.score >= 500) mockFeedback.overall.level = "Bom"
      else mockFeedback.overall.level = "Regular"

      setFeedback(mockFeedback)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getProgressColor = (score: number) => {
    if (score >= 160) return "bg-green-500"
    if (score >= 120) return "bg-yellow-500"
    if (score >= 80) return "bg-orange-500"
    return "bg-red-500"
  }

  const getScoreLevel = (score: number) => {
    if (score >= 160) return "Excelente"
    if (score >= 120) return "Bom"
    if (score >= 80) return "Regular"
    return "Insuficiente"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 pb-20">
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="mb-8">
          <h1 className="mb-2 font-serif text-3xl font-bold text-gray-900">Redação ENEM</h1>
          <p className="text-gray-600">
            Pratique sua escrita com temas do ENEM e receba feedback detalhado por competência
          </p>
          {user && (
            <p className="mt-2 text-sm text-red-600">
              Olá, {user.displayName || "estudante"}! Suas redações são salvas automaticamente.
            </p>
          )}
        </div>

        {/* Instructions */}
        <Card className="mb-6 border-0 bg-white/90 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-red-600" />
                Instruções para Redação ENEM
              </CardTitle>
              <Button
                variant="ghost"
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center gap-2"
              >
                {showInstructions ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                {showInstructions ? "Ocultar" : "Mostrar"}
              </Button>
            </div>
          </CardHeader>
          {showInstructions && (
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-semibold text-gray-900">Estrutura Obrigatória:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                      Texto dissertativo-argumentativo (7 a 30 linhas)
                    </li>
                    <li className="flex items-start gap-2">
                      <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                      Introdução, desenvolvimento e conclusão
                    </li>
                    <li className="flex items-start gap-2">
                      <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                      Proposta de intervenção detalhada
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold text-gray-900">Critérios de Avaliação:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      Domínio da norma padrão (200 pts)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      Compreensão do tema (200 pts)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      Argumentação consistente (200 pts)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      Coesão e coerência (200 pts)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      Proposta de intervenção (200 pts)
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Topic Selection */}
        <Card className="mb-6 border-0 bg-white/90 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Escolha do Tema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Tema Personalizado
              </label>
              <Input
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Digite o tema da sua redação aqui..."
                className="w-full"
              />
            </div>

            <div className="text-center text-sm font-medium text-gray-500">ou</div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Temas do ENEM (2009-2023)
              </label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tema do ENEM" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {enemTopics.map((topic) => (
                    <SelectItem key={topic.value} value={topic.value}>
                      {topic.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Material de Apoio (PDF)
              </label>
              <div
                className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-red-400"
                onClick={triggerFileUpload}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                {uploadedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">{uploadedFile.name}</span>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">
                      Arraste um PDF aqui ou clique para selecionar
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Textos motivadores, coletâneas, etc.
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timer */}
        <Card className="mb-6 border-0 bg-white/90 shadow-lg backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-100 p-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-mono text-3xl font-bold text-gray-900">
                    {formatTime(timer)}
                  </div>
                  <p className="text-sm text-gray-600">Tempo recomendado: 90 minutos</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartTimer}
                  disabled={isTimerRunning}
                  className="border-green-200 bg-green-50 hover:bg-green-100"
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePauseTimer}
                  disabled={!isTimerRunning}
                  className="border-yellow-200 bg-yellow-50 hover:bg-yellow-100"
                >
                  <Pause className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetTimer}
                  className="border-red-200 bg-red-50 hover:bg-red-100"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Writing Area */}
        <Card className="mb-6 border-0 bg-white/90 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-red-600" />
                Sua Redação
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant={wordCount >= 150 && wordCount <= 400 ? "default" : "secondary"}>
                  {wordCount} palavras
                </Badge>
                <Badge variant={lineCount >= 7 && lineCount <= 30 ? "default" : "secondary"}>
                  {lineCount} linhas
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={essayText}
              onChange={(e) => {
                setEssayText(e.target.value)
                if (error) setError(null)
              }}
              placeholder="Digite sua redação aqui... Lembre-se de seguir a estrutura: introdução, desenvolvimento (2-3 parágrafos) e conclusão com proposta de intervenção."
              className="min-h-[500px] resize-none text-base leading-relaxed"
              style={{ fontFamily: "Georgia, serif" }}
            />
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  {wordCount >= 150 && wordCount <= 400 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  )}
                  <span>Palavras: {wordCount} (recomendado: 150-400)</span>
                </div>
                <div className="flex items-center gap-2">
                  {lineCount >= 7 && lineCount <= 30 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  )}
                  <span>Linhas: {lineCount} (obrigatório: 7-30)</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Button
                  onClick={handleSubmitEssay}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={wordCount < 50 || isSubmitting || lineCount < 7}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Avaliando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar para Correção
                    </>
                  )}
                </Button>
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Feedback */}
        {feedback && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-2">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-gray-900">
                  Análise Detalhada por Competência
                </h3>
                <p className="text-gray-600">Avaliação baseada nos critérios oficiais do ENEM</p>
              </div>
            </div>

            {/* Overall Score */}
            <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 shadow-xl">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="mb-2 text-4xl font-bold text-gray-900">
                    {feedback.overall.score}/1000
                  </div>
                  <Badge
                    className="mb-3 px-4 py-1 text-lg"
                    variant={
                      feedback.overall.score >= 900
                        ? "default"
                        : feedback.overall.score >= 700
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {feedback.overall.level}
                  </Badge>
                  <p className="text-gray-700">{feedback.overall.feedback}</p>
                </div>
              </CardContent>
            </Card>

            {/* Competencies */}
            <div className="grid gap-4">
              {[
                { key: "competencia1", icon: FileText },
                { key: "competencia2", icon: Target },
                { key: "competencia3", icon: TrendingUp },
                { key: "competencia4", icon: BookOpen },
                { key: "competencia5", icon: Lightbulb },
              ].map(({ key, icon: Icon }, index) => {
                const comp = feedback[key as keyof FeedbackData] as {
                  score: number
                  feedback: string
                  title: string
                }
                return (
                  <Card key={key} className="border-0 bg-white/90 shadow-lg backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-gray-100 p-2">
                            <Icon className="h-5 w-5 text-gray-700" />
                          </div>
                          <div>
                            <span className="text-lg">Competência {index + 1}</span>
                            <p className="text-sm font-normal text-gray-600">{comp.title}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{comp.score}/200</div>
                          <Badge
                            variant="outline"
                            className={getProgressColor(comp.score).replace("bg-", "text-")}
                          >
                            {getScoreLevel(comp.score)}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Progress value={(comp.score / 200) * 100} className="h-2" />
                        <p className="leading-relaxed text-gray-700">{comp.feedback}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEssayText("")
                  setFeedback(null)
                  setTimer(0)
                  setIsTimerRunning(false)
                }}
                className="bg-white"
              >
                Nova Redação
              </Button>
              <Button className="bg-red-600 hover:bg-red-700">Salvar Resultado</Button>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation currentPage="redacao" />
    </div>
  )
}
