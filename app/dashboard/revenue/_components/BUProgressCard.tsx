import type { RevenueEntry } from "@/types/revenue"
import { MONTHLY_TARGETS, ANNUAL_TARGET, MONTHS_ORDER, MONTH_SHORT_TH } from "@/lib/revenue-targets"

interface Props {
  entries: RevenueEntry[]
}

function formatTHB(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K"
  return n.toLocaleString()
}

export default function BUProgressCard({ entries }: Props) {
  const totalRecognized = entries.reduce((s, e) => s + e.recognizedAmount, 0)
  const totalTarget = ANNUAL_TARGET
  const pct = Math.min(100, Math.round((totalRecognized / totalTarget) * 100))

  const byMonth: Record<string, number> = {}
  for (const e of entries) {
    byMonth[e.month] = (byMonth[e.month] ?? 0) + e.recognizedAmount
  }

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg">BU Revenue Progress</h2>
        <span className="text-accent-cyan font-bold text-2xl">{pct}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-3">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
          style={{ width: pct + "%" }}
        />
      </div>
      <div className="flex justify-between text-sm text-white/60">
        <span>{formatTHB(totalRecognized)} recognized</span>
        <span>Target: {formatTHB(totalTarget)}</span>
      </div>
      <div className="grid grid-cols-6 gap-1 mt-2">
        {MONTHS_ORDER.map((m) => {
          const actual = byMonth[m] ?? 0
          const target = MONTHLY_TARGETS[m] ?? 0
          const p = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0
          const isOver = p >= 100
          return (
            <div key={m} className="flex flex-col items-center gap-1">
              <div className="w-full bg-white/10 rounded-sm h-12 flex items-end overflow-hidden">
                <div
                  className={"w-full rounded-sm transition-all " + (isOver ? "bg-cyan-400" : p >= 70 ? "bg-blue-400" : "bg-blue-700")}
                  style={{ height: Math.max(4, p) + "%" }}
                />
              </div>
              <span className="text-[10px] text-white/50">{MONTH_SHORT_TH[m]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}