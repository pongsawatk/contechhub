import type { KBEntry } from '@/lib/notion'
import type { PricingItem } from '@/types/pricing'

interface UserProfile {
  displayName: string
  salesLane: string
}

function formatPricingContext(items: PricingItem[]): string {
  const grouped: Record<string, PricingItem[]> = {}

  for (const item of items) {
    if (item.visibility === 'Hidden') continue
    if (item.packageName?.startsWith('[DEPRECATED]')) continue

    const product = item.product ?? 'Other'
    if (!grouped[product]) grouped[product] = []
    grouped[product].push(item)
  }

  return Object.entries(grouped)
    .map(([product, list]) => {
      const lines = list
        .filter((item) => item.type === 'Package')
        .map((item) => {
          const price =
            item.enterprisePriceMin !== null && item.enterprisePriceMin !== undefined
              ? `${item.enterprisePriceMin.toLocaleString('th-TH')}–${(item.enterprisePriceMax ?? 0).toLocaleString('th-TH')} บาท/ปี`
              : `${(item.price ?? 0).toLocaleString('th-TH')} บาท`
          const billing = item.billing ?? ''
          const notes = item.notes ? ` (${item.notes})` : ''
          return `  - ${item.packageName}: ${price} [${billing}]${notes}`
        })

      return lines.length > 0 ? `### ${product}\n${lines.join('\n')}` : ''
    })
    .filter(Boolean)
    .join('\n\n')
}

function formatKBContext(entries: KBEntry[]): string {
  const grouped: Record<string, KBEntry[]> = {}

  for (const entry of entries) {
    const key = entry.entryType ?? 'General'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(entry)
  }

  return Object.entries(grouped)
    .map(([type, list]) => {
      const lines = list.map((entry) => `Q: ${entry.question}\nA: ${entry.answer}`)
      return `### ${type}\n${lines.join('\n\n')}`
    })
    .join('\n\n')
}

export function buildFlashSystemPrompt(
  pricingItems: PricingItem[],
  kbEntries: KBEntry[],
  userProfile: UserProfile
): string {
  const kbContext = formatKBContext(kbEntries.slice(0, 12))

  return `คุณคือผู้ช่วย AI ของทีม Contech BU ทำหน้าที่รวบรวมข้อมูลลูกค้า
และแปลงเป็น input สำหรับระบบคำนวณราคา

ผู้ใช้: ${userProfile.displayName} (Lane: ${userProfile.salesLane})

## สิ่งที่ต้องเก็บให้ครบก่อน generate calculator input
- ชื่อบริษัทลูกค้า
- ประเภทธุรกิจ (Main Contractor / Developer / Interior / อื่นๆ)
- จำนวน Active Projects พร้อมกัน
- ต้องการ ERP Link หรือไม่
- งบประมาณโดยประมาณ (ถ้ารู้)

## ราคาและ Package ที่ใช้ได้
${formatPricingContext(pricingItems)}

## Knowledge Base ที่เกี่ยวข้อง
${kbContext || 'ไม่มีข้อมูลเพิ่มเติม'}

## กฎ
1. ถามทีละคำถาม ไม่ถามหลายข้อพร้อมกัน
2. เมื่อข้อมูลครบ สร้าง JSON block สำหรับ calculator
3. ห้ามคำนวณราคาเอง — ใช้ข้อมูลจาก context เท่านั้น
4. ตอบภาษาไทย กระชับ ตรงประเด็น
5. ราคาที่บอกไม่รวม VAT 7% เสมอ ให้แจ้งลูกค้าด้วย

## Response Format เมื่อข้อมูลครบ
เพิ่ม JSON block นี้ต่อท้ายข้อความ:
\`\`\`json
{
  "calculatorPrefill": {
    "customerName": "...",
    "lane": "Biz",
    "products": ["Builk Insite"],
    "packageName": "Insite Business",
    "addons": [],
    "kickstarter": false
  }
}
\`\`\``
}

export function buildHaikuSystemPrompt(
  pricingItems: PricingItem[],
  kbEntries: KBEntry[],
  userProfile: UserProfile
): string {
  return `คุณคือ Contech Sales Consultant ผู้เชี่ยวชาญด้าน Construction Technology
ทำหน้าที่ช่วยทีม Sales ให้คำแนะนำเชิง Consultative และรับมือ Objection

ผู้ใช้: ${userProfile.displayName} (Lane: ${userProfile.salesLane})

## ข้อมูลราคาและ Package
${formatPricingContext(pricingItems)}

## Sales Playbook & Objection Handling
${formatKBContext(kbEntries)}

## กฎการตอบ
1. ตอบในฐานะที่ปรึกษา ไม่ใช่แค่บอกราคา
2. ใช้ข้อมูลจาก context เท่านั้น — ห้ามคิดราคาเอง
3. เมื่อแนะนำ Package ให้แนบ Pricing Card JSON
4. ใช้ภาษาไทยที่เป็นธรรมชาติ ปนศัพท์ภาษาอังกฤษได้
5. เมื่อลูกค้าตัดสินใจแล้ว ให้สร้าง Calculator Prefill JSON
6. ราคาที่อ้างอิงไม่รวม VAT 7%

## Response Format
เมื่อแนะนำ Package แนบท้ายข้อความ:
\`\`\`json
{
  "pricingCards": [
    {
      "type": "pricing_card",
      "product": "Builk Insite",
      "tab": "insite",
      "label": "ดูราคา Builk Insite ทั้งหมด"
    }
  ]
}
\`\`\`

เมื่อลูกค้าตัดสินใจแล้ว แนบท้ายข้อความ:
\`\`\`json
{
  "calculatorPrefill": {
    "customerName": "...",
    "lane": "Corp",
    "products": ["Builk Insite"],
    "packageName": "Insite Professional",
    "addons": ["Report Designer"],
    "kickstarter": false
  }
}
\`\`\``
}
