export type LaneType = 'Biz' | 'Corp'

export interface TopupSelection {
  itemId: string
  itemName: string
  quantity: number        // 1+ for quantity-enabled, always 1 for checkbox
  unitPrice: number
  billing: string
  quantityUnit: string
}

export interface ProductSelection {
  product: 'Builk Insite' | 'Builk 360' | 'Kwanjai'
  packageId: string        // Notion page ID of selected package
  packageName: string
  packagePrice: number
  packageBilling: string
  addonIds: string[]       // Notion page IDs of selected add-ons
  addons: AddonItem[]
  topups: TopupSelection[]  // quantity-based or checkbox top-up items
}

export interface AddonItem {
  id: string
  name: string
  price: number
  billing: string
}

export interface CalculatorInput {
  customerName: string
  lane: LaneType
  selections: ProductSelection[]
  discountPercent: number      // manual discount 0–100
  discountReason: string
  twoYearPrepaid: boolean      // Kickstarter Offer
}

export interface LineItem {
  label: string
  sublabel?: string
  price: number
  billing: string
  isDiscount?: boolean
  isFree?: boolean
  isIncluded?: boolean
}

export interface AppliedOffer {
  name: string
  description: string
  savings: number
}

export interface HintItem {
  message: string
  action?: string            // label for CTA button
  actionType?: 'upgrade_bundle' | 'add_combo'
  payload?: Record<string, unknown>
}

export interface PriceBreakdown {
  lineItems: LineItem[]
  subtotal: number
  discountAmount: number
  discountReason: string
  total: number
  billingCycle: string       // "บาท/ปี" or mixed
  approvalRequired: boolean  // discount > 10%
  appliedOffers: AppliedOffer[]
  warnings: string[]
  hints: HintItem[]
}
