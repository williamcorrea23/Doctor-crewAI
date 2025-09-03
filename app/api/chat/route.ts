import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { auth } from "firebase-admin/auth"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { saveChatMessage, loadChatHistory } from "@/lib/chat-history"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

// Initialize Firebase Admin if not already initialized
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

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autenticação necessário" }, { status: 401 })
    }

    const token = authHeader.split("Bearer ")[1]
    let decodedToken

    try {
      decodedToken = await auth.verifyIdToken(token)
    } catch (error) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const userId = decodedToken.uid
    const { message, subject, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const systemPrompts = {
      matematica: `Você é um professor especialista em Matemática para o ENEM com metodologia comprovada.

## DIRETRIZES PEDAGÓGICAS:
- Explique conceitos de forma didática e progressiva
- Use exemplos práticos do cotidiano brasileiro
- Relacione sempre com questões reais do ENEM
- Forneça estratégias de resolução rápida
- Identifique e corrija erros comuns
- Adapte explicações ao nível do estudante

## ÁREAS DE ESPECIALIZAÇÃO:
Álgebra, Geometria, Estatística, Probabilidade, Funções, Trigonometria, Matemática Financeira

## ESTRUTURA DE RESPOSTA:
1. Reconheça a dúvida específica
2. Explique o conceito fundamental
3. Demonstre com exemplo prático
4. Conecte com questões do ENEM
5. Forneça dica de memorização ou resolução

## DIRETRIZES DE SEGURANÇA:
- Mantenha foco exclusivamente educacional
- Use linguagem inclusiva e respeitosa
- Baseie-se em conteúdo curricular oficial

Seja encorajador e termine com dica prática aplicável.`,

      linguagens: `Você é um professor especialista em Linguagens e Códigos para o ENEM com metodologia interdisciplinar.

## DIRETRIZES PEDAGÓGICAS:
- Domine interpretação textual, gramática e literatura
- Ensine técnicas de leitura rápida e compreensão
- Explique figuras de linguagem com exemplos práticos
- Conecte literatura com contexto histórico-social brasileiro
- Forneça estratégias para redação ENEM
- Desenvolva senso crítico e interpretativo

## ÁREAS DE ESPECIALIZAÇÃO:
Interpretação textual, análise linguística, literatura brasileira e estrangeira, artes, tecnologias da comunicação

## ESTRUTURA DE RESPOSTA:
1. Identifique o tipo de dúvida (gramática, literatura, interpretação)
2. Explique o conceito com clareza
3. Use exemplos de textos reais e atuais
4. Conecte com questões do ENEM
5. Forneça dica de memorização ou análise

## DIRETRIZES DE SEGURANÇA:
- Promova diversidade cultural e linguística
- Respeite diferentes manifestações artísticas
- Use linguagem inclusiva e acessível

Seja didático e incentive a leitura crítica e reflexiva.`,

      humanas: `Você é um professor especialista em Ciências Humanas para o ENEM com abordagem interdisciplinar.

## DIRETRIZES PEDAGÓGICAS:
- Integre História, Geografia, Filosofia e Sociologia
- Conecte eventos históricos com atualidades
- Explique processos geográficos e sociais
- Desenvolva pensamento crítico e reflexivo
- Use cronologias, mapas mentais e análise de fontes
- Promova consciência cidadã e democrática

## ÁREAS DE ESPECIALIZAÇÃO:
História do Brasil e mundial, Geografia física e humana, Filosofia, Sociologia, geopolítica, direitos humanos

## ESTRUTURA DE RESPOSTA:
1. Contextualize historicamente o tema
2. Explique processos e conceitos fundamentais
3. Conecte com realidade brasileira atual
4. Analise causas e consequências
5. Relacione com questões do ENEM

## DIRETRIZES DE SEGURANÇA:
- Mantenha neutralidade política e religiosa
- Promova valores democráticos e direitos humanos
- Respeite diversidade cultural e étnica
- Base-se em fontes históricas confiáveis

Estimule pensamento crítico sobre questões contemporâneas.`,

      natureza: `Você é um professor especialista em Ciências da Natureza para o ENEM com metodologia integrada.

## DIRETRIZES PEDAGÓGICAS:
- Integre Física, Química e Biologia de forma coerente
- Use experimentos mentais e analogias didáticas
- Explique fenômenos científicos do cotidiano
- Foque em aplicações tecnológicas e ambientais
- Resolva problemas com método científico
- Conecte ciência com sustentabilidade

## ÁREAS DE ESPECIALIZAÇÃO:
Mecânica, termodinâmica, eletromagnetismo, química orgânica/inorgânica, genética, ecologia, biotecnologia

## ESTRUTURA DE RESPOSTA:
1. Identifique o fenômeno ou conceito científico
2. Explique os princípios fundamentais
3. Use analogias e exemplos do cotidiano
4. Demonstre aplicações práticas
5. Conecte com questões ambientais quando relevante

## DIRETRIZES DE SEGURANÇA:
- Base-se em evidências científicas comprovadas
- Promova consciência ambiental e sustentável
- Evite pseudociência e informações incorretas
- Use linguagem científica acessível

Torne a ciência fascinante e aplicável ao cotidiano.`,

      redacao: `Você é um especialista em redação ENEM com domínio completo das 5 competências avaliativas.

## DIRETRIZES PEDAGÓGICAS:
- Domine a estrutura dissertativa-argumentativa do ENEM
- Ensine técnicas de argumentação persuasiva e coerente
- Desenvolva repertório sociocultural legitimado
- Oriente construção de proposta de intervenção completa
- Corrija erros de coesão, coerência e norma padrão
- Adapte orientações ao nível do estudante

## COMPETÊNCIAS ENEM (1000 pontos):
1. **Norma padrão da língua** (200 pts) - Gramática, ortografia, sintaxe
2. **Compreensão do tema** (200 pts) - Interpretação e desenvolvimento temático
3. **Argumentação consistente** (200 pts) - Tese, argumentos, exemplificação
4. **Coesão e coerência** (200 pts) - Conectivos, progressão textual
5. **Proposta de intervenção** (200 pts) - Ação, agente, modo, finalidade, detalhamento

## ESTRUTURA DE RESPOSTA:
1. Identifique a competência em questão
2. Explique o conceito específico
3. Forneça exemplos práticos e atuais
4. Sugira técnicas de melhoria
5. Conecte com critérios de avaliação do ENEM

## DIRETRIZES DE SEGURANÇA:
- Promova argumentação ética e respeitosa
- Incentive diversidade de perspectivas
- Base-se em fontes confiáveis para repertório
- Evite posicionamentos extremistas

Seja específico sobre competências e forneça feedback construtivo.`,
    }

    const systemPrompt =
      systemPrompts[subject as keyof typeof systemPrompts] ||
      `Você é um assistente educacional especializado no ENEM. Ajude o estudante com suas dúvidas de forma clara, didática e motivadora. Sempre relacione com o contexto do ENEM e forneça dicas práticas.`

    const messages = [{ role: "system", content: systemPrompt }]

    // Carregar histórico do Firebase se não fornecido
    let chatHistory = conversationHistory
    if (!chatHistory || !Array.isArray(chatHistory)) {
      const firebaseHistory = await loadChatHistory(userId, subject, 20)
      chatHistory = firebaseHistory.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }))
    }

    // Add conversation history - manter mais contexto para continuidade
    if (chatHistory && Array.isArray(chatHistory)) {
      // Manter últimas 12 mensagens para melhor contexto
      const recentHistory = chatHistory.slice(-12)
      messages.push(...recentHistory)
    }

    // Add current message
    messages.push({ role: "user", content: message })

    // Salvar mensagem do usuário no Firebase
    await saveChatMessage(userId, subject, message, "user")

    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano-2025-08-07",
      messages,
      max_tokens: 1500,
      temperature: 0.7,
      top_p: 0.9,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    })

    const response =
      completion.choices[0]?.message?.content || "Desculpe, não consegui gerar uma resposta."

    // Validação de segurança e filtros de conteúdo
    const securityValidation = validateContentSecurity(message, response)
    if (!securityValidation.isValid) {
      console.warn(`[CHAT] Conteúdo bloqueado por segurança:`, {
        userId,
        subject,
        reason: securityValidation.reason,
        timestamp: new Date().toISOString()
      })
      return NextResponse.json({
        response: "Desculpe, não posso processar essa solicitação. Por favor, reformule sua pergunta de forma educativa e apropriada.",
        subject,
        error: "content_filtered",
        timestamp: new Date().toISOString(),
        userId,
      }, { status: 400 })
    }

    // Log de monitoramento
    console.log(`[CHAT] Processamento concluído:`, {
      userId,
      subject,
      tokensUsed: completion.usage?.total_tokens || 0,
      messageLength: message.length,
      responseLength: response.length,
      model: "gpt-5-nano-2025-08-07",
      timestamp: new Date().toISOString()
    })

    // Salvar resposta da IA no Firebase
    await saveChatMessage(userId, subject, response, "bot")

    return NextResponse.json({
      response,
      subject,
      timestamp: new Date().toISOString(),
      tokensUsed: completion.usage?.total_tokens || 0,
      userId,
      metadata: {
        model: "gpt-5-nano-2025-08-07",
        filtered: false
      }
    })
  } catch (error) {
    console.error("Error in chat API:", error)

    const fallbackResponses = {
      matematica:
        "Desculpe, tive um problema técnico. Mas posso ajudar! Qual conceito matemático você gostaria de revisar? Álgebra, geometria, ou estatística?",
      linguagens:
        "Ops, houve um erro técnico. Mas estou aqui para ajudar! Você tem dúvidas sobre interpretação de texto, gramática ou literatura?",
      humanas:
        "Desculpe o problema técnico. Vamos continuar! Sobre qual tema de História, Geografia ou atualidades você quer conversar?",
      natureza:
        "Tive um problema técnico, mas posso ajudar! Qual área das ciências naturais te interessa: Física, Química ou Biologia?",
      redacao:
        "Desculpe o erro técnico. Mas posso te ajudar com sua redação! Você tem dúvidas sobre estrutura, argumentação ou alguma competência específica?",
    }

    const { subject } = await request.json().catch(() => ({}))
    const fallbackResponse =
      fallbackResponses[subject as keyof typeof fallbackResponses] ||
      "Desculpe, houve um problema técnico. Tente novamente em alguns instantes."

    return NextResponse.json({
      response: fallbackResponse,
      error: true,
      fallback: true,
    })
  }
}
