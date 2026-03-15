'use client'

import { useEffect, useState } from 'react'
import ExportTemplate from '../_components/ExportTemplate'
import type { CalculatorInput, PriceBreakdown } from '@/types/calculator'
import type { UserProfile } from '@/types/user'

interface ExportData {
  input: CalculatorInput
  breakdown: PriceBreakdown
  user?: UserProfile
  date?: string
}

export default function ExportPage() {
  const [data, setData] = useState<ExportData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('quoteExport')
      if (raw) {
        setData(JSON.parse(raw))
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    }
  }, [])

  if (error) {
    return (
      <div
        style={{
          fontFamily: 'Sarabun, Inter, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#fff',
          color: '#555',
        }}
      >
        <p>ไม่พบข้อมูล Quote กรุณากลับไปสร้างใบเสนอราคาใหม่</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div
        style={{
          fontFamily: 'Sarabun, Inter, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#fff',
          color: '#999',
        }}
      >
        <p>กำลังโหลด...</p>
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Print button — hidden when printing */}
      <div
        className="no-print"
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          display: 'flex',
          gap: '8px',
          zIndex: 100,
        }}
      >
        <button
          onClick={() => window.print()}
          style={{
            background: '#0f6e56',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 20px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🖨️ พิมพ์ / บันทึก PDF
        </button>
        <button
          onClick={() => window.close()}
          style={{
            background: '#f3f4f6',
            color: '#555',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          ✕ ปิด
        </button>
      </div>

      <ExportTemplate
        input={data.input}
        breakdown={data.breakdown}
        user={data.user}
        date={data.date}
      />
    </div>
  )
}
