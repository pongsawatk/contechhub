import type { PipelineRedFlag } from "@/types/pipeline"
import { formatDate, formatTHB } from "@/lib/pipeline-helpers"

interface Props {
  flags: PipelineRedFlag[]
}

const severityClass: Record<PipelineRedFlag["severity"], string> = {
  critical: "border-red-400/30 bg-red-500/10 text-red-300",
  warning: "border-yellow-400/30 bg-yellow-500/10 text-yellow-200",
  info: "border-blue-400/30 bg-blue-500/10 text-blue-200",
}

const severityLabel: Record<PipelineRedFlag["severity"], string> = {
  critical: "Critical",
  warning: "Watch",
  info: "Info",
}

export default function RedFlagPanel({ flags }: Props) {
  const visibleFlags = flags.slice(0, 6)

  return (
    <section className="glass-card p-5 space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-white font-semibold">Lead-to-Cash Red Flags</h3>
          <p className="text-white/45 text-xs">สัญญาณจาก Hot Quotation และ Sales Order ที่มีอยู่ในระบบตอนนี้</p>
        </div>
        <div className="text-xs text-white/45">
          {flags.length === 0 ? "Clear" : `${flags.length} flags`}
        </div>
      </div>

      {visibleFlags.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
          ยังไม่พบ red flag จากข้อมูลปัจจุบัน
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {visibleFlags.map((flag) => (
            <div key={flag.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-white font-medium text-sm">{flag.title}</div>
                  <div className="text-white/50 text-xs mt-1">{flag.detail}</div>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] ${severityClass[flag.severity]}`}>
                  {severityLabel[flag.severity]}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-white/35">Source</div>
                  <div className="text-white/70 truncate">{flag.source}</div>
                </div>
                <div>
                  <div className="text-white/35">Owner</div>
                  <div className="text-white/70 truncate">{flag.ownerName || "-"}</div>
                </div>
                <div>
                  <div className="text-white/35">Due</div>
                  <div className="text-white/70 tabular-nums">{formatDate(flag.dueDate)}</div>
                </div>
              </div>

              {flag.amount > 0 && (
                <div className="text-xs text-accent-cyan tabular-nums">{formatTHB(flag.amount)} THB</div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
