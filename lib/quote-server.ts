import { calculate, itemAppliesTo } from '@/lib/pricing-engine'
import type {
  AddonItem,
  CalculatorInput,
  LaneType,
  PriceBreakdown,
  ProductSelection,
  ServiceSelection,
  TopupSelection,
  TransformationQuote,
} from '@/types/calculator'
import type { PricingItem } from '@/types/pricing'

/** Error ที่เกิดจาก payload ฝั่ง client ไม่ถูกต้อง — route ตอบ 400 */
export class QuoteValidationError extends Error {}

const PRODUCTS: ProductSelection['product'][] = ['Builk Insite', 'Builk 360', 'Kwanjai']
const LANES: LaneType[] = ['Biz', 'Corp']
const ENGAGEMENT_MODELS: TransformationQuote['engagementModel'][] = ['quick-win', 'project', 'program', '']

function asString(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function asPositiveInt(value: unknown, fallback: number, max: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) : fallback
  return Math.min(Math.max(n, 1), max)
}

function requireItem(items: PricingItem[], id: unknown, context: string): PricingItem {
  if (typeof id !== 'string' || !id) {
    throw new QuoteValidationError(`${context}: missing pricing item id`)
  }
  const item = items.find((candidate) => candidate.id === id)
  if (!item) {
    throw new QuoteValidationError(`${context}: pricing item ${id} not found in Pricing DB`)
  }
  return item
}

function sanitizeSelection(
  raw: Record<string, unknown>,
  items: PricingItem[],
  twoYearPrepaid: boolean
): ProductSelection {
  const packageItem = requireItem(items, raw.packageId, 'Package')
  if (packageItem.type !== 'Package') {
    throw new QuoteValidationError(`Package: ${packageItem.packageName} is not a Package item`)
  }
  const product = packageItem.product
  if (!PRODUCTS.includes(product as ProductSelection['product'])) {
    throw new QuoteValidationError(`Package: unsupported product ${product}`)
  }

  const addonIds = Array.isArray(raw.addonIds) ? raw.addonIds : []
  const addons: AddonItem[] = [...new Set(addonIds)].map((id) => {
    const item = requireItem(items, id, 'Add-on')
    if (item.type !== 'Add-on') {
      throw new QuoteValidationError(`Add-on: ${item.packageName} is not an Add-on item`)
    }
    if (item.product !== product || !itemAppliesTo(item, packageItem.packageName)) {
      throw new QuoteValidationError(
        `Add-on: ${item.packageName} does not apply to ${packageItem.packageName}`
      )
    }
    return { id: item.id, name: item.packageName, price: item.price, billing: item.billing }
  })

  const rawTopups = Array.isArray(raw.topups) ? raw.topups : []
  const topups: TopupSelection[] = rawTopups
    .map((entry): TopupSelection | null => {
      const data = entry as Record<string, unknown>
      const item = requireItem(items, data.itemId, 'Top-up')
      if (item.type !== 'Top-up') {
        throw new QuoteValidationError(`Top-up: ${item.packageName} is not a Top-up item`)
      }
      if (item.product !== product || !itemAppliesTo(item, packageItem.packageName)) {
        throw new QuoteValidationError(
          `Top-up: ${item.packageName} does not apply to ${packageItem.packageName}`
        )
      }
      const maxQuantity = item.maxQuantity > 0 ? item.maxQuantity : 999
      const rawQuantity = typeof data.quantity === 'number' ? Math.floor(data.quantity) : 0
      const quantity = Math.min(Math.max(rawQuantity, 0), maxQuantity)
      if (quantity <= 0) return null
      return {
        itemId: item.id,
        itemName: item.packageName,
        quantity,
        unitPrice: item.price,
        billing: item.billing,
        quantityUnit: item.quantityUnit,
      }
    })
    .filter((topup): topup is TopupSelection => topup !== null)

  const enterpriseTier = raw.enterpriseTier === 'premium' ? 'premium' : 'base'
  const mandatoryMode = raw.mandatoryMode === 'Onsite' ? 'Onsite' : 'Online'

  return {
    product: product as ProductSelection['product'],
    packageId: packageItem.id,
    packageName: packageItem.packageName,
    packagePrice: packageItem.price,
    packageBilling: packageItem.billing,
    packageQuantity:
      packageItem.billing === 'Per Project' ? asPositiveInt(raw.packageQuantity, 1, 999) : 1,
    addonIds: addons.map((addon) => addon.id),
    addons,
    topups,
    enterpriseTier,
    enterprisePriceMin: packageItem.enterprisePriceMin,
    enterprisePriceMax: packageItem.enterprisePriceMax,
    enterpriseAnchorPrice: packageItem.enterpriseAnchorPrice,
    mandatoryMode,
    // Kickstarter (2-year prepaid) เป็นเงื่อนไขเดียวที่ waive implementation fee ได้
    mandatoryFeeWaived: twoYearPrepaid && raw.mandatoryFeeWaived === true,
  }
}

function sanitizeTransformationQuote(
  raw: Record<string, unknown> | undefined,
  items: PricingItem[]
): TransformationQuote | undefined {
  if (!raw || !Array.isArray(raw.services) || raw.services.length === 0) return undefined

  const services: ServiceSelection[] = raw.services.map((entry): ServiceSelection => {
    const data = entry as Record<string, unknown>
    const item = requireItem(items, data.itemId, 'Service')
    const isService =
      item.type === 'Service' || item.type === 'Transformation Service' || item.isInfrastructure
    if (!isService) {
      throw new QuoteValidationError(`Service: ${item.packageName} is not a service item`)
    }
    // quantity > 1 ใช้ได้เฉพาะ Man-day (lump sum / infrastructure = 1 เสมอ)
    const quantity = item.billing === 'Man-day' ? asPositiveInt(data.quantity, 1, 999) : 1
    return {
      itemId: item.id,
      itemName: item.packageName,
      quantity,
      unitPrice: item.price,
      billing: item.billing,
      taskNote: asString(data.taskNote, 500),
    }
  })

  const engagementModel = ENGAGEMENT_MODELS.includes(
    raw.engagementModel as TransformationQuote['engagementModel']
  )
    ? (raw.engagementModel as TransformationQuote['engagementModel'])
    : ''

  return {
    projectName: asString(raw.projectName, 200),
    engagementModel,
    services,
  }
}

/**
 * ตรวจสอบ payload จาก client แล้วสร้าง CalculatorInput ใหม่โดยอ่านราคาทุกตัว
 * จาก Pricing DB (ไม่ trust ราคาที่ client ส่งมา) — G-01
 */
export function sanitizeCalculatorInput(raw: unknown, items: PricingItem[]): CalculatorInput {
  if (!raw || typeof raw !== 'object') {
    throw new QuoteValidationError('Invalid quote payload')
  }
  const data = raw as Record<string, unknown>

  const customerName = asString(data.customerName, 200)
  if (!customerName) {
    throw new QuoteValidationError('Customer name is required')
  }
  if (!LANES.includes(data.lane as LaneType)) {
    throw new QuoteValidationError('Lane must be Biz or Corp')
  }

  const twoYearPrepaid = data.twoYearPrepaid === true
  const rawSelections = Array.isArray(data.selections) ? data.selections : []
  const selections = rawSelections.map((selection) =>
    sanitizeSelection(selection as Record<string, unknown>, items, twoYearPrepaid)
  )
  const transformationQuote = sanitizeTransformationQuote(
    data.transformationQuote as Record<string, unknown> | undefined,
    items
  )

  if (selections.length === 0 && !transformationQuote) {
    throw new QuoteValidationError('Quote must contain at least one package or service')
  }

  const rawDiscount =
    typeof data.discountPercent === 'number' && Number.isFinite(data.discountPercent)
      ? data.discountPercent
      : 0
  const discountPercent = Math.min(Math.max(rawDiscount, 0), 100)

  return {
    customerName,
    lane: data.lane as LaneType,
    selections,
    discountPercent,
    discountReason: asString(data.discountReason, 500),
    twoYearPrepaid,
    transformationQuote,
  }
}

/** Sanitize input แล้วคำนวณ breakdown ฝั่ง server ด้วย pricing engine ตัวเดียวกับ client */
export function buildServerQuote(
  rawInput: unknown,
  items: PricingItem[]
): { input: CalculatorInput; breakdown: PriceBreakdown } {
  const input = sanitizeCalculatorInput(rawInput, items)
  return { input, breakdown: calculate(input, items) }
}
