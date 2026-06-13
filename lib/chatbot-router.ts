import type { ChatIntent } from '@/types/chatbot'

/**
 * OpenRouter model slugs สำหรับ 2-tier routing
 * - fast: เก็บข้อมูล / classify intent (ถูก, เร็ว)
 * - escalation: งานที่ปรึกษา objection/closing (ฉลาดกว่า)
 * เปลี่ยน model = แก้ slug ตรงนี้จุดเดียว
 */
export const CHAT_MODELS = {
  fast: 'google/gemini-2.5-flash',
  escalation: 'anthropic/claude-sonnet-4.6',
} as const

export function requiresEscalation(intent: ChatIntent): boolean {
  const escalationIntents: ChatIntent[] = [
    'explain_package',
    'compare_packages',
    'objection_handling',
    'closing_script',
  ]

  return escalationIntents.includes(intent)
}

/** เลือก model ตาม intent — escalation intents ไป Sonnet, ที่เหลือไป Gemini Flash */
export function modelForIntent(intent: ChatIntent): string {
  return requiresEscalation(intent) ? CHAT_MODELS.escalation : CHAT_MODELS.fast
}

const TAB_MAP: Record<string, string> = {
  'Builk Insite': 'insite',
  'Builk 360': '360',
  'Kwanjai': 'kwanjai',
  'Bundle': 'bundle',
  'Transformation Service': 'transformation',
}

export function productToTab(product: string): string {
  return TAB_MAP[product] ?? product.toLowerCase().replace(/\s+/g, '-')
}
