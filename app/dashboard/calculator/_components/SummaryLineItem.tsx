import type { LineItem } from '@/types/calculator'

interface SummaryLineItemProps {
  item: LineItem
}

function formatTHB(n: number): string {
  return n.toLocaleString('th-TH')
}

export default function SummaryLineItem({ item }: SummaryLineItemProps) {
  if (item.isIncluded) {
    return (
      <div className="flex items-start justify-between gap-2 py-1">
        <div className="min-w-0">
          <p className="text-white/40 text-sm leading-snug line-through">{item.label}</p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Included
        </span>
      </div>
    )
  }

  if (item.isDiscount) {
    return (
      <div className="flex items-start justify-between gap-2 py-1">
        <div className="min-w-0">
          <p className="text-sm leading-snug" style={{ color: '#6ee7b7' }}>
            {item.label}
          </p>
          {item.sublabel && <p className="text-white/40 text-xs mt-0.5">{item.sublabel}</p>}
        </div>
        <span className="text-sm font-medium flex-shrink-0" style={{ color: '#6ee7b7' }}>
          -{formatTHB(Math.abs(item.price))}
        </span>
      </div>
    )
  }

  if (item.isWaived) {
    return (
      <div className="flex items-start justify-between gap-2 py-1">
        <div className="min-w-0">
          <p className="text-white/40 text-sm leading-snug line-through">{item.label}</p>
          {item.sublabel && <p className="text-white/30 text-xs mt-0.5">{item.sublabel}</p>}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-amber-300 text-sm font-medium line-through">{formatTHB(item.price)}</p>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/25 text-amber-300">
            Waived
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start justify-between gap-2 py-1">
      <div className="min-w-0">
        <p className="text-white/90 text-sm leading-snug">{item.label}</p>
        {item.sublabel && <p className="text-white/40 text-xs mt-0.5">{item.sublabel}</p>}
      </div>
      <span className="text-sm text-white/80 flex-shrink-0 font-medium">
        {formatTHB(item.price)}
      </span>
    </div>
  )
}
