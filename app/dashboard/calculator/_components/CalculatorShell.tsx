'use client'

import { useState, useMemo, useCallback } from 'react'
import type { CalculatorInput } from '@/types/calculator'
import type { PricingItem } from '@/types/pricing'
import type { UserProfile } from '@/types/user'
import { calculate } from '@/lib/pricing-engine'
import StepCustomerInfo from './StepCustomerInfo'
import StepProductSelect from './StepProductSelect'
import StepPackageConfig from './StepPackageConfig'
import StepServices from './StepServices'
import StepSpecialOptions from './StepSpecialOptions'
import SummaryPanel from './SummaryPanel'
import QuoteActions from './QuoteActions'
import Link from 'next/link'

interface CalculatorShellProps {
  pricingItems: PricingItem[]
  currentUser?: UserProfile
  initialQuoteId?: string
}

// Dynamic step configuration based on product type
type FlowType = 'standard' | 'transformation'

interface StepDef {
  id: number
  label: string
}

function getSteps(flowType: FlowType): StepDef[] {
  if (flowType === 'transformation') {
    return [
      { id: 1, label: 'Customer' },
      { id: 2, label: 'Products' },
      { id: 3, label: 'Services' },
    ]
  }
  return [
    { id: 1, label: 'Customer' },
    { id: 2, label: 'Products' },
    { id: 3, label: 'Packages' },
    { id: 4, label: 'Offers' },
  ]
}

function getFlowType(input: CalculatorInput): FlowType {
  return input.transformationQuote !== undefined ? 'transformation' : 'standard'
}

function isStepComplete(stepId: number, input: CalculatorInput, flowType: FlowType): boolean {
  if (stepId === 1) return !!input.customerName
  if (stepId === 2) {
    if (flowType === 'transformation') return input.transformationQuote !== undefined
    return input.selections.length > 0
  }
  if (stepId === 3) {
    if (flowType === 'transformation') {
      return (input.transformationQuote?.services.length ?? 0) > 0
    }
    return input.selections.every((selection) => !!selection.packageId)
  }
  return true
}

export default function CalculatorShell({
  pricingItems,
  currentUser,
}: CalculatorShellProps) {
  const [step, setStep] = useState(1)
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

  const flowType = getFlowType(input)
  const steps = getSteps(flowType)
  const maxStep = steps.length

  const breakdown = useMemo(() => calculate(input, pricingItems), [input, pricingItems])

  const onChange = useCallback((patch: Partial<CalculatorInput>) => {
    setInput((prev) => {
      const next = { ...prev, ...patch }

      // When switching flow type, reset step to 2 if currently on step 3+
      const prevFlow = getFlowType(prev)
      const nextFlow = getFlowType(next)
      if (prevFlow !== nextFlow) {
        // flow switched; caller should also call setStep but we handle it in toggle logic
      }

      if (patch.twoYearPrepaid !== undefined) {
        next.selections = next.selections.map((selection) => ({
          ...selection,
          mandatoryFeeWaived: patch.twoYearPrepaid,
        }))
      }

      return next
    })
  }, [])

  // When flow type changes (product select step), reset to step 2 if needed
  const onChangeWithStepReset = useCallback(
    (patch: Partial<CalculatorInput>) => {
      const prevFlow = flowType
      onChange(patch)
      const nextHasTransformation = patch.transformationQuote !== undefined
      const nextFlow: FlowType =
        'transformationQuote' in patch
          ? nextHasTransformation
            ? 'transformation'
            : 'standard'
          : prevFlow
      if (nextFlow !== prevFlow && step > 2) {
        setStep(2)
      }
    },
    [onChange, flowType, step]
  )

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

  function canGoToStep(targetStep: number): boolean {
    if (targetStep <= step) return true
    for (let s = 1; s < targetStep; s++) {
      if (!isStepComplete(s, input, flowType)) return false
    }
    return true
  }

  const canNext = step < maxStep && isStepComplete(step, input, flowType)

  return (
    <div className="max-w-7xl mx-auto">
      <p className="text-muted text-[13px] mb-6">
        <Link href="/dashboard" className="hover:text-white transition-colors">
          Contech Hub
        </Link>
        <span className="mx-1.5">/</span>
        <span>Calculator</span>
      </p>

      <div className="flex gap-8 items-start">
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="text-white font-bold text-2xl">Calculator</h1>
            <p className="text-white/45 text-sm mt-1">
              Build a quote with live pricing, one-time fees, and package offers.
            </p>
          </div>

          {/* Step progress bar */}
          <div className="flex items-center gap-2 mb-7 overflow-x-auto scrollbar-hide pb-1">
            {steps.map((stepItem, idx) => {
              const isActive = step === stepItem.id
              const isComplete = isStepComplete(stepItem.id, input, flowType) && !isActive
              const isClickable = canGoToStep(stepItem.id)

              return (
                <div key={stepItem.id} className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => isClickable && setStep(stepItem.id)}
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
                      {isComplete ? '✓' : stepItem.id}
                    </span>
                    <span>{stepItem.label}</span>
                  </button>

                  {idx < steps.length - 1 && (
                    <div className="w-5 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
                  )}
                </div>
              )
            })}
          </div>

          <div
            className="rounded-2xl p-6 mb-5"
            style={{
              background: 'rgba(10, 30, 70, 0.45)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(100, 220, 255, 0.15)',
            }}
          >
            {step === 1 && <StepCustomerInfo input={input} onChange={onChange} />}
            {step === 2 && (
              <StepProductSelect input={input} onChange={onChangeWithStepReset} />
            )}
            {step === 3 && flowType === 'transformation' && (
              <StepServices
                input={input}
                onChange={onChange}
                pricingItems={pricingItems}
              />
            )}
            {step === 3 && flowType === 'standard' && (
              <StepPackageConfig
                input={input}
                pricingItems={pricingItems}
                onChange={onChange}
              />
            )}
            {step === 4 && flowType === 'standard' && (
              <StepSpecialOptions
                input={input}
                breakdown={breakdown}
                pricingItems={pricingItems}
                onChange={onChange}
              />
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep((prev) => (prev > 1 ? prev - 1 : prev))}
              disabled={step === 1}
              className="px-5 py-2.5 text-sm rounded-xl transition-all"
              style={{
                background: 'rgba(56, 189, 248, 0.07)',
                border: '1px solid rgba(56, 189, 248, 0.18)',
                color: step === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.75)',
                cursor: step === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              ← Back
            </button>

            {step < maxStep ? (
              <button
                onClick={() => canNext && setStep((prev) => prev + 1)}
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
                Next →
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>

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
