import type { PricingItem } from '@/types/pricing'
import { formatPrice, formatNumber } from '@/lib/pricing-utils'

interface Props {
  addons: PricingItem[]
  bundles: PricingItem[]
}

function getBundleSavingsPercent(bundle: PricingItem): number | null {
  const match = bundle.notes.match(/ประหยัด\s*([\d,]+)\s*บาท(?:\s*\((\d+)%\))?/)
  if (!match) return null

  const savings = parseInt(match[1].replace(/,/g, ''), 10)
  if (Number.isNaN(savings)) return null

  if (match[2]) {
    const explicitPercent = parseInt(match[2], 10)
    return Number.isNaN(explicitPercent) ? null : explicitPercent
  }

  const fullPrice = bundle.price + savings
  if (fullPrice <= 0) return null

  return Math.round((savings / fullPrice) * 100)
}

export default function AddonSection({ addons, bundles }: Props) {
  return (
    <div>
      {addons.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {addons.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl transition-all duration-150"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex justify-between items-start mb-2 gap-2">
                <h5 className="text-white text-sm font-medium">{item.packageName}</h5>
                <span className="text-[#4ade80] text-sm font-semibold tabular-nums whitespace-nowrap flex-shrink-0">
                  {formatPrice(item.price, item.billing)}
                </span>
              </div>
              {item.keyInclusions.slice(0, 2).map((inc, index) => (
                <p key={index} className="text-white/50 text-xs leading-relaxed">
                  {inc}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}

      {bundles.length > 0 && (
        <div
          className="p-5 rounded-xl border"
          style={{
            background: 'rgba(15,110,86,0.10)',
            borderColor: 'rgba(15,110,86,0.30)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔥</span>
            <h4 className="text-white font-semibold">แพ็กเกจประหยัด</h4>
          </div>
          {bundles.map((bundle) => {
            const savingsPercent = getBundleSavingsPercent(bundle)

            return (
              <div
                key={bundle.id}
                className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white text-sm font-medium">{bundle.packageName}</p>
                    {savingsPercent !== null && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full border"
                        style={{
                          background: 'rgba(239,159,39,0.20)',
                          borderColor: 'rgba(239,159,39,0.30)',
                          color: '#EF9F27',
                        }}
                      >
                        ประหยัด {savingsPercent}%
                      </span>
                    )}
                  </div>
                  <p className="text-white/50 text-xs">{bundle.keyInclusions.join(' • ')}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-[#4ade80] font-semibold tabular-nums">
                    {formatNumber(bundle.price)} บาท/ปี
                  </p>
                  {bundle.notes && (
                    <p className="text-[#EF9F27] text-xs">{bundle.notes}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
