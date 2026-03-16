import type { RevenueEntry } from "@/types/revenue"

interface Props {
  entries: RevenueEntry[]
  canEdit: boolean
  onEdit: (entry: RevenueEntry) => void
}

function formatTHB(n: number) {
  return n.toLocaleString("th-TH")
}

const STATUS_COLORS: Record<string, string> = {
  "Recognized": "text-cyan-400",
  "Pending": "text-yellow-400",
  "Cancelled": "text-red-400",
}

export default function RevenueTable({ entries, canEdit, onEdit }: Props) {
  if (entries.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-white/50">
        ไม่มีข้อมูลรายได้สำหรับเดือนนี้
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-white/60 font-medium">รายการ</th>
              <th className="px-4 py-3 text-left text-white/60 font-medium">ลูกค้า</th>
              <th className="px-4 py-3 text-right text-white/60 font-medium">Booking</th>
              <th className="px-4 py-3 text-right text-white/60 font-medium">Recognized</th>
              <th className="px-4 py-3 text-left text-white/60 font-medium">สถานะ</th>
              <th className="px-4 py-3 text-left text-white/60 font-medium">Lane</th>
              <th className="px-4 py-3 text-left text-white/60 font-medium">Owner</th>
              {canEdit && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-white font-medium max-w-[180px] truncate">{e.entryName}</td>
                <td className="px-4 py-3 text-white/70 max-w-[140px] truncate">{e.customerName || "-"}</td>
                <td className="px-4 py-3 text-right text-white/80">{formatTHB(e.bookingAmount)}</td>
                <td className="px-4 py-3 text-right text-accent-cyan font-semibold">{formatTHB(e.recognizedAmount)}</td>
                <td className="px-4 py-3">
                  <span className={"text-xs font-medium " + (STATUS_COLORS[e.recognitionStatus] ?? "text-white/60")}>
                    {e.recognitionStatus || "-"}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/60 text-xs">{e.lane || "-"}</td>
                <td className="px-4 py-3 text-white/60 text-xs max-w-[100px] truncate">{e.ownerName || "-"}</td>
                {canEdit && (
                  <td className="px-4 py-3">
                    {!e.monthLocked && (
                      <button
                        onClick={() => onEdit(e)}
                        className="text-xs text-accent-cyan hover:text-white transition-colors px-2 py-1 rounded border border-accent-cyan/30 hover:border-accent-cyan/60"
                      >
                        แก้ไข
                      </button>
                    )}
                    {e.monthLocked && (
                      <span className="text-xs text-white/30">ล็อค</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}