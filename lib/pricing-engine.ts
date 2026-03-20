import type {
  CalculatorInput,
  PriceBreakdown,
  LineItem,
  AppliedOffer,
  HintItem,
} from '@/types/calculator'
import type { PricingItem } from '@/types/pricing'

/**
 * Returns true if the given PricingItem applies to the selected package name.
 * If applicablePackages is empty or contains 'All', it applies to everything.
 */
export function itemAppliesTo(item: PricingItem, packageName: string): boolean {
  if (!item.applicablePackages || item.applicablePackages.length === 0) return true
  if (item.applicablePackages.includes('All')) return true
  // Normalize: "Insite Professional" matches "Professional" in packageName
  return item.applicablePackages.some(
    (ap) =>
      packageName.toLowerCase().includes(ap.toLowerCase().replace('insite ', '').replace('360 ', ''))
      || packageName.toLowerCase().includes(ap.toLowerCase())
  )
}

export function calculate(input: CalculatorInput): PriceBreakdown {
  const lineItems: LineItem[] = []
  const appliedOffers: AppliedOffer[] = []
  const hints: HintItem[] = []
  const warnings: string[] = []

  let baseTotal = 0
  let addonTotal = 0

  // --- Step 1: Add package line items ---
  for (const sel of input.selections) {
    lineItems.push({
      label: sel.packageName,
      sublabel: sel.product,
      price: sel.packagePrice,
      billing: sel.packageBilling,
    })
    baseTotal += sel.packagePrice

    // Add-on items
    for (const addon of sel.addons) {
      lineItems.push({
        label: addon.name,
        sublabel: `Add-on — ${sel.product}`,
        price: addon.price,
        billing: addon.billing,
      })
      addonTotal += addon.price
    }

    // --- Top-ups ---
    for (const topup of (sel.topups ?? [])) {
      if (topup.quantity > 0) {
        const unitLabel = topup.quantityUnit
          ? `${topup.quantity} ${topup.quantityUnit}`
          : `×${topup.quantity}`
        lineItems.push({
          label: `${topup.itemName} (${unitLabel})`,
          sublabel: `Top-up — ${sel.product}`,
          price: topup.unitPrice * topup.quantity,
          billing: topup.billing,
        })
        addonTotal += topup.unitPrice * topup.quantity
      }
    }
  }

  // --- Step 2: Business Rules ---

  // Rule A: Super Combo
  // Triggers when: Insite Professional + 360 Professional both selected
  const hasInsitePro = input.selections.some(
    (s) =>
      s.product === 'Builk Insite' &&
      s.packageName.toLowerCase().includes('professional')
  )
  const has360Pro = input.selections.some(
    (s) =>
      s.product === 'Builk 360' &&
      s.packageName.toLowerCase().includes('professional')
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

  // Rule B: Kickstarter Offer (2-year prepaid)
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

  // Rule C: Productivity Pack hint
  // When Business package selected + A La Carte add-ons >= 4
  for (const sel of input.selections) {
    if (
      sel.product === 'Builk Insite' &&
      sel.packageName.toLowerCase().includes('business') &&
      sel.addons.length >= 4
    ) {
      const alaCarteTotal = sel.addons.reduce((s, a) => s + a.price, 0)
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

  // Rule D: Manual discount
  const subtotal = baseTotal + addonTotal - superComboDiscount
  let manualDiscount = 0
  let approvalRequired = false

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
    appliedOffers,
    warnings,
    hints,
  }
}
