import type { PriceBreakdown, CalculatorInput, LineItem } from '@/types/calculator'
import { isEnterprisePackage } from '@/lib/pricing-engine'
import SummaryLineItem from './SummaryLineItem'

interface SummaryPanelProps {
  breakdown: PriceBreakdown
  input: CalculatorInput
}

function formatTHB(n: number): string {
  return n.toLocaleString('th-TH')
}

function getEnterprisePriceRange(selection: CalculatorInput['selections'][number]): string {
  if (selection.enterprisePriceMin === null || selection.enterprisePriceMin === undefined) return ''
  if (selection.enterprisePriceMax === null || selection.enterprisePriceMax === undefined) return ''
  return `${formatTHB(selection.enterprisePriceMin)} - ${formatTHB(selection.enterprisePriceMax)}`
}

const LANE_COLORS = {
  Biz: { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.45)', text: '#93c5fd' },
  Corp: { bg: 'rgba(139, 92, 246, 0.2)', border: 'rgba(139, 92, 246, 0.45)', text: '#c4b5fd' },
}

function renderLineItems(
  items: LineItem[],
  enterpriseSelections: CalculatorInput['selections']
) {
  return items.map((item, index) => {
    const enterpriseSel = enterpriseSelections.find((selection) => selection.packageName === item.label)
    const tierBadge = enterpriseSel
      ? enterpriseSel.enterpriseTier === 'premium' ? 'Premium' : 'Base'
      : null

    return (
      <div key={`${item.label}-${index}`}>
        {enterpriseSel ? (
          <div className="flex justify-between items-start py-2">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-white text-sm font-medium leading-snug">{item.label}</p>
              {item.sublabel && <p className="text-white/45 text-xs truncate mt-0.5">{item.sublabel}</p>}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-amber-300 font-semibold text-sm tabular-nums whitespace-nowrap">
                {getEnterprisePriceRange(enterpriseSel)}
              </p>
            </div>
          </div>
        ) : (
          <SummaryLineItem item={item} />
        )}
        {tierBadge && (
          <div className="flex justify-end mt-0.5 mb-1">
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                background: tierBadge === 'Premium' ? 'rgba(217,119,6,0.2)' : 'rgba(255,255,255,0.08)',
                border: tierBadge === 'Premium' ? '1px solid rgba(217,119,6,0.4)' : '1px solid rgba(255,255,255,0.15)',
                color: tierBadge === 'Premium' ? '#fbbf24' : 'rgba(255,255,255,0.5)',
              }}
            >
              {tierBadge} Tier
            </span>
          </div>
        )}
      </div>
    )
  })
}

const ENGAGEMENT_LABEL: Record<string, string> = {
  'quick-win': '⚡ Quick Win (1–5 วัน)',
  project: '📋 Project-based (1–3 เดือน)',
  program: '🚀 Transformation (3 เดือน+)',
}

export default function SummaryPanel({ breakdown, input }: SummaryPanelProps) {
  const laneStyle = LANE_COLORS[input.lane]
  const enterpriseSelections = input.selections.filter((selection) => isEnterprisePackage(selection))
  const annualItems = breakdown.lineItems.filter((item) => !item.isOneTime)
  const oneTimeItems = breakdown.lineItems.filter((item) => item.isOneTime)
  const isTransformationOnly = input.transformationQuote !== undefined && input.selections.length === 0

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(10, 30, 70, 0.55)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(100, 220, 255, 0.18)',
      }}
    >
      <div className="mb-4">
        <h2 className="text-white font-bold text-lg leading-tight">Quote Summary</h2>
        {(input.customerName || input.lane) && (
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {input.customerName && (
              <span className="text-white/60 text-sm truncate max-w-[160px]">{input.customerName}</span>
            )}
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: laneStyle.bg,
                border: `1px solid ${laneStyle.border}`,
                color: laneStyle.text,
              }}
            >
              {input.lane}
            </span>
          </div>
        )}
      </div>

      {/* Transformation project header */}
      {isTransformationOnly && (
        <div
          className="mb-4 pb-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-white/40 text-xs mb-1">ชื่อโปรเจค</p>
          <p className="text-white font-semibold">{breakdown.projectName || '—'}</p>
          {breakdown.engagementModel && ENGAGEMENT_LABEL[breakdown.engagementModel] && (
            <span
              className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
              style={{
                background: 'rgba(167,139,250,0.15)',
                border: '1px solid rgba(167,139,250,0.25)',
                color: '#c4b5fd',
              }}
            >
              {ENGAGEMENT_LABEL[breakdown.engagementModel]}
            </span>
          )}
        </div>
      )}

      {breakdown.lineItems.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-white/25 text-sm">No items selected yet</p>
          <p className="text-white/20 text-xs mt-1">Choose products and packages to start pricing.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <p className="text-white/50 text-xs uppercase tracking-wide">Annual / Recurring</p>
              <p className="text-white/45 text-xs">{formatTHB(breakdown.annualTotal)} THB/year</p>
            </div>
            <div className="space-y-0.5">
              {renderLineItems(annualItems, enterpriseSelections)}
            </div>
          </div>

          {oneTimeItems.length > 0 && (
            <div className="space-y-2 mb-4">
              <div className="border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-white/50 text-xs uppercase tracking-wide">One-time Fees</p>
                  <p className="text-white/45 text-xs">{formatTHB(breakdown.oneTimeTotal)} THB</p>
                </div>
              </div>
              <div className="space-y-0.5">
                {oneTimeItems.map((item, index) => (
                  <SummaryLineItem key={`${item.label}-${index}`} item={item} />
                ))}
              </div>
            </div>
          )}

          {breakdown.hasEnterpriseDeal && (
            <div
              className="flex items-start gap-2 px-3 py-2 rounded-lg mb-3 text-[11px]"
              style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)' }}
            >
              <span className="mt-0.5">i</span>
              <div>
                {enterpriseSelections.map((selection) => {
                  const range = getEnterprisePriceRange(selection)
                  return range ? (
                    <p key={selection.packageName} className="text-amber-300/80">
                      {selection.packageName}: {range} THB/year
                    </p>
                  ) : null
                })}
                <p className="text-amber-200/50 mt-0.5">
                  Final enterprise pricing is still anchored to the selected base tier.
                </p>
              </div>
            </div>
          )}

          <div className="border-t my-3" style={{ borderColor: 'rgba(255,255,255,0.15)' }} />

          {isTransformationOnly ? (
            // Transformation totals: split annual infra vs one-time services
            <div className="space-y-2">
              {breakdown.annualTotal > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">ค่า Infrastructure (ต่อปี)</span>
                  <span className="text-white font-semibold tabular-nums">
                    {formatTHB(breakdown.annualTotal)} THB
                  </span>
                </div>
              )}
              {breakdown.oneTimeTotal > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">ค่าบริการ (One-time)</span>
                  <span className="text-white font-semibold tabular-nums">
                    {formatTHB(breakdown.oneTimeTotal)} THB
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-white font-bold text-base">รวมทั้งหมด</span>
                <span className="font-bold text-2xl" style={{ color: '#c4b5fd' }}>
                  {formatTHB(breakdown.annualTotal + breakdown.oneTimeTotal)}
                </span>
              </div>
              {breakdown.annualTotal > 0 && breakdown.oneTimeTotal > 0 && (
                <p className="text-white/35 text-xs">
                  ปีแรก: {formatTHB(breakdown.annualTotal)} + {formatTHB(breakdown.oneTimeTotal)} THB | ปีถัดไป: {formatTHB(breakdown.annualTotal)} THB/ปี
                </p>
              )}
              <p className="text-white/30 text-[11px] text-right">* VAT 7% not included</p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-white font-bold text-base">
                  {input.twoYearPrepaid && breakdown.kickstarter ? 'Net (ราคา 2 ปี Prepaid)' : 'Net Annual Total'}
                </span>
                <span className="font-bold text-2xl" style={{ color: '#6ee7b7' }}>
                  {formatTHB(input.twoYearPrepaid && breakdown.kickstarter ? breakdown.kickstarter.twoYearTotal : breakdown.annualTotal)}
                </span>
              </div>
              <p className="text-white/35 text-xs">
                {input.twoYearPrepaid && breakdown.kickstarter
                  ? `ชำระครั้งเดียว ${formatTHB(breakdown.kickstarter.twoYearTotal)} THB — เทียบเท่า ${formatTHB(breakdown.kickstarter.effectiveAnnualRate)} THB/ปี`
                  : `Year 1: ${formatTHB(breakdown.annualTotal)} + ${formatTHB(breakdown.oneTimeTotal)} THB | Year 2+: ${formatTHB(breakdown.annualTotal)} THB/year`
                }
              </p>
              <p className="text-white/30 text-[11px] text-right mt-1">
                * VAT 7% not included
              </p>
            </div>
          )}

          {input.twoYearPrepaid && breakdown.kickstarter && (
            <div className="glass-card p-4 border border-amber-400/20 bg-amber-400/5 mt-4 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">🚀</span>
                <p className="text-white/70 text-sm font-medium">Kickstarter — ราคา 2 ปี Prepaid</p>
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">ราคาปีที่ 1 + 2 (ปกติ)</span>
                  <span className="text-white/70 tabular-nums">
                    {formatTHB(breakdown.kickstarter.twoYearSubtotal)} THB
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-amber-300/80">ส่วนลด Kickstarter 20%</span>
                  <span className="text-amber-300 tabular-nums font-medium">
                    -{formatTHB(breakdown.kickstarter.discountAmount)} THB
                  </span>
                </div>

                <div className="border-t pt-1.5 mt-1.5" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                <div className="flex justify-between font-semibold">
                  <span className="text-white">รวม 2 ปี (ชำระครั้งเดียว)</span>
                  <span className="text-[#4ade80] tabular-nums text-base">
                    {formatTHB(breakdown.kickstarter.twoYearTotal)} THB
                  </span>
                </div>

                <p className="text-white/35 text-xs text-right mt-1">
                  เทียบเท่า {formatTHB(breakdown.kickstarter.effectiveAnnualRate)} THB/ปี (ประหยัด {formatTHB(breakdown.kickstarter.discountAmount)} THB)
                </p>
              </div>

              {breakdown.kickstarterMandatorySaving > 0 && (
                <div className="flex justify-between text-xs mt-3 pt-3" style={{ borderTop: '1px solid rgba(251, 191, 36, 0.2)' }}>
                  <span className="text-white/50">🎁 Waive Implementation Fee</span>
                  <span className="text-amber-300 tabular-nums">-{formatTHB(breakdown.kickstarterMandatorySaving)} THB</span>
                </div>
              )}
            </div>
          )}

          {breakdown.appliedOffers.length > 0 && (
            <div className="mt-4 space-y-1.5">
              {breakdown.appliedOffers.map((offer, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                  style={{
                    background: 'rgba(15, 110, 86, 0.15)',
                    border: '1px solid rgba(15, 110, 86, 0.3)',
                  }}
                >
                  <span>🎉</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-emerald-300 font-semibold">{offer.name}</span>
                    {offer.savings > 0 && (
                      <span className="text-white/50 ml-1.5">Saved {formatTHB(offer.savings)} THB</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {breakdown.hints.some((hint) => (hint.payload as Record<string, unknown>)?.['type'] === 'enterprise_combo') && (
            <div
              className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs"
              style={{ background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.3)' }}
            >
              <span>🎯</span>
              <span className="text-amber-200 font-medium leading-relaxed">
                Enterprise Combo: sales can confirm either an extra 10% top-up discount or 2 Man-days of implementation support.
              </span>
            </div>
          )}

          {breakdown.approvalRequired && (
            <div
              className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
              style={{
                background: 'rgba(234, 88, 12, 0.15)',
                border: '1px solid rgba(234, 88, 12, 0.4)',
              }}
            >
              <span>⚠</span>
              <span className="text-orange-200 font-medium">
                {breakdown.hasEnterpriseDeal
                  ? 'Enterprise deals require Head of BU approval.'
                  : 'This quote requires Head of BU approval.'}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
