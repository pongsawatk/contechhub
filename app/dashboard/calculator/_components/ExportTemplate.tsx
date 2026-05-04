import type { CalculatorInput, PriceBreakdown } from '@/types/calculator'
import type { UserProfile } from '@/types/user'
import type { PackageExportDetail } from '@/types/quote'

interface ExportTemplateProps {
  input: CalculatorInput
  breakdown: PriceBreakdown
  user?: UserProfile
  date?: string
  quoteId?: string
  packageDetails?: PackageExportDetail[]
}

function formatTHB(n: number): string {
  return n.toLocaleString('th-TH')
}

function formatItemPrice(breakdownItem: PriceBreakdown['lineItems'][number]) {
  if (breakdownItem.isWaived) return `${formatTHB(breakdownItem.price)} (Waived)`
  if (breakdownItem.isDiscount) return `-${formatTHB(Math.abs(breakdownItem.price))}`
  return formatTHB(breakdownItem.price)
}

function formatItemNote(breakdownItem: PriceBreakdown['lineItems'][number]) {
  if (breakdownItem.isWaived) return 'Waived'
  if (breakdownItem.isOneTime) return 'One-time'
  return breakdownItem.billing || 'Recurring'
}

export default function ExportTemplate({
  input,
  breakdown,
  user,
  date,
  quoteId,
  packageDetails,
}: ExportTemplateProps) {
  const annualItems = breakdown.lineItems.filter((item) => !item.isOneTime)
  const oneTimeItems = breakdown.lineItems.filter((item) => item.isOneTime)
  const detailsToShow = (packageDetails ?? []).filter(
    (detail) =>
      detail.keyInclusions.length > 0 ||
      detail.notes ||
      detail.addons.length > 0 ||
      detail.topups.length > 0 ||
      (detail.isEnterprise && (detail.enterpriseBaseNote || detail.enterprisePremiumNote))
  )

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
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 20mm; }
        }
        body { margin: 0; background: #fff; }
      `}</style>

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
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a' }}>
            Quote Summary
          </div>
          {quoteId && (
            <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
              ID: {quoteId}
            </div>
          )}
        </div>
      </div>

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
            Customer
          </p>
          <p style={{ fontSize: '16px', fontWeight: 700 }}>{input.customerName || '-'}</p>
          <p style={{ fontSize: '13px', color: '#555', marginTop: '2px' }}>
            Lane: <strong>{input.lane}</strong>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Prepared Date
          </p>
          <p style={{ fontSize: '14px', fontWeight: 600 }}>{date ?? new Date().toLocaleDateString('th-TH')}</p>
          {user && (
            <p style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>
              Prepared by {user.displayName}
            </p>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px', textTransform: 'uppercase' }}>
          Annual / Recurring
        </p>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
          }}
        >
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: '#374151', borderBottom: '1px solid #d1d5db' }}>
                Item
              </th>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: '#374151', borderBottom: '1px solid #d1d5db' }}>
                Detail
              </th>
              <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: '#374151', borderBottom: '1px solid #d1d5db' }}>
                Type
              </th>
              <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 700, color: '#374151', borderBottom: '1px solid #d1d5db' }}>
                Price (THB)
              </th>
            </tr>
          </thead>
          <tbody>
            {annualItems.map((item, index) => (
              <tr
                key={`${item.label}-${index}`}
                style={{
                  background: index % 2 === 0 ? '#fff' : '#f9fafb',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                <td style={{ padding: '10px 12px', fontWeight: item.isDiscount ? 500 : 600, color: item.isDiscount ? '#059669' : '#111827' }}>
                  {item.label}
                </td>
                <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: '12px' }}>
                  {item.sublabel || '-'}
                </td>
                <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: '12px' }}>
                  {formatItemNote(item)}
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    textAlign: 'right',
                    fontWeight: 600,
                    color: item.isDiscount ? '#059669' : item.isWaived ? '#d97706' : '#111827',
                  }}
                >
                  {formatItemPrice(item)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {oneTimeItems.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px', textTransform: 'uppercase' }}>
            One-time Fees
          </p>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
            }}
          >
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: '#374151', borderBottom: '1px solid #d1d5db' }}>
                  Item
                </th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: '#374151', borderBottom: '1px solid #d1d5db' }}>
                  Detail
                </th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: '#374151', borderBottom: '1px solid #d1d5db' }}>
                  Type
                </th>
                <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 700, color: '#374151', borderBottom: '1px solid #d1d5db' }}>
                  Price (THB)
                </th>
              </tr>
            </thead>
            <tbody>
              {oneTimeItems.map((item, index) => (
                <tr
                  key={`${item.label}-${index}`}
                  style={{
                    background: index % 2 === 0 ? '#fff' : '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#111827' }}>
                    {item.label}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: '12px' }}>
                    {item.sublabel || '-'}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: '12px' }}>
                    {formatItemNote(item)}
                  </td>
                  <td
                    style={{
                      padding: '10px 12px',
                      textAlign: 'right',
                      fontWeight: 600,
                      color: item.isWaived ? '#d97706' : '#111827',
                    }}
                  >
                    {formatItemPrice(item)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div
        style={{
          borderTop: '2px solid #e5e7eb',
          paddingTop: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#6b7280' }}>
          <span>Annual / Recurring</span>
          <span>{formatTHB(breakdown.annualTotal)} THB/year</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#6b7280' }}>
          <span>One-time Fees</span>
          <span>{formatTHB(breakdown.oneTimeTotal)} THB</span>
        </div>
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
          <span style={{ fontWeight: 700, fontSize: '16px' }}>Year 1</span>
          <span style={{ fontWeight: 800, fontSize: '20px', color: '#0f6e56' }}>
            {formatTHB(breakdown.firstYearTotal)} THB
          </span>
        </div>
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
          Year 2+: {formatTHB(breakdown.annualTotal)} THB/year
        </p>
      </div>

      {input.twoYearPrepaid && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '24px',
          }}
        >
          <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px', color: '#92400e' }}>
            Kickstarter Total Saving
          </p>
          <p style={{ fontSize: '12px', color: '#78350f', marginBottom: '4px' }}>
            20% discount (2 years): -{formatTHB(breakdown.kickstarterDiscountSaving)} THB
          </p>
          <p style={{ fontSize: '12px', color: '#78350f', marginBottom: '4px' }}>
            Waive Implementation Fee: -{formatTHB(breakdown.kickstarterMandatorySaving)} THB
          </p>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#92400e' }}>
            Total saved {formatTHB(breakdown.kickstarterTotalSaving)} THB
          </p>
        </div>
      )}

      {detailsToShow.length > 0 && (
        <div
          style={{
            marginBottom: '24px',
            pageBreakInside: 'avoid',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#374151',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            เงื่อนไขแพ็กเกจ / What&apos;s Included
          </p>
          {detailsToShow.map((detail, index) => {
            const enterpriseTier =
              detail.enterpriseTier === 'premium' ? 'Premium' : 'Base'
            return (
              <div
                key={`${detail.product}-${detail.packageName}-${index}`}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  marginBottom: '10px',
                  background: '#fafafa',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: '8px',
                    marginBottom: '6px',
                  }}
                >
                  <p style={{ fontWeight: 700, fontSize: '14px', color: '#0f6e56' }}>
                    {detail.packageName}
                    {detail.isEnterprise && (
                      <span
                        style={{
                          marginLeft: '8px',
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: '#fef3c7',
                          color: '#92400e',
                          letterSpacing: '0.3px',
                        }}
                      >
                        {enterpriseTier} Tier
                      </span>
                    )}
                  </p>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>{detail.product}</span>
                </div>
                {detail.targetProfile && (
                  <p
                    style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      marginBottom: '8px',
                      fontStyle: 'italic',
                    }}
                  >
                    เหมาะสำหรับ: {detail.targetProfile}
                  </p>
                )}
                {detail.keyInclusions.length > 0 && (
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '18px',
                      fontSize: '12px',
                      color: '#1f2937',
                      lineHeight: 1.7,
                    }}
                  >
                    {detail.keyInclusions.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                )}
                {detail.notes && (
                  <div
                    style={{
                      marginTop: '10px',
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      padding: '8px 10px',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                        marginBottom: '4px',
                      }}
                    >
                      Package notes
                    </p>
                    <p style={{ fontSize: '11px', color: '#1f2937', lineHeight: 1.6 }}>
                      {detail.notes}
                    </p>
                  </div>
                )}
                {detail.isEnterprise && (detail.enterpriseBaseNote || detail.enterprisePremiumNote) && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      marginTop: '10px',
                    }}
                  >
                    {detail.enterpriseBaseNote && (
                      <div
                        style={{
                          background: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          padding: '8px 10px',
                        }}
                      >
                        <p
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.4px',
                            marginBottom: '4px',
                          }}
                        >
                          Base
                        </p>
                        <p style={{ fontSize: '11px', color: '#1f2937', lineHeight: 1.6 }}>
                          {detail.enterpriseBaseNote}
                        </p>
                      </div>
                    )}
                    {detail.enterprisePremiumNote && (
                      <div
                        style={{
                          background: '#fff',
                          border: '1px solid #fde68a',
                          borderRadius: '6px',
                          padding: '8px 10px',
                        }}
                      >
                        <p
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: '#92400e',
                            textTransform: 'uppercase',
                            letterSpacing: '0.4px',
                            marginBottom: '4px',
                          }}
                        >
                          Premium
                        </p>
                        <p style={{ fontSize: '11px', color: '#1f2937', lineHeight: 1.6 }}>
                          {detail.enterprisePremiumNote}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {detail.addons.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <p
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                        marginBottom: '4px',
                      }}
                    >
                      Add-ons
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: '#1f2937', lineHeight: 1.6 }}>
                      {detail.addons.map((addon, i) => (
                        <li key={i}>
                          <strong>{addon.name}</strong>
                          {addon.description && <span style={{ color: '#4b5563' }}> — {addon.description}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {detail.topups.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <p
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                        marginBottom: '4px',
                      }}
                    >
                      Top-ups
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: '#1f2937', lineHeight: 1.6 }}>
                      {detail.topups.map((topup, i) => (
                        <li key={i}>
                          <strong>
                            {topup.name} ({topup.quantity}
                            {topup.quantityUnit ? ` ${topup.quantityUnit}` : ''})
                          </strong>
                          {topup.description && <span style={{ color: '#4b5563' }}> — {topup.description}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

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
            Applied offers
          </p>
          {breakdown.appliedOffers.map((offer, index) => (
            <p key={index} style={{ fontSize: '12px', color: '#047857', marginBottom: '4px' }}>
              <strong>{offer.name}</strong> - {offer.description}
              {offer.savings > 0 && ` (Saved ${formatTHB(offer.savings)} THB)`}
            </p>
          ))}
        </div>
      )}

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
        <p>All prices exclude VAT 7% and follow the current 2026 calculator model.</p>
        <p style={{ marginTop: '4px' }}>
          Builk One Co., Ltd. | contech@builk.com
        </p>
      </div>
    </div>
  )
}
