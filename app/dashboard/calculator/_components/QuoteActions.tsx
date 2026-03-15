'use client'

import { useState } from 'react'
import type { CalculatorInput, PriceBreakdown } from '@/types/calculator'
import type { UserProfile } from '@/types/user'

interface QuoteActionsProps {
  breakdown: PriceBreakdown
  input: CalculatorInput
  currentUser?: UserProfile
  isSaving: boolean
  savedQuoteId: string | null
  onSave: () => Promise<void>
}

function formatTHB(n: number): string {
  return n.toLocaleString('th-TH')
}

export default function QuoteActions({
  breakdown,
  input,
  currentUser,
  isSaving,
  savedQuoteId,
  onSave,
}: QuoteActionsProps) {
  const [copied, setCopied] = useState(false)

  const isDisabled = !input.customerName || input.selections.length === 0
  const today = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  function buildClipboardText(): string {
    const lines = [
      'ใบเสนอราคา Contech Hub',
      `ลูกค้า: ${input.customerName} | Lane: ${input.lane}`,
      '─'.repeat(34),
      ...breakdown.lineItems.map((item) => {
        const prefix = item.isDiscount ? '  ลด ' : '  • '
        const price = item.price === 0 ? 'ฟรี' : `${formatTHB(Math.abs(item.price))} บาท/ปี`
        return `${prefix}${item.label}: ${price}`
      }),
      '─'.repeat(34),
      `ราคาสุทธิ: ${formatTHB(breakdown.total)} บาท/ปี`,
      '* ไม่รวม VAT 7% | มีผล ม.ค. 2026',
      `สร้างโดย ${currentUser?.displayName ?? 'Sales'} — ${today}`,
    ]
    return lines.join('\n')
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildClipboardText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea')
      ta.value = buildClipboardText()
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleExport() {
    const exportData = { input, breakdown, user: currentUser, date: today }
    try {
      sessionStorage.setItem('quoteExport', JSON.stringify(exportData))
    } catch {
      // sessionStorage might not be available in some contexts
    }
    window.open('/dashboard/calculator/export', '_blank')
  }

  return (
    <div className="mt-4 space-y-2.5">
      {/* Save Quote */}
      <button
        onClick={onSave}
        disabled={isDisabled || isSaving}
        className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
        style={{
          background:
            isDisabled || isSaving
              ? 'rgba(255,255,255,0.07)'
              : 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
          border:
            isDisabled || isSaving
              ? '1px solid rgba(255,255,255,0.1)'
              : '1px solid rgba(56, 189, 248, 0.35)',
          color: isDisabled || isSaving ? 'rgba(255,255,255,0.3)' : 'white',
          cursor: isDisabled || isSaving ? 'not-allowed' : 'pointer',
        }}
      >
        {isSaving ? (
          <>
            <svg
              className="animate-spin w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            กำลังบันทึก...
          </>
        ) : (
          <>💾 บันทึก Quote</>
        )}
      </button>

      {/* Success message */}
      {savedQuoteId && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
          style={{
            background: 'rgba(15, 110, 86, 0.2)',
            border: '1px solid rgba(15, 110, 86, 0.4)',
          }}
        >
          <span className="text-emerald-400">✓</span>
          <span className="text-emerald-300">บันทึกแล้ว</span>
          <span className="text-white/40 ml-auto font-mono truncate max-w-[120px]" title={savedQuoteId}>
            {savedQuoteId.substring(0, 8)}…
          </span>
        </div>
      )}

      {/* Copy Summary */}
      <button
        onClick={handleCopy}
        disabled={isDisabled}
        className="w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
        style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          color: isDisabled ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.85)',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        {copied ? '✓ คัดลอกแล้ว' : '📋 Copy Summary'}
      </button>

      {/* Export PDF */}
      <button
        onClick={handleExport}
        disabled={isDisabled}
        className="w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
        style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          color: isDisabled ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.85)',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        📄 Export PDF
      </button>
    </div>
  )
}
