import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { auth } from "firebase-admin"
import { saveChatMessage, loadChatHistory } from "@/lib/chat-history"

// Initialize Firebase Admin
if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  console.warn("Firebase Admin credentials not configured")
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Prompt baseado na pedagogia de Paulo Freire
const PAULO_FREIRE_PROMPT = `
Você é um educador inspirado na pedagogia crítica de Paulo Freire. Sua abordagem deve seguir estes princípios:

1. **EDUCAÇÃO DIALÓGICA**: Estabeleça um diálogo horizontal com o estudante, onde ambos aprendem juntos. Não seja autoritário, mas sim um facilitador do conhecimento.

2. **PROBLEMATIZAÇÃO**: Transforme o conteúdo em problemas reais e significativos para o estudante. Conecte sempre com a realidade brasileira e experiências cotidianas.

3. **CONSCIENTIZAÇÃO CRÍTICA**: Desenvolva o pensamento crítico do estudante sobre os temas do ENEM, conectando-os com questões sociais, políticas e econômicas do Brasil.

4. **VALORIZAÇÃO DO CONHECIMENTO PRÉVIO**: Reconheça e valorize o que o estudante já sabe, construindo sobre essa base.

5. **EDUCAÇÃO LIBERTADORA**: Ajude o estudante a compreender que o conhecimento é uma ferramenta de transformação social e pessoal.

6. **CONTEXTUALIZAÇÃO**: Sempre relacione o conteúdo com a realidade social brasileira, especialmente questões de desigualdade, diversidade e cidadania.

Sua linguagem deve ser:
- Acessível e respeitosa
- Questionadora (faça perguntas que provoquem reflexão)
- Encorajadora da participação ativa
- Conectada com a realidade do estudante

Lembre-se: "Ninguém educa ninguém, ninguém educa a si mesmo, os homens se educam entre si, mediatizados pelo mundo" - Paulo Freire
`

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autenticação necessário" }, { status: 401 })
    }

    const token = authHeader.split("Bearer ")[1]
    let userId: string

    try {
      const decodedToken = await auth().verifyIdToken(token)
      userId = decodedToken.uid
    } catch (error) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { message, subject } = await request.json()

    if (!message || !subject) {
      return NextResponse.json({ error: "Mensagem e matéria são obrigatórias" }, { status: 400 })
    }

    // Carregar histórico da conversa
    const conversationHistory = await loadChatHistory(userId, `aulas_${subject}`)

    // Preparar mensagens para OpenAI
    const messages: any[] = [
      {
        role: "system",
        content: `${PAULO_FREIRE_PROMPT}

Você está ensinando sobre: ${subject}

Mantenha sempre o foco na matéria solicitada, mas conecte com outras áreas do conhecimento quando relevante para o ENEM.`,
      },
    ]

    // Adicionar histórico da conversa
    conversationHistory.forEach((msg) => {
      messages.push({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.message,
      })
    })

    // Adicionar mensagem atual
    messages.push({
      role: "user",
      content: message,
    })

    // Salvar mensagem do usuário no histórico
    await saveChatMessage(userId, `aulas_${subject}`, message, "user")

    // Chamar OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    })

    const aiResponse =
      completion.choices[0]?.message?.content || "Desculpe, não consegui processar sua pergunta."

    // Salvar resposta da IA no histórico
    await saveChatMessage(userId, `aulas_${subject}`, aiResponse, "bot")

    return NextResponse.json({
      message: aiResponse,
      userId,
      subject,
    })
  } catch (error) {
    console.error("Erro na API de aulas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
