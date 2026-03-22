export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export type ChatIntent =
  | 'collect_requirement'
  | 'extract_fields'
  | 'summarize'
  | 'explain_package'
  | 'compare_packages'
  | 'objection_handling'
  | 'closing_script'

export interface PricingCardRef {
  type: 'pricing_card'
  product: string
  tab: string
  label: string
  url: string
}

export interface CalculatorPrefill {
  customerName?: string
  lane?: 'Biz' | 'Corp'
  products?: string[]
  packageName?: string
  addons?: string[]
  kickstarter?: boolean
  engagementModel?: string
  services?: Array<{
    itemName: string
    quantity: number
    taskNote?: string
  }>
}

export interface ChatbotResponse {
  message: string
  intent: ChatIntent
  modelUsed: 'gemini-2.5-flash' | 'claude-haiku-4-5-20251001'
  pricingCards?: PricingCardRef[]
  calculatorPrefill?: CalculatorPrefill | null
}
