import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { auth } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { saveChatHistory, loadChatHistory } from '@/lib/chat-history'

// Função de validação de segurança e filtros de conteúdo
function validateContentSecurity(userMessage: string, aiResponse: string): { isValid: boolean; reason?: string } {
  const userLower = userMessage.toLowerCase()
  const aiLower = aiResponse.toLowerCase()
  
  // Lista de palavras e padrões inadequados
  const inappropriatePatterns = [
    /\b(hack|hacking|pirataria|drogas|violência)\b/i,
    /\b(suicídio|autolesão|depressão severa)\b/i,
    /\b(conteúdo adulto|pornografia|sexual explícito)\b/i,
    /\b(discriminação|racismo|homofobia|xenofobia)\b/i,
    /\b(trapacear|colar|fraude acadêmica)\b/i
  ]
  
  // Verificar mensagem do usuário
  for (const pattern of inappropriatePatterns) {
    if (pattern.test(userLower)) {
      return { isValid: false, reason: `Conteúdo inadequado detectado na mensagem do usuário: ${pattern.source}` }
    }
  }
  
  // Verificar resposta da IA
  for (const pattern of inappropriatePatterns) {
    if (pattern.test(aiLower)) {
      return { isValid: false, reason: `Conteúdo inadequado detectado na resposta da IA: ${pattern.source}` }
    }
  }
  
  // Verificar se a resposta está relacionada ao contexto educacional
  const educationalKeywords = ['enem', 'estudo', 'aprender', 'educação', 'conhecimento', 'matéria', 'disciplina', 'prova', 'exercício']
  const hasEducationalContext = educationalKeywords.some(keyword => 
    userLower.includes(keyword) || aiLower.includes(keyword)
  )
  
  // Se não há contexto educacional e a mensagem é muito longa, pode ser suspeita
  if (!hasEducationalContext && userMessage.length > 500) {
    return { isValid: false, reason: 'Mensagem muito longa sem contexto educacional claro' }
  }
  
  return { isValid: true }
}

// Initialize Firebase Admin
if (!getApps().length) {
  if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.warn('Firebase Admin credentials not configured')
  } else {
    initializeApp({
      credential: cert({
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      }),
    })
  }
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

const subjectPrompts = {
  matematica: `Você é um especialista em Matemática do ENEM. Crie questões de múltipla escolha seguindo o padrão ENEM com:
- Enunciado claro e contextualizado
- 5 alternativas (A, B, C, D, E)
- Nível de dificuldade apropriado
- Explicação detalhada da resolução
- Tópicos como: funções, geometria, estatística, probabilidade, álgebra, trigonometria`,
  
  linguagens: `Você é um especialista em Linguagens do ENEM. Crie questões de múltipla escolha seguindo o padrão ENEM com:
- Interpretação de texto, gramática, literatura
- Textos diversos: crônicas, artigos, poemas, charges
- 5 alternativas (A, B, C, D, E)
- Contextualização social e cultural
- Explicação fundamentada na norma culta`,
  
  cienciasHumanas: `Você é um especialista em Ciências Humanas do ENEM. Crie questões de múltipla escolha seguindo o padrão ENEM com:
- História, Geografia, Filosofia, Sociologia
- Análise de documentos, mapas, gráficos
- 5 alternativas (A, B, C, D, E)
- Contextualização histórica e social
- Explicação interdisciplinar`,
  
  cienciasDaNatureza: `Você é um especialista em Ciências da Natureza do ENEM. Crie questões de múltipla escolha seguindo o padrão ENEM com:
- Física, Química, Biologia
- Experimentos, gráficos, tabelas
- 5 alternativas (A, B, C, D, E)
- Aplicações práticas e cotidianas
- Explicação científica detalhada`
}

const topicsBySubject = {
  matematica: ['Funções', 'Geometria', 'Estatística', 'Probabilidade', 'Álgebra', 'Trigonometria', 'Análise Combinatória'],
  linguagens: ['Interpretação de Texto', 'Gramática', 'Literatura', 'Redação', 'Linguística', 'Semântica'],
  cienciasHumanas: ['História do Brasil', 'Geografia', 'Filosofia', 'Sociologia', 'Geopolítica', 'Movimentos Sociais'],
  cienciasDaNatureza: ['Física', 'Química', 'Biologia', 'Ecologia', 'Genética', 'Termodinâmica']
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autenticação necessário' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    let userId: string

    try {
      const decodedToken = await auth.verifyIdToken(token)
      userId = decodedToken.uid
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { subject, quantity = 5, difficulty = 'medium', year = 2023 } = await request.json()

    if (!subject || !subjectPrompts[subject as keyof typeof subjectPrompts]) {
      return NextResponse.json(
        { error: 'Matéria inválida ou não especificada' },
        { status: 400 }
      )
    }

    if (quantity < 1 || quantity > 20) {
      return NextResponse.json(
        { error: 'Quantidade deve estar entre 1 e 20 questões' },
        { status: 400 }
      )
    }

    const topics = topicsBySubject[subject as keyof typeof topicsBySubject]
    const selectedTopics = topics.sort(() => 0.5 - Math.random()).slice(0, Math.min(quantity, topics.length))

    const questions: Question[] = []

    for (let i = 0; i < quantity; i++) {
      const topic = selectedTopics[i % selectedTopics.length]
      const questionPrompt = `${subjectPrompts[subject as keyof typeof subjectPrompts]}

Crie UMA questão sobre: ${topic}
Ano: ${year}
Dificuldade: ${difficulty}

Retorne APENAS um JSON válido no seguinte formato:
{
  "topic": "${topic}",
  "question": "Enunciado da questão aqui",
  "options": [
    {"id": "a", "text": "Alternativa A"},
    {"id": "b", "text": "Alternativa B"},
    {"id": "c", "text": "Alternativa C"},
    {"id": "d", "text": "Alternativa D"},
    {"id": "e", "text": "Alternativa E"}
  ],
  "correct": "letra_correta",
  "explanation": "Explicação detalhada da resolução"
}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-5-nano-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em criar questões do ENEM. Retorne APENAS JSON válido, sem texto adicional.'
          },
          {
            role: 'user',
            content: questionPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1800,
        top_p: 0.9,
        presence_penalty: 0.2,
        frequency_penalty: 0.1
      })

      try {
        const aiResponse = completion.choices[0].message.content || '{}'
        
        // Validação de segurança
        const securityValidation = validateContentSecurity(questionPrompt, aiResponse)
        if (!securityValidation.isValid) {
          console.warn(`[EXERCICIOS] Conteúdo bloqueado por segurança:`, {
            userId,
            subject,
            topic,
            reason: securityValidation.reason,
            timestamp: new Date().toISOString()
          })
          // Usar questão fallback segura
          questions.push({
            id: i + 1,
            subject,
            year: parseInt(year),
            difficulty,
            topic,
            question: `Questão educativa de ${topic} - conteúdo em revisão`,
            options: [
              { id: 'a', text: 'Alternativa A' },
              { id: 'b', text: 'Alternativa B' },
              { id: 'c', text: 'Alternativa C' },
              { id: 'd', text: 'Alternativa D' },
              { id: 'e', text: 'Alternativa E' }
            ],
            correct: 'a',
            explanation: 'Conteúdo em revisão por questões de segurança'
          })
          continue
        }
        
        const questionData = JSON.parse(aiResponse)
        
        const question: Question = {
          id: i + 1,
          subject,
          year: parseInt(year),
          difficulty,
          topic: questionData.topic || topic,
          question: questionData.question || 'Questão não disponível',
          options: questionData.options || [],
          correct: questionData.correct || 'a',
          explanation: questionData.explanation || 'Explicação não disponível'
        }

        // Log de monitoramento
        console.log(`[EXERCICIOS] Questão gerada:`, {
          userId,
          subject,
          topic,
          questionId: i + 1,
          tokensUsed: completion.usage?.total_tokens || 0,
          model: 'gpt-5-nano-2025-08-07',
          timestamp: new Date().toISOString()
        })

        questions.push(question)
      } catch (parseError) {
        console.error('Erro ao parsear questão:', parseError)
        // Fallback com questão básica
        questions.push({
          id: i + 1,
          subject,
          year: parseInt(year),
          difficulty,
          topic,
          question: `Questão de ${topic} - ${subject}`,
          options: [
            { id: 'a', text: 'Alternativa A' },
            { id: 'b', text: 'Alternativa B' },
            { id: 'c', text: 'Alternativa C' },
            { id: 'd', text: 'Alternativa D' },
            { id: 'e', text: 'Alternativa E' }
          ],
          correct: 'a',
          explanation: 'Explicação temporariamente indisponível'
        })
      }
    }

    // Salvar histórico de exercícios se userId fornecido
    if (userId) {
      try {
        await saveChatHistory(userId, `exercicios_${subject}`, [
          {
            role: 'system',
            content: `Exercício gerado: ${quantity} questões de ${subject} - ${difficulty} - ${year}`
          }
        ])
      } catch (error) {
        console.error('Erro ao salvar histórico de exercícios:', error)
      }
    }

    return NextResponse.json({
      success: true,
      questions,
      metadata: {
        subject,
        quantity: questions.length,
        difficulty,
        year,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Erro na API de exercícios:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const subject = searchParams.get('subject')
  
  if (!subject) {
    return NextResponse.json(
      { error: 'Parâmetro subject é obrigatório' },
      { status: 400 }
    )
  }

  // Retornar informações sobre a matéria
  const subjectInfo = {
    matematica: {
      name: 'Matemática',
      topics: topicsBySubject.matematica,
      availableYears: [2023, 2022, 2021, 2020, 2019],
      difficulties: ['easy', 'medium', 'hard']
    },
    linguagens: {
      name: 'Linguagens',
      topics: topicsBySubject.linguagens,
      availableYears: [2023, 2022, 2021, 2020, 2019],
      difficulties: ['easy', 'medium', 'hard']
    },
    cienciasHumanas: {
      name: 'Ciências Humanas',
      topics: topicsBySubject.cienciasHumanas,
      availableYears: [2023, 2022, 2021, 2020, 2019],
      difficulties: ['easy', 'medium', 'hard']
    },
    cienciasDaNatureza: {
      name: 'Ciências da Natureza',
      topics: topicsBySubject.cienciasDaNatureza,
      availableYears: [2023, 2022, 2021, 2020, 2019],
      difficulties: ['easy', 'medium', 'hard']
    }
  }

  const info = subjectInfo[subject as keyof typeof subjectInfo]
  
  if (!info) {
    return NextResponse.json(
      { error: 'Matéria não encontrada' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    subject: info
  })
}