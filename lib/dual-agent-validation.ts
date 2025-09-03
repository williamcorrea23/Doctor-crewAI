import OpenAI from 'openai'
import Groq from 'groq-sdk'

// Configuração dos clientes
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Interface para resposta validada
export interface ValidatedResponse {
  finalResponse: string
  groqValidation: {
    response: string
    tokensUsed: number
    responseTime: number
    issues?: string[]
  }
  openaiRefinement: {
    response: string
    tokensUsed: number
    responseTime: number
    improvements?: string[]
  }
  metadata: {
    totalTokens: number
    totalResponseTime: number
    validationPassed: boolean
    timestamp: string
  }
}

// Função principal de validação em duas etapas
export async function dualAgentValidation(
  userMessage: string,
  systemPrompt: string,
  context: any[] = [],
  options: {
    groqModel?: string
    openaiModel?: string
    maxTokens?: number
    temperature?: number
  } = {}
): Promise<ValidatedResponse> {
  const startTime = Date.now()
  
  const {
    groqModel = 'llama-3.1-70b-versatile',
    openaiModel = 'gpt-5-nano-2025-08-07',
    maxTokens = 1500,
    temperature = 0.7
  } = options

  try {
    // ETAPA 1: Validação inicial com Groq
    console.log('[DUAL-AGENT] Iniciando validação com Groq...')
    const groqStartTime = Date.now()
    
    const groqMessages = [
      {
        role: 'system' as const,
        content: `${systemPrompt}

## INSTRUÇÕES DE VALIDAÇÃO:
Você é o primeiro agente em um sistema de validação em duas etapas. Sua função é:
1. Processar a solicitação do usuário de forma precisa e educativa
2. Identificar possíveis problemas ou melhorias necessárias
3. Fornecer uma resposta inicial sólida
4. Listar quaisquer aspectos que precisem de refinamento

Sua resposta será posteriormente refinada por um segundo agente especializado.`
      },
      ...context,
      {
        role: 'user' as const,
        content: userMessage
      }
    ]

    const groqCompletion = await groq.chat.completions.create({
      model: groqModel,
      messages: groqMessages,
      max_tokens: maxTokens,
      temperature: temperature,
      top_p: 0.9,
    })

    const groqResponse = groqCompletion.choices[0]?.message?.content || ''
    const groqEndTime = Date.now()
    const groqResponseTime = groqEndTime - groqStartTime
    const groqTokens = groqCompletion.usage?.total_tokens || 0

    console.log(`[DUAL-AGENT] Groq concluído em ${groqResponseTime}ms, ${groqTokens} tokens`)

    // ETAPA 2: Refinamento e validação final com OpenAI
    console.log('[DUAL-AGENT] Iniciando refinamento com OpenAI...')
    const openaiStartTime = Date.now()
    
    const refinementPrompt = `${systemPrompt}

## INSTRUÇÕES DE REFINAMENTO:
Você é o segundo agente em um sistema de validação em duas etapas. Sua função é:
1. Analisar a resposta inicial do primeiro agente
2. Identificar e corrigir quaisquer imprecisões ou problemas
3. Melhorar a clareza, precisão e qualidade educativa
4. Fornecer a resposta final otimizada
5. Garantir conformidade com padrões educacionais do ENEM

## RESPOSTA DO PRIMEIRO AGENTE:
${groqResponse}

## SOLICITAÇÃO ORIGINAL DO USUÁRIO:
${userMessage}

Analise a resposta acima e forneça uma versão refinada, corrigida e otimizada.`

    const openaiMessages = [
      {
        role: 'system' as const,
        content: refinementPrompt
      },
      {
        role: 'user' as const,
        content: 'Por favor, refine e otimize a resposta do primeiro agente, garantindo máxima qualidade educativa.'
      }
    ]

    const openaiCompletion = await openai.chat.completions.create({
      model: openaiModel,
      messages: openaiMessages,
      max_tokens: maxTokens,
      temperature: temperature * 0.8, // Temperatura ligeiramente menor para refinamento
      top_p: 0.95,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    })

    const openaiResponse = openaiCompletion.choices[0]?.message?.content || ''
    const openaiEndTime = Date.now()
    const openaiResponseTime = openaiEndTime - openaiStartTime
    const openaiTokens = openaiCompletion.usage?.total_tokens || 0

    console.log(`[DUAL-AGENT] OpenAI concluído em ${openaiResponseTime}ms, ${openaiTokens} tokens`)

    // Análise de qualidade e validação
    const totalTime = Date.now() - startTime
    const totalTokens = groqTokens + openaiTokens
    
    // Verificar se houve melhoria significativa
    const validationPassed = openaiResponse.length > groqResponse.length * 0.8 && 
                           openaiResponse.length < groqResponse.length * 1.5

    const result: ValidatedResponse = {
      finalResponse: openaiResponse,
      groqValidation: {
        response: groqResponse,
        tokensUsed: groqTokens,
        responseTime: groqResponseTime,
        issues: analyzeResponseIssues(groqResponse)
      },
      openaiRefinement: {
        response: openaiResponse,
        tokensUsed: openaiTokens,
        responseTime: openaiResponseTime,
        improvements: analyzeImprovements(groqResponse, openaiResponse)
      },
      metadata: {
        totalTokens,
        totalResponseTime: totalTime,
        validationPassed,
        timestamp: new Date().toISOString()
      }
    }

    console.log(`[DUAL-AGENT] Processo completo: ${totalTime}ms, ${totalTokens} tokens, validação: ${validationPassed ? 'PASSOU' : 'FALHOU'}`)
    
    return result

  } catch (error) {
    console.error('[DUAL-AGENT] Erro no processo de validação:', error)
    
    // Fallback: usar apenas OpenAI se Groq falhar
    try {
      const fallbackCompletion = await openai.chat.completions.create({
        model: openaiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          ...context,
          { role: 'user', content: userMessage }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
      })

      const fallbackResponse = fallbackCompletion.choices[0]?.message?.content || 'Desculpe, houve um erro no processamento.'
      
      return {
        finalResponse: fallbackResponse,
        groqValidation: {
          response: 'Erro na validação inicial',
          tokensUsed: 0,
          responseTime: 0,
          issues: ['Falha na conexão com Groq']
        },
        openaiRefinement: {
          response: fallbackResponse,
          tokensUsed: fallbackCompletion.usage?.total_tokens || 0,
          responseTime: Date.now() - startTime,
          improvements: ['Resposta gerada diretamente pelo OpenAI (fallback)']
        },
        metadata: {
          totalTokens: fallbackCompletion.usage?.total_tokens || 0,
          totalResponseTime: Date.now() - startTime,
          validationPassed: false,
          timestamp: new Date().toISOString()
        }
      }
    } catch (fallbackError) {
      console.error('[DUAL-AGENT] Erro no fallback:', fallbackError)
      throw new Error('Falha completa no sistema de validação em duas etapas')
    }
  }
}

// Função para analisar problemas na resposta inicial
function analyzeResponseIssues(response: string): string[] {
  const issues: string[] = []
  
  if (response.length < 50) {
    issues.push('Resposta muito curta')
  }
  
  if (response.length > 2000) {
    issues.push('Resposta muito longa')
  }
  
  if (!response.includes('ENEM') && !response.includes('enem')) {
    issues.push('Falta contexto específico do ENEM')
  }
  
  const educationalKeywords = ['estudo', 'aprender', 'conhecimento', 'educação']
  const hasEducationalContext = educationalKeywords.some(keyword => 
    response.toLowerCase().includes(keyword)
  )
  
  if (!hasEducationalContext) {
    issues.push('Falta contexto educacional claro')
  }
  
  return issues
}

// Função para analisar melhorias entre as respostas
function analyzeImprovements(groqResponse: string, openaiResponse: string): string[] {
  const improvements: string[] = []
  
  if (openaiResponse.length > groqResponse.length * 1.1) {
    improvements.push('Resposta expandida com mais detalhes')
  }
  
  if (openaiResponse.includes('##') || openaiResponse.includes('**')) {
    improvements.push('Formatação melhorada')
  }
  
  const groqEnemCount = (groqResponse.match(/enem/gi) || []).length
  const openaiEnemCount = (openaiResponse.match(/enem/gi) || []).length
  
  if (openaiEnemCount > groqEnemCount) {
    improvements.push('Maior foco no contexto ENEM')
  }
  
  if (openaiResponse.includes('exemplo') || openaiResponse.includes('prática')) {
    improvements.push('Adição de exemplos práticos')
  }
  
  return improvements
}

// Função para validação de segurança integrada
export function validateDualAgentSecurity(groqResponse: string, openaiResponse: string): {
  isValid: boolean
  issues: string[]
} {
  const issues: string[] = []
  
  const inappropriatePatterns = [
    /\b(hack|hacking|pirataria|drogas|violência)\b/i,
    /\b(suicídio|autolesão|depressão severa)\b/i,
    /\b(conteúdo adulto|pornografia|sexual explícito)\b/i,
    /\b(discriminação|racismo|homofobia|xenofobia)\b/i,
    /\b(trapacear|colar|fraude acadêmica)\b/i
  ]
  
  // Verificar ambas as respostas
  for (const pattern of inappropriatePatterns) {
    if (pattern.test(groqResponse)) {
      issues.push(`Conteúdo inadequado detectado na resposta Groq: ${pattern.source}`)
    }
    if (pattern.test(openaiResponse)) {
      issues.push(`Conteúdo inadequado detectado na resposta OpenAI: ${pattern.source}`)
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
}