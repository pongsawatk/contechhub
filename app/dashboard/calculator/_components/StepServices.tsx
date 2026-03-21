'use client'

import { useState } from 'react'
import type { CalculatorInput, TransformationQuote, ServiceSelection } from '@/types/calculator'
import type { PricingItem } from '@/types/pricing'

interface StepServicesProps {
  input: CalculatorInput
  onChange: (patch: Partial<CalculatorInput>) => void
  pricingItems: PricingItem[]
}

const ENGAGEMENT_MODELS = [
  { id: 'quick-win' as const, icon: '⚡', name: 'Quick Win', duration: '1–5 วัน' },
  { id: 'project' as const, icon: '📋', name: 'Project-based', duration: '1–3 เดือน' },
  { id: 'program' as const, icon: '🚀', name: 'Transformation', duration: '3 เดือน+' },
]

function formatNumber(n: number): string {
  return n.toLocaleString('th-TH')
}

function billingLabel(billing: string): string {
  return (
    ({
      'Man-day': 'Man-day',
      'Lump Sum': 'ครั้ง',
      'Per Year': 'ปี',
      'One-time': 'ครั้ง',
    } as Record<string, string>)[billing] ?? billing
  )
}

// ── ServiceItemRow ─────────────────────────────────────────────────────────
interface ServiceItemRowProps {
  item: PricingItem
  selection: ServiceSelection | undefined
  onToggle: (itemId: string) => void
  onUpdate: (itemId: string, patch: Partial<ServiceSelection>) => void
}

function ServiceItemRow({ item, selection, onToggle, onUpdate }: ServiceItemRowProps) {
  const isSelected = Boolean(selection)
  const qty = selection?.quantity ?? 1

  return (
    <div
      className="rounded-xl transition-all"
      style={{
        border: isSelected ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
        background: isSelected ? 'rgba(255,255,255,0.06)' : 'transparent',
        padding: '12px',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(item.id)}
          className="mt-0.5 shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all"
          style={{
            border: isSelected ? '1px solid #a78bfa' : '1px solid rgba(255,255,255,0.2)',
            background: isSelected ? 'rgba(167,139,250,0.8)' : 'rgba(255,255,255,0.05)',
          }}
        >
          {isSelected && <span className="text-white text-xs">✓</span>}
        </button>

        <div className="flex-1 min-w-0">
          {/* Item header */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-white text-sm font-medium">{item.packageName}</p>
            <p className="text-white/50 text-xs whitespace-nowrap tabular-nums flex-shrink-0">
              {formatNumber(item.price)} บาท/{billingLabel(item.billing)}
            </p>
          </div>

          {item.notes && (
            <p className="text-white/40 text-xs mt-0.5">{item.notes}</p>
          )}

          {/* Expanded controls when selected */}
          {isSelected && (
            <div className="mt-3 space-y-2">
              {/* Quantity stepper — Man-day billing only */}
              {item.billing === 'Man-day' && (
                <div className="flex items-center gap-3">
                  <span className="text-white/50 text-xs w-24 shrink-0">จำนวน Man-day</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdate(item.id, { quantity: Math.max(1, qty - 1) })}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-white transition-all hover:bg-white/15"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      −
                    </button>
                    <span className="text-white font-semibold w-8 text-center tabular-nums">{qty}</span>
                    <button
                      onClick={() => onUpdate(item.id, { quantity: qty + 1 })}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-white transition-all hover:bg-white/15"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-white/35 text-xs">
                    = {formatNumber(item.price * qty)} บาท
                  </span>
                </div>
              )}

              {/* Task Note */}
              <div>
                <label className="text-white/40 text-xs block mb-1">รายละเอียดงาน (ไม่บังคับ)</label>
                <textarea
                  value={selection?.taskNote ?? ''}
                  onChange={(e) => onUpdate(item.id, { taskNote: e.target.value })}
                  placeholder="เช่น ออกแบบ Auto-Report ส่ง LINE ทุกเช้า / Dashboard GP Analysis 3 หน้า"
                  rows={2}
                  className="glass-input w-full px-3 py-2 text-xs rounded-lg resize-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── InfrastructureRow ──────────────────────────────────────────────────────
interface InfrastructureRowProps {
  item: PricingItem
  isSelected: boolean
  onToggle: (itemId: string) => void
}

function InfrastructureRow({ item, isSelected, onToggle }: InfrastructureRowProps) {
  return (
    <div
      className="rounded-xl transition-all"
      style={{
        border: isSelected ? '1px solid rgba(251,146,60,0.35)' : '1px solid transparent',
        background: isSelected ? 'rgba(251,146,60,0.06)' : 'transparent',
        padding: '12px',
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle(item.id)}
          className="shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all"
          style={{
            border: isSelected ? '1px solid #fb923c' : '1px solid rgba(255,255,255,0.2)',
            background: isSelected ? 'rgba(251,146,60,0.8)' : 'rgba(255,255,255,0.05)',
          }}
        >
          {isSelected && <span className="text-white text-xs">✓</span>}
        </button>

        <div className="flex items-center justify-between flex-1 min-w-0 gap-2">
          <div className="min-w-0">
            <p className="text-white text-sm font-medium">{item.packageName}</p>
            {item.notes && <p className="text-white/40 text-xs mt-0.5">{item.notes}</p>}
          </div>
          <p className="text-white/50 text-xs whitespace-nowrap tabular-nums flex-shrink-0">
            {formatNumber(item.price)} บาท/ปี
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function StepServices({ input, onChange, pricingItems }: StepServicesProps) {
  const quote: TransformationQuote = input.transformationQuote ?? {
    projectName: '',
    engagementModel: '',
    services: [],
  }

  function patchQuote(patch: Partial<TransformationQuote>) {
    onChange({ transformationQuote: { ...quote, ...patch } })
  }

  // Filter service items from pricing DB
  const serviceItems = pricingItems.filter(
    (item) =>
      (item.type === 'Service' || item.type === 'Transformation Service') &&
      !item.packageName.startsWith('[DEPRECATED]') &&
      !item.isMandatoryImplementation &&
      item.billing !== 'Per Year'
  )
  const infraItems = pricingItems.filter(
    (item) =>
      (item.type === 'Service' || item.type === 'Transformation Service' || item.isInfrastructure) &&
      !item.packageName.startsWith('[DEPRECATED]') &&
      item.billing === 'Per Year'
  )

  // Group by serviceCategory
  const standardItems = serviceItems.filter(
    (item) => item.serviceCategory === 'Standard Implementation'
  )
  const automationItems = serviceItems.filter(
    (item) => item.serviceCategory === 'Automation & AI' || (!item.serviceCategory && !item.isInfrastructure)
  )

  // Service selection helpers
  function getSelection(itemId: string): ServiceSelection | undefined {
    return quote.services.find((s) => s.itemId === itemId)
  }

  function toggleItem(item: PricingItem) {
    const existing = getSelection(item.id)
    if (existing) {
      patchQuote({ services: quote.services.filter((s) => s.itemId !== item.id) })
    } else {
      const newSvc: ServiceSelection = {
        itemId: item.id,
        itemName: item.packageName,
        quantity: 1,
        unitPrice: item.price,
        billing: item.billing,
        taskNote: '',
      }
      patchQuote({ services: [...quote.services, newSvc] })
    }
  }

  function updateItem(itemId: string, patch: Partial<ServiceSelection>) {
    patchQuote({
      services: quote.services.map((s) => (s.itemId === itemId ? { ...s, ...patch } : s)),
    })
  }

  // Total preview
  const total = quote.services.reduce((sum, svc) => sum + svc.unitPrice * svc.quantity, 0)

  const renderServiceGroup = (title: string, items: PricingItem[], accentColor: string) => {
    if (items.length === 0) return null
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full" style={{ background: accentColor }} />
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">{title}</p>
        </div>
        {items.map((item) => (
          <ServiceItemRow
            key={item.id}
            item={item}
            selection={getSelection(item.id)}
            onToggle={() => toggleItem(item)}
            onUpdate={updateItem}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-semibold text-base mb-1">Transformation Service</h3>
        <p className="text-white/45 text-sm">เลือกรายการบริการและระบุรายละเอียดงาน</p>
      </div>

      {/* Section A — Project Info */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <h4 className="text-white font-semibold text-sm mb-4">ข้อมูลโปรเจค</h4>

        {/* Project Name */}
        <div className="mb-4">
          <label className="text-white/50 text-xs block mb-1">ชื่อโปรเจค / Scope โดยรวม</label>
          <input
            type="text"
            value={quote.projectName}
            onChange={(e) => patchQuote({ projectName: e.target.value })}
            placeholder="เช่น CCK — Automation Phase 1, Modernform BI Dashboard"
            className="w-full px-4 py-2.5 text-sm rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'white',
              outline: 'none',
            }}
          />
          <p className="text-white/25 text-xs mt-1">
            ใช้แสดงใน Summary และ Quote เพื่อให้ลูกค้าเข้าใจ Scope ทันที
          </p>
        </div>

        {/* Engagement Model */}
        <div>
          <label className="text-white/50 text-xs block mb-2">Engagement Model</label>
          <div className="grid grid-cols-3 gap-2">
            {ENGAGEMENT_MODELS.map((model) => {
              const isActive = quote.engagementModel === model.id
              return (
                <button
                  key={model.id}
                  onClick={() => patchQuote({ engagementModel: model.id })}
                  className="p-3 rounded-xl text-left transition-all"
                  style={{
                    border: isActive
                      ? '1px solid rgba(167,139,250,0.5)'
                      : '1px solid rgba(255,255,255,0.1)',
                    background: isActive ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.03)',
                  }}
                >
                  <p className="text-lg mb-1">{model.icon}</p>
                  <p className="text-white text-xs font-medium">{model.name}</p>
                  <p className="text-white/40 text-xs">{model.duration}</p>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Section B — Service Items */}
      {serviceItems.length === 0 && infraItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/30 text-sm">ยังไม่มีรายการบริการจาก Notion</p>
        </div>
      ) : (
        <div className="space-y-6">
          {renderServiceGroup('A. Standard Implementation', standardItems, '#60a5fa')}
          {renderServiceGroup('B. Automation & AI', automationItems, '#c084fc')}

          {infraItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: '#fb923c' }} />
                <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                  C. Infrastructure (บาท/ปี)
                </p>
              </div>
              {infraItems.map((item) => (
                <InfrastructureRow
                  key={item.id}
                  item={item}
                  isSelected={Boolean(getSelection(item.id))}
                  onToggle={() => toggleItem(item)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section C — Total Preview */}
      {quote.services.length > 0 && (
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)' }}
        >
          <p className="text-purple-300 text-sm">
            รวม <span className="font-semibold">{quote.services.length}</span> รายการ
          </p>
          <p className="text-white font-bold tabular-nums">
            {formatNumber(total)} บาท
          </p>
        </div>
      )}
    </div>
  )
}
