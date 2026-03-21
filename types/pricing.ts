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
  applicablePackages: string[]
  quantityEnabled: boolean
  quantityUnit: string
  maxQuantity: number
  enterprisePriceMin: number | null
  enterprisePriceMax: number | null
  enterpriseAnchorPrice: number | null
  enterpriseBaseNote: string
  enterprisePremiumNote: string
  isInfrastructure: boolean
  showEnterpriseMatrix: boolean
  serviceCategory?: string | null
  implementationMode?: string | null
  isMandatoryImplementation: boolean
}
