import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { auth } from "firebase-admin/auth"
import { initializeApp, getApps, cert } from "firebase-admin/app"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autenticação necessário' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    let decodedToken
    
    try {
      decodedToken = await auth().verifyIdToken(token)
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const userId = decodedToken.uid
    const { texto, tema, wordCount, lineCount, timeSpent } = await request.json()

    if (!texto || !tema) {
      return NextResponse.json({ error: "Texto e tema são obrigatórios" }, { status: 400 })
    }

    // SISTEMA DE DUPLA AVALIAÇÃO
    // Avaliador 1: Foco em aspectos técnicos e estruturais
    const evaluator1Prompt = `Você é o AVALIADOR 1 - Especialista em aspectos técnicos e estruturais de redações do ENEM.

TEMA: ${tema}

REDAÇÃO (${wordCount} palavras, ${lineCount} linhas, tempo: ${Math.floor(timeSpent / 60)}min):
${texto}

Sua especialidade: COMPETÊNCIAS 1, 3 e 4

**COMPETÊNCIA 1 - Domínio da modalidade escrita formal (0-200 pontos)**
Foque em: ortografia, acentuação, pontuação, concordância, regência, sintaxe, adequação vocabular.

**COMPETÊNCIA 3 - Organização e interpretação de informações (0-200 pontos)**
Foque em: projeto de texto, autoria, argumentação, progressão textual, estratégias argumentativas.

**COMPETÊNCIA 4 - Mecanismos linguísticos (0-200 pontos)**
Foque em: articulação entre parágrafos, períodos e ideias, conectivos, coesão referencial.

Para cada competência, forneça:
- Pontuação exata (0, 40, 80, 120, 160 ou 200)
- Justificativa técnica detalhada
- Erros específicos encontrados
- Sugestões de correção`

    // Avaliador 2: Foco em conteúdo e proposta de intervenção
    const evaluator2Prompt = `Você é o AVALIADOR 2 - Especialista em conteúdo e proposta de intervenção de redações do ENEM.

TEMA: ${tema}

REDAÇÃO (${wordCount} palavras, ${lineCount} linhas, tempo: ${Math.floor(timeSpent / 60)}min):
${texto}

Sua especialidade: COMPETÊNCIAS 2 e 5

**COMPETÊNCIA 2 - Compreensão da proposta e repertório (0-200 pontos)**
Foque em: compreensão do tema, tangenciamento, fuga, repertório sociocultural legitimado, conhecimentos de mundo.

**COMPETÊNCIA 5 - Proposta de intervenção (0-200 pontos)**
Foque em: presença da proposta, detalhamento completo (ação, agente, modo/meio, finalidade, detalhamento), viabilidade, relação com o tema.

Para cada competência, forneça:
- Pontuação exata (0, 40, 80, 120, 160 ou 200)
- Análise do repertório utilizado
- Avaliação da proposta de intervenção
- Sugestões de melhoria no conteúdo`

    // Executar ambas as avaliações em paralelo
    const [evaluation1, evaluation2] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [{ role: "user", content: evaluator1Prompt }],
        max_tokens: 1500,
        temperature: 0.1,
      }),
      openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [{ role: "user", content: evaluator2Prompt }],
        max_tokens: 1500,
        temperature: 0.1,
      })
    ])

    const evaluation1Text = evaluation1.choices[0]?.message?.content || "Erro na avaliação técnica"
    const evaluation2Text = evaluation2.choices[0]?.message?.content || "Erro na avaliação de conteúdo"

    // Processar resultados da dupla avaliação
    const feedback = {
      competencia1: {
        score: extractScore(evaluation1Text, "COMPETÊNCIA 1") || 160,
        feedback: extractFeedback(evaluation1Text, "COMPETÊNCIA 1") || "Avaliação técnica da escrita formal.",
        title: "Domínio da modalidade escrita formal",
        evaluator: "Avaliador 1 - Técnico"
      },
      competencia2: {
        score: extractScore(evaluation2Text, "COMPETÊNCIA 2") || 140,
        feedback: extractFeedback(evaluation2Text, "COMPETÊNCIA 2") || "Avaliação do conteúdo e repertório.",
        title: "Compreender a proposta de redação",
        evaluator: "Avaliador 2 - Conteúdo"
      },
      competencia3: {
        score: extractScore(evaluation1Text, "COMPETÊNCIA 3") || 120,
        feedback: extractFeedback(evaluation1Text, "COMPETÊNCIA 3") || "Avaliação da organização textual.",
        title: "Selecionar e organizar informações",
        evaluator: "Avaliador 1 - Técnico"
      },
      competencia4: {
        score: extractScore(evaluation1Text, "COMPETÊNCIA 4") || 140,
        feedback: extractFeedback(evaluation1Text, "COMPETÊNCIA 4") || "Avaliação dos mecanismos linguísticos.",
        title: "Conhecimento dos mecanismos linguísticos",
        evaluator: "Avaliador 1 - Técnico"
      },
      competencia5: {
        score: extractScore(evaluation2Text, "COMPETÊNCIA 5") || 120,
        feedback: extractFeedback(evaluation2Text, "COMPETÊNCIA 5") || "Avaliação da proposta de intervenção.",
        title: "Elaborar proposta de intervenção",
        evaluator: "Avaliador 2 - Conteúdo"
      },
      overall: {
        score: 0,
        feedback: "Sua redação foi avaliada por dois especialistas independentes para maior precisão.",
        level: "Bom",
      },
      evaluations: {
        technical: {
          evaluator: "Avaliador 1 - Especialista Técnico",
          focus: "Competências 1, 3 e 4 (aspectos técnicos e estruturais)",
          fullText: evaluation1Text
        },
        content: {
          evaluator: "Avaliador 2 - Especialista em Conteúdo",
          focus: "Competências 2 e 5 (conteúdo e proposta de intervenção)",
          fullText: evaluation2Text
        }
      },
      metadata: {
        wordCount,
        lineCount,
        timeSpent,
        evaluatedAt: new Date().toISOString(),
        userId,
        evaluationMethod: "Dupla Avaliação Especializada"
      },
    }

    // Calculate total score
    feedback.overall.score =
      feedback.competencia1.score +
      feedback.competencia2.score +
      feedback.competencia3.score +
      feedback.competencia4.score +
      feedback.competencia5.score

    // Determine performance level
    if (feedback.overall.score >= 900) feedback.overall.level = "Excelente"
    else if (feedback.overall.score >= 700) feedback.overall.level = "Muito Bom"
    else if (feedback.overall.score >= 500) feedback.overall.level = "Bom"
    else if (feedback.overall.score >= 300) feedback.overall.level = "Regular"
    else feedback.overall.level = "Insuficiente"

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error("Error in essay evaluation API:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

function extractScore(text: string, competencia: string): number | null {
  const regex = new RegExp(`${competencia}[^\\d]*(\\d{1,3})\\s*pontos?`, "i")
  const match = text.match(regex)
  return match ? Number.parseInt(match[1]) : null
}

function extractFeedback(text: string, competencia: string): string | null {
  const lines = text.split("\n")
  let capturing = false
  const feedback = []

  for (const line of lines) {
    if (line.includes(competencia)) {
      capturing = true
      continue
    }
    if (capturing && line.includes("COMPETÊNCIA") && !line.includes(competencia)) {
      break
    }
    if (capturing && line.trim()) {
      feedback.push(line.trim())
    }
  }

  return feedback.length > 0 ? feedback.join(" ").substring(0, 300) : null
}
