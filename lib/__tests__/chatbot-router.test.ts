import { describe, it, expect } from 'vitest'
import {
  CHAT_MODELS,
  requiresEscalation,
  modelForIntent,
  productToTab,
} from '@/lib/chatbot-router'
import type { ChatIntent } from '@/types/chatbot'

describe('requiresEscalation', () => {
  it('escalates consultative intents', () => {
    const escalated: ChatIntent[] = [
      'explain_package',
      'compare_packages',
      'objection_handling',
      'closing_script',
    ]
    for (const intent of escalated) {
      expect(requiresEscalation(intent)).toBe(true)
    }
  })

  it('keeps data-collection intents on the fast tier', () => {
    const fast: ChatIntent[] = ['collect_requirement', 'extract_fields', 'summarize']
    for (const intent of fast) {
      expect(requiresEscalation(intent)).toBe(false)
    }
  })
})

describe('modelForIntent', () => {
  it('routes fast intents to the Gemini Flash slug', () => {
    expect(modelForIntent('collect_requirement')).toBe(CHAT_MODELS.fast)
  })
  it('routes escalation intents to the Sonnet slug', () => {
    expect(modelForIntent('objection_handling')).toBe(CHAT_MODELS.escalation)
  })
  it('uses OpenRouter provider-prefixed slugs', () => {
    expect(CHAT_MODELS.fast).toMatch(/^google\//)
    expect(CHAT_MODELS.escalation).toMatch(/^anthropic\//)
  })
})

describe('productToTab', () => {
  it('maps known products to their pricing tab', () => {
    expect(productToTab('Builk Insite')).toBe('insite')
    expect(productToTab('Builk 360')).toBe('360')
    expect(productToTab('Transformation Service')).toBe('transformation')
  })
  it('slugifies unknown products', () => {
    expect(productToTab('Some New Product')).toBe('some-new-product')
  })
})
