export interface PricingItem {
  id: string
  packageName: string
  product: 'Builk Insite' | 'Builk 360' | 'Kwanjai' | 'Bundle'
  type: 'Package' | 'Add-on' | 'Top-up' | 'Bundle' | 'Service' | 'Transformation Service' | 'Infrastructure'
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
  enterprisePriceMin: number | null
  enterprisePriceMax: number | null
  enterpriseAnchorPrice: number | null
  enterpriseBaseNote: string
  enterprisePremiumNote: string
  isInfrastructure: boolean
  showEnterpriseMatrix: boolean
  serviceCategory?: 'Standard Implementation' | 'Automation & AI' | 'Infrastructure' | null
  implementationMode?: 'Online' | 'Onsite' | 'N/A' | null
  isMandatoryImplementation: boolean
}
