import type { PricingItem } from '@/types/pricing'
import { formatNumber, formatBilling, LaneBadge } from '@/lib/pricing-utils'

interface Props {
  item: PricingItem
  productColor: string
}

export default function PackageCard({ item, productColor }: Props) {
  const isBestValue = item.packageName.toLowerCase().includes('professional')
  const isContactSales = item.price === 0

  return (
    <div
      className="glass-card relative flex flex-col h-full p-5 hover:-translate-y-1 transition-all duration-200"
      style={isBestValue ? { borderColor: `${productColor}60` } : {}}
    >
      {/* Best Value Badge */}
      {isBestValue && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span
            className="px-3 py-1 rounded-full text-white text-xs font-medium whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #0F6E56, #534AB7)' }}
          >
            ⭐ Best Value
          </span>
        </div>
      )}

      {/* Name + Target Profile */}
      <div className="mb-4 pt-2">
        <h4 className="text-white font-semibold text-base">{item.packageName}</h4>
        {item.targetProfile && (
          <p className="text-white/[0.45] text-xs font-light mt-1">{item.targetProfile}</p>
        )}
      </div>

      {/* Price */}
      <div className="mb-4">
        {isContactSales ? (
          <p className="text-[#4ade80] text-xl font-semibold">ติดต่อฝ่ายขาย</p>
        ) : (
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-white text-2xl font-semibold tabular-nums">
              {formatNumber(item.price)}
            </span>
            <span className="text-white/50 text-sm">{formatBilling(item.billing)}</span>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {item.activeSlots > 0 && (
          <span
            className="text-xs px-2 py-0.5 rounded-full border"
            style={{
              background: `${productColor}20`,
              borderColor: `${productColor}40`,
              color: productColor,
            }}
          >
            {item.activeSlots} Active Slots
          </span>
        )}
        {item.lane && <LaneBadge lane={item.lane} />}
        {item.visibility === 'Internal Only' && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300">
            Internal
          </span>
        )}
      </div>

      {/* Key Inclusions */}
      {item.keyInclusions.length > 0 && (
        <div className="flex-1 mb-4">
          <p className="text-white/40 text-xs font-light mb-2 uppercase tracking-wider">
            รายละเอียด
          </p>
          <ul className="space-y-1.5">
            {item.keyInclusions.slice(0, 6).map((inc, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                <span className="text-[#4ade80] text-xs mt-0.5 flex-shrink-0">✓</span>
                {inc}
              </li>
            ))}
            {item.keyInclusions.length > 6 && (
              <li className="text-white/[0.35] text-xs">
                ...และอีก {item.keyInclusions.length - 6} รายการ
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Notes */}
      {item.notes && (
        <div
          className="mt-auto pt-3 border-t border-white/5"
          style={{
            borderLeft: '2px solid #4ade80',
            paddingLeft: '10px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '0 4px 4px 0',
          }}
        >
          <p className="text-white/50 text-xs leading-relaxed">{item.notes}</p>
        </div>
      )}
    </div>
  )
}
