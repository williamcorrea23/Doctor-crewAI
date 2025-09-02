"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Play,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Target,
  TrendingUp,
  Users,
  MessageCircle,
  PenTool,
  Award,
  Zap,
  HelpCircle,
  Star,
  Brain,
  Calendar,
  BarChart3,
} from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"

const tutorialSections = [
  {
    id: "getting-started",
    title: "Primeiros Passos",
    icon: Play,
    color: "bg-blue-100 text-blue-700",
    description: "Como começar a usar a plataforma",
    steps: [
      {
        title: "Faça seu login",
        description: "Entre com sua conta Google ou crie uma conta com email e senha",
        tip: "Use sempre a mesma conta para manter seu progresso salvo",
      },
      {
        title: "Complete seu perfil",
        description: "Adicione informações sobre seus objetivos e área de interesse",
        tip: "Isso nos ajuda a personalizar sua experiência de estudo",
      },
      {
        title: "Explore o dashboard",
        description: "Veja suas estatísticas, progresso e redações recentes",
        tip: "O dashboard é atualizado em tempo real conforme você estuda",
      },
    ],
  },
  {
    id: "interactive-classes",
    title: "Aulas Interativas",
    icon: MessageCircle,
    color: "bg-green-100 text-green-700",
    description: "Como usar o chat com IA para tirar dúvidas",
    steps: [
      {
        title: "Escolha a matéria",
        description: "Selecione entre Matemática, Linguagens, Ciências Humanas, Ciências da Natureza ou Redação",
        tip: "Cada matéria tem uma IA especializada com conhecimento específico",
      },
      {
        title: "Faça perguntas específicas",
        description: "Seja detalhado em suas dúvidas para receber explicações mais precisas",
        tip: "Exemplo: 'Como resolver equações do 2º grau?' em vez de 'Ajuda com matemática'",
      },
      {
        title: "Pratique com exemplos",
        description: "Peça exercícios práticos e resolva junto com a IA",
        tip: "A IA pode criar exercícios personalizados baseados em suas dificuldades",
      },
    ],
  },
  {
    id: "essay-writing",
    title: "Sistema de Redação",
    icon: PenTool,
    color: "bg-red-100 text-red-700",
    description: "Como escrever e receber feedback detalhado",
    steps: [
      {
        title: "Escolha um tema",
        description: "Selecione um tema do ENEM ou crie um tema personalizado",
        tip: "Comece com temas que você já conhece para ganhar confiança",
      },
      {
        title: "Use o timer",
        description: "Pratique com o cronômetro para simular a prova real",
        tip: "O ENEM permite 90 minutos para a redação, pratique dentro desse tempo",
      },
      {
        title: "Analise o feedback",
        description: "Receba avaliação detalhada por competência do ENEM",
        tip: "Foque nas competências com menor pontuação para melhorar mais rápido",
      },
    ],
  },
  {
    id: "exercises",
    title: "Exercícios e Simulados",
    icon: Target,
    color: "bg-purple-100 text-purple-700",
    description: "Como praticar questões e fazer simulados",
    steps: [
      {
        title: "Pratique por matéria",
        description: "Resolva questões específicas de cada área do conhecimento",
        tip: "Comece com prática dirigida antes de fazer simulados completos",
      },
      {
        title: "Faça simulados cronometrados",
        description: "Teste seus conhecimentos em condições similares à prova",
        tip: "Simulados ajudam a gerenciar o tempo e identificar pontos fracos",
      },
      {
        title: "Revise as explicações",
        description: "Leia as explicações detalhadas de cada questão",
        tip: "Entender o erro é mais importante que acertar a questão",
      },
    ],
  },
]

const studyTips = [
  {
    icon: Calendar,
    title: "Organize seu tempo",
    description: "Crie um cronograma de estudos equilibrado entre todas as matérias",
    tip: "Dedique mais tempo às matérias com menor desempenho",
  },
  {
    icon: Brain,
    title: "Use técnicas de memorização",
    description: "Aplique mapas mentais, resumos e flashcards para fixar conteúdo",
    tip: "A repetição espaçada é mais eficaz que estudar tudo de uma vez",
  },
  {
    icon: BarChart3,
    title: "Acompanhe seu progresso",
    description: "Monitore suas estatísticas e identifique áreas de melhoria",
    tip: "Pequenos progressos diários levam a grandes resultados",
  },
  {
    icon: Zap,
    title: "Mantenha a consistência",
    description: "Estude um pouco todos os dias em vez de longas sessões esporádicas",
    tip: "30 minutos diários são mais eficazes que 3 horas uma vez por semana",
  },
]

const faqItems = [
  {
    question: "Como a IA avalia minhas redações?",
    answer:
      "Nossa IA analisa sua redação usando os mesmos critérios do ENEM: domínio da norma padrão, compreensão do tema, argumentação, coesão/coerência e proposta de intervenção. Cada competência recebe uma nota de 0 a 200 pontos.",
  },
  {
    question: "Posso usar a plataforma offline?",
    answer:
      "A plataforma requer conexão com internet para funcionar, pois utiliza IA em tempo real. Porém, você pode baixar materiais de estudo para consulta offline.",
  },
  {
    question: "Quantas redações posso enviar por dia?",
    answer:
      "Não há limite para o número de redações. Recomendamos escrever pelo menos uma redação por semana para manter a prática constante.",
  },
  {
    question: "Como interpretar minha pontuação nos exercícios?",
    answer:
      "A pontuação segue o padrão ENEM: 0-1000 pontos. Acima de 700 é considerado bom, acima de 800 é muito bom, e acima de 900 é excelente.",
  },
  {
    question: "A plataforma substitui um cursinho?",
    answer:
      "Nossa plataforma é um complemento excelente aos estudos, oferecendo prática personalizada e feedback instantâneo. Recomendamos usar junto com outras fontes de estudo.",
  },
]

export default function Tutorial() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId)
  }

  const toggleFaq = (faqId: string) => {
    setOpenFaq(openFaq === faqId ? null : faqId)
  }

  const markStepCompleted = (sectionId: string, stepIndex: number) => {
    const stepId = `${sectionId}-${stepIndex}`
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId)
    } else {
      newCompleted.add(stepId)
    }
    setCompletedSteps(newCompleted)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Tutorial da Plataforma</h1>
          <p className="text-gray-600">Aprenda a usar todas as funcionalidades e maximize seus estudos para o ENEM</p>
        </div>

        {/* Quick Start Guide */}
        <Card className="mb-8 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-600" />
              Guia Rápido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="p-3 bg-blue-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">1. Faça Login</h3>
                <p className="text-sm text-gray-600">Entre com sua conta</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-green-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">2. Tire Dúvidas</h3>
                <p className="text-sm text-gray-600">Use o chat com IA</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-red-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <PenTool className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">3. Escreva Redações</h3>
                <p className="text-sm text-gray-600">Receba feedback detalhado</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-purple-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">4. Pratique</h3>
                <p className="text-sm text-gray-600">Resolva exercícios</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Tutorials */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-serif font-bold text-gray-900">Tutoriais Detalhados</h2>
          {tutorialSections.map((section) => (
            <Card key={section.id} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <Collapsible open={activeSection === section.id} onOpenChange={() => toggleSection(section.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${section.color}`}>
                          <section.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{section.title}</CardTitle>
                          <p className="text-sm text-gray-600 font-normal">{section.description}</p>
                        </div>
                      </div>
                      {activeSection === section.id ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {section.steps.map((step, index) => {
                        const stepId = `${section.id}-${index}`
                        const isCompleted = completedSteps.has(stepId)

                        return (
                          <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markStepCompleted(section.id, index)}
                              className={`p-1 h-6 w-6 rounded-full ${
                                isCompleted ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-400"
                              }`}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                              <p className="text-gray-700 mb-2">{step.description}</p>
                              <div className="flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-amber-500" />
                                <p className="text-sm text-amber-700 italic">{step.tip}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {/* Study Tips */}
        <Card className="mb-8 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Dicas de Estudo para o ENEM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {studyTips.map((tip, index) => (
                <div key={index} className="flex gap-4">
                  <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                    <tip.icon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{tip.title}</h3>
                    <p className="text-gray-700 text-sm mb-2">{tip.description}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <p className="text-xs text-yellow-700 italic">{tip.tip}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="mb-8 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              Perguntas Frequentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <div key={index}>
                  <Collapsible open={openFaq === `faq-${index}`} onOpenChange={() => toggleFaq(`faq-${index}`)}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-4 h-auto text-left hover:bg-gray-50">
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        {openFaq === `faq-${index}` ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  {index < faqItems.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Award className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Pronto para começar?</h3>
            <p className="text-gray-600 mb-6">
              Agora que você conhece todas as funcionalidades, comece sua jornada rumo ao ENEM!
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <TrendingUp className="h-4 w-4 mr-2" />
                Ver Dashboard
              </Button>
              <Button variant="outline" className="bg-white">
                <MessageCircle className="h-4 w-4 mr-2" />
                Começar Aulas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <Card className="mt-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  Progresso do Tutorial: {completedSteps.size}/
                  {tutorialSections.reduce((acc, section) => acc + section.steps.length, 0)} passos
                </span>
              </div>
              <Badge variant="outline" className="text-green-700 border-green-300">
                {Math.round(
                  (completedSteps.size / tutorialSections.reduce((acc, section) => acc + section.steps.length, 0)) *
                    100,
                )}
                % completo
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation currentPage="tutorial" />
    </div>
  )
}
