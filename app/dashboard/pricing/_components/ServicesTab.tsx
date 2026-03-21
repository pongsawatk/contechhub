import { formatBilling, formatNumber } from '@/lib/pricing-utils'
import type { PricingItem } from '@/types/pricing'

interface Props {
  items: PricingItem[]
}

const SERVICE_AREAS = [
  {
    title: 'Custom Dashboard & Report',
    icon: '📊',
    description:
      'ออกแบบ Dashboard ผู้บริหาร เชื่อมข้อมูลจาก Insite/360 เข้า Power BI หรือสร้าง Report อัตโนมัติตามโจทย์ธุรกิจ',
    example: 'เช่น: Financial S-Curve, Manpower Analysis, Defect Heatmap',
    borderColor: 'rgba(59,130,246,0.45)',
  },
  {
    title: 'Workflow Automation',
    icon: '⚡',
    description:
      'สร้างระบบ Automation ข้ามเครื่องมือด้วย n8n - Auto-Alert, Auto-Report, LINE Bot แจ้งเตือน',
    example: 'เช่น: สรุปงานประจำวันส่ง Email ทุกเช้า / แจ้งเตือน Budget Overrun เข้า LINE',
    borderColor: 'rgba(250,204,21,0.45)',
  },
  {
    title: 'API & System Integration',
    icon: '🔗',
    description:
      'เชื่อมต่อ Builk กับระบบ ERP, CRM หรือ 3rd Party ที่องค์กรใช้อยู่ ผ่าน API / Middleware',
    example: 'เช่น: เชื่อม Pojjaman ↔ Insite, BI Pipeline, IoT Sensors',
    borderColor: 'rgba(74,222,128,0.45)',
  },
  {
    title: 'AI Chatbot & Assistant',
    icon: '🤖',
    description:
      'สร้าง AI Agent ที่ตอบคำถามสเปควัสดุ, สรุปรายงาน, หรือทำงานซ้ำซ้อนแทนคน ด้วย Vibe Coding',
    example: 'เช่น: Knowledge Base Chatbot / AI สรุปประชุม / Smart QC Classifier',
    borderColor: 'rgba(192,132,252,0.45)',
  },
] as const

const ENGAGEMENT_MODELS = [
  {
    title: 'Quick Win',
    icon: '⚡',
    duration: '1-5 วัน',
    description: 'สำหรับงานที่ต้องการผลเร็ว - Automation Flow เดียว หรือ Dashboard ง่ายๆ',
    examples: [
      'Auto-Report ส่ง Email ทุกเช้า',
      'LINE Bot แจ้งเตือนง่ายๆ',
      'Dashboard 1 หน้า',
    ],
    borderColor: 'rgba(74,222,128,0.45)',
  },
  {
    title: 'Project-based',
    icon: '📋',
    duration: '1-3 เดือน',
    description: 'สำหรับงาน Integration หรือ AI Solution ที่ต้องการ Scope ชัดเจน',
    examples: [
      'ระบบเชื่อม ERP ↔ Site',
      'AI Chatbot สำหรับหน้างาน',
      'Custom BI Dashboard',
    ],
    borderColor: 'rgba(96,165,250,0.45)',
  },
  {
    title: 'Transformation Program',
    icon: '🚀',
    duration: '3 เดือนขึ้นไป',
    description: 'สำหรับองค์กรที่ต้องการปรับกระบวนการทำงานทั้งระบบ',
    examples: [
      'Digital Workflow ครบวงจร',
      'AI-Ready Organization',
      'Data Strategy & Implementation',
    ],
    borderColor: 'rgba(168,85,247,0.45)',
  },
] as const

type ServiceCategory = NonNullable<PricingItem['serviceCategory']>

const GROUPS: Array<{
  category: ServiceCategory
  title: string
  accentColor: string
  note?: string
}> = [
  {
    category: 'Standard Implementation',
    title: 'A. Standard Implementation Fee',
    accentColor: '#60a5fa',
  },
  {
    category: 'Automation & AI',
    title: 'B. Automation & AI Development Fee',
    accentColor: '#c084fc',
    note: 'ไม่จำเป็นต้องซื้อ Product Builk ก่อน - รับงานทุกรูปแบบ',
  },
  {
    category: 'Infrastructure',
    title: 'C. Infrastructure Fee (Annual)',
    accentColor: '#fb923c',
    note: 'จำเป็นสำหรับ n8n Automation หรือ AI ที่ Run เป็น Production',
  },
]

function formatTablePrice(item: PricingItem): string {
  return item.price > 0 ? `${formatNumber(item.price)} บาท` : 'ติดต่อฝ่ายขาย'
}

function getItemNote(item: PricingItem): string {
  return [item.notes, item.targetProfile, item.keyInclusions.join(' • ')].filter(Boolean).join(' | ')
}

export default function ServicesTab({ items }: Props) {
  const serviceItems = items.filter(
    (item) => item.type === 'Service' || item.type === 'Transformation Service'
  )

  const itemsByCategory = serviceItems.reduce<Record<string, PricingItem[]>>((acc, item) => {
    const category = item.serviceCategory ?? 'Uncategorized'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {})

  const standardItems = itemsByCategory['Standard Implementation'] ?? []
  const standardTableItems = standardItems.filter((item) => !item.isMandatoryImplementation)
  const mandatoryPairs = Array.from(
    new Set(
      standardItems.filter((item) => item.isMandatoryImplementation).map((item) => item.product)
    )
  )
    .map((product) => {
      const productItems = standardItems.filter(
        (item) => item.product === product && item.isMandatoryImplementation
      )

      return {
        product,
        label: product.replace('Builk ', ''),
        onlineItem: productItems.find((item) => item.implementationMode === 'Online') ?? null,
        onsiteItem: productItems.find((item) => item.implementationMode === 'Onsite') ?? null,
      }
    })
    .filter((pair) => pair.onlineItem || pair.onsiteItem)

  return (
    <div className="space-y-10">
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold text-white">Contech Transformation Service</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-white/55">
          บริการที่ปรึกษาและพัฒนาระบบดิจิทัลครบวงจร - ไม่จำกัดว่าต้องซื้อ Product ก่อน
          รองรับได้ตั้งแต่งาน 1 วันจนถึง Transformation Program หลายเดือน
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4ade80]">5.1</span>
          <h3 className="text-lg font-semibold text-white">บริการ 4 ด้านหลัก</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SERVICE_AREAS.map((area) => (
            <div
              key={area.title}
              className="glass-card border-l-4 p-5"
              style={{ borderLeftColor: area.borderColor }}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl leading-none">{area.icon}</div>
                <div>
                  <h4 className="mb-2 font-semibold text-white">{area.title}</h4>
                  <p className="text-sm leading-relaxed text-white/65">{area.description}</p>
                  <p className="mt-3 text-xs leading-relaxed text-white/35">{area.example}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4ade80]">5.2</span>
          <h3 className="text-lg font-semibold text-white">ค่าบริการ</h3>
        </div>

        {GROUPS.map((group) => {
          const groupItems =
            group.category === 'Standard Implementation'
              ? standardTableItems
              : itemsByCategory[group.category] ?? []

          return (
            <div key={group.category} className="glass-card space-y-5 p-5">
              <div className="border-l-4 pl-4" style={{ borderLeftColor: group.accentColor }}>
                <h4 className="text-lg font-semibold text-white">{group.title}</h4>
              </div>

              {group.category === 'Standard Implementation' && mandatoryPairs.length > 0 && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-medium text-amber-100">
                        ค่า Implementation บังคับครั้งแรก (First-time)
                      </p>
                      <span className="text-sm text-amber-200/80">
                        🎁 Kickstarter Offer: waive ค่านี้ทั้งหมด + ลด 20% + แถม Training
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {mandatoryPairs.map((pair) => {
                      const entries = [pair.onlineItem, pair.onsiteItem].filter(
                        (item): item is PricingItem => Boolean(item)
                      )

                      return (
                        <div
                          key={pair.product}
                          className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                        >
                          <h5 className="font-semibold text-white">
                            First-time Implementation - {pair.label}
                          </h5>
                          <p className="mt-1 text-xs text-amber-200/75">
                            * ค่าบริการบังคับครั้งแรก
                          </p>

                          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {entries.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-xl border border-white/8 bg-black/10 p-4"
                              >
                                <p className="mb-2 text-xs text-white/45">
                                  [{item.implementationMode ?? 'N/A'}]
                                </p>
                                <p className="font-semibold tabular-nums text-white">
                                  {formatTablePrice(item)}
                                </p>
                                <p className="mt-1 text-xs text-white/40">
                                  {formatBilling(item.billing)}
                                </p>
                                {item.keyInclusions.length > 0 && (
                                  <p className="mt-2 text-xs leading-relaxed text-white/35">
                                    {item.keyInclusions.join(' • ')}
                                  </p>
                                )}
                                {item.implementationMode === 'Onsite' && (
                                  <p className="mt-2 text-xs text-white/25">* ไม่รวมค่าเดินทาง</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-white/8 text-left text-white/45">
                      <th className="pb-3 font-medium">รายการ</th>
                      <th className="pb-3 font-medium">ราคา</th>
                      <th className="pb-3 font-medium">หน่วย</th>
                      <th className="pb-3 font-medium">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupItems.length > 0 ? (
                      groupItems.map((item) => (
                        <tr key={item.id} className="border-b border-white/5 align-top">
                          <td className="py-3 pr-4">
                            <p className="font-medium text-white">{item.packageName}</p>
                            {item.isMandatoryImplementation && (
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/65">
                                  [{item.implementationMode ?? 'N/A'}]
                                </span>
                                <span className="text-[11px] text-amber-200/75">
                                  * ค่าบริการบังคับครั้งแรก
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 pr-4 tabular-nums text-white">
                            {formatTablePrice(item)}
                          </td>
                          <td className="py-3 pr-4 text-white/65">
                            {item.quantityUnit || formatBilling(item.billing) || '-'}
                          </td>
                          <td className="py-3 leading-relaxed text-white/45">
                            {getItemNote(item) || '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-white/35">
                          ยังไม่มีข้อมูลในหมวดนี้จาก Notion
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {group.note && <p className="text-sm leading-relaxed text-white/45">{group.note}</p>}
            </div>
          )
        })}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4ade80]">5.3</span>
          <h3 className="text-lg font-semibold text-white">รูปแบบการทำงานร่วมกัน</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {ENGAGEMENT_MODELS.map((model) => (
            <div
              key={model.title}
              className="glass-card border-l-4 p-5"
              style={{ borderLeftColor: model.borderColor }}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="mb-2 text-2xl leading-none">{model.icon}</p>
                  <h4 className="font-semibold text-white">{model.title}</h4>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65">
                  {model.duration}
                </span>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-white/65">{model.description}</p>

              <div className="space-y-2">
                {model.examples.map((example) => (
                  <div key={example} className="flex items-start gap-2 text-sm text-white/50">
                    <span className="mt-1 text-xs text-[#4ade80]">•</span>
                    <span>{example}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-5 py-4">
          <p className="text-sm leading-relaxed text-amber-100/90">
            💡 ไม่จำเป็นต้องรอรอบสัญญาหรือซื้อ Product เพิ่ม - เริ่มต้นด้วย Discovery Call
            (ฟรี) เพื่อประเมิน Scope และ ROI
          </p>
        </div>
      </section>
    </div>
  )
}
