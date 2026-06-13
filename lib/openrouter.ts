import type { ChatMessage } from '@/types/chatbot'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

/** OpenAI-compatible message shape ที่ OpenRouter รับ */
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterChatResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  error?: {
    message?: string
  }
}

/**
 * แปลง system prompt + ประวัติแชต (ChatMessage[]) เป็น OpenAI messages array
 * โดย system อยู่หัวสุด — แยกเป็น pure function เพื่อ unit test ได้โดยไม่ต้องยิง network
 */
export function toOpenAIMessages(system: string, messages: ChatMessage[]): OpenAIMessage[] {
  return [
    { role: 'system', content: system },
    ...messages.map((message): OpenAIMessage => ({ role: message.role, content: message.content })),
  ]
}

async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json()
  } catch {
    return null
  }
}

export interface OpenRouterCallOptions {
  model: string
  system: string
  messages: ChatMessage[]
  maxTokens?: number
}

/**
 * เรียก LLM ผ่าน OpenRouter (gateway เดียวรองรับทั้ง Gemini / Claude / ฯลฯ)
 * — API key ส่งผ่าน Authorization header เสมอ ไม่ใส่ใน URL
 */
export async function callOpenRouter({
  model,
  system,
  messages,
  maxTokens = 800,
}: OpenRouterCallOptions): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'X-Title': 'ContechHub',
  }
  // ใช้จัด ranking ฝั่ง OpenRouter — optional
  if (process.env.AUTH_URL) headers['HTTP-Referer'] = process.env.AUTH_URL

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: toOpenAIMessages(system, messages),
    }),
  })

  const data = (await readJson(res)) as OpenRouterChatResponse | null
  if (!res.ok) {
    console.error('[Chatbot] OpenRouter error:', data?.error ?? data)
    throw new Error(`OpenRouter request failed (${res.status})`)
  }

  const text = data?.choices?.[0]?.message?.content
  return typeof text === 'string' ? text.trim() : ''
}
