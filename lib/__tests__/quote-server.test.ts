import { describe, it, expect } from 'vitest'
import {
  sanitizeCalculatorInput,
  buildServerQuote,
  QuoteValidationError,
} from '@/lib/quote-server'
import type { PricingItem } from '@/types/pricing'
import { makeItem } from './fixtures'

const pkg = makeItem({
  id: 'pkg-pro',
  product: 'Builk Insite',
  type: 'Package',
  packageName: 'Insite Professional',
  price: 80000,
  billing: 'Per Year',
})
const addon = makeItem({
  id: 'addon-1',
  product: 'Builk Insite',
  type: 'Add-on',
  packageName: 'Extra Reports',
  price: 12000,
  applicablePackages: ['All'],
})
const topup = makeItem({
  id: 'topup-1',
  product: 'Builk Insite',
  type: 'Top-up',
  packageName: 'Extra Seats',
  price: 1000,
  applicablePackages: ['All'],
  maxQuantity: 5,
  quantityUnit: 'seat',
})
const service = makeItem({
  id: 'svc-1',
  type: 'Service',
  packageName: 'Onsite Workshop',
  price: 20000,
  billing: 'Man-day',
})

const ITEMS: PricingItem[] = [pkg, addon, topup, service]

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    customerName: 'ACME Co',
    lane: 'Biz',
    selections: [{ packageId: 'pkg-pro' }],
    ...overrides,
  }
}

describe('sanitizeCalculatorInput — top-level validation', () => {
  it('rejects non-object payload', () => {
    expect(() => sanitizeCalculatorInput(null, ITEMS)).toThrow(QuoteValidationError)
  })

  it('requires a customer name', () => {
    expect(() => sanitizeCalculatorInput(validPayload({ customerName: '  ' }), ITEMS)).toThrow(
      /Customer name/
    )
  })

  it('requires a valid lane', () => {
    expect(() => sanitizeCalculatorInput(validPayload({ lane: 'Other' }), ITEMS)).toThrow(/Lane/)
  })

  it('requires at least one package or service', () => {
    expect(() => sanitizeCalculatorInput(validPayload({ selections: [] }), ITEMS)).toThrow(
      /at least one/
    )
  })

  it('clamps discountPercent into 0..100', () => {
    expect(sanitizeCalculatorInput(validPayload({ discountPercent: 250 }), ITEMS).discountPercent).toBe(100)
    expect(sanitizeCalculatorInput(validPayload({ discountPercent: -5 }), ITEMS).discountPercent).toBe(0)
  })
})

describe('requireItem — pricing DB lookups', () => {
  it('rejects a missing package id', () => {
    expect(() => sanitizeCalculatorInput(validPayload({ selections: [{}] }), ITEMS)).toThrow(
      /missing pricing item id/
    )
  })

  it('rejects an unknown package id', () => {
    expect(() =>
      sanitizeCalculatorInput(validPayload({ selections: [{ packageId: 'nope' }] }), ITEMS)
    ).toThrow(/not found in Pricing DB/)
  })

  it('rejects when the referenced item is not a Package', () => {
    expect(() =>
      sanitizeCalculatorInput(validPayload({ selections: [{ packageId: 'addon-1' }] }), ITEMS)
    ).toThrow(/not a Package/)
  })
})

describe('G-01 — prices always come from the Pricing DB', () => {
  it('ignores any client-sent price and uses the DB price', () => {
    const input = sanitizeCalculatorInput(
      validPayload({
        selections: [{ packageId: 'pkg-pro', packagePrice: 1, addons: [{ price: 1 }] }],
      }),
      ITEMS
    )
    expect(input.selections[0].packagePrice).toBe(80000)
  })

  it('resolves add-on price and metadata from the DB', () => {
    const input = sanitizeCalculatorInput(
      validPayload({ selections: [{ packageId: 'pkg-pro', addonIds: ['addon-1'] }] }),
      ITEMS
    )
    expect(input.selections[0].addons).toHaveLength(1)
    expect(input.selections[0].addons[0]).toMatchObject({ id: 'addon-1', price: 12000 })
  })

  it('dedupes repeated add-on ids', () => {
    const input = sanitizeCalculatorInput(
      validPayload({ selections: [{ packageId: 'pkg-pro', addonIds: ['addon-1', 'addon-1'] }] }),
      ITEMS
    )
    expect(input.selections[0].addons).toHaveLength(1)
  })
})

describe('top-up sanitization', () => {
  it('clamps quantity to the item maxQuantity', () => {
    const input = sanitizeCalculatorInput(
      validPayload({
        selections: [{ packageId: 'pkg-pro', topups: [{ itemId: 'topup-1', quantity: 99 }] }],
      }),
      ITEMS
    )
    expect(input.selections[0].topups[0].quantity).toBe(5)
    expect(input.selections[0].topups[0].unitPrice).toBe(1000)
  })

  it('drops top-ups with zero quantity', () => {
    const input = sanitizeCalculatorInput(
      validPayload({
        selections: [{ packageId: 'pkg-pro', topups: [{ itemId: 'topup-1', quantity: 0 }] }],
      }),
      ITEMS
    )
    expect(input.selections[0].topups).toHaveLength(0)
  })
})

describe('mandatory fee waiver gating', () => {
  it('only waives the fee when 2-year prepaid is set', () => {
    const withoutPrepaid = sanitizeCalculatorInput(
      validPayload({ selections: [{ packageId: 'pkg-pro', mandatoryFeeWaived: true }] }),
      ITEMS
    )
    expect(withoutPrepaid.selections[0].mandatoryFeeWaived).toBe(false)

    const withPrepaid = sanitizeCalculatorInput(
      validPayload({
        twoYearPrepaid: true,
        selections: [{ packageId: 'pkg-pro', mandatoryFeeWaived: true }],
      }),
      ITEMS
    )
    expect(withPrepaid.selections[0].mandatoryFeeWaived).toBe(true)
  })
})

describe('transformation services', () => {
  it('sanitizes a service-only quote and caps man-day quantity', () => {
    const input = sanitizeCalculatorInput(
      {
        customerName: 'ACME',
        lane: 'Corp',
        selections: [],
        transformationQuote: {
          projectName: 'Rollout',
          engagementModel: 'project',
          services: [{ itemId: 'svc-1', quantity: 3, taskNote: 'kickoff' }],
        },
      },
      ITEMS
    )
    expect(input.transformationQuote?.services[0]).toMatchObject({
      itemId: 'svc-1',
      quantity: 3,
      unitPrice: 20000,
      taskNote: 'kickoff',
    })
  })

  it('rejects a non-service item used as a service', () => {
    expect(() =>
      sanitizeCalculatorInput(
        {
          customerName: 'ACME',
          lane: 'Biz',
          selections: [],
          transformationQuote: {
            projectName: '',
            engagementModel: '',
            services: [{ itemId: 'pkg-pro', quantity: 1 }],
          },
        },
        ITEMS
      )
    ).toThrow(/not a service/)
  })
})

describe('buildServerQuote', () => {
  it('returns both sanitized input and a recomputed breakdown', () => {
    const { input, breakdown } = buildServerQuote(
      validPayload({ selections: [{ packageId: 'pkg-pro', addonIds: ['addon-1'] }] }),
      ITEMS
    )
    expect(input.selections[0].packagePrice).toBe(80000)
    expect(breakdown.subtotal).toBe(92000)
  })
})
