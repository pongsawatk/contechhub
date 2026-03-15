interface Props {
  effectiveDateNote?: string
}

export default function PricingFooter({ effectiveDateNote }: Props) {
  return (
    <div
      className="mt-12 p-5 rounded-xl text-center border border-white/[0.06]"
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      <p className="text-white/40 text-sm leading-relaxed">
        ราคาทั้งหมดไม่รวม VAT 7%
        <span className="mx-2 text-white/20">·</span>
        ราคามีผล ณ มกราคม 2026
        <span className="mx-2 text-white/20">·</span>
        ขอใบเสนอราคาได้ที่ทีม Sales
      </p>
      {effectiveDateNote && (
        <p className="text-white/25 text-xs mt-1">
          ข้อมูลอัปเดตล่าสุดจาก Notion · Revalidate ทุก 1 ชั่วโมง
        </p>
      )}
    </div>
  )
}
