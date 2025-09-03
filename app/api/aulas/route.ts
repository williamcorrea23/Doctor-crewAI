import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { auth } from "firebase-admin/auth"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { saveChatMessage, loadChatHistory } from "@/lib/chat-history"
import { dualAgentValidation, validateDualAgentSecurity, ValidatedResponse } from "@/lib/dual-agent-validation"

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
    console.warn("Firebase Admin credentials not configured")
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

// Prompt otimizado baseado na pedagogia de Paulo Freire seguindo diretrizes OpenAI
const PAULO_FREIRE_PROMPT = `
Você é um educador especializado em preparação para o ENEM, inspirado na pedagogia crítica de Paulo Freire. Siga rigorosamente estes princípios:

## DIRETRIZES FUNDAMENTAIS:

1. **EDUCAÇÃO DIALÓGICA**: 
   - Estabeleça diálogo horizontal e respeitoso com o estudante
   - Reconheça o conhecimento prévio do aluno como ponto de partida
   - Faça perguntas reflexivas que estimulem o pensamento crítico
   - Evite respostas autoritárias ou definitivas

2. **PROBLEMATIZAÇÃO CONTEXTUALIZADA**:
   - Conecte todo conteúdo com a realidade brasileira contemporânea
   - Use exemplos concretos do cotidiano do estudante
   - Relacione temas com questões sociais, políticas e econômicas atuais
   - Demonstre a aplicabilidade prática do conhecimento

3. **CONSCIENTIZAÇÃO CRÍTICA**:
   - Desenvolva pensamento crítico sobre temas do ENEM
   - Conecte conteúdos com questões sociais, políticas e econômicas
   - Promova reflexão sobre desigualdades e diversidade no Brasil
   - Estimule análise crítica de informações e fontes

4. **VALORIZAÇÃO DO CONHECIMENTO PRÉVIO**:
   - Reconheça e valorize experiências do estudante
   - Construa conhecimento sobre bases já existentes
   - Conecte saberes populares com conhecimento acadêmico
   - Respeite diferentes formas de aprender

## DIRETRIZES DE SEGURANÇA E QUALIDADE:

- Mantenha neutralidade política e religiosa
- Evite conteúdo discriminatório ou ofensivo
- Baseie-se em fontes confiáveis e atualizadas
- Promova inclusão e diversidade
- Foque exclusivamente em conteúdo educacional

## ESTRUTURA DE RESPOSTA:

1. Reconheça a pergunta do estudante
2. Conecte com conhecimento prévio ou experiências
3. Explique o conceito de forma clara e contextualizada
4. Forneça exemplos práticos e brasileiros
5. Faça perguntas reflexivas para aprofundar o aprendizado
6. Relacione com outros temas do ENEM quando relevante

Sua linguagem deve ser:
- Acessível e respeitosa
- Questionadora (faça perguntas que provoquem reflexão)
- Encorajadora da participação ativa
- Conectada com a realidade do estudante

Lembre-se: "Ninguém educa ninguém, ninguém educa a si mesmo, os homens se educam entre si, mediatizados pelo mundo" - Paulo Freire
`

export async function POST(request: NextRequest) {
  console.log('🔥 POST /api/aulas - Iniciando requisição')
  
  try {
    // Verificar autenticação
    const authHeader = request.headers.get("authorization")
    console.log('🔑 Auth header presente:', !!authHeader)
    console.log('🔍 Auth header preview:', authHeader?.substring(0, 50) + '...')
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('❌ Token de autorização ausente ou inválido')
      return NextResponse.json({ error: "Token de autenticação necessário" }, { status: 401 })
    }

    const token = authHeader.split("Bearer ")[1]
    console.log('🎫 Token extraído, tamanho:', token.length)
    console.log('🔍 Token preview:', token?.substring(0, 50) + '...')
    
    let userId: string

    try {
      const decodedToken = await auth.verifyIdToken(token)
      userId = decodedToken.uid
      console.log('✅ Token válido para usuário:', userId)
    } catch (error) {
      console.error('❌ Falha na verificação do token:', error)
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { message, subject } = await request.json()

    if (!message || !subject) {
      return NextResponse.json({ error: "Mensagem e matéria são obrigatórias" }, { status: 400 })
    }

    // Carregar histórico da conversa com controle inteligente de contexto
    console.log('📚 Carregando histórico do chat para usuário:', userId)
    const conversationHistory = await loadChatHistory(userId, `aulas_${subject}`, 30)
    console.log('📖 Histórico carregado, mensagens:', conversationHistory.length)

    // Sistema de gerenciamento de contexto avançado
    console.log('🎯 Preparando mensagens com contexto para:', subject)
    const systemMessage = {
      role: "system",
      content: `${PAULO_FREIRE_PROMPT}

## CONTEXTO ESPECÍFICO:
Matéria: ${subject}
Usuário: ${userId}
Sessão: aulas_${subject}

## INSTRUÇÕES DE CONTINUIDADE:
- Mantenha foco na matéria solicitada
- Conecte com outras áreas quando relevante para o ENEM
- Referencie tópicos anteriores quando apropriado
- Construa sobre conhecimento já discutido
- Adapte complexidade ao nível demonstrado pelo estudante

## CONTROLE DE QUALIDADE:
- Monitore coerência das respostas
- Evite repetições desnecessárias
- Mantenha engajamento educacional`,
    }

    // Preparar mensagens com controle de tokens
    const messages: any[] = [systemMessage]
    console.log('💬 Sistema de mensagens inicializado')

    // Gerenciamento inteligente de contexto histórico
    const maxHistoryMessages = 15
    const recentHistory = conversationHistory.slice(-maxHistoryMessages)
    
    // Calcular tokens aproximados para otimização
    let estimatedTokens = JSON.stringify(systemMessage).length / 4
    
    // Adicionar histórico com controle de tokens
    const contextMessages: any[] = []
    for (let i = recentHistory.length - 1; i >= 0; i--) {
      const msg = recentHistory[i]
      const msgTokens = msg.text.length / 4
      
      if (estimatedTokens + msgTokens < 3000) { // Reservar espaço para resposta
        contextMessages.unshift({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text,
        })
        estimatedTokens += msgTokens
      } else {
        break
      }
    }
    
    messages.push(...contextMessages)

    // Adicionar mensagem atual
    const currentMessage = {
      role: "user",
      content: message,
    }
    messages.push(currentMessage)
    estimatedTokens += message.length / 4

    // Salvar mensagem do usuário no histórico
    await saveChatMessage(userId, `aulas_${subject}`, message, "user")

    // Monitoramento de desempenho - início
    const startTime = Date.now()
    console.log(`[AULAS] Iniciando processamento com validação dual - Usuário: ${userId}, Matéria: ${subject}, Tokens estimados: ${Math.round(estimatedTokens)}`);

    // Usar sistema de validação em duas etapas (Groq + OpenAI)
    const systemPrompt = `Você é um professor especialista em ${subject} para o ENEM. Sua missão é fornecer explicações claras, didáticas e precisas sobre os tópicos solicitados.

## DIRETRIZES PEDAGÓGICAS:
- Use linguagem acessível e exemplos práticos
- Conecte o conteúdo com questões do ENEM
- Forneça dicas de estudo e memorização
- Seja encorajador e motivacional
- Estruture as respostas de forma organizada

## FOCO NO ENEM:
- Priorize conteúdos que mais aparecem no exame
- Mencione competências e habilidades relevantes
- Sugira estratégias de resolução de questões
- Relacione com temas de redação quando apropriado`

    console.log('🤖 Iniciando validação dual (Groq + OpenAI)...')
    
    const validatedResponse: ValidatedResponse = await dualAgentValidation(
      message,
      systemPrompt,
      messages.slice(0, -1), // Contexto sem a mensagem atual
      {
        maxTokens: 1200,
        temperature: 0.7
      }
    )
    console.log('✅ Validação dual concluída com sucesso')

    // Monitoramento de desempenho - métricas
    const endTime = Date.now()
    const responseTime = endTime - startTime
    const aiResponse = validatedResponse.finalResponse

    // Validação de segurança dual para ambas as respostas
    const dualSecurityValidation = validateDualAgentSecurity(
      validatedResponse.groqValidation.response,
      validatedResponse.finalResponse
    )
    
    if (!dualSecurityValidation.isValid) {
      console.warn(`[AULAS] Conteúdo bloqueado por validação dual de segurança:`, {
        userId,
        issues: dualSecurityValidation.issues,
        timestamp: new Date().toISOString()
      })
      return NextResponse.json({
        message: "Desculpe, não posso processar essa solicitação. Por favor, reformule sua pergunta de forma educativa e apropriada.",
        userId,
        subject,
        error: "content_filtered"
      }, { status: 400 })
    }
    
    // Log de monitoramento detalhado com métricas de validação dual
    console.log(`[AULAS] Processamento dual concluído:`, {
      userId,
      subject,
      responseTime: `${responseTime}ms`,
      groqTokens: validatedResponse.groqValidation.tokensUsed,
      openaiTokens: validatedResponse.openaiRefinement.tokensUsed,
      totalTokens: validatedResponse.metadata.totalTokens,
      groqTime: `${validatedResponse.groqValidation.responseTime}ms`,
      openaiTime: `${validatedResponse.openaiRefinement.responseTime}ms`,
      estimatedTokens: Math.round(estimatedTokens),
      messageLength: message.length,
      responseLength: aiResponse.length,
      validationPassed: validatedResponse.metadata.validationPassed,
      validationMethod: "dual-agent"
    })

    // Validação de conteúdo (básica)
    if (aiResponse.length < 10) {
      console.warn(`[AULAS] Resposta muito curta detectada para usuário ${userId}`);
    }
    
    if (responseTime > 10000) {
      console.warn(`[AULAS] Tempo de resposta alto: ${responseTime}ms para usuário ${userId}`);
    }

    // Salvar resposta da IA no histórico
    await saveChatMessage(userId, `aulas_${subject}`, aiResponse, "bot")

    return NextResponse.json({
      message: aiResponse,
      userId,
      subject,
      metadata: {
        responseTime,
        totalTokens: validatedResponse.metadata.totalTokens,
        groqTokens: validatedResponse.groqValidation.tokensUsed,
        openaiTokens: validatedResponse.openaiRefinement.tokensUsed,
        validationMethod: "dual-agent",
        validationPassed: validatedResponse.metadata.validationPassed,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("❌ Erro geral na API de aulas:", error)
    
    // Log detalhado do erro
    if (error instanceof Error) {
      console.error('Tipo do erro:', error.constructor.name)
      console.error('Mensagem:', error.message)
      console.error('Stack:', error.stack)
    }
    
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
