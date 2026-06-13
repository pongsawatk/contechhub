import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { hasAuthenticatedUser, hasBuAccess } from '@/lib/api-auth'
import { buildFastSystemPrompt, buildEscalationSystemPrompt } from '@/lib/chatbot-prompt'
import { parseChatbotResponse } from '@/lib/chatbot-parser'
import { CHAT_MODELS, modelForIntent, requiresEscalation } from '@/lib/chatbot-router'
import { callOpenRouter } from '@/lib/openrouter'
import { getKBEntries, getPricingPackages } from '@/lib/notion'
import type { ChatIntent, ChatMessage } from '@/types/chatbot'

async function classifyIntent(lastUserMessage: string): Promise<ChatIntent> {
  const classifyPrompt = `Classify this sales chat message into exactly one intent.
Valid intents: collect_requirement, extract_fields, summarize, explain_package, compare_packages, objection_handling, closing_script
Return JSON only, no other text: {"intent": "..."}`

  try {
    const text = await callOpenRouter({
      model: CHAT_MODELS.fast,
      system: classifyPrompt,
      messages: [{ role: 'user', content: lastUserMessage }],
      maxTokens: 50,
    })
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

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY is not configured' }, { status: 500 })
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

    const escalate = requiresEscalation(intent)
    const model = modelForIntent(intent)
    const system = escalate
      ? buildEscalationSystemPrompt(pricingItems, kbEntries, userProfile)
      : buildFastSystemPrompt(pricingItems, kbEntries, userProfile)

    const rawText = await callOpenRouter({
      model,
      system,
      messages,
      maxTokens: escalate ? 1000 : 800,
    })

    const result = parseChatbotResponse(rawText, intent, model)
    return NextResponse.json({ ...result, sessionId })
  } catch (error) {
    console.error('[Chatbot] message route error:', error)
    return NextResponse.json({ error: 'Failed to generate chatbot response' }, { status: 500 })
  }
}
