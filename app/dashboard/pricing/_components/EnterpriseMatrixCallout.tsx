'use client'

import { useState } from 'react'

interface Props {
  productName: string
}

const INSITE_MATRIX = {
  title: 'Insite Enterprise',
  anchor: '450,000',
  rows: [
    { label: 'ราคา', base: '400,000 บาท/ปี', premium: '500,000 บาท/ปี' },
    { label: 'QBR', base: 'Quarterly', premium: 'Monthly Executive' },
    { label: 'Database', base: 'Shared Cloud', premium: 'Private DB (Setup waived)' },
    { label: 'Support SLA', base: '1 วันทำการ', premium: '4 ชั่วโมง' },
  ],
  note: 'Sales anchor เริ่มที่ 450,000 บาท เสมอ',
}

const MATRIX_360 = {
  title: '360 Enterprise',
  anchor: '340,000',
  rows: [
    { label: 'ราคา', base: '300,000 บาท/ปี', premium: '380,000 บาท/ปี' },
    { label: 'Pin Pool', base: '15,000 Pins/ปี', premium: '20,000 Pins/ปี' },
    { label: 'MS-Teams', base: 'Add-on แยก', premium: '✅ Included' },
    { label: 'Drone Footage', base: 'Add-on แยก', premium: '✅ Included' },
    { label: 'QBR', base: 'Quarterly', premium: 'Monthly Executive' },
    { label: 'Support SLA', base: '1 วันทำการ', premium: '4 ชั่วโมง' },
  ],
  note: 'Sales anchor เริ่มที่ 340,000 บาท — ลูกค้าใช้ Teams/Drone → เสนอ 380k ทันที',
}

export default function EnterpriseMatrixCallout({ productName }: Props) {
  const [open, setOpen] = useState(false)
  const data = productName === 'Builk Insite' ? INSITE_MATRIX : MATRIX_360

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(20, 10, 5, 0.55)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(217, 119, 6, 0.35)',
        borderLeft: '3px solid #d97706',
      }}
    >
      {/* Header / Toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-amber-500/5"
      >
        <div className="flex items-center gap-3">
          <span className="text-base">📊</span>
          <span className="text-amber-300 font-semibold text-sm">
            Enterprise Pricing Matrix — {data.title}
          </span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(234, 88, 12, 0.15)', color: '#fb923c', border: '1px solid rgba(234,88,12,0.3)' }}
          >
            🔒 Internal Only
          </span>
        </div>
        <span className="text-amber-500/70 text-sm transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>

      {/* Collapsible matrix */}
      {open && (
        <div className="px-5 pb-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-white/40 text-xs font-medium text-left py-2 pr-6 w-1/3">ตัวแปร</th>
                  <th className="text-white/70 text-xs font-semibold text-center py-2 px-4">
                    <span className="px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      Base
                    </span>
                  </th>
                  <th className="text-amber-300 text-xs font-semibold text-center py-2 px-4">
                    <span className="px-2 py-1 rounded-lg" style={{ background: 'rgba(251,191,36,0.12)' }}>
                      Premium
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, i) => (
                  <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="text-white/50 text-xs py-2.5 pr-6">{row.label}</td>
                    <td className="text-white/75 text-xs text-center py-2.5 px-4">{row.base}</td>
                    <td className="text-amber-200 text-xs text-center py-2.5 px-4 font-medium">{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Anchor note */}
          <div
            className="mt-4 flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs"
            style={{ background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.25)' }}
          >
            <span>🎯</span>
            <p className="text-amber-200/80 leading-relaxed">
              <span className="font-semibold text-amber-300">Sales Anchor:</span>{' '}
              {data.note}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
