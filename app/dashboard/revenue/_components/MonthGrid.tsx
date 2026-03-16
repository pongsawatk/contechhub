import type { RevenueEntry } from "@/types/revenue"
import { MONTHS_ORDER, MONTH_NAMES_TH, MONTHLY_TARGETS } from "@/lib/revenue-targets"

interface Props {
  entries: RevenueEntry[]
  selectedMonth: string
  onSelect: (m: string) => void
}

function formatTHB(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K"
  return n.toLocaleString()
}

export default function MonthGrid({ entries, selectedMonth, onSelect }: Props) {
  const byMonth: Record<string, number> = {}
  for (const e of entries) {
    byMonth[e.month] = (byMonth[e.month] ?? 0) + e.recognizedAmount
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
      {MONTHS_ORDER.map((m) => {
        const actual = byMonth[m] ?? 0
        const target = MONTHLY_TARGETS[m] ?? 0
        const pct = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0
        const isSelected = m === selectedMonth
        const statusColor = pct >= 100 ? "text-cyan-400" : pct >= 70 ? "text-blue-400" : "text-white/50"

        return (
          <button
            key={m}
            onClick={() => onSelect(m)}
            className={"glass-card p-3 text-left transition-all cursor-pointer hover:border-accent-cyan/40 " +
              (isSelected ? "border-accent-cyan/60 bg-blue-900/30" : "")}
          >
            <div className="text-xs text-white/60 mb-1">{MONTH_NAMES_TH[m]}</div>
            <div className={"text-sm font-semibold " + statusColor}>{formatTHB(actual)}</div>
            <div className="text-[10px] text-white/40 mt-0.5">{pct}% of {formatTHB(target)}</div>
          </button>
        )
      })}
    </div>
  )
}