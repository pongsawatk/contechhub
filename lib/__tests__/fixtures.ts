import type { PricingItem } from '@/types/pricing'
import type { ProductSelection } from '@/types/calculator'

/** สร้าง PricingItem พร้อม default ครบทุก field — override เฉพาะที่ test สนใจ */
export function makeItem(overrides: Partial<PricingItem> = {}): PricingItem {
  return {
    id: overrides.id ?? `item-${Math.random().toString(36).slice(2, 8)}`,
    packageName: 'Test Package',
    product: 'Builk Insite',
    type: 'Package',
    price: 0,
    billing: 'Per Year',
    activeSlots: 0,
    keyInclusions: [],
    targetProfile: '',
    lane: 'Biz',
    notes: '',
    visibility: 'Public',
    sortOrder: 0,
    effectiveDate: null,
    applicablePackages: [],
    quantityEnabled: false,
    quantityUnit: '',
    maxQuantity: 0,
    enterprisePriceMin: null,
    enterprisePriceMax: null,
    enterpriseAnchorPrice: null,
    enterpriseBaseNote: '',
    enterprisePremiumNote: '',
    isInfrastructure: false,
    showEnterpriseMatrix: false,
    serviceCategory: null,
    implementationMode: null,
    isMandatoryImplementation: false,
    ...overrides,
  }
}

/** สร้าง ProductSelection พร้อม default — override เฉพาะที่ test สนใจ */
export function makeSelection(overrides: Partial<ProductSelection> = {}): ProductSelection {
  return {
    product: 'Builk Insite',
    packageId: 'pkg-1',
    packageName: 'Insite Professional',
    packagePrice: 0,
    packageBilling: 'Per Year',
    addonIds: [],
    addons: [],
    topups: [],
    ...overrides,
  }
}
