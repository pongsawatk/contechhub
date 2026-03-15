import type { PriceBreakdown, CalculatorInput } from '@/types/calculator'
import SummaryLineItem from './SummaryLineItem'

interface SummaryPanelProps {
  breakdown: PriceBreakdown
  input: CalculatorInput
}

function formatTHB(n: number): string {
  return n.toLocaleString('th-TH')
}

const LANE_COLORS = {
  Biz: { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.45)', text: '#93c5fd' },
  Corp: { bg: 'rgba(139, 92, 246, 0.2)', border: 'rgba(139, 92, 246, 0.45)', text: '#c4b5fd' },
}

export default function SummaryPanel({ breakdown, input }: SummaryPanelProps) {
  const laneStyle = LANE_COLORS[input.lane]

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
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-white font-bold text-lg leading-tight">สรุปราคา</h2>
        {(input.customerName || input.lane) && (
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {input.customerName && (
              <span className="text-white/60 text-sm truncate max-w-[160px]">
                {input.customerName}
              </span>
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

      {/* Empty state */}
      {breakdown.lineItems.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-white/25 text-sm">ยังไม่มีรายการ</p>
          <p className="text-white/20 text-xs mt-1">เลือกสินค้าเพื่อเริ่มคำนวณ</p>
        </div>
      ) : (
        <>
          {/* Line items */}
          <div className="space-y-0.5 mb-4">
            {breakdown.lineItems.map((item, i) => (
              <SummaryLineItem key={i} item={item} />
            ))}
          </div>

          {/* Divider */}
          <div className="border-t my-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

          {/* Subtotal */}
          <div className="flex justify-between items-center mb-1">
            <span className="text-white/50 text-sm">รวมก่อนส่วนลด</span>
            <span className="text-white/70 text-sm font-medium">
              {formatTHB(breakdown.subtotal)}
            </span>
          </div>

          {/* Discount row */}
          {breakdown.discountAmount > 0 && (
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm" style={{ color: '#6ee7b7' }}>ส่วนลดรวม</span>
              <span className="text-sm font-medium" style={{ color: '#6ee7b7' }}>
                −{formatTHB(breakdown.discountAmount)}
              </span>
            </div>
          )}

          {/* Strong divider */}
          <div className="border-t my-3" style={{ borderColor: 'rgba(255,255,255,0.15)' }} />

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-white font-bold text-base">ราคาสุทธิ</span>
            <span className="font-bold text-2xl" style={{ color: '#6ee7b7' }}>
              {formatTHB(breakdown.total)}
            </span>
          </div>

          {/* VAT note */}
          <p className="text-white/30 text-[11px] text-right mt-1">
            * ยังไม่รวม VAT 7%
          </p>

          {/* Applied Offers */}
          {breakdown.appliedOffers.length > 0 && (
            <div className="mt-4 space-y-1.5">
              {breakdown.appliedOffers.map((offer, i) => (
                <div
                  key={i}
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
                      <span className="text-white/50 ml-1.5">
                        ประหยัด {formatTHB(offer.savings)} บาท
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Approval Required */}
          {breakdown.approvalRequired && (
            <div
              className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
              style={{
                background: 'rgba(234, 88, 12, 0.15)',
                border: '1px solid rgba(234, 88, 12, 0.4)',
              }}
            >
              <span>⚠️</span>
              <span className="text-orange-200 font-medium">
                ต้องการ Approval จาก Head of BU
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
