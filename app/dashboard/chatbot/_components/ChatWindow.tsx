'use client'

import { useEffect, useRef, useState } from 'react'
import type { CalculatorPrefill, ChatIntent, ChatMessage, PricingCardRef } from '@/types/chatbot'

interface Props {
  userProfile: {
    displayName: string
    salesLane: string
    appRole: string
    email: string
  }
}

const SUGGESTED_PROMPTS = [
  'ลูกค้า Developer อยากเริ่มใช้ Insite ราคาเท่าไร?',
  'ช่วยแนะนำท่าปิดการขายลูกค้าที่บอกว่าแพงเกิน',
  'ความต่างระหว่าง Business กับ Professional คืออะไร?',
]

const TOPIC_LABELS: Record<ChatIntent, string> = {
  collect_requirement: 'Requirement Collection',
  extract_fields: 'Field Extraction',
  summarize: 'Summary',
  explain_package: 'Package Explanation',
  compare_packages: 'Package Comparison',
  objection_handling: 'Objection Handling',
  closing_script: 'Closing Script',
}

function encodePrefill(prefill: CalculatorPrefill): string {
  const json = JSON.stringify(prefill)
  const bytes = new TextEncoder().encode(json)
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  return btoa(binary)
}

export default function ChatWindow({ userProfile }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [activeCards, setActiveCards] = useState<PricingCardRef[]>([])
  const [calculatorPrefill, setCalculatorPrefill] = useState<CalculatorPrefill | null>(null)
  const [lastModel, setLastModel] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, activeCards, calculatorPrefill])

  async function persistSession(
    nextMessages: ChatMessage[],
    intent?: ChatIntent,
    modelUsed?: string,
    prefill?: CalculatorPrefill | null,
    calculatorOpened = false
  ) {
    const topic = intent ? TOPIC_LABELS[intent] : undefined
    const res = await fetch('/api/internal/chatbot/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        messageCount: nextMessages.length,
        conversationLog: nextMessages,
        ...(topic ? { topicsDiscussed: [topic] } : {}),
        ...(modelUsed ? { modelUsed } : {}),
        ...(calculatorOpened ? { calculatorOpened } : {}),
        ...(prefill ? { calculatorPrefillData: JSON.stringify(prefill) } : {}),
      }),
    })

    if (!res.ok) return

    const data = await res.json()
    if (!sessionId && data.sessionId) {
      setSessionId(data.sessionId)
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return

    const userMsg: ChatMessage = { role: 'user', content: text.trim() }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/internal/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, sessionId }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to send message')
      }

      const assistantMsg: ChatMessage = { role: 'assistant', content: data.message }
      const allMessages = [...nextMessages, assistantMsg]

      setMessages(allMessages)
      setLastModel(data.modelUsed ?? null)
      setActiveCards(data.pricingCards ?? [])
      setCalculatorPrefill(data.calculatorPrefill ?? null)

      await persistSession(
        allMessages,
        data.intent as ChatIntent,
        data.modelUsed,
        (data.calculatorPrefill as CalculatorPrefill | null) ?? null
      )
    } catch (error) {
      console.error(error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'ขออภัย ระบบผู้ช่วยยังตอบไม่ได้ในตอนนี้ ลองใหม่อีกครั้งนะครับ',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  async function openCalculator() {
    if (!calculatorPrefill) return

    try {
      await persistSession(messages, undefined, lastModel ?? undefined, calculatorPrefill, true)
    } catch (error) {
      console.error('[Chatbot] Failed to persist calculator open state:', error)
    }

    const encoded = encodePrefill(calculatorPrefill)
    window.location.assign(`/dashboard/calculator?prefill=${encodeURIComponent(encoded)}`)
  }

  return (
    <div className="glass-card flex h-full flex-col overflow-hidden">
      <div className="border-b border-white/8 p-4">
        <p className="text-white font-semibold">Contech Sales Assistant</p>
        <p className="mt-1 text-xs text-white/40">
          {userProfile.displayName} | Lane {userProfile.salesLane}
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="mb-4 text-center text-sm text-white/50">Start with one of these prompts</p>
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-left text-sm text-white/70 transition-all hover:bg-white/8"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                message.role === 'user'
                  ? 'border border-[#4ade80]/30 bg-[#4ade80]/20 text-white'
                  : 'glass-card text-white/90'
              }`}
            >
              {message.content}

              {message.role === 'assistant' && index === messages.length - 1 && lastModel && (
                <div className="mt-2 border-t border-white/8 pt-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      lastModel.includes('haiku')
                        ? 'bg-orange-400/15 text-orange-300'
                        : 'bg-green-400/15 text-green-300'
                    }`}
                  >
                    {lastModel.includes('haiku') ? 'Haiku' : 'Flash'}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="glass-card rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-white/40 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-white/40 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-white/40" />
              </div>
            </div>
          </div>
        )}

        {activeCards.length > 0 && !isLoading && (
          <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/45">
              Pricing References
            </p>
            <div className="space-y-2">
              {activeCards.map((card) => (
                <a
                  key={`${card.product}-${card.tab}-${card.label}`}
                  href={card.url}
                  className="block rounded-xl border border-white/10 px-4 py-3 text-sm text-white/75 transition-all hover:bg-white/6"
                >
                  <p className="font-medium text-white">{card.label}</p>
                  <p className="mt-1 text-xs text-white/40">{card.product}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        {calculatorPrefill && !isLoading && (
          <div className="flex justify-start">
            <button
              onClick={openCalculator}
              className="rounded-xl border border-amber-400/30 bg-amber-400/15 px-4 py-2.5 text-sm font-medium text-amber-300 transition-all hover:bg-amber-400/25"
            >
              Open calculator with this context
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/8 p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void sendMessage(input)
              }
            }}
            placeholder="Type a customer question or sales scenario..."
            className="glass-input flex-1 rounded-xl px-4 py-2.5 text-sm"
          />
          <button
            onClick={() => void sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="rounded-xl border border-[#4ade80]/30 bg-[#4ade80]/20 px-4 py-2.5 text-sm font-medium text-[#4ade80] transition-all disabled:opacity-30 hover:bg-[#4ade80]/30"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
