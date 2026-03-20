export interface PricingItem {
  id: string
  packageName: string
  product: 'Builk Insite' | 'Builk 360' | 'Kwanjai' | 'Bundle'
  type: 'Package' | 'Add-on' | 'Top-up' | 'Bundle' | 'Service' | 'Infrastructure'
  price: number
  billing: string
  activeSlots: number
  keyInclusions: string[]
  targetProfile: string
  lane: 'Biz' | 'Corp' | 'Both' | ''
  notes: string
  visibility: 'Public' | 'Internal Only' | 'Hidden' | ''
  sortOrder: number
  effectiveDate: string | null
  applicablePackages: string[]  // from "Applicable Packages" multi_select
  quantityEnabled: boolean      // from "Quantity Enabled" checkbox
  quantityUnit: string          // from "Quantity Unit" text
  maxQuantity: number           // from "Max Quantity" number, 0 = no limit
}
