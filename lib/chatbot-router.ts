import type { ChatIntent } from '@/types/chatbot'

export function requiresEscalation(intent: ChatIntent): boolean {
  const escalationIntents: ChatIntent[] = [
    'explain_package',
    'compare_packages',
    'objection_handling',
    'closing_script',
  ]

  return escalationIntents.includes(intent)
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
