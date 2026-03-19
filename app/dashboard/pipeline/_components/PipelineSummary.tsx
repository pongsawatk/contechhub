import type { HotQuotation, SalesOrder } from "@/types/pipeline"
import { formatTHB, stageColor } from "@/lib/pipeline-helpers"
import Link from "next/link"

interface Props {
  quotations: HotQuotation[]
  orders: SalesOrder[]
}

export default function PipelineSummary({ quotations, orders }: Props) {
  const activeQuotes = quotations.filter((q) => q.status === "Active")
  const totalQuoteAmount = activeQuotes.reduce((s, q) => s + q.quotationAmount, 0)
  const stages = ["Sent", "Follow-up", "Negotiation", "Verbal Yes"]
  const stageCount: Record<string, number> = {}
  for (const s of stages) stageCount[s] = activeQuotes.filter((q) => q.stage === s).length

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const mtdOrders = orders.filter((o) => {
    const d = o.closeDate ? new Date(o.closeDate) : null
    return d && d >= startOfMonth && d <= now
  })
  const wonOrders = mtdOrders
  const totalOrderAmount = wonOrders.reduce((s, o) => s + o.orderAmount, 0)
  const avgDeal = wonOrders.length > 0 ? totalOrderAmount / wonOrders.length : 0
  const revenueTypes = ["New Logo Biz", "New Logo Corp", "Add-on", "Renewal", "Service"]
  const rtCount: Record<string, number> = {}
  for (const rt of revenueTypes) rtCount[rt] = wonOrders.filter((o) => o.revenueType === rt).length

  const totalBooking = orders.reduce((s, o) => s + o.orderAmount, 0)
  const totalRecognized = orders.reduce((s, o) => s + o.revenueAmount, 0)
  const mtdBooking = mtdOrders.reduce((s, o) => s + o.orderAmount, 0)
  const recPct = totalBooking > 0 ? Math.round((totalRecognized / totalBooking) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card 1: Hot Quotation */}
      <div className="glass-card p-5 space-y-4 relative">
        <div className="flex items-center gap-2">
          <span className="text-2xl">\uD83D\uDD25</span>
          <h3 className="text-white font-semibold">Hot Quotation</h3>
        </div>
        <div>
          <div className="text-3xl font-bold text-white">{activeQuotes.length}</div>
          <div className="text-accent-cyan text-lg font-semibold">{formatTHB(totalQuoteAmount)} THB</div>
        </div>
        <div className="space-y-1">
          {stages.map((s) => (
            <div key={s} className="flex items-center gap-2 text-xs">
              <span className={"w-24 " + stageColor(s)}>{s}</span>
              <div className="flex-1 bg-white/10 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-blue-500"
                  style={{ width: activeQuotes.length > 0 ? (stageCount[s] / activeQuotes.length * 100) + "%" : "0%" }} />
              </div>
              <span className="text-white/50 w-4 text-right">{stageCount[s]}</span>
            </div>
          ))}
        </div>
        <div className="text-xs text-white/40">
          Hotness 5: {activeQuotes.filter((q) => q.hotness === "5").length} ·
          Hotness 4: {activeQuotes.filter((q) => q.hotness === "4").length}
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-3xl hidden md:block">\u2192</div>
      </div>

      {/* Card 2: Sales Order */}
      <div className="glass-card p-5 space-y-4 relative">
        <div className="flex items-center gap-2">
          <span className="text-2xl">\uD83D\uDCBC</span>
          <h3 className="text-white font-semibold">Sales Order (MTD)</h3>
        </div>
        <div>
          <div className="text-3xl font-bold text-white">{wonOrders.length}</div>
          <div className="text-accent-cyan text-lg font-semibold">{formatTHB(totalOrderAmount)} THB</div>
        </div>
        <div className="space-y-1">
          {revenueTypes.filter((rt) => rtCount[rt] > 0).map((rt) => (
            <div key={rt} className="flex items-center gap-2 text-xs">
              <span className="text-white/60 w-28 truncate">{rt}</span>
              <span className="text-accent-cyan">{rtCount[rt]}</span>
            </div>
          ))}
        </div>
        <div className="text-xs text-white/40">Avg deal: {formatTHB(avgDeal)} THB</div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-3xl hidden md:block">\u2192</div>
      </div>

      {/* Card 3: Revenue */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">\uD83D\uDCB9</span>
          <h3 className="text-white font-semibold">Revenue</h3>
        </div>
        <div>
          <div className="text-3xl font-bold text-white">{formatTHB(mtdBooking)} THB</div>
          <div className="text-white/50 text-sm">MTD Booking</div>
          <div className="text-white/30 text-xs mt-0.5">รวมทั้งหมด: {formatTHB(totalBooking)}</div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-white/60">Recognized</span>
            <span className="text-accent-cyan">{recPct}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
              style={{ width: recPct + "%" }} />
          </div>
        </div>
        <Link href="/dashboard/revenue"
          className="block text-center text-xs text-accent-cyan hover:text-white transition-colors py-2 glass-ghost rounded-lg">
          \u0e14\u0e39 Revenue Tracker \u2192
        </Link>
      </div>
    </div>
  )
}