'use client'

import Image from 'next/image'
import type { CalculatorInput, ProductSelection } from '@/types/calculator'

interface StepProductSelectProps {
  input: CalculatorInput
  onChange: (patch: Partial<CalculatorInput>) => void
}

const PRODUCTS = [
  {
    id: 'Builk Insite' as const,
    logo: '/logos/iNSITE_Logo.png',
    color: '#378ADD',
    tagline: 'บริหารโครงการ QC ต้นทุน แบบ Real-time',
    startingPrice: 7500,
  },
  {
    id: 'Builk 360' as const,
    logo: '/logos/builk360_Logo.png',
    color: '#1D9E75',
    tagline: 'ติดตามไซต์งานด้วยภาพ 360 องศา',
    startingPrice: 15000,
  },
  {
    id: 'Kwanjai' as const,
    logo: '/logos/Kwanjai_Logo.png',
    color: '#7F77DD',
    tagline: 'บริการหลังการขาย Warranty ผ่าน LINE',
    startingPrice: 0,
  },
]

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function StepProductSelect({ input, onChange }: StepProductSelectProps) {
  const selectedIds = new Set(input.selections.map((s) => s.product))

  const hasInsite = selectedIds.has('Builk Insite')
  const has360 = selectedIds.has('Builk 360')
  const showSuperComboHint = hasInsite && has360

  function toggle(productId: (typeof PRODUCTS)[number]['id']) {
    if (selectedIds.has(productId)) {
      // Remove
      onChange({
        selections: input.selections.filter((s) => s.product !== productId),
      })
    } else {
      // Add with empty selection
      const newSel: ProductSelection = {
        product: productId,
        packageId: '',
        packageName: '',
        packagePrice: 0,
        packageBilling: 'ราย ปี',
        addonIds: [],
        addons: [],
      }
      onChange({ selections: [...input.selections, newSel] })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-semibold text-base mb-1">เลือกสินค้า</h3>
        <p className="text-white/45 text-sm">เลือกผลิตภัณฑ์ที่ต้องการเสนอ (เลือกได้หลายรายการ)</p>
      </div>

      <div className="space-y-3">
        {PRODUCTS.map((product) => {
          const isSelected = selectedIds.has(product.id)
          return (
            <button
              key={product.id}
              onClick={() => toggle(product.id)}
              className="w-full text-left rounded-xl p-4 transition-all relative"
              style={{
                background: isSelected
                  ? hexToRgba(product.color, 0.12)
                  : 'rgba(10, 30, 70, 0.45)',
                border: isSelected
                  ? `1.5px solid ${hexToRgba(product.color, 0.55)}`
                  : '1px solid rgba(100, 220, 255, 0.12)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              {/* Checkmark */}
              <div
                className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all"
                style={
                  isSelected
                    ? {
                        background: hexToRgba(product.color, 0.85),
                        border: `1px solid ${hexToRgba(product.color, 0.9)}`,
                      }
                    : {
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }
                }
              >
                {isSelected && <span className="text-white text-[10px]">✓</span>}
              </div>

              <div className="flex items-center gap-3 pr-8">
                {/* Logo */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{ background: hexToRgba(product.color, 0.15) }}
                >
                  <Image
                    src={product.logo}
                    alt={product.id}
                    width={32}
                    height={32}
                    className="object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.75)' }}
                  >
                    {product.id}
                  </p>
                  <p className="text-white/45 text-xs mt-0.5 truncate">{product.tagline}</p>
                </div>

                {/* Starting price */}
                <div className="text-right flex-shrink-0">
                  {product.startingPrice > 0 ? (
                    <p className="text-white/50 text-xs">
                      เริ่มต้น{' '}
                      <span className="text-white/75 font-medium">
                        {product.startingPrice.toLocaleString('th-TH')}
                      </span>{' '}
                      บ./ปี
                    </p>
                  ) : (
                    <p className="text-white/40 text-xs">ติดต่อทีมขาย</p>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Super Combo hint */}
      {showSuperComboHint && (
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
          style={{
            background: 'rgba(15, 110, 86, 0.12)',
            border: '1px solid rgba(15, 110, 86, 0.35)',
          }}
        >
          <span className="text-base mt-0.5">🎁</span>
          <p className="text-emerald-200 text-sm">
            เลือกทั้งสองนี้ สามารถรับส่วนลด{' '}
            <span className="font-semibold">Super Combo 10%</span>{' '}
            ได้โดยอัตโนมัติ เมื่อเลือก Professional ทั้งคู่
          </p>
        </div>
      )}
    </div>
  )
}
