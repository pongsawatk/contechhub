import Image from 'next/image'
import type { PricingItem } from '@/types/pricing'
import PackageCard from './PackageCard'
import AddonSection from './AddonSection'
import TopupSection from './TopupSection'

interface Props {
  items: PricingItem[]
  productName: string
  productColor: string
  productLogo: string
}

export default function ProductTab({ items, productName, productColor, productLogo }: Props) {
  const packages = items.filter((i) => i.type === 'Package')
  const addons = items.filter((i) => i.type === 'Add-on')
  const bundles = items.filter((i) => i.type === 'Bundle')
  const topups = items.filter((i) => i.type === 'Top-up')

  return (
    <div className="space-y-10">
      {/* Section 1: Packages */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2 flex-shrink-0">
            <Image
              src={productLogo}
              alt={productName}
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="text-white text-2xl font-semibold">{productName}</h2>
            <p className="text-white/50 text-sm font-light">เปรียบเทียบแพ็กเกจ</p>
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

      {/* Section 2: Add-ons & Bundles */}
      {(addons.length > 0 || bundles.length > 0) && (
        <section>
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <span style={{ color: productColor }}>+</span> Add-ons เสริมประสิทธิภาพ
          </h3>
          <AddonSection addons={addons} bundles={bundles} productColor={productColor} />
        </section>
      )}

      {/* Section 3: Top-ups */}
      {topups.length > 0 && (
        <section>
          <h3 className="text-white text-lg font-semibold mb-4">เติมเพิ่มเมื่อต้องการ</h3>
          <TopupSection topups={topups} />
        </section>
      )}
    </div>
  )
}
