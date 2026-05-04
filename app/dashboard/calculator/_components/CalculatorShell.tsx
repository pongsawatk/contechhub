'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import type { CalculatorInput, ProductSelection, ServiceSelection, TransformationQuote } from '@/types/calculator'
import type { CalculatorPrefill } from '@/types/chatbot'
import type { PricingItem } from '@/types/pricing'
import type { UserProfile } from '@/types/user'
import { calculate, getPackagePrice, itemAppliesTo } from '@/lib/pricing-engine'
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
  initialInput?: CalculatorInput
  initialPrefill?: string
}

type StepKey = 'customer' | 'products' | 'packages' | 'services' | 'offers'

interface StepDef {
  id: number
  key: StepKey
  label: string
}

function getSteps(input: CalculatorInput): StepDef[] {
  const hasProducts = input.selections.length > 0
  const hasServices = input.transformationQuote !== undefined

  const keys: StepKey[] = ['customer', 'products']

  if (hasProducts || (!hasProducts && !hasServices)) {
    keys.push('packages')
  }
  if (hasServices) {
    keys.push('services')
  }
  if (hasProducts || (!hasProducts && !hasServices)) {
    keys.push('offers')
  }

  return keys.map((key, index) => ({
    id: index + 1,
    key,
    label:
      key === 'customer'
        ? 'Customer'
        : key === 'products'
        ? 'Products'
        : key === 'packages'
        ? 'Packages'
        : key === 'services'
        ? 'Services'
        : 'Offers',
  }))
}

function isStepComplete(stepKey: StepKey, input: CalculatorInput): boolean {
  if (stepKey === 'customer') return !!input.customerName
  if (stepKey === 'products') return input.selections.length > 0 || input.transformationQuote !== undefined
  if (stepKey === 'packages') return input.selections.every((selection) => !!selection.packageId)
  if (stepKey === 'services') return (input.transformationQuote?.services.length ?? 0) > 0
  if (stepKey === 'offers') return true
  return true
}

function createDefaultInput(): CalculatorInput {
  return {
    customerName: '',
    lane: 'Biz',
    selections: [],
    discountPercent: 0,
    discountReason: '',
    twoYearPrepaid: false,
  }
}

function normalizeValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function isProductSelectionProduct(value: string): value is ProductSelection['product'] {
  return value === 'Builk Insite' || value === 'Builk 360' || value === 'Kwanjai'
}

function createDefaultSelection(
  product: ProductSelection['product'],
  twoYearPrepaid: boolean
): ProductSelection {
  return {
    product,
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
    mandatoryFeeWaived: twoYearPrepaid,
  }
}

function decodePrefillParam(prefill: string): CalculatorPrefill {
  const binary = atob(prefill)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  const json = new TextDecoder().decode(bytes)
  return JSON.parse(json) as CalculatorPrefill
}

function buildTransformationQuote(
  prefill: CalculatorPrefill,
  pricingItems: PricingItem[],
  existingQuote?: TransformationQuote
): TransformationQuote | undefined {
  const normalizedServices = prefill.services ?? []
  const mappedServices: ServiceSelection[] = normalizedServices
    .map((service) => {
      const match = pricingItems.find((item) => {
        const isServiceType =
          item.type === 'Service' ||
          item.type === 'Transformation Service' ||
          item.isInfrastructure
        return isServiceType && normalizeValue(item.packageName) === normalizeValue(service.itemName)
      })

      if (!match) return null

      return {
        itemId: match.id,
        itemName: match.packageName,
        quantity: Math.max(1, service.quantity || 1),
        unitPrice: match.price,
        billing: match.billing,
        taskNote: service.taskNote ?? '',
      }
    })
    .filter((service): service is ServiceSelection => Boolean(service))

  if (!prefill.engagementModel && mappedServices.length === 0 && !existingQuote) {
    return undefined
  }

  return {
    projectName: existingQuote?.projectName ?? '',
    engagementModel:
      prefill.engagementModel === 'quick-win' ||
      prefill.engagementModel === 'project' ||
      prefill.engagementModel === 'program'
        ? prefill.engagementModel
        : existingQuote?.engagementModel ?? '',
    services: mappedServices.length > 0 ? mappedServices : existingQuote?.services ?? [],
  }
}

function applyPrefillToInput(
  baseInput: CalculatorInput,
  prefill: CalculatorPrefill,
  pricingItems: PricingItem[]
): CalculatorInput {
  const nextInput: CalculatorInput = {
    ...baseInput,
    customerName: prefill.customerName ?? baseInput.customerName,
    lane: prefill.lane ?? baseInput.lane,
    twoYearPrepaid: prefill.kickstarter ?? baseInput.twoYearPrepaid,
  }

  const packageItem =
    prefill.packageName
      ? pricingItems.find(
          (item) =>
            item.type === 'Package' &&
            normalizeValue(item.packageName) === normalizeValue(prefill.packageName ?? '')
        )
      : undefined

  const requestedProducts = Array.from(
    new Set([
      ...(prefill.products ?? []),
      ...(packageItem?.product ? [packageItem.product] : []),
    ])
  ).filter(isProductSelectionProduct)

  const selectionMap = new Map<ProductSelection['product'], ProductSelection>(
    nextInput.selections.map((selection) => [selection.product, { ...selection }])
  )

  for (const product of requestedProducts) {
    if (!selectionMap.has(product)) {
      selectionMap.set(product, createDefaultSelection(product, nextInput.twoYearPrepaid))
    }
  }

  if (packageItem && isProductSelectionProduct(packageItem.product)) {
    const currentSelection =
      selectionMap.get(packageItem.product) ??
      createDefaultSelection(packageItem.product, nextInput.twoYearPrepaid)
    const price = getPackagePrice(packageItem)

    selectionMap.set(packageItem.product, {
      ...currentSelection,
      packageId: packageItem.id,
      packageName: packageItem.packageName,
      packagePrice: price.base,
      packageBilling: packageItem.billing || currentSelection.packageBilling,
      packageQuantity: currentSelection.packageQuantity ?? 1,
      enterpriseTier:
        packageItem.enterprisePriceMin !== null && packageItem.enterprisePriceMin !== undefined
          ? currentSelection.enterpriseTier ?? 'base'
          : undefined,
      enterprisePriceMin: packageItem.enterprisePriceMin,
      enterprisePriceMax: packageItem.enterprisePriceMax,
      enterpriseAnchorPrice: packageItem.enterpriseAnchorPrice,
      addonIds: [],
      addons: [],
      topups: [],
      mandatoryFeeWaived: nextInput.twoYearPrepaid,
    })
  }

  if ((prefill.addons ?? []).length > 0) {
    const addonNames = new Set((prefill.addons ?? []).map(normalizeValue))

    for (const [product, selection] of selectionMap.entries()) {
      const matchedAddons = pricingItems
        .filter((item) => {
          if (item.product !== product || item.type !== 'Add-on') return false
          if (!addonNames.has(normalizeValue(item.packageName))) return false
          return selection.packageName ? itemAppliesTo(item, selection.packageName) : true
        })
        .map((item) => ({
          id: item.id,
          name: item.packageName,
          price: item.price,
          billing: item.billing || 'Annual',
        }))

      if (matchedAddons.length > 0) {
        selectionMap.set(product, {
          ...selection,
          addonIds: matchedAddons.map((addon) => addon.id),
          addons: matchedAddons,
        })
      }
    }
  }

  nextInput.selections = Array.from(selectionMap.values()).map((selection) => ({
    ...selection,
    mandatoryFeeWaived: nextInput.twoYearPrepaid,
  }))

  const transformationQuote = buildTransformationQuote(prefill, pricingItems, nextInput.transformationQuote)
  if (transformationQuote) {
    nextInput.transformationQuote = transformationQuote
  }

  return nextInput
}

function getStartingStep(input: CalculatorInput): number {
  const steps = getSteps(input)
  return steps.find((stepDef) => !isStepComplete(stepDef.key, input))?.id ?? steps[steps.length - 1]?.id ?? 1
}

export default function CalculatorShell({
  pricingItems,
  currentUser,
  initialQuoteId,
  initialInput,
  initialPrefill,
}: CalculatorShellProps) {
  const hydratedInput = initialInput ?? createDefaultInput()
  const [step, setStep] = useState(() => getStartingStep(hydratedInput))
  const [input, setInput] = useState<CalculatorInput>(hydratedInput)
  const [isSaving, setIsSaving] = useState(false)
  const [prefillNotice, setPrefillNotice] = useState<string | null>(null)
  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(
    initialInput ? (initialQuoteId ?? null) : null
  )
  const hasAppliedPrefillRef = useRef(false)

  const steps = getSteps(input)
  const maxStep = steps.length

  const breakdown = useMemo(() => calculate(input, pricingItems), [input, pricingItems])

  const onChange = useCallback((patch: Partial<CalculatorInput>) => {
    setInput((prev) => {
      const next = { ...prev, ...patch }

      if (patch.twoYearPrepaid !== undefined) {
        next.selections = next.selections.map((selection) => ({
          ...selection,
          mandatoryFeeWaived: patch.twoYearPrepaid,
        }))
      }

      return next
    })
  }, [])

  useEffect(() => {
    if (!initialPrefill || hasAppliedPrefillRef.current) return

    hasAppliedPrefillRef.current = true

    try {
      const prefill = decodePrefillParam(initialPrefill)
      setInput((prev) => applyPrefillToInput(prev, prefill, pricingItems))
      setSavedQuoteId(null)
      setStep(2)
      setPrefillNotice('Loaded chat details into this calculator.')
    } catch (error) {
      console.error('[Calculator] Invalid chatbot prefill:', error)
    }
  }, [initialPrefill, pricingItems])

  // When product selections change dynamically, step state handles component transitions cleanly.
  // Step product selections remain isolated on Step 2.
  const onChangeWithStepReset = onChange

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
      const stepDef = steps.find((x) => x.id === s)
      if (stepDef && !isStepComplete(stepDef.key, input)) return false
    }
    return true
  }

  const currentStepDef = steps.find((s) => s.id === step)
  const canNext = step < maxStep && !!currentStepDef && isStepComplete(currentStepDef.key, input)

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
            {prefillNotice && (
              <div
                className="mt-3 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium"
                style={{
                  background: 'rgba(250, 204, 21, 0.12)',
                  border: '1px solid rgba(250, 204, 21, 0.28)',
                  color: '#fde68a',
                }}
              >
                {prefillNotice}
              </div>
            )}
          </div>

          {/* Step progress bar */}
          <div className="flex items-center gap-2 mb-7 overflow-x-auto scrollbar-hide pb-1">
            {steps.map((stepItem, idx) => {
              const isActive = step === stepItem.id
              const isComplete = isStepComplete(stepItem.key, input) && !isActive
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
                      {isComplete ? 'OK' : stepItem.id}
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
            {currentStepDef?.key === 'customer' && <StepCustomerInfo input={input} onChange={onChange} />}
            {currentStepDef?.key === 'products' && (
              <StepProductSelect input={input} onChange={onChangeWithStepReset} />
            )}
            {currentStepDef?.key === 'packages' && (
              <StepPackageConfig
                input={input}
                pricingItems={pricingItems}
                onChange={onChange}
              />
            )}
            {currentStepDef?.key === 'services' && (
              <StepServices
                input={input}
                onChange={onChange}
                pricingItems={pricingItems}
              />
            )}
            {currentStepDef?.key === 'offers' && (
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
              Back
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
                Next
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
            pricingItems={pricingItems}
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
