import type {
  CalculatorInput,
  PriceBreakdown,
  LineItem,
  AppliedOffer,
  HintItem,
} from '@/types/calculator'
import type { PricingItem } from '@/types/pricing'

interface EnterpriseAware {
  enterprisePriceMin?: number | null
  enterprisePriceMax?: number | null
  enterpriseAnchorPrice?: number | null
}

interface SelectionPriceSource extends EnterpriseAware {
  packagePrice: number
}

export interface PackagePrice {
  base: number
  premium?: number
  anchor?: number
}

function formatTHB(n: number): string {
  return n.toLocaleString('th-TH')
}

function getSelectionPackagePrice(item: SelectionPriceSource): PackagePrice {
  if (item.enterprisePriceMin !== null && item.enterprisePriceMin !== undefined) {
    return {
      base: item.enterprisePriceMin,
      premium: item.enterprisePriceMax ?? undefined,
      anchor: item.enterpriseAnchorPrice ?? undefined,
    }
  }

  return { base: item.packagePrice }
}

/**
 * Returns true if the given PricingItem applies to the selected package name.
 * If applicablePackages is empty or contains 'All', it applies to everything.
 */
export function itemAppliesTo(item: PricingItem, packageName: string): boolean {
  if (!item.applicablePackages || item.applicablePackages.length === 0) return true
  if (item.applicablePackages.includes('All')) return true
  return item.applicablePackages.some(
    (ap) =>
      packageName.toLowerCase().includes(ap.toLowerCase().replace('insite ', '').replace('360 ', ''))
      || packageName.toLowerCase().includes(ap.toLowerCase())
  )
}

export function isEnterprisePackage(item: EnterpriseAware | null | undefined): boolean {
  return item?.enterprisePriceMin !== null && item?.enterprisePriceMin !== undefined
}

export function getPackagePrice(item: PricingItem): PackagePrice {
  if (item.enterprisePriceMin !== null && item.enterprisePriceMin !== undefined) {
    return {
      base: item.enterprisePriceMin,
      premium: item.enterprisePriceMax ?? undefined,
      anchor: item.enterpriseAnchorPrice ?? undefined,
    }
  }

  return { base: item.price }
}

export function getEnterprisePriceRange(item: PricingItem): string {
  const price = getPackagePrice(item)
  if (price.premium === undefined) return ''
  return `${formatTHB(price.base)} – ${formatTHB(price.premium)}`
}

export function calculate(input: CalculatorInput): PriceBreakdown {
  const lineItems: LineItem[] = []
  const appliedOffers: AppliedOffer[] = []
  const hints: HintItem[] = []
  const warnings: string[] = []

  let baseTotal = 0
  let addonTotal = 0
  let hasEnterpriseDeal = false

  for (const sel of input.selections) {
    const isEnterprise = isEnterprisePackage(sel)
    if (isEnterprise) hasEnterpriseDeal = true

    const packagePrice = getSelectionPackagePrice(sel)
    const effectivePrice = isEnterprise && sel.enterpriseTier === 'premium' && packagePrice.premium !== undefined
      ? packagePrice.premium
      : packagePrice.base

    lineItems.push({
      label: sel.packageName,
      sublabel: sel.product,
      price: effectivePrice,
      billing: sel.packageBilling,
    })
    baseTotal += effectivePrice

    for (const addon of sel.addons) {
      lineItems.push({
        label: addon.name,
        sublabel: `Add-on – ${sel.product}`,
        price: addon.price,
        billing: addon.billing,
      })
      addonTotal += addon.price
    }

    for (const topup of (sel.topups ?? [])) {
      if (topup.quantity > 0) {
        const unitLabel = topup.quantityUnit
          ? `${topup.quantity} ${topup.quantityUnit}`
          : `x${topup.quantity}`
        lineItems.push({
          label: `${topup.itemName} (${unitLabel})`,
          sublabel: `Top-up – ${sel.product}`,
          price: topup.unitPrice * topup.quantity,
          billing: topup.billing,
        })
        addonTotal += topup.unitPrice * topup.quantity
      }
    }
  }

  const hasInsitePro = input.selections.some(
    (s) =>
      s.product === 'Builk Insite' &&
      s.packageName.toLowerCase().includes('professional') &&
      !isEnterprisePackage(s)
  )
  const has360Pro = input.selections.some(
    (s) =>
      s.product === 'Builk 360' &&
      s.packageName.toLowerCase().includes('professional') &&
      !isEnterprisePackage(s)
  )
  let superComboDiscount = 0
  if (hasInsitePro && has360Pro) {
    superComboDiscount = (baseTotal + addonTotal) * 0.1
    appliedOffers.push({
      name: 'Super Combo',
      description: 'ซื้อ Insite Pro + 360 Pro พร้อมกัน ลด 10%',
      savings: superComboDiscount,
    })
    lineItems.push({
      label: 'Super Combo Discount (10%)',
      price: -superComboDiscount,
      billing: '',
      isDiscount: true,
    })
  }

  const hasInsiteEnterprise = input.selections.some(
    (s) => s.product === 'Builk Insite' && isEnterprisePackage(s)
  )
  const has360Enterprise = input.selections.some(
    (s) => s.product === 'Builk 360' && isEnterprisePackage(s)
  )
  if (hasInsiteEnterprise && has360Enterprise) {
    hints.push({
      message: 'Enterprise Combo: ลด 10% on Top หรือแถม Implementation 2 Man-days — เลือก 1 (แจ้ง Sales เพื่อยืนยัน)',
      actionType: 'add_combo',
      payload: { type: 'enterprise_combo' },
    })
  }

  if (input.twoYearPrepaid) {
    appliedOffers.push({
      name: 'Kickstarter Offer',
      description: 'สัญญา 2 ปี — แถมฟรี Implementation & Training',
      savings: 0,
    })
    lineItems.push({
      label: 'Implementation & Training (Kickstarter)',
      sublabel: 'มูลค่า ~30,000–50,000 บาท',
      price: 0,
      billing: '',
      isFree: true,
    })
  }

  for (const sel of input.selections) {
    if (
      sel.product === 'Builk Insite' &&
      sel.packageName.toLowerCase().includes('business') &&
      sel.addons.length >= 4
    ) {
      const alaCarteTotal = sel.addons.reduce((sum, addon) => sum + addon.price, 0)
      if (alaCarteTotal > 45000) {
        hints.push({
          message: `ซื้อ Productivity Pack (45,000 บ./ปี) คุ้มกว่า ${alaCarteTotal.toLocaleString('th-TH')} บ. ประหยัด ${(alaCarteTotal - 45000).toLocaleString('th-TH')} บาท`,
          action: 'เปลี่ยนเป็น Productivity Pack',
          actionType: 'upgrade_bundle',
          payload: { product: 'Builk Insite', bundleName: 'Productivity Pack' },
        })
      }
    }
  }

  const subtotal = baseTotal + addonTotal - superComboDiscount
  let manualDiscount = 0
  let approvalRequired = hasEnterpriseDeal

  if (input.discountPercent > 0) {
    manualDiscount = subtotal * (input.discountPercent / 100)
    if (input.discountPercent > 10) {
      approvalRequired = true
      warnings.push(
        `Discount ${input.discountPercent}% เกิน 10% — ต้องการ Approval จาก Head of BU`
      )
    }
    lineItems.push({
      label: `Manual Discount (${input.discountPercent}%)`,
      sublabel: input.discountReason || '',
      price: -manualDiscount,
      billing: '',
      isDiscount: true,
    })
  }

  const total = subtotal - manualDiscount

  return {
    lineItems,
    subtotal: baseTotal + addonTotal,
    discountAmount: superComboDiscount + manualDiscount,
    discountReason: input.discountReason,
    total,
    billingCycle: 'บาท/ปี',
    approvalRequired,
    hasEnterpriseDeal,
    appliedOffers,
    warnings,
    hints,
  }
}
