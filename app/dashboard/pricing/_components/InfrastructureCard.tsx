import type { PricingItem } from '@/types/pricing'
import { formatNumber, formatBilling } from '@/lib/pricing-utils'

interface Props {
  item: PricingItem
}

export default function InfrastructureCard({ item }: Props) {
  const isContactSales = item.price === 0

  return (
    <div
      className="p-5 rounded-2xl border flex flex-col gap-3"
      style={{
        background: 'rgba(239,68,68,0.04)',
        borderColor: 'rgba(239,68,68,0.15)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-white font-semibold text-base leading-tight">
          {item.packageName}
        </h4>
        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 whitespace-nowrap flex-shrink-0">
          Enterprise
        </span>
      </div>

      {/* Target Profile */}
      {item.targetProfile && (
        <p className="text-white/45 text-xs font-light">{item.targetProfile}</p>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-1">
        {isContactSales ? (
          <span className="text-[#4ade80] text-xl font-semibold">ติดต่อฝ่ายขาย</span>
        ) : (
          <>
            <span className="text-white text-2xl font-semibold tabular-nums">
              {formatNumber(item.price)}
            </span>
            <span className="text-white/45 text-sm">{formatBilling(item.billing)}</span>
          </>
        )}
      </div>

      {/* Key Inclusions */}
      {item.keyInclusions.length > 0 && (
        <ul className="space-y-1.5">
          {item.keyInclusions.map((inc, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/65">
              <span className="text-red-400 text-xs mt-0.5 flex-shrink-0">✓</span>
              {inc}
            </li>
          ))}
        </ul>
      )}

      {/* Notes */}
      {item.notes && (
        <div
          className="pt-2 border-t border-white/5"
          style={{ borderLeft: '2px solid rgba(239,68,68,0.4)', paddingLeft: '10px' }}
        >
          <p className="text-white/40 text-xs leading-relaxed">{item.notes}</p>
        </div>
      )}
    </div>
  )
}
