"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Calculator,
  Languages,
  Globe,
  FlaskRoundIcon as Flask,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Trophy,
  Target,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  TrendingUp,
  Award,
} from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useAuth } from "@/components/auth-provider"

const subjects = [
  {
    id: "matematica",
    name: "Matemática",
    icon: Calculator,
    color: "bg-blue-100 text-blue-700",
    questions: 45,
  },
  {
    id: "linguagens",
    name: "Linguagens",
    icon: Languages,
    color: "bg-green-100 text-green-700",
    questions: 45,
  },
  {
    id: "humanas",
    name: "Ciências Humanas",
    icon: Globe,
    color: "bg-orange-100 text-orange-700",
    questions: 45,
  },
  {
    id: "natureza",
    name: "Ciências da Natureza",
    icon: Flask,
    color: "bg-purple-100 text-purple-700",
    questions: 45,
  },
]

const mockQuestions = [
  {
    id: 1,
    subject: "matematica",
    year: 2023,
    difficulty: "medium",
    topic: "Funções",
    question: "Uma função f é definida por f(x) = 2x + 3. Qual é o valor de f(5)?",
    options: [
      { id: "a", text: "10" },
      { id: "b", text: "13" },
      { id: "c", text: "15" },
      { id: "d", text: "18" },
      { id: "e", text: "20" },
    ],
    correct: "b",
    explanation: "Para encontrar f(5), substituímos x por 5 na função: f(5) = 2(5) + 3 = 10 + 3 = 13.",
  },
  {
    id: 2,
    subject: "linguagens",
    year: 2022,
    difficulty: "hard",
    topic: "Interpretação de Texto",
    question: "Com base no texto apresentado, qual é a principal crítica do autor em relação ao uso das redes sociais?",
    options: [
      { id: "a", text: "O vício em tecnologia" },
      { id: "b", text: "A perda da privacidade" },
      { id: "c", text: "A superficialidade das relações" },
      { id: "d", text: "O isolamento social" },
      { id: "e", text: "A desinformação" },
    ],
    correct: "c",
    explanation:
      "O autor enfatiza como as redes sociais promovem interações superficiais em detrimento de relacionamentos mais profundos e significativos.",
  },
]

interface Question {
  id: number
  subject: string
  year: number
  difficulty: string
  topic: string
  question: string
  options: { id: string; text: string }[]
  correct: string
  explanation: string
}

interface ExerciseSession {
  questions: Question[]
  currentIndex: number
  answers: Record<number, string>
  startTime: Date
  timeSpent: number
  isCompleted: boolean
}

export default function Exercicios() {
  const { user } = useAuth()
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [exerciseMode, setExerciseMode] = useState<"practice" | "simulation" | null>(null)
  const [session, setSession] = useState<ExerciseSession | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [showResult, setShowResult] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && session) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, session])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startExercise = (subject: string, mode: "practice" | "simulation") => {
    const filteredQuestions = mockQuestions.filter((q) => q.subject === subject)
    const questionCount = mode === "simulation" ? Math.min(filteredQuestions.length, 10) : 5

    const newSession: ExerciseSession = {
      questions: filteredQuestions.slice(0, questionCount),
      currentIndex: 0,
      answers: {},
      startTime: new Date(),
      timeSpent: 0,
      isCompleted: false,
    }

    setSession(newSession)
    setSelectedSubject(subject)
    setExerciseMode(mode)
    setSelectedAnswer("")
    setShowResult(false)
    setTimer(0)
    setIsTimerRunning(mode === "simulation")
  }

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId)
  }

  const handleNextQuestion = () => {
    if (!session || !selectedAnswer) return

    const newAnswers = { ...session.answers, [session.questions[session.currentIndex].id]: selectedAnswer }
    const newIndex = session.currentIndex + 1

    if (newIndex >= session.questions.length) {
      // Exercise completed
      setSession({
        ...session,
        answers: newAnswers,
        isCompleted: true,
        timeSpent: timer,
      })
      setIsTimerRunning(false)
      setShowResult(true)
    } else {
      setSession({
        ...session,
        answers: newAnswers,
        currentIndex: newIndex,
      })
      setSelectedAnswer("")
    }
  }

  const handlePreviousQuestion = () => {
    if (!session || session.currentIndex === 0) return

    const newIndex = session.currentIndex - 1
    const previousAnswer = session.answers[session.questions[newIndex].id] || ""

    setSession({
      ...session,
      currentIndex: newIndex,
    })
    setSelectedAnswer(previousAnswer)
  }

  const calculateResults = () => {
    if (!session) return { score: 0, correct: 0, total: 0, percentage: 0 }

    let correct = 0
    session.questions.forEach((question) => {
      if (session.answers[question.id] === question.correct) {
        correct++
      }
    })

    const total = session.questions.length
    const percentage = Math.round((correct / total) * 100)
    const score = Math.round((correct / total) * 1000) // ENEM-style scoring

    return { score, correct, total, percentage }
  }

  const resetExercise = () => {
    setSession(null)
    setSelectedSubject(null)
    setExerciseMode(null)
    setSelectedAnswer("")
    setShowResult(false)
    setTimer(0)
    setIsTimerRunning(false)
  }

  // Results view
  if (showResult && session) {
    const results = calculateResults()

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 pb-20">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="text-center mb-8">
            <div className="p-4 bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
              <Trophy className="h-10 w-10 text-yellow-500" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Exercício Concluído!</h1>
            <p className="text-gray-600">Confira seu desempenho e continue praticando</p>
          </div>

          {/* Overall Results */}
          <Card className="mb-6 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-4xl font-bold text-green-600 mb-2">{results.percentage}%</div>
                  <p className="text-gray-600">Aproveitamento</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">{results.score}</div>
                  <p className="text-gray-600">Pontuação ENEM</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {results.correct}/{results.total}
                  </div>
                  <p className="text-gray-600">Acertos</p>
                </div>
              </div>
              <div className="mt-6">
                <Progress value={results.percentage} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Question Review */}
          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-serif font-bold text-gray-900">Revisão das Questões</h3>
            {session.questions.map((question, index) => {
              const userAnswer = session.answers[question.id]
              const isCorrect = userAnswer === question.correct
              const correctOption = question.options.find((opt) => opt.id === question.correct)
              const userOption = question.options.find((opt) => opt.id === userAnswer)

              return (
                <Card key={question.id} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Questão {index + 1}</CardTitle>
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Correto
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-4 w-4 mr-1" />
                            Incorreto
                          </Badge>
                        )}
                        <Badge variant="outline">{question.topic}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{question.question}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">Sua resposta:</span>
                        <span className={`font-medium ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                          {userOption ? `${userAnswer.toUpperCase()}) ${userOption.text}` : "Não respondida"}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">Resposta correta:</span>
                          <span className="font-medium text-green-600">
                            {question.correct.toUpperCase()}) {correctOption?.text}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Explicação:</h4>
                      <p className="text-blue-800 text-sm">{question.explanation}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={resetExercise} className="bg-white">
              <RotateCcw className="h-4 w-4 mr-2" />
              Novo Exercício
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Award className="h-4 w-4 mr-2" />
              Salvar Resultado
            </Button>
          </div>
        </div>

        <BottomNavigation currentPage="exercicios" />
      </div>
    )
  }

  // Exercise in progress
  if (session && !showResult) {
    const currentQuestion = session.questions[session.currentIndex]
    const progress = ((session.currentIndex + 1) / session.questions.length) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 pb-20">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={resetExercise} className="bg-white/80 backdrop-blur-sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Sair
              </Button>
              <div>
                <h1 className="text-xl font-serif font-bold text-gray-900">
                  {subjects.find((s) => s.id === selectedSubject)?.name}
                </h1>
                <p className="text-sm text-gray-600">
                  {exerciseMode === "simulation" ? "Simulado" : "Prática"} • Questão {session.currentIndex + 1} de{" "}
                  {session.questions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {exerciseMode === "simulation" && (
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-mono font-bold text-gray-900">{formatTime(timer)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          <Card className="mb-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Progresso</span>
                <span className="text-sm font-medium text-gray-900">
                  {session.currentIndex + 1}/{session.questions.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          {/* Question */}
          <Card className="mb-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Questão {session.currentIndex + 1}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{currentQuestion.topic}</Badge>
                  <Badge variant="outline">{currentQuestion.year}</Badge>
                  <Badge
                    variant="outline"
                    className={
                      currentQuestion.difficulty === "easy"
                        ? "border-green-300 text-green-700"
                        : currentQuestion.difficulty === "medium"
                          ? "border-yellow-300 text-yellow-700"
                          : "border-red-300 text-red-700"
                    }
                  >
                    {currentQuestion.difficulty === "easy"
                      ? "Fácil"
                      : currentQuestion.difficulty === "medium"
                        ? "Médio"
                        : "Difícil"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6 leading-relaxed">{currentQuestion.question}</p>

              <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAnswerSelect(option.id)}
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        <span className="font-medium text-gray-900 mr-2">{option.id.toUpperCase()})</span>
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={session.currentIndex === 0}
              className="bg-white/80 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            <Button onClick={handleNextQuestion} disabled={!selectedAnswer} className="bg-blue-600 hover:bg-blue-700">
              {session.currentIndex === session.questions.length - 1 ? "Finalizar" : "Próxima"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        <BottomNavigation currentPage="exercicios" />
      </div>
    )
  }

  // Main menu
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Exercícios ENEM</h1>
          <p className="text-gray-600">Pratique com questões reais e simulados completos</p>
          {user && (
            <p className="text-sm text-blue-600 mt-2">
              Olá, {user.displayName || "estudante"}! Seu progresso é salvo automaticamente.
            </p>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Dificuldade</label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="easy">Fácil</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="hard">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Ano</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os anos</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                    <SelectItem value="2020">2020</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full bg-white">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Meu Desempenho
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-xl ${subject.color}`}>
                    <subject.icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{subject.name}</h3>
                    <p className="text-sm text-gray-600">{subject.questions} questões disponíveis</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <Button
                    onClick={() => startExercise(subject.id, "practice")}
                    variant="outline"
                    className="w-full justify-start bg-white hover:bg-gray-50"
                  >
                    <BookOpen className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Prática Dirigida</div>
                      <div className="text-xs text-gray-500">5 questões • Sem tempo limite</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => startExercise(subject.id, "simulation")}
                    className="w-full justify-start bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Clock className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Simulado</div>
                      <div className="text-xs opacity-90">10 questões • Cronometrado</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Statistics */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-indigo-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Seu Progresso</h3>
                <p className="text-sm text-gray-600">Estatísticas dos últimos exercícios</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-1">87%</div>
                <p className="text-xs text-gray-600">Taxa de Acerto</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">156</div>
                <p className="text-xs text-gray-600">Questões Resolvidas</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">12h</div>
                <p className="text-xs text-gray-600">Tempo de Estudo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation currentPage="exercicios" />
    </div>
  )
}
