'use client'

import type { CalculatorInput, LaneType } from '@/types/calculator'

interface StepCustomerInfoProps {
  input: CalculatorInput
  onChange: (patch: Partial<CalculatorInput>) => void
}

const LANE_OPTIONS: {
  value: LaneType
  label: string
  description: string
}[] = [
  {
    value: 'Biz',
    label: 'Biz',
    description: 'ตัดสินใจเร็ว (1–2 สัปดาห์) · เน้นจำนวน Volume Game',
  },
  {
    value: 'Corp',
    label: 'Corp',
    description: 'Buying Process ซับซ้อน (1–3 เดือน) · เน้นมูลค่าต่อ Deal',
  },
]

export default function StepCustomerInfo({ input, onChange }: StepCustomerInfoProps) {
  const selectedLane = LANE_OPTIONS.find((l) => l.value === input.lane)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-semibold text-base mb-1">ข้อมูลลูกค้า</h3>
        <p className="text-white/45 text-sm">กรอกข้อมูลลูกค้าสำหรับใบเสนอราคา</p>
      </div>

      {/* Customer Name */}
      <div className="space-y-2">
        <label className="block text-white/75 text-sm font-medium">
          ชื่อลูกค้า / บริษัท <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          className="glass-input w-full px-4 py-3 text-sm placeholder:text-white/25 transition-all"
          placeholder="เช่น บจก. สยามก่อสร้าง"
          value={input.customerName}
          onChange={(e) => onChange({ customerName: e.target.value })}
        />
      </div>

      {/* Lane Toggle */}
      <div className="space-y-3">
        <label className="block text-white/75 text-sm font-medium">เลือก Lane</label>
        <div className="flex gap-3">
          {LANE_OPTIONS.map((lane) => {
            const isActive = input.lane === lane.value
            return (
              <button
                key={lane.value}
                onClick={() => onChange({ lane: lane.value })}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all"
                style={
                  isActive
                    ? {
                        background: 'rgba(15, 110, 86, 0.3)',
                        border: '1px solid rgba(15, 110, 86, 0.55)',
                        color: '#fff',
                      }
                    : {
                        background: 'rgba(56, 189, 248, 0.06)',
                        border: '1px solid rgba(56, 189, 248, 0.18)',
                        color: 'rgba(255,255,255,0.55)',
                      }
                }
              >
                {lane.label}
                {isActive && (
                  <span className="ml-2 text-xs opacity-60">
                    {lane.value === 'Biz' ? '— SME / ผู้รับเหมา' : '— Developer / Main Con'}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Lane description */}
        {selectedLane && (
          <div
            className="px-4 py-2.5 rounded-lg text-sm"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <span className="text-white/50">{selectedLane.description}</span>
          </div>
        )}
      </div>
    </div>
  )
}
