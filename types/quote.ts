import type { CalculatorInput } from "@/types/calculator"

export interface StoredQuoteState {
  version: 1
  savedAt: string
  input: CalculatorInput
}

export interface QuoteSessionRecord {
  id: string
  quoteName: string
  customerName: string
  lane: string
  status: string
  finalPrice: number
  summaryJson: string
  approvalRequired: boolean
  calculatorInput: CalculatorInput | null
}
