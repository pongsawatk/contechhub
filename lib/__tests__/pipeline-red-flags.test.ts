import { describe, expect, it } from 'vitest'
import { getPipelineRedFlags } from '@/lib/pipeline-red-flags'
import type { HotQuotation, SalesOrder } from '@/types/pipeline'

function quote(overrides: Partial<HotQuotation> = {}): HotQuotation {
  return {
    id: 'q1',
    entryName: 'Q-001 - Builk Insite',
    quotationNo: 'Q-001',
    customerRelationId: '',
    contactName: '',
    product: 'Builk Insite',
    quotationAmount: 100000,
    hotness: '5',
    lane: 'Biz',
    stage: 'Follow-up',
    ownerName: 'Teal',
    ownerEmail: 'teal@example.com',
    expectedClose: '2026-06-30',
    lastActivity: '2026-06-20',
    status: 'Active',
    importBatch: '',
    notes: '',
    ...overrides,
  }
}

function order(overrides: Partial<SalesOrder> = {}): SalesOrder {
  return {
    id: 'o1',
    entryName: 'SO-001 - Builk Insite',
    orderNo: 'SO-001',
    quotationNo: 'Q-001',
    customerRelationId: '',
    contactName: '',
    product: 'Builk Insite',
    orderAmount: 200000,
    lane: 'Biz',
    revenueType: 'New Logo Biz',
    closeDate: '2026-06-01',
    expectedGoLive: '2026-06-20',
    contractMonths: 12,
    ownerName: 'Teal',
    ownerEmail: 'teal@example.com',
    paymentTerms: '30 Days',
    revenuePercent: 25,
    revenueAmount: 50000,
    recognitionStatus: 'Partially Recognized',
    importBatch: '',
    notes: '',
    ...overrides,
  }
}

describe('getPipelineRedFlags', () => {
  const today = new Date('2026-06-27T12:00:00+07:00')

  it('flags active quotations without owner or expected close', () => {
    const flags = getPipelineRedFlags([
      quote({ ownerName: '', expectedClose: null, lastActivity: '2026-06-26' }),
    ], [], today)

    expect(flags.map((flag) => flag.id)).toContain('quote-owner-q1')
    expect(flags.map((flag) => flag.id)).toContain('quote-close-q1')
  })

  it('flags stale quotation follow-up', () => {
    const flags = getPipelineRedFlags([
      quote({ lastActivity: '2026-06-10', stage: 'Negotiation' }),
    ], [], today)

    expect(flags[0]).toMatchObject({
      id: 'quote-idle-q1',
      severity: 'warning',
    })
  })

  it('flags verbal yes deals past expected close as critical', () => {
    const flags = getPipelineRedFlags([
      quote({ stage: 'Verbal Yes', expectedClose: '2026-06-20' }),
    ], [], today)

    expect(flags[0]).toMatchObject({
      id: 'quote-verbal-q1',
      severity: 'critical',
    })
  })

  it('flags sales orders with go-live or revenue risk', () => {
    const flags = getPipelineRedFlags([], [order()], today)

    expect(flags.map((flag) => flag.id)).toContain('order-golive-o1')
    expect(flags.map((flag) => flag.id)).toContain('order-revenue-o1')
  })

  it('does not flag completed orders', () => {
    const flags = getPipelineRedFlags([], [
      order({ recognitionStatus: 'Fully Recognized', revenueAmount: 200000 }),
    ], today)

    expect(flags).toHaveLength(0)
  })
})
