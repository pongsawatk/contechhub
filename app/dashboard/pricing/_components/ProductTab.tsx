import Image from 'next/image'
import { isEnterprisePackage } from '@/lib/pricing-engine'
import { formatNumber } from '@/lib/pricing-utils'
import type { PricingItem } from '@/types/pricing'
import AddonSection from './AddonSection'
import EnterpriseMatrixCallout from './EnterpriseMatrixCallout'
import InfrastructureCard from './InfrastructureCard'
import PackageCard from './PackageCard'
import TopupSection from './TopupSection'

interface Props {
  items: PricingItem[]
  productName: string
  productColor: string
  productLogo: string
  isAdminOrBU?: boolean
}

export default function ProductTab({
  items,
  productName,
  productColor,
  productLogo,
  isAdminOrBU,
}: Props) {
  const packages = items.filter(
    (item) => item.product === productName && item.type === 'Package' && !item.isInfrastructure
  )
  const addons = items.filter((item) => item.product === productName && item.type === 'Add-on')
  const bundles = items.filter((item) => item.product === productName && item.type === 'Bundle')
  const topups = items.filter((item) => item.product === productName && item.type === 'Top-up')
  const infrastructure = items.filter((item) => item.product === productName && item.isInfrastructure)
  const mandatoryItems = items.filter(
    (item) => item.product === productName && item.isMandatoryImplementation
  )
  const onlineItem = mandatoryItems.find((item) => item.implementationMode === 'Online')
  const onsiteItem = mandatoryItems.find((item) => item.implementationMode === 'Onsite')
  const hasMandatoryImplementation = Boolean(onlineItem && onsiteItem)
  const hasEnterprisePackage = packages.some((item) => isEnterprisePackage(item))
  const enterpriseMatrixItem = packages.find((item) => item.showEnterpriseMatrix)

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-7 flex items-center gap-5">
          <div
            className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl"
            style={{
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
            <h2 className="text-2xl font-semibold text-white">{productName}</h2>
            <p className="mt-0.5 text-sm font-light text-white/50">เปรียบเทียบแพ็กเกจ</p>
          </div>
        </div>

        {packages.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {packages.map((item) => (
              <PackageCard key={item.id} item={item} productColor={productColor} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <p className="text-sm italic text-white/40">ยังไม่มีข้อมูลแพ็กเกจจาก Notion</p>
          </div>
        )}
      </section>

      {enterpriseMatrixItem && (
        <EnterpriseMatrixCallout
          item={enterpriseMatrixItem}
          isVisible={Boolean(isAdminOrBU && enterpriseMatrixItem.showEnterpriseMatrix)}
        />
      )}

      {hasMandatoryImplementation && (
        <section className="space-y-3">
          {hasEnterprisePackage && (
            <div className="flex justify-end">
              <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                ✅ Included in Package
              </span>
            </div>
          )}

          <div className="glass-card mb-6 border-l-4 border-amber-400/40 p-5">
            <h4 className="mb-3 text-sm font-medium text-white/70">ค่า Implementation บังคับครั้งแรก</h4>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <p className="mb-1 text-xs text-white/45">[Online]</p>
                <p className="font-semibold tabular-nums text-white">
                  {formatNumber(onlineItem!.price)} บาท
                </p>
                <p className="text-xs leading-relaxed text-white/35">
                  {onlineItem!.keyInclusions.join(' • ') || onlineItem!.notes}
                </p>
              </div>
              <div className="self-center text-white/20">หรือ</div>
              <div className="flex-1">
                <p className="mb-1 text-xs text-white/45">[Onsite]</p>
                <p className="font-semibold tabular-nums text-white">
                  {formatNumber(onsiteItem!.price)} บาท
                </p>
                <p className="text-xs leading-relaxed text-white/35">
                  {onsiteItem!.keyInclusions.join(' • ') || onsiteItem!.notes}
                </p>
                <p className="text-xs text-white/25">* ไม่รวมค่าเดินทาง</p>
              </div>
            </div>
            <div className="mt-3 border-t border-white/8 pt-3 text-xs text-amber-300/70">
              🎁 Kickstarter Offer: waive ค่านี้ทั้งหมด พร้อมลด 20% + แถม Training
            </div>
          </div>
        </section>
      )}

      {(addons.length > 0 || bundles.length > 0) && (
        <section>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <span style={{ color: productColor }}>+</span> Add-ons เสริมประสิทธิภาพ
          </h3>
          <AddonSection addons={addons} bundles={bundles} />
        </section>
      )}

      {topups.length > 0 && (
        <section>
          <h3 className="mb-4 text-lg font-semibold text-white">เติมเพิ่มเมื่อต้องการ</h3>
          <TopupSection topups={topups} />
        </section>
      )}

      {infrastructure.length > 0 && (
        <div className="mt-10">
          <div className="mb-4 flex items-center gap-3">
            <h3 className="text-lg font-semibold text-white">Enterprise Infrastructure</h3>
            <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-xs text-red-300">
              Enterprise Only
            </span>
          </div>
          <p className="mb-5 text-sm font-light text-white/45">
            ตัวเลือกสำหรับองค์กรที่ต้องการ Private Database แยกส่วนตัว
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {infrastructure.map((item) => (
              <InfrastructureCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
