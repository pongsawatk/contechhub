import Image from 'next/image'
import type { PricingItem } from '@/types/pricing'
import { formatNumber } from '@/lib/pricing-utils'

interface ProductConfig {
  logo: string
  color: string
  tabId: string
  nameTH: string
  tagline: string
}

const PRODUCT_CONFIG: Record<string, ProductConfig> = {
  'Builk Insite': {
    logo: '/logos/iNSITE_Logo.png',
    color: '#378ADD',
    tabId: 'insite',
    nameTH: 'บริหารโครงการ',
    tagline: 'เชื่อมแผนงาน คุณภาพ และต้นทุน ไว้ในที่เดียว',
  },
  'Builk 360': {
    logo: '/logos/builk360_Logo.png',
    color: '#1D9E75',
    tabId: '360',
    nameTH: 'ติดตามไซต์งาน',
    tagline: 'ยกไซต์งานมาไว้บนหน้าจอ ด้วยภาพ 360 องศา',
  },
  Kwanjai: {
    logo: '/logos/Kwanjai_Logo.png',
    color: '#7F77DD',
    tabId: 'kwanjai',
    nameTH: 'บริการหลังการขาย',
    tagline: 'บริหารงานซ่อมและบริการหลังการขายผ่าน LINE',
  },
}

interface Props {
  items: PricingItem[]
  onTabChange: (tab: string) => void
}

export default function OverviewTab({ items, onTabChange }: Props) {
  const products = ['Builk Insite', 'Builk 360', 'Kwanjai']

  return (
    <div>
      {/* 3-product grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {products.map((product) => {
          const config = PRODUCT_CONFIG[product]
          if (!config) return null

          const productItems = items.filter((i) => i.product === product)
          const packages = productItems.filter((i) => i.type === 'Package')
          const hasAddons = productItems.some((i) => i.type === 'Add-on')

          const startingPrice = Math.min(
            ...packages.map((p) => p.price).filter((p) => p > 0),
            Infinity
          )

          return (
            <div
              key={product}
              className="glass-card relative overflow-hidden p-6 flex flex-col group hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              style={{ borderTop: `3px solid ${config.color}` }}
              onClick={() => onTabChange(config.tabId)}
            >
              {/* Product Logo + Name */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2 flex-shrink-0">
                  <Image
                    src={config.logo}
                    alt={product}
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="text-white/50 text-xs font-light">{config.nameTH}</p>
                  <h3 className="text-white font-semibold text-lg">{product}</h3>
                </div>
              </div>

              {/* Tagline */}
              <p className="text-white/70 text-sm font-light mb-4 leading-relaxed">
                {config.tagline}
              </p>

              {/* Starting price */}
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

              {/* Chips */}
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

              {/* CTA */}
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

      {/* Bundle Promo Banner */}
      <div
        className="rounded-2xl border p-6"
        style={{
          background: 'rgba(15,110,86,0.08)',
          borderColor: 'rgba(15,110,86,0.2)',
        }}
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎁</span>
              <h3 className="text-white font-semibold text-lg">โปรโมชันพิเศษ</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex items-start gap-2">
                <span className="text-[#4ade80] text-sm mt-0.5">✦</span>
                <div>
                  <p className="text-white text-sm font-medium">Super Combo</p>
                  <p className="text-white/50 text-xs">
                    Insite Pro + 360 Pro — ลด 10% หรือแถม 1 Onsite Training
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#4ade80] text-sm mt-0.5">✦</span>
                <div>
                  <p className="text-white text-sm font-medium">Kickstarter</p>
                  <p className="text-white/50 text-xs">
                    สัญญา 2 ปี — แถมฟรี Implementation & Training
                  </p>
                </div>
              </div>
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
    </div>
  )
}
