import type { PricingItem } from '@/types/pricing'
import { formatNumber, formatBilling, LaneBadge } from '@/lib/pricing-utils'
import { isEnterprisePackage, getEnterprisePriceRange } from '@/lib/pricing-engine'

interface Props {
  item: PricingItem
  productColor: string
}

export default function PackageCard({ item, productColor }: Props) {
  const visibleInclusions = 10
  const isBestValue =
    item.packageName.toLowerCase().includes('professional') &&
    !isEnterprisePackage(item.packageName)
  const isEnterprise = isEnterprisePackage(item.packageName)
  const isContactSales = item.price === 0 && !isEnterprise
  const priceRange = isEnterprise ? getEnterprisePriceRange(item.packageName) : ''

  return (
    <div
      className="glass-card relative flex flex-col h-full p-5 hover:-translate-y-1 transition-all duration-200"
      style={
        isBestValue
          ? { borderColor: `${productColor}60` }
          : isEnterprise
            ? {
                borderColor: 'rgba(251, 191, 36, 0.4)',
                boxShadow: '0 0 0 1px rgba(251,191,36,0.15)',
              }
            : {}
      }
    >
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

      {isEnterprise && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #92400e, #d97706)', color: '#fef3c7' }}
          >
            👑 Enterprise
          </span>
        </div>
      )}

      <div className="mb-4 pt-2">
        <h4 className="text-white font-semibold text-base">{item.packageName}</h4>
        {item.targetProfile && (
          <p className="text-white/[0.45] text-xs font-light mt-1">{item.targetProfile}</p>
        )}
      </div>

      <div className="mb-4">
        {isContactSales ? (
          <p className="text-[#4ade80] text-xl font-semibold">ติดต่อฝ่ายขาย</p>
        ) : isEnterprise ? (
          <div>
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-white text-xl font-semibold tabular-nums" style={{ color: '#fbbf24' }}>
                {priceRange}
              </span>
            </div>
            <p className="text-white/40 text-xs mt-0.5">บาท / ปี (Base – Premium)</p>
          </div>
        ) : (
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-white text-2xl font-semibold tabular-nums">
              {formatNumber(item.price)}
            </span>
            <span className="text-white/50 text-sm">{formatBilling(item.billing)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {isEnterprise ? (
          <span
            className="text-xs px-2 py-0.5 rounded-full border"
            style={{
              background: 'rgba(251,191,36,0.12)',
              borderColor: 'rgba(251,191,36,0.35)',
              color: '#fbbf24',
            }}
          >
            Unlimited* Slots
          </span>
        ) : item.activeSlots > 0 ? (
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
        ) : null}
        {item.lane && <LaneBadge lane={item.lane} />}
        {item.visibility === 'Internal Only' && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300">
            Internal
          </span>
        )}
      </div>

      {item.keyInclusions.length > 0 && (
        <div className="flex-1 mb-4">
          <p className="text-white/40 text-xs font-light mb-2 uppercase tracking-wider">
            รายละเอียด
          </p>
          <ul className="space-y-1.5">
            {item.keyInclusions.slice(0, visibleInclusions).map((inc, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                <span className="text-[#4ade80] text-xs mt-0.5 flex-shrink-0">✓</span>
                {inc}
              </li>
            ))}
            {item.keyInclusions.length > visibleInclusions && (
              <li className="text-white/[0.35] text-xs">
                ...และอีก {item.keyInclusions.length - visibleInclusions} รายการ
              </li>
            )}
          </ul>
        </div>
      )}

      {isEnterprise && (
        <p className="text-white/30 text-[11px] mb-2">* Soft cap &gt; 30 Active Slots</p>
      )}

      {item.notes && (
        <div
          className="mt-auto pt-3 border-t border-white/5"
          style={{
            borderLeft: isEnterprise ? '2px solid #d97706' : '2px solid #4ade80',
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
