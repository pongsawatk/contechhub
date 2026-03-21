'use client'

import { useState } from 'react'
import type { PricingItem } from '@/types/pricing'
import { formatNumber } from '@/lib/pricing-utils'

interface EnterpriseMatrixCalloutProps {
  item: PricingItem
  isVisible: boolean
}

function splitMatrixValues(note: string): string[] {
  return note
    .split(' | ')
    .map((value) => value.trim())
    .filter(Boolean)
}

function inferRowLabel(value: string, index: number): string {
  const lower = value.toLowerCase()

  if (lower.startsWith('pin pool') || lower.includes('pins/')) return 'Pin Pool'
  if (lower.includes('teams')) return 'MS-Teams'
  if (lower.includes('drone')) return 'Drone Footage'
  if (lower.includes('qbr')) return 'QBR / Review'
  if (lower.includes('sla')) return 'Support SLA'
  if (lower.includes('database') || lower.includes('cloud') || lower.includes('private db')) return 'Database'

  return `Feature ${index + 1}`
}

export default function EnterpriseMatrixCallout({ item, isVisible }: EnterpriseMatrixCalloutProps) {
  const [open, setOpen] = useState(false)

  if (!isVisible) return null

  const baseRows = splitMatrixValues(item.enterpriseBaseNote)
  const premiumRows = splitMatrixValues(item.enterprisePremiumNote)
  const rowCount = Math.max(baseRows.length, premiumRows.length)
  const rows = Array.from({ length: rowCount }, (_, index) => {
    const base = baseRows[index] ?? ''
    const premium = premiumRows[index] ?? ''
    return {
      label: inferRowLabel(base || premium, index),
      base,
      premium,
    }
  }).filter((row) => row.base || row.premium)

  const showAnchor = item.enterpriseAnchorPrice !== null && item.enterpriseAnchorPrice !== undefined
  const hasBasePrice = item.enterprisePriceMin !== null && item.enterprisePriceMin !== undefined
  const hasPremiumPrice = item.enterprisePriceMax !== null && item.enterprisePriceMax !== undefined

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
      <button
        onClick={() => setOpen((value) => !value)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-amber-500/5"
      >
        <div className="flex items-center gap-3">
          <span className="text-base">📊</span>
          <span className="text-amber-300 font-semibold text-sm">
            Enterprise Pricing Matrix — {item.packageName}
          </span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{
              background: 'rgba(234, 88, 12, 0.15)',
              color: '#fb923c',
              border: '1px solid rgba(234,88,12,0.3)',
            }}
          >
            🔒 Internal Only
          </span>
        </div>
        <span
          className="text-amber-500/70 text-sm transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-white/40 text-xs font-medium text-left py-2 pr-6 w-1/3">
                    รายการ
                  </th>
                  <th className="text-white/70 text-xs font-semibold text-center py-2 px-4">
                    <span className="px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      {hasBasePrice ? `Base (${formatNumber(item.enterprisePriceMin!)} บาท/ปี)` : 'Base'}
                    </span>
                  </th>
                  <th className="text-amber-300 text-xs font-semibold text-center py-2 px-4">
                    <span className="px-2 py-1 rounded-lg" style={{ background: 'rgba(251,191,36,0.12)' }}>
                      {hasPremiumPrice ? `Premium (${formatNumber(item.enterprisePriceMax!)} บาท/ปี)` : 'Premium'}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${row.label}-${index}`} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="text-white/50 text-xs py-2.5 pr-6">{row.label}</td>
                    <td className="text-white/75 text-xs text-center py-2.5 px-4">{row.base || '—'}</td>
                    <td className="text-amber-200 text-xs text-center py-2.5 px-4 font-medium">
                      {row.premium || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showAnchor && (
            <div
              className="mt-4 flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs"
              style={{ background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.25)' }}
            >
              <span>🎯</span>
              <p className="text-amber-200/80 leading-relaxed">
                <span className="font-semibold text-amber-300">Sales Anchor:</span>{' '}
                Sales anchor เริ่มที่ {formatNumber(item.enterpriseAnchorPrice!)} บาท เสมอ
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
