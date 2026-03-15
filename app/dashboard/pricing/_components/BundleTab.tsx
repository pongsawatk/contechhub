import type { PricingItem } from '@/types/pricing'
import { formatNumber, formatBilling } from '@/lib/pricing-utils'

interface Props {
  items: PricingItem[]
}

export default function BundleTab({ items }: Props) {
  const specialBundles = items.filter(
    (i) => i.product === 'Bundle' && i.type === 'Bundle'
  )
  const services = items.filter((i) => i.type === 'Service')
  const infrastructure = items.filter(
    (i) =>
      i.type === 'Package' &&
      (i.packageName.toLowerCase().includes('private') ||
        i.packageName.toLowerCase().includes('database') ||
        i.packageName.toLowerCase().includes('on-premise') ||
        i.packageName.toLowerCase().includes('cloud'))
  )

  const isEmpty =
    specialBundles.length === 0 && services.length === 0 && infrastructure.length === 0

  return (
    <div className="space-y-10">
      {/* Section 1: Special Bundles */}
      {specialBundles.length > 0 && (
        <section>
          <h2 className="text-white text-2xl font-semibold mb-1">บันเดิลพิเศษ</h2>
          <p className="text-white/50 text-sm font-light mb-6">
            โปรโมชันสำหรับลูกค้าที่ใช้หลายผลิตภัณฑ์
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specialBundles.map((bundle) => (
              <div
                key={bundle.id}
                className="p-6 rounded-2xl border flex flex-col gap-3"
                style={{
                  background: 'rgba(15,110,86,0.08)',
                  borderColor: 'rgba(15,110,86,0.25)',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{bundle.packageName}</h3>
                    {bundle.targetProfile && (
                      <p className="text-white/50 text-sm mt-1">{bundle.targetProfile}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    {bundle.price > 0 ? (
                      <>
                        <p className="text-[#4ade80] font-semibold text-lg tabular-nums">
                          {formatNumber(bundle.price)} บาท
                        </p>
                        <p className="text-white/40 text-xs">{formatBilling(bundle.billing)}</p>
                      </>
                    ) : (
                      <p className="text-[#4ade80] font-semibold">ติดต่อฝ่ายขาย</p>
                    )}
                  </div>
                </div>
                {bundle.keyInclusions.length > 0 && (
                  <ul className="space-y-1.5">
                    {bundle.keyInclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                        <span className="text-[#4ade80] text-xs mt-0.5 flex-shrink-0">✓</span>
                        {inc}
                      </li>
                    ))}
                  </ul>
                )}
                {bundle.notes && (
                  <p className="text-[#EF9F27] text-xs border-t border-white/5 pt-2">
                    {bundle.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 2: Professional Services */}
      {services.length > 0 && (
        <section>
          <h2 className="text-white text-2xl font-semibold mb-1">Professional Services</h2>
          <p className="text-white/50 text-sm font-light mb-6">บริการเสริมโดยทีม Contech</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map((item) => (
              <div
                key={item.id}
                className="glass-card flex justify-between items-center gap-4 p-5"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium">{item.packageName}</h4>
                  {item.targetProfile && (
                    <p className="text-white/50 text-sm mt-0.5">{item.targetProfile}</p>
                  )}
                  {item.notes && (
                    <p className="text-white/[0.35] text-xs mt-1">{item.notes}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  {item.price > 0 ? (
                    <>
                      <p className="text-[#4ade80] font-semibold text-lg tabular-nums">
                        {formatNumber(item.price)}
                      </p>
                      <p className="text-white/40 text-xs">{formatBilling(item.billing)}</p>
                    </>
                  ) : (
                    <p className="text-[#4ade80] font-semibold">ติดต่อฝ่ายขาย</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 3: Infrastructure */}
      {infrastructure.length > 0 && (
        <section>
          <h2 className="text-white text-2xl font-semibold mb-1">
            Private Database & Infrastructure
          </h2>
          <p className="text-white/50 text-sm font-light mb-6">
            ตัวเลือกสำหรับองค์กรที่ต้องการ Dedicated Infrastructure
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {infrastructure.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-2xl border flex flex-col gap-3"
                style={{
                  background: 'rgba(83,74,183,0.08)',
                  borderColor: 'rgba(83,74,183,0.25)',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{item.packageName}</h3>
                    {item.targetProfile && (
                      <p className="text-white/50 text-sm mt-1">{item.targetProfile}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    {item.price > 0 ? (
                      <>
                        <p className="text-[#4ade80] font-semibold text-lg tabular-nums">
                          {formatNumber(item.price)} บาท
                        </p>
                        <p className="text-white/40 text-xs">{formatBilling(item.billing)}</p>
                      </>
                    ) : (
                      <p className="text-[#4ade80] font-semibold">ติดต่อฝ่ายขาย</p>
                    )}
                  </div>
                </div>
                {item.keyInclusions.length > 0 && (
                  <ul className="space-y-1.5">
                    {item.keyInclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                        <span className="text-[#4ade80] text-xs mt-0.5 flex-shrink-0">✓</span>
                        {inc}
                      </li>
                    ))}
                  </ul>
                )}
                {item.notes && (
                  <p className="text-white/40 text-xs border-t border-white/5 pt-2">{item.notes}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="glass-card p-16 text-center">
          <p className="text-white/40 text-sm">ยังไม่มีข้อมูลบันเดิลจาก Notion</p>
        </div>
      )}
    </div>
  )
}
