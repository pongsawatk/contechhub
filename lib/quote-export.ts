import type { CalculatorInput } from '@/types/calculator'
import type { PricingItem } from '@/types/pricing'
import type { PackageExportDetail } from '@/types/quote'

export function buildPackageExportDetails(
  input: CalculatorInput,
  pricingItems: PricingItem[]
): PackageExportDetail[] {
  return input.selections.map((selection) => {
    const packageItem = pricingItems.find((item) => item.id === selection.packageId)
    const isEnterprise =
      packageItem?.enterprisePriceMin !== null && packageItem?.enterprisePriceMin !== undefined

    const addons = selection.addons.map((addon) => {
      const addonItem = pricingItems.find((item) => item.id === addon.id)
      return {
        name: addon.name,
        description: addonItem?.keyInclusions.join(' • ') ?? '',
      }
    })

    const topups = selection.topups.map((topup) => {
      const topupItem = pricingItems.find((item) => item.id === topup.itemId)
      return {
        name: topup.itemName,
        description: topupItem?.keyInclusions.join(' • ') ?? '',
        quantity: topup.quantity,
        quantityUnit: topup.quantityUnit,
      }
    })

    return {
      product: selection.product,
      packageName: selection.packageName,
      targetProfile: packageItem?.targetProfile ?? '',
      keyInclusions: packageItem?.keyInclusions ?? [],
      notes: packageItem?.notes ?? '',
      isEnterprise,
      enterpriseTier: selection.enterpriseTier,
      enterpriseBaseNote: packageItem?.enterpriseBaseNote ?? '',
      enterprisePremiumNote: packageItem?.enterprisePremiumNote ?? '',
      addons,
      topups,
    }
  })
}
