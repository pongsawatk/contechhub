import type { CalculatorPrefill, ChatIntent, ChatbotResponse, PricingCardRef } from '@/types/chatbot'
import { productToTab } from './chatbot-router'

export function parseChatbotResponse(
  rawText: string,
  intent: ChatIntent,
  modelUsed: 'gemini-2.5-flash' | 'claude-haiku-4-5-20251001'
): ChatbotResponse {
  const jsonMatches = rawText.match(/```json\n([\s\S]*?)\n```/g) ?? []

  let pricingCards: PricingCardRef[] = []
  let calculatorPrefill: CalculatorPrefill | null = null

  for (const match of jsonMatches) {
    try {
      const jsonStr = match.replace(/```json\n|```/g, '').trim()
      const parsed = JSON.parse(jsonStr)

      if (parsed.pricingCards) {
        pricingCards = parsed.pricingCards.map((card: PricingCardRef) => ({
          ...card,
          tab: productToTab(card.product),
          url: `/dashboard/pricing?tab=${productToTab(card.product)}`,
        }))
      }

      if (parsed.calculatorPrefill) {
        calculatorPrefill = parsed.calculatorPrefill
      }
    } catch {
      // Skip malformed JSON blocks.
    }
  }

  const message = rawText.replace(/```json\n[\s\S]*?\n```/g, '').trim()

  return { message, intent, modelUsed, pricingCards, calculatorPrefill }
}
