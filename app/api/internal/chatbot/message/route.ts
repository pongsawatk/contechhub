import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { hasAuthenticatedUser, hasBuAccess } from '@/lib/api-auth'
import { buildFlashSystemPrompt, buildHaikuSystemPrompt } from '@/lib/chatbot-prompt'
import { parseChatbotResponse } from '@/lib/chatbot-parser'
import { requiresEscalation } from '@/lib/chatbot-router'
import { getKBEntries, getPricingPackages } from '@/lib/notion'
import type { ChatIntent, ChatMessage } from '@/types/chatbot'

const GEMINI_MODEL = 'gemini-2.5-flash'
const HAIKU_MODEL = 'claude-haiku-4-5-20251001'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'

function normalizeModelText(text: unknown): string {
  return typeof text === 'string' ? text.trim() : ''
}

async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json()
  } catch {
    return null
  }
}

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

interface AnthropicMessagesResponse {
  content?: Array<{
    text?: string
  }>
}

async function callGemini(systemPrompt: string, messages: ChatMessage[], maxTokens = 800): Promise<string> {
  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: messages.map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    })),
    generationConfig: { maxOutputTokens: maxTokens },
  }

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = (await readJson(res)) as GeminiGenerateContentResponse | null
  if (!res.ok) {
    console.error('[Chatbot] Gemini error:', data)
    throw new Error('Gemini request failed')
  }

  return normalizeModelText(data?.candidates?.[0]?.content?.parts?.[0]?.text)
}

async function callHaiku(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  const body = {
    model: HAIKU_MODEL,
    max_tokens: 1000,
    system: systemPrompt,
    messages,
  }

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  })

  const data = (await readJson(res)) as AnthropicMessagesResponse | null
  if (!res.ok) {
    console.error('[Chatbot] Haiku error:', data)
    throw new Error('Haiku request failed')
  }

  const text = Array.isArray(data?.content)
    ? data.content
        .map((part: { text?: string }) => part?.text ?? '')
        .join('\n')
        .trim()
    : ''

  return normalizeModelText(text)
}

async function classifyIntent(lastUserMessage: string): Promise<ChatIntent> {
  const classifyPrompt = `Classify this sales chat message into exactly one intent.
Valid intents: collect_requirement, extract_fields, summarize, explain_package, compare_packages, objection_handling, closing_script
Return JSON only, no other text: {"intent": "..."}` 

  try {
    const text = await callGemini(classifyPrompt, [{ role: 'user', content: lastUserMessage }], 50)
    const clean = text.replace(/```json\n?|```/g, '').trim()
    const parsed = JSON.parse(clean)
    return parsed.intent as ChatIntent
  } catch {
    return 'collect_requirement'
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!hasAuthenticatedUser(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasBuAccess(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { messages, sessionId } = body as {
    messages: ChatMessage[]
    sessionId?: string
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'No messages' }, { status: 400 })
  }

  if (!process.env.GOOGLE_AI_API_KEY) {
    return NextResponse.json({ error: 'GOOGLE_AI_API_KEY is not configured' }, { status: 500 })
  }

  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.content ?? ''
  const isContechBU = session.user.profile?.buMembership === 'Contech BU'
  const userProfile = {
    displayName: session.user.profile.displayName,
    salesLane: session.user.profile.salesLane ?? 'Both',
  }

  try {
    const [pricingItems, kbEntries, intent] = await Promise.all([
      getPricingPackages(isContechBU),
      getKBEntries(userProfile.salesLane),
      classifyIntent(lastUserMessage),
    ])

    let rawText = ''
    let modelUsed: 'gemini-2.5-flash' | 'claude-haiku-4-5-20251001' = GEMINI_MODEL

    if (requiresEscalation(intent)) {
      rawText = await callHaiku(buildHaikuSystemPrompt(pricingItems, kbEntries, userProfile), messages)
      modelUsed = HAIKU_MODEL
    } else {
      rawText = await callGemini(buildFlashSystemPrompt(pricingItems, kbEntries, userProfile), messages)
      modelUsed = GEMINI_MODEL
    }

    const result = parseChatbotResponse(rawText, intent, modelUsed)
    return NextResponse.json({ ...result, sessionId })
  } catch (error) {
    console.error('[Chatbot] message route error:', error)
    return NextResponse.json({ error: 'Failed to generate chatbot response' }, { status: 500 })
  }
}
