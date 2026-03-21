import type { PricingItem } from '@/types/pricing'
import PackageCard from './PackageCard'
import AddonSection from './AddonSection'
import TopupSection from './TopupSection'
import InfrastructureCard from './InfrastructureCard'
import EnterpriseMatrixCallout from './EnterpriseMatrixCallout'
import Image from 'next/image'

interface Props {
  items: PricingItem[]
  productName: string
  productColor: string
  productLogo: string
  isAdminOrBU?: boolean
}

export default function ProductTab({ items, productName, productColor, productLogo, isAdminOrBU }: Props) {
  const packages       = items.filter((i) => i.product === productName && i.type === 'Package')
  const addons         = items.filter((i) => i.product === productName && i.type === 'Add-on')
  const bundles        = items.filter((i) => i.product === productName && i.type === 'Bundle')
  const topups         = items.filter((i) => i.product === productName && i.type === 'Top-up')
  const infrastructure = items.filter((i) => i.product === productName && i.type === 'Infrastructure')

  const showEnterpriseMatrix =
    isAdminOrBU &&
    (productName === 'Builk Insite' || productName === 'Builk 360')

  return (
    <div className="space-y-10">
      {/* Section 1: Packages */}
      <section>
        {/* Product header — larger logo */}
        <div className="flex items-center gap-5 mb-7">
          <div
            className="rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255,255,255,0.08)',
              border: `1px solid ${productColor}30`,
              padding: '10px',
            }}
          >
            <Image
              src={productLogo}
              alt={productName}
              width={60}
              height={60}
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="text-white text-2xl font-semibold">{productName}</h2>
            <p className="text-white/50 text-sm font-light mt-0.5">เปรียบเทียบแพ็กเกจ</p>
          </div>
        </div>

        {packages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {packages.map((item) => (
              <PackageCard key={item.id} item={item} productColor={productColor} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <p className="text-white/40 text-sm italic">ยังไม่มีข้อมูลแพ็กเกจจาก Notion</p>
          </div>
        )}
      </section>

      {/* Enterprise Pricing Matrix (admin/bu_member only) */}
      {showEnterpriseMatrix && (
        <EnterpriseMatrixCallout productName={productName} />
      )}

      {/* Section 2: Add-ons & Bundles */}
      {(addons.length > 0 || bundles.length > 0) && (
        <section>
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <span style={{ color: productColor }}>+</span> Add-ons เสริมประสิทธิภาพ
          </h3>
          <AddonSection addons={addons} bundles={bundles} />
        </section>
      )}

      {/* Section 3: Top-ups */}
      {topups.length > 0 && (
        <section>
          <h3 className="text-white text-lg font-semibold mb-4">เติมเพิ่มเมื่อต้องการ</h3>
          <TopupSection topups={topups} />
        </section>
      )}

      {/* Section 4: Infrastructure (Enterprise Only) */}
      {infrastructure.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-white text-lg font-semibold">
              Enterprise Infrastructure
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-300">
              Enterprise Only
            </span>
          </div>
          <p className="text-white/45 text-sm font-light mb-5">
            ตัวเลือกสำหรับองค์กรที่ต้องการ Private Database แยกส่วนตัว
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {infrastructure.map((item) => (
              <InfrastructureCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
