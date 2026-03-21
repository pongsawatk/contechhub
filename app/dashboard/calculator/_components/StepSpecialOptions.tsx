'use client'

import type { CalculatorInput, PriceBreakdown } from '@/types/calculator'
import type { PricingItem } from '@/types/pricing'
import WarningBanner from './WarningBanner'

interface StepSpecialOptionsProps {
  input: CalculatorInput
  breakdown: PriceBreakdown
  pricingItems: PricingItem[]
  onChange: (patch: Partial<CalculatorInput>) => void
}

function formatTHB(n: number): string {
  return n.toLocaleString('th-TH')
}

function getTrainingBenefit(packageName: string): string {
  const lower = packageName.toLowerCase()
  if (lower.includes('business')) return '3 Man-days Onsite Training'
  if (lower.includes('professional')) return '5 Man-days Onsite Training'
  if (lower.includes('enterprise')) return '5 Man-days Onsite Training'
  return 'Training (as agreed)'
}

export default function StepSpecialOptions({
  input,
  breakdown,
  pricingItems,
  onChange,
}: StepSpecialOptionsProps) {
  const hasProducts = input.selections.some((selection) => selection.packagePrice > 0)
  const discountBase =
    input.discountPercent > 0 && input.discountPercent < 100
      ? breakdown.annualTotal / (1 - input.discountPercent / 100)
      : breakdown.annualTotal
  const manualDiscountAmount =
    input.discountPercent > 0 && discountBase > 0
      ? discountBase * (input.discountPercent / 100)
      : 0

  const kickstarterItem = pricingItems.find((item) =>
    item.packageName.toLowerCase().includes('kickstarter')
  )
  const selectedTrainingBenefits = Array.from(
    new Set(
      input.selections
        .filter((selection) => selection.packageName)
        .map((selection) => getTrainingBenefit(selection.packageName))
    )
  )
  const trainingText =
    selectedTrainingBenefits.length > 0
      ? selectedTrainingBenefits.join(' / ')
      : 'Training (as agreed)'

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-semibold text-base mb-1">Special Options</h3>
        <p className="text-white/45 text-sm">Apply Kickstarter benefits or an approved manual discount.</p>
      </div>

      {hasProducts && (
        <div
          className="rounded-2xl p-5 transition-all"
          style={{
            background: input.twoYearPrepaid
              ? 'rgba(15, 110, 86, 0.14)'
              : 'rgba(10, 30, 70, 0.45)',
            border: input.twoYearPrepaid
              ? '1.5px solid rgba(15, 110, 86, 0.5)'
              : '1px solid rgba(100, 220, 255, 0.12)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🚀</span>
                <h4 className="text-white font-semibold text-sm">Kickstarter Offer - 2-year prepaid</h4>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                20% off annual fees plus waived mandatory implementation.
              </p>

              <div
                className="mt-3 rounded-lg px-3 py-2 text-xs"
                style={{
                  background: input.twoYearPrepaid
                    ? 'rgba(15, 110, 86, 0.2)'
                    : 'rgba(255,255,255,0.04)',
                  border: input.twoYearPrepaid
                    ? '1px solid rgba(15, 110, 86, 0.4)'
                    : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p className={input.twoYearPrepaid ? 'text-emerald-300' : 'text-white/65'}>
                  🎁 Extra benefit: 20% off + Waive Implementation Fee + {trainingText}
                </p>
                {kickstarterItem && kickstarterItem.keyInclusions.length > 0 && (
                  <p className="text-white/35 mt-1">
                    {kickstarterItem.keyInclusions.join(' • ')}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => onChange({ twoYearPrepaid: !input.twoYearPrepaid })}
              className="flex-shrink-0 mt-1"
              aria-label="Toggle Kickstarter Offer"
            >
              <div
                className="w-12 h-6 rounded-full relative transition-all duration-200"
                style={{
                  background: input.twoYearPrepaid
                    ? 'rgba(15, 110, 86, 0.8)'
                    : 'rgba(255,255,255,0.12)',
                  border: input.twoYearPrepaid
                    ? '1px solid rgba(15, 110, 86, 0.9)'
                    : '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
                  style={{ left: input.twoYearPrepaid ? '26px' : '2px' }}
                />
              </div>
            </button>
          </div>
        </div>
      )}

      <div
        className="rounded-2xl p-5 space-y-4"
        style={{
          background: 'rgba(10, 30, 70, 0.45)',
          border: '1px solid rgba(100, 220, 255, 0.12)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🏷</span>
          <h4 className="text-white font-semibold text-sm">Manual Discount</h4>
        </div>

        <div className="space-y-2">
          <label className="block text-white/65 text-sm">Discount (%)</label>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={100}
              className="glass-input w-full px-4 py-3 text-sm pr-10 placeholder:text-white/25 transition-all"
              placeholder="0"
              value={input.discountPercent || ''}
              onChange={(e) => {
                const val = Math.min(100, Math.max(0, Number(e.target.value)))
                onChange({ discountPercent: val })
              }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">
              %
            </span>
          </div>

          {input.discountPercent > 0 && manualDiscountAmount > 0 && (
            <p className="text-white/55 text-xs">
              {input.discountPercent}% ={' '}
              <span className="text-emerald-300 font-semibold">
                {formatTHB(Math.round(manualDiscountAmount))} THB
              </span>
            </p>
          )}
        </div>

        {input.discountPercent > 0 && (
          <div className="space-y-2">
            <label className="block text-white/65 text-sm">
              Reason <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              className="glass-input w-full px-4 py-3 text-sm placeholder:text-white/25 transition-all"
              placeholder="Example: legacy customer / quarterly promo"
              value={input.discountReason}
              onChange={(e) => onChange({ discountReason: e.target.value })}
            />
          </div>
        )}

        {breakdown.hasEnterpriseDeal && (
          <WarningBanner message="Enterprise deals always require Head of BU approval." />
        )}
        {!breakdown.hasEnterpriseDeal && input.discountPercent > 10 && (
          <WarningBanner message="Discounts above 10% require Head of BU approval." />
        )}
      </div>
    </div>
  )
}
