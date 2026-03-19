/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ParsedRow } from "@/types/pipeline"

interface Props {
  rows: ParsedRow[]
  type: "hot-quotation" | "sales-order"
}

export default function ImportPreviewTable({ rows, type }: Props) {
  const isHQ = type === "hot-quotation"
  return (
    <div className="overflow-x-auto max-h-64 overflow-y-auto">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-[rgba(5,13,50,0.95)]">
          <tr className="border-b border-white/10">
            <th className="px-2 py-2 text-left text-white/50 w-8">#</th>
            {isHQ ? (
              <>
                <th className="px-2 py-2 text-left text-white/50">Quotation No.</th>
                <th className="px-2 py-2 text-left text-white/50">Product</th>
                <th className="px-2 py-2 text-left text-white/50">Company</th>
                <th className="px-2 py-2 text-right text-white/50">Amount</th>
                <th className="px-2 py-2 text-left text-white/50">Stage</th>
              </>
            ) : (
              <>
                <th className="px-2 py-2 text-left text-white/50">Order No.</th>
                <th className="px-2 py-2 text-left text-white/50">Company</th>
                <th className="px-2 py-2 text-right text-white/50">Amount</th>
                <th className="px-2 py-2 text-left text-white/50">Revenue Type</th>
                <th className="px-2 py-2 text-left text-white/50">Close Date</th>
              </>
            )}
            <th className="px-2 py-2 text-left text-white/50">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 20).map((r, i) => {
            const d = r.data as any
            const hasError = r.errors.length > 0
            const hasWarn = r.warnings.length > 0
            const rowBg = hasError
              ? "bg-red-500/8 border-l-2 border-red-400"
              : hasWarn
              ? "bg-yellow-400/6"
              : ""
            return (
              <tr key={i} className={"border-b border-white/5 " + rowBg}>
                <td className="px-2 py-1.5 text-white/30">{r.rowIndex}</td>
                {isHQ ? (
                  <>
                    <td className="px-2 py-1.5 text-white/80">{d.quotationNo || "-"}</td>
                    <td className="px-2 py-1.5 text-white/70">{d.product || "-"}</td>
                    <td className="px-2 py-1.5 text-white/70 max-w-[120px] truncate">{d.companyName || "-"}</td>
                    <td className="px-2 py-1.5 text-right text-accent-cyan">{d.quotationAmount?.toLocaleString() || "0"}</td>
                    <td className="px-2 py-1.5 text-white/60">{d.stage || "-"}</td>
                  </>
                ) : (
                  <>
                    <td className="px-2 py-1.5 text-white/80">{d.orderNo || "-"}</td>
                    <td className="px-2 py-1.5 text-white/70 max-w-[120px] truncate">{d.companyName || "-"}</td>
                    <td className="px-2 py-1.5 text-right text-accent-cyan">{d.orderAmount?.toLocaleString() || "0"}</td>
                    <td className="px-2 py-1.5 text-white/60">{d.revenueType || "-"}</td>
                    <td className="px-2 py-1.5 text-white/60">{d.closeDate || "-"}</td>
                  </>
                )}
                <td className="px-2 py-1.5">
                  {hasError && (
                    <div className="text-red-400">{r.errors.map((e) => e.message).join(", ")}</div>
                  )}
                  {!hasError && hasWarn && (
                    <div className="text-yellow-400">{r.warnings[0]?.message}</div>
                  )}
                  {!hasError && !hasWarn && <span className="text-green-400">\u2713</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {rows.length > 20 && (
        <p className="text-center text-white/30 text-xs py-2">แสดง 20 แถวแรกจากทั้งหมด {rows.length} แถว</p>
      )}
    </div>
  )
}