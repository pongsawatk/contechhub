import type { PricingItem } from '@/types/pricing'
import { formatPrice } from '@/lib/pricing-utils'

interface Props {
  topups: PricingItem[]
}

export default function TopupSection({ topups }: Props) {
  if (topups.length === 0) return null

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <table className="w-full">
        <thead>
          <tr
            className="border-b border-white/[0.08]"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">
              รายการ
            </th>
            <th className="text-right px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">
              ราคา
            </th>
            <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider hidden md:table-cell">
              รายละเอียด
            </th>
          </tr>
        </thead>
        <tbody>
          {topups.map((item, i) => (
            <tr
              key={item.id}
              className="border-b border-white/5 last:border-0 transition-colors"
              style={
                i % 2 === 1
                  ? { background: 'rgba(255,255,255,0.015)' }
                  : undefined
              }
            >
              <td className="px-4 py-3 text-white text-sm font-medium">
                {item.packageName}
              </td>
              <td className="px-4 py-3 text-[#4ade80] text-sm font-semibold text-right tabular-nums whitespace-nowrap">
                {formatPrice(item.price, item.billing)}
              </td>
              <td className="px-4 py-3 text-white/50 text-xs hidden md:table-cell">
                {item.keyInclusions[0] ?? ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
