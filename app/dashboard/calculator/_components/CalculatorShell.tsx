'use client'

import { useState, useMemo, useCallback } from 'react'
import type { CalculatorInput } from '@/types/calculator'
import type { PricingItem } from '@/types/pricing'
import type { UserProfile } from '@/types/user'
import { calculate } from '@/lib/pricing-engine'
import StepCustomerInfo from './StepCustomerInfo'
import StepProductSelect from './StepProductSelect'
import StepPackageConfig from './StepPackageConfig'
import StepSpecialOptions from './StepSpecialOptions'
import SummaryPanel from './SummaryPanel'
import QuoteActions from './QuoteActions'
import Link from 'next/link'

interface CalculatorShellProps {
  pricingItems: PricingItem[]
  currentUser?: UserProfile
  initialQuoteId?: string
}

const STEPS = [
  { id: 1, label: 'ข้อมูลลูกค้า' },
  { id: 2, label: 'เลือกสินค้า' },
  { id: 3, label: 'แพ็กเกจ' },
  { id: 4, label: 'ส่วนลด' },
] as const

type StepId = (typeof STEPS)[number]['id']

function isStepComplete(step: StepId, input: CalculatorInput): boolean {
  if (step === 1) return !!input.customerName
  if (step === 2) return input.selections.length > 0
  if (step === 3) return input.selections.every((s) => !!s.packageId)
  return true
}

export default function CalculatorShell({
  pricingItems,
  currentUser,
}: CalculatorShellProps) {
  const [step, setStep] = useState<StepId>(1)
  const [input, setInput] = useState<CalculatorInput>({
    customerName: '',
    lane: 'Biz',
    selections: [],
    discountPercent: 0,
    discountReason: '',
    twoYearPrepaid: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null)

  const breakdown = useMemo(() => calculate(input), [input])

  const onChange = useCallback((patch: Partial<CalculatorInput>) => {
    setInput((prev) => ({ ...prev, ...patch }))
  }, [])

  async function handleSave() {
    setIsSaving(true)
    try {
      const res = await fetch('/api/internal/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, breakdown }),
      })
      if (res.ok) {
        const data = await res.json()
        setSavedQuoteId(data.quoteId)
        // Update URL for shareability
        const url = new URL(window.location.href)
        url.searchParams.set('quote', data.quoteId)
        window.history.pushState({}, '', url.toString())
      }
    } catch (err) {
      console.error('[QuoteSave] Error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  function canGoToStep(targetStep: StepId): boolean {
    // Can always go back, can go forward only if previous steps complete
    if (targetStep <= step) return true
    for (let s = 1; s < targetStep; s++) {
      if (!isStepComplete(s as StepId, input)) return false
    }
    return true
  }

  const canNext =
    step < 4 &&
    isStepComplete(step, input) &&
    (step !== 2 || input.selections.length > 0)

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <p className="text-muted text-[13px] mb-6">
        <Link href="/dashboard" className="hover:text-white transition-colors">
          Contech Hub
        </Link>
        <span className="mx-1.5">›</span>
        <span>คิดราคา</span>
      </p>

      <div className="flex gap-8 items-start">
        {/* ── Left: Form ── */}
        <div className="flex-1 min-w-0">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-white font-bold text-2xl">คิดราคา</h1>
            <p className="text-white/45 text-sm mt-1">
              สร้างใบเสนอราคาสำหรับลูกค้า — คำนวณแบบ Real-time
            </p>
          </div>

          {/* Step Navigator */}
          <div className="flex items-center gap-2 mb-7 overflow-x-auto scrollbar-hide pb-1">
            {STEPS.map((s, idx) => {
              const isActive = step === s.id
              const isComplete = isStepComplete(s.id, input) && !isActive
              const isClickable = canGoToStep(s.id)

              return (
                <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => isClickable && setStep(s.id)}
                    className="flex items-center gap-2 py-2 px-3.5 rounded-full text-sm font-medium transition-all"
                    style={
                      isActive
                        ? {
                            background: 'rgba(56, 189, 248, 0.2)',
                            border: '1px solid rgba(56, 189, 248, 0.5)',
                            color: 'white',
                          }
                        : isComplete
                        ? {
                            background: 'rgba(15, 110, 86, 0.2)',
                            border: '1px solid rgba(15, 110, 86, 0.45)',
                            color: '#6ee7b7',
                            cursor: 'pointer',
                          }
                        : {
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.35)',
                            cursor: 'default',
                          }
                    }
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: isActive
                          ? 'rgba(56, 189, 248, 0.4)'
                          : isComplete
                          ? 'rgba(15, 110, 86, 0.5)'
                          : 'rgba(255,255,255,0.08)',
                      }}
                    >
                      {isComplete ? '✓' : s.id}
                    </span>
                    <span>{s.label}</span>
                  </button>

                  {idx < STEPS.length - 1 && (
                    <div
                      className="w-5 h-px"
                      style={{ background: 'rgba(255,255,255,0.1)' }}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Step content card */}
          <div
            className="rounded-2xl p-6 mb-5"
            style={{
              background: 'rgba(10, 30, 70, 0.45)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(100, 220, 255, 0.15)',
            }}
          >
            {step === 1 && (
              <StepCustomerInfo input={input} onChange={onChange} />
            )}
            {step === 2 && (
              <StepProductSelect input={input} onChange={onChange} />
            )}
            {step === 3 && (
              <StepPackageConfig
                input={input}
                pricingItems={pricingItems}
                onChange={onChange}
              />
            )}
            {step === 4 && (
              <StepSpecialOptions
                input={input}
                breakdown={breakdown}
                onChange={onChange}
              />
            )}
          </div>

          {/* Step Nav Buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => setStep((prev) => (prev > 1 ? ((prev - 1) as StepId) : prev))}
              disabled={step === 1}
              className="px-5 py-2.5 text-sm rounded-xl transition-all"
              style={{
                background: 'rgba(56, 189, 248, 0.07)',
                border: '1px solid rgba(56, 189, 248, 0.18)',
                color: step === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.75)',
                cursor: step === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              ← ย้อนกลับ
            </button>

            {step < 4 ? (
              <button
                onClick={() => canNext && setStep((prev) => (prev + 1) as StepId)}
                disabled={!canNext}
                className="px-6 py-2.5 text-sm font-semibold rounded-xl transition-all"
                style={{
                  background: canNext
                    ? 'linear-gradient(135deg, #1d4ed8, #0ea5e9)'
                    : 'rgba(255,255,255,0.06)',
                  border: canNext
                    ? '1px solid rgba(56, 189, 248, 0.3)'
                    : '1px solid rgba(255,255,255,0.08)',
                  color: canNext ? 'white' : 'rgba(255,255,255,0.25)',
                  cursor: canNext ? 'pointer' : 'not-allowed',
                }}
              >
                ถัดไป →
              </button>
            ) : (
              <div /> // placeholder to keep buttons flush
            )}
          </div>
        </div>

        {/* ── Right: Sticky Summary ── */}
        <div className="w-96 flex-shrink-0 sticky top-24 space-y-0">
          <SummaryPanel breakdown={breakdown} input={input} />
          <QuoteActions
            breakdown={breakdown}
            input={input}
            currentUser={currentUser}
            isSaving={isSaving}
            savedQuoteId={savedQuoteId}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  )
}
