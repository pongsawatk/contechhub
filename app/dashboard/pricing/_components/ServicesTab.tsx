import type { PricingItem } from '@/types/pricing'
import { formatNumber, formatBilling } from '@/lib/pricing-utils'

interface Props {
  items: PricingItem[]
}

export default function ServicesTab({ items }: Props) {
  const services = items.filter((i) => i.type === 'Service')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-white text-2xl font-semibold mb-1">Professional Services</h2>
        <p className="text-white/50 text-sm font-light">
          บริการเสริมโดยทีม Contech — Implementation, Training และ Customization
        </p>
      </div>

      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((item) => (
            <div
              key={item.id}
              className="glass-card p-5 flex justify-between items-start gap-4"
            >
              {/* Left: info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold text-base mb-1">{item.packageName}</h4>
                {item.targetProfile && (
                  <p className="text-white/55 text-sm mb-2">{item.targetProfile}</p>
                )}
                {item.keyInclusions.length > 0 && (
                  <ul className="space-y-1 mb-2">
                    {item.keyInclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                        <span className="text-[#4ade80] text-xs mt-0.5 flex-shrink-0">✓</span>
                        {inc}
                      </li>
                    ))}
                  </ul>
                )}
                {item.notes && (
                  <p className="text-white/[0.35] text-xs mt-1 leading-relaxed">{item.notes}</p>
                )}
              </div>

              {/* Right: price */}
              <div className="text-right flex-shrink-0">
                {item.price > 0 ? (
                  <>
                    <p className="text-[#4ade80] font-semibold text-xl tabular-nums">
                      {formatNumber(item.price)}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5">{formatBilling(item.billing)}</p>
                  </>
                ) : (
                  <p className="text-[#4ade80] font-semibold text-base">ติดต่อฝ่ายขาย</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 text-center">
          <p className="text-white/40 text-sm">ยังไม่มีข้อมูล Professional Services จาก Notion</p>
        </div>
      )}

      {/* Note */}
      <div
        className="p-4 rounded-xl border"
        style={{
          background: 'rgba(83,74,183,0.06)',
          borderColor: 'rgba(83,74,183,0.2)',
        }}
      >
        <p className="text-white/50 text-sm">
          💡 <span className="text-white/70 font-medium">หมายเหตุ</span>{' '}
          ราคาบริการขึ้นอยู่กับ scope และระยะเวลา
          ติดต่อทีม Sales เพื่อขอใบเสนอราคาที่เหมาะกับโครงการของคุณ
        </p>
      </div>
    </div>
  )
}
