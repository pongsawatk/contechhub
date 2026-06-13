import { describe, it, expect } from 'vitest'
import {
  calculate,
  itemAppliesTo,
  isEnterprisePackage,
  getPackagePrice,
  getEnterprisePriceRange,
} from '@/lib/pricing-engine'
import type { CalculatorInput } from '@/types/calculator'
import { makeItem, makeSelection } from './fixtures'

function baseInput(overrides: Partial<CalculatorInput> = {}): CalculatorInput {
  return {
    customerName: 'ACME',
    lane: 'Biz',
    selections: [],
    discountPercent: 0,
    discountReason: '',
    twoYearPrepaid: false,
    ...overrides,
  }
}

describe('itemAppliesTo', () => {
  it('applies when no restriction list', () => {
    expect(itemAppliesTo(makeItem({ applicablePackages: [] }), 'Insite Professional')).toBe(true)
  })

  it('applies when list contains "All"', () => {
    expect(itemAppliesTo(makeItem({ applicablePackages: ['All'] }), 'Anything')).toBe(true)
  })

  it('matches by normalized package name', () => {
    const item = makeItem({ applicablePackages: ['Professional'] })
    expect(itemAppliesTo(item, 'Insite Professional')).toBe(true)
    expect(itemAppliesTo(item, 'Insite Business')).toBe(false)
  })
})

describe('isEnterprisePackage', () => {
  it('is true when enterprisePriceMin is set', () => {
    expect(isEnterprisePackage({ enterprisePriceMin: 100000 })).toBe(true)
  })
  it('is false when enterprisePriceMin is null/undefined', () => {
    expect(isEnterprisePackage({ enterprisePriceMin: null })).toBe(false)
    expect(isEnterprisePackage(null)).toBe(false)
  })
})

describe('getPackagePrice / getEnterprisePriceRange', () => {
  it('returns flat base price for normal item', () => {
    expect(getPackagePrice(makeItem({ price: 50000 }))).toEqual({ base: 50000 })
  })
  it('returns enterprise range when min/max set', () => {
    const item = makeItem({ enterprisePriceMin: 100000, enterprisePriceMax: 300000 })
    expect(getPackagePrice(item)).toMatchObject({ base: 100000, premium: 300000 })
    expect(getEnterprisePriceRange(item)).toBe('100,000 - 300,000')
  })
  it('returns empty range when no premium', () => {
    expect(getEnterprisePriceRange(makeItem({ price: 50000 }))).toBe('')
  })
})

describe('calculate — package + addons + topups', () => {
  it('sums package price into recurring totals', () => {
    const input = baseInput({
      selections: [makeSelection({ packagePrice: 50000 })],
    })
    const r = calculate(input)
    expect(r.subtotal).toBe(50000)
    expect(r.annualTotal).toBe(50000)
    expect(r.total).toBe(50000)
    expect(r.oneTimeTotal).toBe(0)
    expect(r.firstYearTotal).toBe(50000)
    expect(r.billingCycle).toBe('THB/year')
  })

  it('adds add-on prices to recurring', () => {
    const input = baseInput({
      selections: [
        makeSelection({
          packagePrice: 50000,
          addons: [{ id: 'a1', name: 'Add-on A', price: 12000, billing: 'Per Year' }],
        }),
      ],
    })
    expect(calculate(input).subtotal).toBe(62000)
  })

  it('multiplies top-up unit price by quantity and skips zero-qty', () => {
    const input = baseInput({
      selections: [
        makeSelection({
          packagePrice: 50000,
          topups: [
            { itemId: 't1', itemName: 'Seats', quantity: 3, unitPrice: 1000, billing: 'Per Year', quantityUnit: 'seat' },
            { itemId: 't2', itemName: 'Empty', quantity: 0, unitPrice: 9999, billing: 'Per Year', quantityUnit: 'seat' },
          ],
        }),
      ],
    })
    const r = calculate(input)
    expect(r.subtotal).toBe(53000)
    expect(r.lineItems.some((li) => li.label.includes('Empty'))).toBe(false)
  })

  it('multiplies package price by quantity for Per Project billing', () => {
    const input = baseInput({
      selections: [
        makeSelection({ packagePrice: 20000, packageBilling: 'Per Project', packageQuantity: 3 }),
      ],
    })
    expect(calculate(input).subtotal).toBe(60000)
  })
})

describe('calculate — mandatory implementation fee', () => {
  const mandatoryOnline = makeItem({
    id: 'm-online',
    isMandatoryImplementation: true,
    product: 'Builk Insite',
    implementationMode: 'Online',
    price: 15000,
    billing: 'One-time',
  })
  const mandatoryOnsite = makeItem({
    id: 'm-onsite',
    isMandatoryImplementation: true,
    product: 'Builk Insite',
    implementationMode: 'Onsite',
    price: 30000,
    billing: 'One-time',
  })

  it('adds the fee matching the selected mode into oneTimeTotal', () => {
    const input = baseInput({
      selections: [makeSelection({ packagePrice: 50000, mandatoryMode: 'Onsite' })],
    })
    const r = calculate(input, [mandatoryOnline, mandatoryOnsite])
    expect(r.oneTimeTotal).toBe(30000)
    expect(r.firstYearTotal).toBe(80000)
    expect(r.billingCycle).toBe('mixed')
  })

  it('falls back to Online mode when requested mode missing', () => {
    const input = baseInput({
      selections: [makeSelection({ packagePrice: 50000, mandatoryMode: 'Onsite' })],
    })
    expect(calculate(input, [mandatoryOnline]).oneTimeTotal).toBe(15000)
  })

  it('does not charge fee when waived', () => {
    const input = baseInput({
      selections: [makeSelection({ packagePrice: 50000, mandatoryMode: 'Online', mandatoryFeeWaived: true })],
    })
    const r = calculate(input, [mandatoryOnline])
    expect(r.oneTimeTotal).toBe(0)
    expect(r.lineItems.find((li) => li.isOneTime)?.isWaived).toBe(true)
  })

  it('skips mandatory fee for enterprise packages', () => {
    const input = baseInput({
      selections: [
        makeSelection({ enterprisePriceMin: 200000, enterpriseTier: 'base' }),
      ],
    })
    const r = calculate(input, [mandatoryOnline])
    expect(r.oneTimeTotal).toBe(0)
    expect(r.hasEnterpriseDeal).toBe(true)
  })
})

describe('calculate — enterprise tier pricing', () => {
  it('uses base price for base tier', () => {
    const input = baseInput({
      selections: [makeSelection({ enterprisePriceMin: 200000, enterprisePriceMax: 500000, enterpriseTier: 'base' })],
    })
    expect(calculate(input).subtotal).toBe(200000)
  })
  it('uses premium price for premium tier', () => {
    const input = baseInput({
      selections: [makeSelection({ enterprisePriceMin: 200000, enterprisePriceMax: 500000, enterpriseTier: 'premium' })],
    })
    expect(calculate(input).subtotal).toBe(500000)
  })
})

describe('calculate — offers', () => {
  it('applies 10% Super Combo when Insite Pro + 360 Pro present', () => {
    const input = baseInput({
      selections: [
        makeSelection({ product: 'Builk Insite', packageName: 'Insite Professional', packagePrice: 100000 }),
        makeSelection({ product: 'Builk 360', packageName: '360 Professional', packagePrice: 100000 }),
      ],
    })
    const r = calculate(input)
    expect(r.subtotal).toBe(200000)
    const combo = r.appliedOffers.find((o) => o.name === 'Super Combo')
    expect(combo?.savings).toBe(20000)
    expect(r.annualTotal).toBe(180000)
  })

  it('applies 20% Kickstarter discount on 2-year prepaid', () => {
    const input = baseInput({
      twoYearPrepaid: true,
      selections: [makeSelection({ packagePrice: 100000 })],
    })
    const r = calculate(input)
    expect(r.kickstarterDiscountSaving).toBe(20000)
    expect(r.annualTotal).toBe(80000)
    expect(r.kickstarter?.twoYearTotal).toBe(160000)
    expect(r.kickstarter?.effectiveAnnualRate).toBe(80000)
  })

  it('counts waived mandatory fee as kickstarter saving', () => {
    const mandatory = makeItem({
      id: 'm',
      isMandatoryImplementation: true,
      product: 'Builk Insite',
      implementationMode: 'Online',
      price: 15000,
    })
    const input = baseInput({
      twoYearPrepaid: true,
      selections: [makeSelection({ packagePrice: 100000, mandatoryFeeWaived: true })],
    })
    const r = calculate(input, [mandatory])
    expect(r.kickstarterMandatorySaving).toBe(15000)
    expect(r.kickstarterTotalSaving).toBe(35000)
  })
})

describe('calculate — manual discount + approval', () => {
  it('applies discount under threshold without approval', () => {
    const input = baseInput({
      discountPercent: 10,
      selections: [makeSelection({ packagePrice: 100000 })],
    })
    const r = calculate(input)
    expect(r.annualTotal).toBe(90000)
    expect(r.approvalRequired).toBe(false)
    expect(r.warnings).toHaveLength(0)
  })

  it('flags approval and warning when discount exceeds 10%', () => {
    const input = baseInput({
      discountPercent: 20,
      selections: [makeSelection({ packagePrice: 100000 })],
    })
    const r = calculate(input)
    expect(r.annualTotal).toBe(80000)
    expect(r.approvalRequired).toBe(true)
    expect(r.warnings[0]).toContain('exceeds 10%')
  })
})

describe('calculate — transformation services', () => {
  it('adds one-time and per-year services as line items', () => {
    const input = baseInput({
      transformationQuote: {
        projectName: 'Digital Rollout',
        engagementModel: 'project',
        services: [
          { itemId: 's1', itemName: 'Workshop', quantity: 2, unitPrice: 20000, billing: 'Man-day', taskNote: '' },
          { itemId: 's2', itemName: 'Support', quantity: 1, unitPrice: 50000, billing: 'Per Year', taskNote: '' },
        ],
      },
    })
    const r = calculate(input)
    expect(r.projectName).toBe('Digital Rollout')
    expect(r.engagementModel).toBe('project')
    expect(r.lineItems.find((li) => li.label.includes('Workshop'))?.price).toBe(40000)
  })

  it('requires approval when transformation total exceeds 100,000 THB', () => {
    const input = baseInput({
      transformationQuote: {
        projectName: '',
        engagementModel: '',
        services: [
          { itemId: 's1', itemName: 'Big', quantity: 1, unitPrice: 150000, billing: 'Lump Sum', taskNote: '' },
        ],
      },
    })
    const r = calculate(input)
    expect(r.approvalRequired).toBe(true)
    expect(r.warnings.some((w) => w.includes('100,000'))).toBe(true)
  })
})
