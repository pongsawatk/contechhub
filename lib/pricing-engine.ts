import type {
  CalculatorInput,
  PriceBreakdown,
  LineItem,
  AppliedOffer,
  HintItem,
  ProductSelection,
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

function normalizePackageName(value: string): string {
  return value.toLowerCase().replace('insite ', '').replace('360 ', '').trim()
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

export function itemAppliesTo(item: PricingItem, packageName: string): boolean {
  if (!item.applicablePackages || item.applicablePackages.length === 0) return true
  if (item.applicablePackages.includes('All')) return true

  const normalizedPackageName = normalizePackageName(packageName)
  return item.applicablePackages.some((applicablePackage) => {
    const normalizedApplicableName = normalizePackageName(applicablePackage)
    return (
      normalizedPackageName.includes(normalizedApplicableName)
      || packageName.toLowerCase().includes(applicablePackage.toLowerCase())
    )
  })
}

function getApplicableMandatoryItems(
  allItems: PricingItem[],
  selection: ProductSelection
): PricingItem[] {
  return allItems.filter(
    (item) =>
      item.isMandatoryImplementation &&
      item.product === selection.product &&
      !item.packageName.startsWith('[DEPRECATED]') &&
      itemAppliesTo(item, selection.packageName)
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
  return `${formatTHB(price.base)} - ${formatTHB(price.premium)}`
}

export function calculate(input: CalculatorInput, allItems: PricingItem[] = []): PriceBreakdown {
  const lineItems: LineItem[] = []
  const appliedOffers: AppliedOffer[] = []
  const hints: HintItem[] = []
  const warnings: string[] = []

  let recurringSubtotal = 0
  let oneTimeTotal = 0
  let hasEnterpriseDeal = false

  for (const selection of input.selections) {
    const isEnterprise = isEnterprisePackage(selection)
    if (isEnterprise) hasEnterpriseDeal = true

    const packagePrice = getSelectionPackagePrice(selection)
    const basePackagePrice =
      isEnterprise && selection.enterpriseTier === 'premium' && packagePrice.premium !== undefined
        ? packagePrice.premium
        : packagePrice.base
    const packageQuantity =
      selection.packageBilling === 'Per Project'
        ? Math.max(1, selection.packageQuantity ?? 1)
        : 1
    const effectivePrice = basePackagePrice * packageQuantity

    lineItems.push({
      label:
        packageQuantity > 1
          ? `${selection.packageName} x ${packageQuantity} projects`
          : selection.packageName,
      sublabel: selection.product,
      price: effectivePrice,
      billing: selection.packageBilling,
    })
    recurringSubtotal += effectivePrice

    for (const addon of selection.addons) {
      lineItems.push({
        label: addon.name,
        sublabel: `Add-on - ${selection.product}`,
        price: addon.price,
        billing: addon.billing,
      })
      recurringSubtotal += addon.price
    }

    for (const topup of selection.topups ?? []) {
      if (topup.quantity <= 0) continue

      const unitLabel = topup.quantityUnit
        ? `${topup.quantity} ${topup.quantityUnit}`
        : `x${topup.quantity}`
      const topupPrice = topup.unitPrice * topup.quantity

      lineItems.push({
        label: `${topup.itemName} (${unitLabel})`,
        sublabel: `Top-up - ${selection.product}`,
        price: topupPrice,
        billing: topup.billing,
      })
      recurringSubtotal += topupPrice
    }

    const mandatoryItems = getApplicableMandatoryItems(allItems, selection)
    const mandatoryMode = selection.mandatoryMode ?? 'Online'
    const mandatoryItem =
      mandatoryItems.find((item) => item.implementationMode === mandatoryMode)
      ?? mandatoryItems.find((item) => item.implementationMode === 'Online')
      ?? mandatoryItems[0]

    if (!isEnterprise && mandatoryItem) {
      lineItems.push({
        label: `Implementation Fee - ${selection.product} (${mandatoryMode})`,
        sublabel: mandatoryItem.keyInclusions.join(' | ') || mandatoryItem.notes || undefined,
        price: mandatoryItem.price,
        billing: mandatoryItem.billing || 'One-time',
        isOneTime: true,
        isWaived: selection.mandatoryFeeWaived,
      })

      if (!selection.mandatoryFeeWaived) {
        oneTimeTotal += mandatoryItem.price
      }
    }
  }

  const hasInsitePro = input.selections.some(
    (selection) =>
      selection.product === 'Builk Insite' &&
      selection.packageName.toLowerCase().includes('professional') &&
      !isEnterprisePackage(selection)
  )
  const has360Pro = input.selections.some(
    (selection) =>
      selection.product === 'Builk 360' &&
      selection.packageName.toLowerCase().includes('professional') &&
      !isEnterprisePackage(selection)
  )

  let superComboDiscount = 0
  if (hasInsitePro && has360Pro) {
    superComboDiscount = recurringSubtotal * 0.1
    appliedOffers.push({
      name: 'Super Combo',
      description: 'Bundle Insite Professional with 360 Professional for 10% off recurring fees.',
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
    (selection) => selection.product === 'Builk Insite' && isEnterprisePackage(selection)
  )
  const has360Enterprise = input.selections.some(
    (selection) => selection.product === 'Builk 360' && isEnterprisePackage(selection)
  )
  if (hasInsiteEnterprise && has360Enterprise) {
    hints.push({
      message:
        'Enterprise Combo: sales can confirm either an extra 10% top-up discount or 2 man-days of implementation support.',
      actionType: 'add_combo',
      payload: { type: 'enterprise_combo' },
    })
  }

  const kickstarterDiscountSaving = input.twoYearPrepaid
    ? (recurringSubtotal - superComboDiscount) * 0.2
    : 0
  const kickstarterMandatorySaving = lineItems
    .filter((item) => item.isOneTime && item.isWaived)
    .reduce((sum, item) => sum + item.price, 0)

  if (input.twoYearPrepaid) {
    appliedOffers.push({
      name: 'Kickstarter Offer',
      description: '20% off 2-year prepaid plans, plus waived implementation fee and training benefits.',
      savings: kickstarterDiscountSaving + kickstarterMandatorySaving,
    })
    lineItems.push({
      label: 'Kickstarter Discount (20%)',
      sublabel: '2-year prepaid',
      price: -kickstarterDiscountSaving,
      billing: '',
      isDiscount: true,
    })
  }

  for (const selection of input.selections) {
    if (
      selection.product === 'Builk Insite' &&
      selection.packageName.toLowerCase().includes('business') &&
      selection.addons.length >= 4
    ) {
      const alaCarteTotal = selection.addons.reduce((sum, addon) => sum + addon.price, 0)
      if (alaCarteTotal > 45000) {
        hints.push({
          message: `Productivity Pack may be more cost-effective than ${formatTHB(alaCarteTotal)} THB of add-ons.`,
          action: 'Switch to Productivity Pack',
          actionType: 'upgrade_bundle',
          payload: { product: 'Builk Insite', bundleName: 'Productivity Pack' },
        })
      }
    }
  }

  const recurringAfterOffers = recurringSubtotal - superComboDiscount - kickstarterDiscountSaving
  let manualDiscount = 0
  let approvalRequired = hasEnterpriseDeal

  if (input.discountPercent > 0) {
    manualDiscount = recurringAfterOffers * (input.discountPercent / 100)
    if (input.discountPercent > 10) {
      approvalRequired = true
      warnings.push(
        `Discount ${input.discountPercent}% exceeds 10% and requires Head of BU approval.`
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

  const annualTotal = recurringAfterOffers - manualDiscount
  const firstYearTotal = annualTotal + oneTimeTotal

  return {
    lineItems,
    subtotal: recurringSubtotal,
    annualTotal,
    oneTimeTotal,
    firstYearTotal,
    discountAmount: superComboDiscount + kickstarterDiscountSaving + manualDiscount,
    discountReason: input.discountReason,
    total: annualTotal,
    billingCycle: oneTimeTotal > 0 ? 'mixed' : 'THB/year',
    approvalRequired,
    hasEnterpriseDeal,
    appliedOffers,
    warnings,
    hints,
    kickstarterDiscountSaving,
    kickstarterMandatorySaving,
    kickstarterTotalSaving: kickstarterDiscountSaving + kickstarterMandatorySaving,
  }
}
