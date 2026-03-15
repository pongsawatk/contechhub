'use client'

import type { CalculatorInput, PriceBreakdown } from '@/types/calculator'
import WarningBanner from './WarningBanner'

interface StepSpecialOptionsProps {
  input: CalculatorInput
  breakdown: PriceBreakdown
  onChange: (patch: Partial<CalculatorInput>) => void
}

function formatTHB(n: number): string {
  return n.toLocaleString('th-TH')
}

export default function StepSpecialOptions({ input, breakdown, onChange }: StepSpecialOptionsProps) {
  const hasProducts = input.selections.some((s) => s.packagePrice > 0)
  const manualDiscountAmount =
    breakdown.subtotal > 0 && input.discountPercent > 0
      ? breakdown.subtotal * (input.discountPercent / 100)
      : 0

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-semibold text-base mb-1">ตัวเลือกพิเศษ</h3>
        <p className="text-white/45 text-sm">ส่วนลดและข้อเสนอพิเศษ</p>
      </div>

      {/* Kickstarter Offer */}
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
                <h4 className="text-white font-semibold text-sm">
                  Kickstarter Offer — สัญญา 2 ปี
                </h4>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                รับ Implementation &amp; Training ฟรีทั้งหมด
                <br />
                <span className="text-white/35 text-xs">(มูลค่า ~30,000–50,000 บาท)</span>
              </p>
              {input.twoYearPrepaid && (
                <div
                  className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                  style={{
                    background: 'rgba(15, 110, 86, 0.2)',
                    border: '1px solid rgba(15, 110, 86, 0.4)',
                  }}
                >
                  <span className="text-emerald-400">✓</span>
                  <span className="text-emerald-300">
                    แถมฟรี Implementation &amp; Training
                  </span>
                </div>
              )}
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() =>
                onChange({ twoYearPrepaid: !input.twoYearPrepaid })
              }
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
                  style={{
                    left: input.twoYearPrepaid ? '26px' : '2px',
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Manual Discount */}
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
          <span className="text-lg">🏷️</span>
          <h4 className="text-white font-semibold text-sm">ส่วนลดเพิ่มเติม</h4>
        </div>

        <div className="space-y-2">
          <label className="block text-white/65 text-sm">ส่วนลด (%)</label>
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

          {/* Live discount display */}
          {input.discountPercent > 0 && manualDiscountAmount > 0 && (
            <p className="text-white/55 text-xs">
              ลด {input.discountPercent}% ={' '}
              <span className="text-emerald-300 font-semibold">
                {formatTHB(Math.round(manualDiscountAmount))} บาท
              </span>
            </p>
          )}
        </div>

        {/* Discount Reason */}
        {input.discountPercent > 0 && (
          <div className="space-y-2">
            <label className="block text-white/65 text-sm">
              เหตุผลส่วนลด <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              className="glass-input w-full px-4 py-3 text-sm placeholder:text-white/25 transition-all"
              placeholder="เช่น ลูกค้าเก่า / โปรโมชัน Q1"
              value={input.discountReason}
              onChange={(e) => onChange({ discountReason: e.target.value })}
            />
          </div>
        )}

        {/* >10% warning */}
        {breakdown.approvalRequired && (
          <WarningBanner message="ส่วนลดเกิน 10% ต้องการ Approval จาก Head of BU" />
        )}
      </div>
    </div>
  )
}
