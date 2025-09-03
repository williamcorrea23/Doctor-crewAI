"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import {
  Calculator,
  Languages,
  Globe,
  FlaskRoundIcon as Flask,
  PenTool,
  ArrowLeft,
  Send,
  Bot,
  User,
  ChevronRight,
  BookOpen,
  Heart,
} from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useAuth } from "@/hooks/use-auth"
import { loadChatHistory } from "@/lib/chat-history"
import { getCurrentUserToken } from "@/lib/auth"

const subjects = [
  {
    id: "matematica",
    name: "Matemática",
    icon: Calculator,
    color: "bg-blue-100 text-blue-700",
    description: "Álgebra, Geometria, Estatística",
    topics: [
      {
        id: "funcoes",
        name: "Funções",
        description: "Função afim, quadrática, exponencial e logarítmica",
      },
      {
        id: "geometria-plana",
        name: "Geometria Plana",
        description: "Áreas, perímetros e teoremas fundamentais",
      },
      {
        id: "geometria-espacial",
        name: "Geometria Espacial",
        description: "Volumes, áreas de sólidos e geometria 3D",
      },
      {
        id: "estatistica",
        name: "Estatística",
        description: "Média, mediana, moda e análise de dados",
      },
      {
        id: "probabilidade",
        name: "Probabilidade",
        description: "Eventos, combinações e permutações",
      },
      {
        id: "trigonometria",
        name: "Trigonometria",
        description: "Seno, cosseno, tangente e identidades",
      },
      { id: "progressoes", name: "Progressões", description: "PA, PG e aplicações" },
      {
        id: "matrizes",
        name: "Matrizes e Determinantes",
        description: "Operações matriciais e sistemas lineares",
      },
      {
        id: "analise-combinatoria",
        name: "Análise Combinatória",
        description: "Princípios de contagem e arranjos",
      },
      {
        id: "numeros-complexos",
        name: "Números Complexos",
        description: "Operações e representações no plano",
      },
      {
        id: "polinomios",
        name: "Polinômios",
        description: "Operações, raízes e teorema fundamental",
      },
      {
        id: "geometria-analitica",
        name: "Geometria Analítica",
        description: "Retas, circunferências e cônicas",
      },
      {
        id: "matematica-financeira",
        name: "Matemática Financeira",
        description: "Juros, porcentagem e aplicações",
      },
      {
        id: "razao-proporcao",
        name: "Razão e Proporção",
        description: "Regra de três e grandezas proporcionais",
      },
      { id: "logaritmos", name: "Logaritmos", description: "Propriedades e equações logarítmicas" },
    ],
  },
  {
    id: "linguagens",
    name: "Linguagens",
    icon: Languages,
    color: "bg-green-100 text-green-700",
    description: "Português, Literatura, Inglês",
    topics: [
      {
        id: "interpretacao",
        name: "Interpretação de Texto",
        description: "Compreensão e análise textual",
      },
      { id: "gramatica", name: "Gramática", description: "Sintaxe, morfologia e semântica" },
      {
        id: "literatura-brasileira",
        name: "Literatura Brasileira",
        description: "Escolas literárias e obras importantes",
      },
      {
        id: "literatura-portuguesa",
        name: "Literatura Portuguesa",
        description: "Camões, Gil Vicente e outros autores",
      },
      { id: "ingles", name: "Inglês", description: "Leitura e interpretação em língua inglesa" },
      { id: "espanhol", name: "Espanhol", description: "Compreensão textual em espanhol" },
      {
        id: "figuras-linguagem",
        name: "Figuras de Linguagem",
        description: "Metáfora, metonímia e outras figuras",
      },
      {
        id: "generos-textuais",
        name: "Gêneros Textuais",
        description: "Narrativo, dissertativo, descritivo",
      },
      {
        id: "funcoes-linguagem",
        name: "Funções da Linguagem",
        description: "Referencial, emotiva, conativa, etc.",
      },
      {
        id: "variacao-linguistica",
        name: "Variação Linguística",
        description: "Norma culta, coloquial e regional",
      },
      { id: "sintaxe", name: "Sintaxe", description: "Análise sintática e períodos compostos" },
      { id: "semantica", name: "Semântica", description: "Significado, polissemia e ambiguidade" },
      {
        id: "intertextualidade",
        name: "Intertextualidade",
        description: "Relações entre textos e referências",
      },
      {
        id: "arte-cultura",
        name: "Arte e Cultura",
        description: "Manifestações artísticas e culturais",
      },
      {
        id: "tecnologia-comunicacao",
        name: "Tecnologia e Comunicação",
        description: "Mídias digitais e linguagem virtual",
      },
    ],
  },
  {
    id: "humanas",
    name: "Ciências Humanas",
    icon: Globe,
    color: "bg-orange-100 text-orange-700",
    description: "História, Geografia, Filosofia",
    topics: [
      {
        id: "historia-brasil",
        name: "História do Brasil",
        description: "Colônia, Império e República",
      },
      {
        id: "geografia-fisica",
        name: "Geografia Física",
        description: "Relevo, clima e hidrografia",
      },
      { id: "filosofia", name: "Filosofia", description: "Pensadores e correntes filosóficas" },
      {
        id: "sociologia",
        name: "Sociologia",
        description: "Sociedade, cultura e movimentos sociais",
      },
      {
        id: "geopolitica",
        name: "Geopolítica",
        description: "Relações internacionais e conflitos",
      },
      {
        id: "historia-geral",
        name: "História Geral",
        description: "Antiguidade, Idade Média e Moderna",
      },
      {
        id: "geografia-humana",
        name: "Geografia Humana",
        description: "População, urbanização e migração",
      },
      {
        id: "historia-contemporanea",
        name: "História Contemporânea",
        description: "Século XX e XXI",
      },
      { id: "cartografia", name: "Cartografia", description: "Mapas, escalas e projeções" },
      { id: "antropologia", name: "Antropologia", description: "Cultura e diversidade humana" },
      {
        id: "geografia-economica",
        name: "Geografia Econômica",
        description: "Globalização e desenvolvimento",
      },
      { id: "politica", name: "Ciência Política", description: "Estado, democracia e cidadania" },
      {
        id: "questoes-ambientais",
        name: "Questões Ambientais",
        description: "Sustentabilidade e impactos",
      },
      {
        id: "direitos-humanos",
        name: "Direitos Humanos",
        description: "Cidadania e justiça social",
      },
      {
        id: "movimentos-sociais",
        name: "Movimentos Sociais",
        description: "Lutas e transformações sociais",
      },
    ],
  },
  {
    id: "natureza",
    name: "Ciências da Natureza",
    icon: Flask,
    color: "bg-purple-100 text-purple-700",
    description: "Física, Química, Biologia",
    topics: [
      { id: "mecanica", name: "Mecânica", description: "Cinemática, dinâmica e estática" },
      {
        id: "quimica-organica",
        name: "Química Orgânica",
        description: "Funções orgânicas e reações",
      },
      { id: "genetica", name: "Genética", description: "Hereditariedade e biotecnologia" },
      { id: "ecologia", name: "Ecologia", description: "Ecossistemas e meio ambiente" },
      { id: "termodinamica", name: "Termodinâmica", description: "Calor, temperatura e energia" },
      { id: "citologia", name: "Citologia", description: "Estrutura e função celular" },
      {
        id: "quimica-inorganica",
        name: "Química Inorgânica",
        description: "Ácidos, bases, sais e óxidos",
      },
      {
        id: "eletromagnetismo",
        name: "Eletromagnetismo",
        description: "Eletricidade, magnetismo e ondas",
      },
      { id: "evolucao", name: "Evolução", description: "Teorias evolutivas e especiação" },
      {
        id: "fisico-quimica",
        name: "Físico-Química",
        description: "Cinética, equilíbrio e eletroquímica",
      },
      { id: "anatomia", name: "Anatomia Humana", description: "Sistemas do corpo humano" },
      { id: "ondulatoria", name: "Ondulatória", description: "Ondas mecânicas e eletromagnéticas" },
      {
        id: "biotecnologia",
        name: "Biotecnologia",
        description: "Engenharia genética e aplicações",
      },
      {
        id: "quimica-ambiental",
        name: "Química Ambiental",
        description: "Poluição e sustentabilidade",
      },
      { id: "optica", name: "Óptica", description: "Reflexão, refração e instrumentos ópticos" },
    ],
  },
  {
    id: "redacao",
    name: "Redação",
    icon: PenTool,
    color: "bg-pink-100 text-pink-700",
    description: "Dissertação argumentativa",
    topics: [
      {
        id: "estrutura",
        name: "Estrutura da Redação",
        description: "Introdução, desenvolvimento e conclusão",
      },
      { id: "argumentacao", name: "Argumentação", description: "Tipos de argumentos e persuasão" },
      { id: "coesao", name: "Coesão e Coerência", description: "Conectivos e organização textual" },
      { id: "temas-atuais", name: "Temas Atuais", description: "Questões sociais contemporâneas" },
      {
        id: "intervencao",
        name: "Proposta de Intervenção",
        description: "Como elaborar soluções viáveis",
      },
      { id: "competencias", name: "5 Competências", description: "Critérios de avaliação do ENEM" },
    ],
  },
]

interface Message {
  id: number
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export default function Aulas() {
  const { user } = useAuth()
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadHistory = async () => {
      if (user && selectedSubject && selectedTopic) {
        try {
          const subject = subjects.find((s) => s.id === selectedSubject)
          const topic = subject?.topics.find((t) => t.id === selectedTopic)
          const subjectKey = `aulas_${subject?.name} - ${topic?.name}: ${topic?.description}`

          const history = await loadChatHistory(user.uid, subjectKey)

          if (history.length > 0) {
            const formattedHistory: Message[] = history.map((msg) => ({
              id: msg.id,
              text: msg.text,
              sender: msg.sender,
              timestamp: msg.timestamp,
            }))
            setMessages(formattedHistory)
          } else {
            // Mensagem de boas-vindas inspirada em Paulo Freire
            const welcomeMessage: Message = {
              id: Date.now(),
              text: `Olá! 🌟 Que alegria ter você aqui para explorarmos juntos o fascinante mundo de ${topic?.name}!\n\nComo dizia Paulo Freire, "não há docência sem discência" - isso significa que eu também aprendo com você a cada conversa. Sua experiência e curiosidade são fundamentais neste processo de construção do conhecimento.\n\n💭 Para começarmos nosso diálogo, me conte: o que você já sabe sobre ${topic?.name}? Ou talvez tenha alguma dúvida específica que gostaria de explorar?\n\nLembre-se: não existem perguntas bobas, apenas oportunidades de aprender e crescer juntos! 🚀`,
              sender: "bot",
              timestamp: new Date(),
            }
            setMessages([welcomeMessage])
          }
        } catch (error) {
          console.error("Erro ao carregar histórico:", error)
          // Fallback para mensagem simples
          const subject = subjects.find((s) => s.id === selectedSubject)
          const topic = subject?.topics.find((t) => t.id === selectedTopic)
          const fallbackMessage: Message = {
            id: Date.now(),
            text: `Olá! Vamos estudar ${topic?.name} juntos? Faça sua primeira pergunta! 📚`,
            sender: "bot",
            timestamp: new Date(),
          }
          setMessages([fallbackMessage])
        }
      }
    }

    loadHistory()
  }, [user, selectedSubject, selectedTopic])

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId)
    setSelectedTopic(null)
    setMessages([])
  }

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId)
    setMessages([])
  }

  const handleSendMessage = async () => {
    console.log('🔍 DEBUG - handleSendMessage iniciado')
    console.log('🔍 DEBUG - user:', !!user, user?.uid)
    console.log('🔍 DEBUG - inputMessage:', inputMessage.trim())
    console.log('🔍 DEBUG - isLoading:', isLoading)
    
    if (!inputMessage.trim() || isLoading || !user) {
      console.log('🔍 DEBUG - Condição de saída atingida')
      return
    }

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage("")
    setIsLoading(true)

    try {
      const subject = subjects.find((s) => s.id === selectedSubject)
      const topic = subject?.topics.find((t) => t.id === selectedTopic)

      console.log('🔍 DEBUG - Obtendo token...')
      // Obter token de autenticação do Firebase
      const token = await getCurrentUserToken()
      console.log('🔍 DEBUG - Token obtido:', !!token, token?.substring(0, 20) + '...')
      
      if (!token) {
        throw new Error('Token de autenticação não disponível')
      }

      const response = await fetch("/api/aulas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: currentMessage,
          subject: `${subject?.name} - ${topic?.name}: ${topic?.description}`,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage: Message = {
          id: Date.now() + 1,
          text: data.message,
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
      } else {
        throw new Error("Falha na comunicação com a IA")
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
      
      let errorMessage = "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente."
      
      if (error instanceof Error) {
        if (error.message.includes('Token de autenticação')) {
          errorMessage = "Sessão expirada. Por favor, faça login novamente."
        } else if (error.message.includes('fetch')) {
          errorMessage = "Erro de conexão. Verifique sua internet e tente novamente."
        } else if (error.message.includes('401')) {
          errorMessage = "Acesso não autorizado. Faça login novamente."
        } else if (error.message.includes('500')) {
          errorMessage = "Erro interno do servidor. Tente novamente em alguns minutos."
        }
      }
      
      const subject = subjects.find((s) => s.id === selectedSubject)
      const topic = subject?.topics.find((t) => t.id === selectedTopic)

      const fallbackResponses = [
        `Que pergunta interessante sobre ${topic?.name}! 🤔 Vamos refletir juntos: como você enxerga esse conceito em sua vida cotidiana?`,
        `Excelente questionamento sobre ${topic?.name}! 💭 Na pedagogia crítica, acreditamos que o conhecimento nasce do diálogo. O que você já observou sobre isso?`,
        `Sua curiosidade sobre ${topic?.name} é o primeiro passo para o aprendizado! 🌱 Vamos construir esse conhecimento juntos, partindo do que você já sabe.`,
        `Que bom que você trouxe essa questão sobre ${topic?.name}! 🎯 Como educador freireano, quero entender: qual sua experiência com esse tema?`,
      ]

      const botMessage: Message = {
        id: Date.now() + 1,
        text: errorMessage,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (selectedTopic) {
      setSelectedTopic(null)
      setMessages([])
    } else {
      setSelectedSubject(null)
      setMessages([])
    }
  }

  if (selectedSubject && selectedTopic) {
    const subject = subjects.find((s) => s.id === selectedSubject)
    const topic = subject?.topics.find((t) => t.id === selectedTopic)

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-24">
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              {subject && <subject.icon className="h-6 w-6 text-gray-700" />}
              <div>
                <h1 className="font-serif text-2xl font-bold text-gray-900">{topic?.name}</h1>
                <p className="text-sm text-gray-600">
                  {subject?.name} • {topic?.description}
                </p>
              </div>
            </div>
          </div>

          <Card className="flex h-[calc(100vh-240px)] flex-col border-0 bg-white/90 shadow-lg backdrop-blur-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  Assistente IA - {topic?.name}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {messages.length > 1 ? `${messages.length - 1} mensagens` : "Novo chat"}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
              <ScrollArea className="min-h-0 flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex max-w-[85%] items-start gap-3 ${
                          message.sender === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 rounded-full p-2 ${
                            message.sender === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                          }`}
                        >
                          {message.sender === "user" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <div
                            className={`rounded-lg p-3 ${
                              message.sender === "user"
                                ? "rounded-br-sm bg-blue-600 text-white"
                                : "rounded-bl-sm bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.text}</p>
                          </div>
                          <span className="px-1 text-xs text-gray-500">
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
                    <div className="flex justify-start gap-3">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-2 text-white">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="rounded-lg rounded-bl-sm bg-gray-100 p-3">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-gray-600">Pensando...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="flex-shrink-0 border-t bg-gray-50/50 p-4">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Digite sua dúvida sobre ${topic?.name}...`}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    disabled={isLoading}
                    className="flex-1 bg-white"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-blue-600 px-4 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-center text-xs text-gray-500">
                  Pressione Enter para enviar • Shift + Enter para quebrar linha
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <BottomNavigation currentPage="aulas" />
      </div>
    )
  }

  if (selectedSubject) {
    const subject = subjects.find((s) => s.id === selectedSubject)

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              {subject && <subject.icon className="h-6 w-6 text-gray-700" />}
              <div>
                <h1 className="font-serif text-2xl font-bold text-gray-900">{subject?.name}</h1>
                <p className="text-sm text-gray-600">Escolha um tópico específico para começar</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {subject?.topics.map((topic) => (
              <Card
                key={topic.id}
                className="group cursor-pointer border-0 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                onClick={() => handleTopicSelect(topic.id)}
              >
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                      {topic.name}
                    </h3>
                    <ChevronRight className="h-5 w-5 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-blue-600" />
                  </div>
                  <p className="mb-4 text-sm text-gray-600">{topic.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      Tópico Específico
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs group-hover:bg-blue-50 group-hover:text-blue-600"
                    >
                      Iniciar Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-100 p-3">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900">
                    Chat Especializado por Tópico
                  </h3>
                  <p className="text-sm text-gray-600">
                    Cada tópico tem um assistente IA especializado que conhece profundamente o
                    assunto e pode dar explicações mais precisas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <BottomNavigation currentPage="aulas" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="mb-8">
          <h1 className="mb-2 font-serif text-3xl font-bold text-gray-900">Aulas Interativas</h1>
          <p className="text-gray-600">
            Escolha uma matéria e depois um tópico específico para ter conversas focadas com nossa
            IA
          </p>
          {user && (
            <p className="mt-2 text-sm text-blue-600">
              Olá, {user.displayName || "estudante"}! Suas conversas são salvas automaticamente.
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              className="group cursor-pointer border-0 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              onClick={() => handleSubjectSelect(subject.id)}
            >
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-4">
                  <div
                    className={`rounded-xl p-3 ${subject.color} transition-transform group-hover:scale-110`}
                  >
                    <subject.icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-xl font-semibold text-gray-900">{subject.name}</h3>
                    <p className="text-sm text-gray-600">{subject.description}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {subject.topics.slice(0, 3).map((topic) => (
                      <Badge key={topic.id} variant="outline" className="text-xs">
                        {topic.name}
                      </Badge>
                    ))}
                    {subject.topics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{subject.topics.length - 3} tópicos
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      {subject.topics.length} Tópicos
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group-hover:bg-blue-50 group-hover:text-blue-600"
                    >
                      Ver Tópicos →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">
                  Nova Experiência de Aprendizado
                </h3>
                <p className="text-sm text-gray-600">
                  Agora você pode escolher tópicos específicos para ter conversas mais focadas e
                  produtivas com nossa IA especializada.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation currentPage="aulas" />
    </div>
  )
}
