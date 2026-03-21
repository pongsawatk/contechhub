import Image from 'next/image'
import type { PricingItem } from '@/types/pricing'
import { formatNumber, getProductConfig, getProductTabId } from '@/lib/pricing-utils'

interface Props {
  items: PricingItem[]
  onTabChange: (tab: string) => void
}

export default function OverviewTab({ items, onTabChange }: Props) {
  const products = Array.from(
    new Set(
      items
        .filter((item) => item.type === 'Package' && item.product !== 'Bundle' && !item.isInfrastructure)
        .map((item) => item.product)
    )
  )
  const bundles = items.filter((item) => item.type === 'Bundle').filter((item) => !item.isInfrastructure)

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {products.map((product) => {
          const config = getProductConfig(product)
          const productItems = items.filter((item) => item.product === product && !item.isInfrastructure)
          const packages = productItems.filter((item) => item.type === 'Package')
          const hasAddons = productItems.some((item) => item.type === 'Add-on')

          const startingPrice = Math.min(
            ...packages.map((pkg) => pkg.price).filter((price) => price > 0),
            Infinity
          )

          return (
            <div
              key={product}
              className="glass-card relative overflow-hidden p-6 flex flex-col group hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              style={{ borderTop: `3px solid ${config.color}` }}
              onClick={() => onTabChange(getProductTabId(product))}
            >
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    padding: '10px',
                  }}
                >
                  <Image
                    src={config.logo}
                    alt={product}
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="text-white/50 text-xs font-light">{config.nameTH}</p>
                  <h3 className="text-white font-semibold text-xl mt-0.5">{product}</h3>
                </div>
              </div>

              {config.tagline && (
                <p className="text-white/70 text-sm font-light mb-4 leading-relaxed">
                  {config.tagline}
                </p>
              )}

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-white/40 text-xs">เริ่มต้น</span>
                {isFinite(startingPrice) ? (
                  <>
                    <span className="text-[#4ade80] text-xl font-semibold">
                      {formatNumber(startingPrice)}
                    </span>
                    <span className="text-white/50 text-xs">บาท</span>
                  </>
                ) : (
                  <span className="text-[#4ade80] text-xl font-semibold">ติดต่อฝ่ายขาย</span>
                )}
              </div>

              <div className="flex gap-2 flex-wrap mb-4">
                <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/50">
                  {packages.length} แพ็กเกจ
                </span>
                {hasAddons && (
                  <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/50">
                    Add-ons
                  </span>
                )}
              </div>

              <div
                className="flex items-center gap-1 text-sm font-medium mt-auto"
                style={{ color: config.color }}
              >
                ดูราคาทั้งหมด
                <span className="group-hover:translate-x-1 transition-transform duration-200">
                  →
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {bundles.length > 0 && (
        <div
          className="rounded-2xl border p-6"
          style={{
            background: 'rgba(15,110,86,0.08)',
            borderColor: 'rgba(15,110,86,0.2)',
          }}
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🎁</span>
                <h3 className="text-white font-semibold text-lg">โปรโมชั่นพิเศษ</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bundles.map((bundle) => (
                  <div
                    key={bundle.id}
                    className="rounded-xl p-4 border"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      borderColor: 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <p className="text-white text-sm font-medium">{bundle.packageName}</p>
                    {bundle.keyInclusions.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {bundle.keyInclusions.map((inclusion, index) => (
                          <p key={index} className="text-white/55 text-xs leading-relaxed">
                            {inclusion}
                          </p>
                        ))}
                      </div>
                    )}
                    {bundle.notes && (
                      <p className="text-[#EF9F27] text-xs mt-3 pt-3 border-t border-white/5">
                        {bundle.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onTabChange('bundle')}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white whitespace-nowrap self-center"
              style={{
                background: 'rgba(15,110,86,0.3)',
                border: '1px solid rgba(15,110,86,0.5)',
              }}
            >
              ดูบันเดิลทั้งหมด →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
