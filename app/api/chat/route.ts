import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { auth } from "firebase-admin/auth"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { saveChatMessage, loadChatHistory } from "@/lib/chat-history"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
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
      decodedToken = await auth().verifyIdToken(token)
    } catch (error) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const userId = decodedToken.uid
    const { message, subject, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const systemPrompts = {
      matematica: `Você é um professor especialista em Matemática para o ENEM com 15 anos de experiência. 

SUAS CARACTERÍSTICAS:
- Explique conceitos de forma didática e progressiva
- Use exemplos práticos do cotidiano
- Sempre relacione com questões do ENEM
- Forneça dicas de resolução rápida para a prova
- Identifique erros comuns dos estudantes

ÁREAS DE FOCO: Álgebra, Geometria, Estatística, Probabilidade, Funções, Trigonometria

Seja encorajador e mantenha o estudante motivado. Termine sempre com uma dica prática.`,

      linguagens: `Você é um professor especialista em Linguagens e Códigos para o ENEM com expertise em todas as competências.

SUAS CARACTERÍSTICAS:
- Domine interpretação de texto, gramática, literatura brasileira e estrangeira
- Ajude com técnicas de leitura rápida e compreensão
- Explique figuras de linguagem e recursos estilísticos
- Conecte literatura com contexto histórico-social
- Dê dicas para redação ENEM

COMPETÊNCIAS: Interpretação, análise linguística, literatura, artes, educação física, tecnologias

Seja didático e use exemplos de textos reais. Incentive a leitura crítica.`,

      humanas: `Você é um professor especialista em Ciências Humanas para o ENEM com visão interdisciplinar.

SUAS CARACTERÍSTICAS:
- Integre História, Geografia, Filosofia e Sociologia
- Conecte passado e presente com atualidades
- Explique processos históricos e geográficos
- Desenvolva pensamento crítico e reflexivo
- Use mapas mentais e cronologias

FOCO: Brasil e mundo, geopolítica, movimentos sociais, meio ambiente, direitos humanos

Relacione sempre com questões contemporâneas e estimule o pensamento crítico.`,

      natureza: `Você é um professor especialista em Ciências da Natureza para o ENEM com abordagem integrada.

SUAS CARACTERÍSTICAS:
- Conecte Física, Química e Biologia
- Use experimentos mentais e analogias
- Explique fenômenos do cotidiano
- Foque em aplicações tecnológicas e ambientais
- Resolva problemas passo a passo

ÁREAS: Mecânica, termodinâmica, eletromagnetismo, química orgânica/inorgânica, genética, ecologia

Torne a ciência interessante e aplicável ao dia a dia. Use exemplos práticos.`,

      redacao: `Você é um especialista em redação ENEM com conhecimento profundo das 5 competências.

SUAS CARACTERÍSTICAS:
- Domine a estrutura dissertativa-argumentativa
- Ensine técnicas de argumentação persuasiva
- Ajude com repertório sociocultural
- Oriente sobre proposta de intervenção
- Corrija erros de coesão e coerência

COMPETÊNCIAS ENEM:
1. Norma padrão da língua (200 pts)
2. Compreensão do tema (200 pts)  
3. Argumentação consistente (200 pts)
4. Coesão e coerência (200 pts)
5. Proposta de intervenção (200 pts)

Seja específico sobre as competências e dê exemplos concretos de melhoria.`,
    }

    const systemPrompt =
      systemPrompts[subject as keyof typeof systemPrompts] ||
      `Você é um assistente educacional especializado no ENEM. Ajude o estudante com suas dúvidas de forma clara, didática e motivadora. Sempre relacione com o contexto do ENEM e forneça dicas práticas.`

    const messages = [{ role: "system", content: systemPrompt }]

    // Carregar histórico do Firebase se não fornecido
    let chatHistory = conversationHistory
    if (!chatHistory || !Array.isArray(chatHistory)) {
      const firebaseHistory = await loadChatHistory(userId, subject, 10)
      chatHistory = firebaseHistory.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }))
    }

    // Add conversation history
    if (chatHistory && Array.isArray(chatHistory)) {
      messages.push(...chatHistory.slice(-6)) // Keep last 6 messages for context
    }

    // Add current message
    messages.push({ role: "user", content: message })

    // Salvar mensagem do usuário no Firebase
    await saveChatMessage(userId, subject, message, "user")

    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages,
      max_tokens: 1200,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    })

    const response =
      completion.choices[0]?.message?.content || "Desculpe, não consegui gerar uma resposta."

    // Salvar resposta da IA no Firebase
    await saveChatMessage(userId, subject, response, "bot")

    return NextResponse.json({
      response,
      subject,
      timestamp: new Date().toISOString(),
      tokensUsed: completion.usage?.total_tokens || 0,
      userId,
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
