'use client'

import Image from 'next/image'
import type { CalculatorInput, ProductSelection, TransformationQuote } from '@/types/calculator'

interface StepProductSelectProps {
  input: CalculatorInput
  onChange: (patch: Partial<CalculatorInput>) => void
}

const PRODUCTS = [
  {
    id: 'Builk Insite' as const,
    logo: '/logos/iNSITE_Logo.png',
    color: '#378ADD',
    tagline: 'Real-time project quality and cost control',
    startingPrice: 7500,
  },
  {
    id: 'Builk 360' as const,
    logo: '/logos/builk360_Logo.png',
    color: '#1D9E75',
    tagline: '360 site progress visibility for every project',
    startingPrice: 15000,
  },
  {
    id: 'Kwanjai' as const,
    logo: '/logos/Kwanjai_Logo.png',
    color: '#7F77DD',
    tagline: 'After-sales warranty support through LINE',
    startingPrice: 0,
  },
]

const TRANSFORMATION = {
  id: 'transformation' as const,
  icon: '🚀',
  color: '#a78bfa',
  name: 'Transformation Service',
  description: 'ออกแบบและพัฒนาระบบดิจิทัล — ไม่จำเป็นต้องซื้อ Product ก่อน',
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const EMPTY_TRANSFORMATION_QUOTE: TransformationQuote = {
  projectName: '',
  engagementModel: '',
  services: [],
}

export default function StepProductSelect({ input, onChange }: StepProductSelectProps) {
  const selectedIds = new Set(input.selections.map((selection) => selection.product))
  const isTransformation = input.transformationQuote !== undefined

  const hasInsite = selectedIds.has('Builk Insite')
  const has360 = selectedIds.has('Builk 360')
  const showSuperComboHint = hasInsite && has360 && !isTransformation

  function toggle(productId: (typeof PRODUCTS)[number]['id']) {
    // Selecting a regular product clears transformation quote
    if (isTransformation) {
      onChange({ transformationQuote: undefined })
    }

    if (selectedIds.has(productId)) {
      onChange({
        selections: input.selections.filter((selection) => selection.product !== productId),
      })
      return
    }

    const newSelection: ProductSelection = {
      product: productId,
      packageId: '',
      packageName: '',
      packagePrice: 0,
      packageBilling: 'Annual',
      packageQuantity: 1,
      addonIds: [],
      addons: [],
      topups: [],
      enterpriseTier: undefined,
      enterprisePriceMin: undefined,
      enterprisePriceMax: undefined,
      enterpriseAnchorPrice: undefined,
      mandatoryMode: 'Online',
      mandatoryFeeWaived: input.twoYearPrepaid,
    }

    onChange({ selections: [...input.selections, newSelection] })
  }

  function toggleTransformation() {
    if (isTransformation) {
      onChange({ transformationQuote: undefined })
    } else {
      // Select transformation — clear regular product selections
      onChange({
        selections: [],
        transformationQuote: EMPTY_TRANSFORMATION_QUOTE,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-semibold text-base mb-1">Select Products</h3>
        <p className="text-white/45 text-sm">Choose one or more products for this quote.</p>
      </div>

      <div className="space-y-3">
        {PRODUCTS.map((product) => {
          const isSelected = selectedIds.has(product.id)
          const isDisabled = isTransformation
          return (
            <button
              key={product.id}
              onClick={() => !isDisabled && toggle(product.id)}
              className="w-full text-left rounded-xl p-4 transition-all relative"
              style={{
                background: isSelected
                  ? hexToRgba(product.color, 0.12)
                  : isDisabled
                  ? 'rgba(255,255,255,0.02)'
                  : 'rgba(10, 30, 70, 0.45)',
                border: isSelected
                  ? `1.5px solid ${hexToRgba(product.color, 0.55)}`
                  : '1px solid rgba(100, 220, 255, 0.12)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                opacity: isDisabled ? 0.45 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
              }}
            >
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
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.75)' }}>
                    {product.id}
                  </p>
                  <p className="text-white/45 text-xs mt-0.5 truncate">{product.tagline}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  {product.startingPrice > 0 ? (
                    <p className="text-white/50 text-xs">
                      Starts at{' '}
                      <span className="text-white/75 font-medium">
                        {product.startingPrice.toLocaleString('th-TH')}
                      </span>{' '}
                      THB/year
                    </p>
                  ) : (
                    <p className="text-white/40 text-xs">Contact sales</p>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <p className="text-white/25 text-xs">หรือ</p>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
      </div>

      {/* Transformation Service card */}
      <button
        onClick={toggleTransformation}
        className="w-full text-left rounded-xl p-4 transition-all relative"
        style={{
          background: isTransformation
            ? hexToRgba(TRANSFORMATION.color, 0.12)
            : selectedIds.size > 0
            ? 'rgba(255,255,255,0.02)'
            : 'rgba(10, 30, 70, 0.45)',
          border: isTransformation
            ? `1.5px solid ${hexToRgba(TRANSFORMATION.color, 0.55)}`
            : '1px solid rgba(167,139,250,0.2)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          opacity: selectedIds.size > 0 && !isTransformation ? 0.5 : 1,
          cursor: selectedIds.size > 0 && !isTransformation ? 'not-allowed' : 'pointer',
        }}
      >
        <div
          className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all"
          style={
            isTransformation
              ? {
                  background: hexToRgba(TRANSFORMATION.color, 0.85),
                  border: `1px solid ${hexToRgba(TRANSFORMATION.color, 0.9)}`,
                }
              : {
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }
          }
        >
          {isTransformation && <span className="text-white text-[10px]">✓</span>}
        </div>

        <div className="flex items-center gap-3 pr-8">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xl"
            style={{ background: hexToRgba(TRANSFORMATION.color, 0.15) }}
          >
            {TRANSFORMATION.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p
                className="font-semibold text-sm"
                style={{ color: isTransformation ? '#fff' : 'rgba(255,255,255,0.75)' }}
              >
                {TRANSFORMATION.name}
              </p>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(167,139,250,0.15)',
                  border: '1px solid rgba(167,139,250,0.3)',
                  color: '#c4b5fd',
                }}
              >
                Standalone
              </span>
            </div>
            <p className="text-white/45 text-xs mt-0.5 truncate">{TRANSFORMATION.description}</p>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-white/40 text-xs">Custom quote</p>
          </div>
        </div>
      </button>

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
            Selecting both products can unlock the <span className="font-semibold">Super Combo 10%</span> offer when both packages are Professional.
          </p>
        </div>
      )}
    </div>
  )
}
