import { getEnterprisePriceRange, isEnterprisePackage } from '@/lib/pricing-engine'
import { formatBilling, formatNumber, LaneBadge } from '@/lib/pricing-utils'
import type { PricingItem } from '@/types/pricing'

interface Props {
  item: PricingItem
  productColor: string
}

export default function PackageCard({ item, productColor }: Props) {
  const visibleInclusions = 10
  const isBestValue =
    item.packageName.toLowerCase().includes('professional') && !isEnterprisePackage(item)
  const isEnterprise = isEnterprisePackage(item)
  const isContactSales = item.price === 0 && !isEnterprise
  const priceRange = isEnterprise ? getEnterprisePriceRange(item) : ''

  return (
    <div
      className="glass-card relative flex h-full flex-col p-5 transition-all duration-200 hover:-translate-y-1"
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
        <div className="absolute left-1/2 top-[-12px] z-10 -translate-x-1/2">
          <span
            className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #0F6E56, #534AB7)' }}
          >
            Best Value
          </span>
        </div>
      )}

      {isEnterprise && (
        <div className="absolute left-1/2 top-[-12px] z-10 -translate-x-1/2">
          <span
            className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: 'linear-gradient(135deg, #92400e, #d97706)', color: '#fef3c7' }}
          >
            Enterprise
          </span>
        </div>
      )}

      <div className="mb-4 pt-2">
        <h4 className="text-base font-semibold text-white">{item.packageName}</h4>
        {item.targetProfile && (
          <p className="mt-1 text-xs font-light text-white/[0.45]">{item.targetProfile}</p>
        )}
      </div>

      <div className="mb-4">
        {isContactSales ? (
          <p className="text-xl font-semibold text-[#4ade80]">ติดต่อฝ่ายขาย</p>
        ) : isEnterprise ? (
          <div>
            <div className="flex flex-wrap items-baseline gap-1">
              <span className="text-xl font-semibold tabular-nums text-white" style={{ color: '#fbbf24' }}>
                {priceRange}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-white/40">บาท / ปี (Base - Premium)</p>
          </div>
        ) : (
          <div className="flex flex-wrap items-baseline gap-1">
            <span className="text-2xl font-semibold tabular-nums text-white">
              {formatNumber(item.price)}
            </span>
            <span className="text-sm text-white/50">{formatBilling(item.billing)}</span>
          </div>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {isEnterprise ? (
          <>
            <span
              className="rounded-full border px-2 py-0.5 text-xs"
              style={{
                background: 'rgba(251,191,36,0.12)',
                borderColor: 'rgba(251,191,36,0.35)',
                color: '#fbbf24',
              }}
            >
              Unlimited* Slots
            </span>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-200">
              ✅ Included in Package
            </span>
          </>
        ) : item.activeSlots > 0 ? (
          <span
            className="rounded-full border px-2 py-0.5 text-xs"
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
          <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-xs text-orange-300">
            Internal
          </span>
        )}
      </div>

      {item.keyInclusions.length > 0 && (
        <div className="mb-4 flex-1">
          <p className="mb-2 text-xs font-light uppercase tracking-wider text-white/40">รายละเอียด</p>
          <ul className="space-y-1.5">
            {item.keyInclusions.slice(0, visibleInclusions).map((inc, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-white/70">
                <span className="mt-0.5 flex-shrink-0 text-xs text-[#4ade80]">•</span>
                {inc}
              </li>
            ))}
            {item.keyInclusions.length > visibleInclusions && (
              <li className="text-xs text-white/[0.35]">
                ...และอีก {item.keyInclusions.length - visibleInclusions} รายการ
              </li>
            )}
          </ul>
        </div>
      )}

      {isEnterprise && <p className="mb-2 text-[11px] text-white/30">* Soft cap &gt; 30 Active Slots</p>}

      {item.notes && (
        <div
          className="mt-auto border-t border-white/5 pt-3"
          style={{
            borderLeft: isEnterprise ? '2px solid #d97706' : '2px solid #4ade80',
            paddingLeft: '10px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '0 4px 4px 0',
          }}
        >
          <p className="text-xs leading-relaxed text-white/50">{item.notes}</p>
        </div>
      )}
    </div>
  )
}
