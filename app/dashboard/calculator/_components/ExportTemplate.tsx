import type { CalculatorInput, PriceBreakdown } from '@/types/calculator'
import type { UserProfile } from '@/types/user'

interface ExportTemplateProps {
  input: CalculatorInput
  breakdown: PriceBreakdown
  user?: UserProfile
  date?: string
  quoteId?: string
}

function formatTHB(n: number): string {
  return n.toLocaleString('th-TH')
}

export default function ExportTemplate({
  input,
  breakdown,
  user,
  date,
  quoteId,
}: ExportTemplateProps) {
  return (
    <div
      style={{
        fontFamily: "'Sarabun', 'Inter', sans-serif",
        background: '#fff',
        color: '#1a1a1a',
        maxWidth: '720px',
        margin: '0 auto',
        padding: '48px 40px',
      }}
    >
      {/* Print-hide styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 20mm; }
        }
        body { margin: 0; background: #fff; }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '2px solid #0f6e56',
          paddingBottom: '20px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: '22px',
              color: '#0f6e56',
              letterSpacing: '-0.5px',
            }}
          >
            Contech Hub
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
            Builk One | Construction Technology BU
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#1a1a1a',
            }}
          >
            ใบเสนอราคา
          </div>
          {quoteId && (
            <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
              ID: {quoteId}
            </div>
          )}
        </div>
      </div>

      {/* Meta */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ลูกค้า
          </p>
          <p style={{ fontSize: '16px', fontWeight: 700 }}>{input.customerName || '—'}</p>
          <p style={{ fontSize: '13px', color: '#555', marginTop: '2px' }}>
            Lane: <strong>{input.lane}</strong> —{' '}
            {input.lane === 'Biz' ? 'SME / ผู้รับเหมา' : 'Developer / Main Contractor'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            วันที่
          </p>
          <p style={{ fontSize: '14px', fontWeight: 600 }}>{date ?? new Date().toLocaleDateString('th-TH')}</p>
          {user && (
            <p style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>
              สร้างโดย {user.displayName}
            </p>
          )}
        </div>
      </div>

      {/* Breakdown Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
          marginBottom: '24px',
        }}
      >
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                fontWeight: 700,
                color: '#374151',
                borderBottom: '1px solid #d1d5db',
              }}
            >
              รายการ
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                fontWeight: 700,
                color: '#374151',
                borderBottom: '1px solid #d1d5db',
              }}
            >
              รายละเอียด
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '10px 12px',
                fontWeight: 700,
                color: '#374151',
                borderBottom: '1px solid #d1d5db',
              }}
            >
              ราคา (บาท/ปี)
            </th>
          </tr>
        </thead>
        <tbody>
          {breakdown.lineItems.map((item, i) => (
            <tr
              key={i}
              style={{
                background: i % 2 === 0 ? '#fff' : '#f9fafb',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <td
                style={{
                  padding: '10px 12px',
                  fontWeight: item.isDiscount ? 500 : 600,
                  color: item.isDiscount ? '#059669' : '#111827',
                }}
              >
                {item.label}
              </td>
              <td
                style={{
                  padding: '10px 12px',
                  color: '#6b7280',
                  fontSize: '12px',
                }}
              >
                {item.isFree
                  ? '🎁 ฟรี (Kickstarter)'
                  : item.sublabel || '—'}
              </td>
              <td
                style={{
                  padding: '10px 12px',
                  textAlign: 'right',
                  fontWeight: 600,
                  color: item.isDiscount
                    ? '#059669'
                    : item.isFree
                    ? '#059669'
                    : '#111827',
                }}
              >
                {item.isFree
                  ? 'ฟรี'
                  : item.isDiscount
                  ? `−${formatTHB(Math.abs(item.price))}`
                  : formatTHB(item.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div
        style={{
          borderTop: '2px solid #e5e7eb',
          paddingTop: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '13px',
            color: '#6b7280',
          }}
        >
          <span>รวมก่อนส่วนลด</span>
          <span>{formatTHB(breakdown.subtotal)} บาท</span>
        </div>
        {breakdown.discountAmount > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '13px',
              color: '#059669',
            }}
          >
            <span>ส่วนลดรวม</span>
            <span>−{formatTHB(breakdown.discountAmount)} บาท</span>
          </div>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px',
            background: '#f0fdf4',
            borderRadius: '8px',
            marginTop: '8px',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '16px' }}>ราคาสุทธิ</span>
          <span
            style={{
              fontWeight: 800,
              fontSize: '20px',
              color: '#0f6e56',
            }}
          >
            {formatTHB(breakdown.total)} บาท/ปี
          </span>
        </div>
      </div>

      {/* Applied Offers */}
      {breakdown.appliedOffers.length > 0 && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '24px',
          }}
        >
          <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px', color: '#065f46' }}>
            🎉 ข้อเสนอพิเศษที่ได้รับ
          </p>
          {breakdown.appliedOffers.map((offer, i) => (
            <p key={i} style={{ fontSize: '12px', color: '#047857', marginBottom: '4px' }}>
              <strong>{offer.name}</strong> — {offer.description}
              {offer.savings > 0 && ` (ประหยัด ${formatTHB(offer.savings)} บาท)`}
            </p>
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: '16px',
          fontSize: '11px',
          color: '#9ca3af',
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        <p>ราคาไม่รวม VAT 7% · มีผล ม.ค. 2026 · ติดต่อ Contech BU</p>
        <p style={{ marginTop: '4px' }}>
          Builk One Co., Ltd. | contech@builk.com
        </p>
      </div>
    </div>
  )
}
