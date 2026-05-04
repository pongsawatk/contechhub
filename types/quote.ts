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

export interface PackageAddonDetail {
  name: string
  description: string
}

export interface PackageTopupDetail {
  name: string
  description: string
  quantity: number
  quantityUnit: string
}

export interface PackageExportDetail {
  product: string
  packageName: string
  targetProfile: string
  keyInclusions: string[]
  notes: string
  isEnterprise: boolean
  enterpriseTier?: 'base' | 'premium'
  enterpriseBaseNote: string
  enterprisePremiumNote: string
  addons: PackageAddonDetail[]
  topups: PackageTopupDetail[]
}
