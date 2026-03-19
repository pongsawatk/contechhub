export interface Customer {
  id: string
  companyName: string
  customerId: string
  segment: string
  region: string
  tier: string
  primaryContact: string
  phone: string
  email: string
  source: string
  active: boolean
}

export type HotQuotationProduct = "Builk Insite" | "Builk 360" | "Kwanjai" | "Bundle"
export type HotQuotationStage = "Sent" | "Follow-up" | "Negotiation" | "Verbal Yes"
export type HotQuotationStatus = "Active" | "Won" | "Lost" | "On Hold"

export interface HotQuotation {
  id: string
  entryName: string
  quotationNo: string
  customerRelationId: string
  contactName: string
  product: HotQuotationProduct | ""
  quotationAmount: number
  hotness: "5" | "4" | ""
  lane: "Biz" | "Corp" | ""
  stage: HotQuotationStage | ""
  ownerName: string
  ownerEmail: string
  expectedClose: string | null
  lastActivity: string | null
  status: HotQuotationStatus | ""
  importBatch: string
  notes: string
}

export interface SalesOrder {
  id: string
  entryName: string
  orderNo: string
  quotationNo: string
  customerRelationId: string
  contactName: string
  product: string
  orderAmount: number
  lane: "Biz" | "Corp" | ""
  revenueType: string
  closeDate: string | null
  expectedGoLive: string | null
  contractMonths: number
  ownerName: string
  ownerEmail: string
  paymentTerms: string
  revenuePercent: number
  revenueAmount: number
  recognitionStatus: string
  importBatch: string
  notes: string
}

export interface ParsedHotQuotation {
  quotationNo: string
  product: string
  companyName: string
  contactName: string
  quotationAmount: number
  hotness: string
  lane: string
  stage: string
  salesOwner: string
  expectedClose: string
  lastActivity: string
  notes: string
}

export interface ParsedSalesOrder {
  orderNo: string
  quotationNo: string
  product: string
  companyName: string
  contactName: string
  orderAmount: number
  lane: string
  revenueType: string
  closeDate: string
  expectedGoLive: string
  contractMonths: number
  salesOwner: string
  paymentTerms: string
  notes: string
}

export interface RowError {
  row: number
  field: string
  message: string
}

export interface ParsedRow {
  rowIndex: number
  data: ParsedHotQuotation | ParsedSalesOrder
  errors: RowError[]
  warnings: RowError[]
}

export interface ParseResult {
  valid: ParsedRow[]
  invalid: ParsedRow[]
  all: ParsedRow[]
}

export interface ImportResult {
  created: number
  updated: number
  skipped: number
  errors: string[]
}