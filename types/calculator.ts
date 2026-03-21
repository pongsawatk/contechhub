export type LaneType = 'Biz' | 'Corp'

export interface TopupSelection {
  itemId: string
  itemName: string
  quantity: number
  unitPrice: number
  billing: string
  quantityUnit: string
}

export interface ProductSelection {
  product: 'Builk Insite' | 'Builk 360' | 'Kwanjai'
  packageId: string
  packageName: string
  packagePrice: number
  packageBilling: string
  packageQuantity?: number
  addonIds: string[]
  addons: AddonItem[]
  topups: TopupSelection[]
  enterpriseTier?: 'base' | 'premium'
  enterprisePriceMin?: number | null
  enterprisePriceMax?: number | null
  enterpriseAnchorPrice?: number | null
  mandatoryMode?: 'Online' | 'Onsite'
  mandatoryFeeWaived?: boolean
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
  discountPercent: number
  discountReason: string
  twoYearPrepaid: boolean
}

export interface LineItem {
  label: string
  sublabel?: string
  price: number
  billing: string
  isDiscount?: boolean
  isFree?: boolean
  isIncluded?: boolean
  isOneTime?: boolean
  isWaived?: boolean
}

export interface AppliedOffer {
  name: string
  description: string
  savings: number
}

export interface HintItem {
  message: string
  action?: string
  actionType?: 'upgrade_bundle' | 'add_combo'
  payload?: Record<string, unknown>
}

export interface PriceBreakdown {
  lineItems: LineItem[]
  subtotal: number
  annualTotal: number
  oneTimeTotal: number
  firstYearTotal: number
  discountAmount: number
  discountReason: string
  total: number
  billingCycle: string
  approvalRequired: boolean
  hasEnterpriseDeal: boolean
  appliedOffers: AppliedOffer[]
  warnings: string[]
  hints: HintItem[]
  kickstarterDiscountSaving: number
  kickstarterMandatorySaving: number
  kickstarterTotalSaving: number
}
