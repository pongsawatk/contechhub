"use client"

import type { KpiRecord } from "@/types/kpi"
import AccountableAvatar from "@/components/kpi/AccountableAvatar"

interface KpiCardProps {
  entry: KpiRecord
  canEdit: boolean
  isMine: boolean
  onEdit: () => void
}

const STATUS_STYLES: Record<KpiRecord["status"], { badge: string; bar: string }> = {
  "On Track": {
    badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    bar: "from-emerald-400 to-green-300",
  },
  "At Risk": {
    badge: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    bar: "from-amber-400 to-yellow-300",
  },
  "Off Track": {
    badge: "border-rose-400/30 bg-rose-400/10 text-rose-200",
    bar: "from-rose-500 to-red-300",
  },
  "Completed": {
    badge: "border-sky-400/30 bg-sky-400/10 text-sky-200",
    bar: "from-sky-400 to-cyan-300",
  },
}

function formatValue(value: number | null, unit: string, isPercent: boolean): string {
  if (value === null) return "-"
  if (isPercent || unit === "%") return `${value}%`
  if (unit === "THB") return `฿${value.toLocaleString("th-TH")}`
  if (unit === "x") return `${value}x`
  return `${value.toLocaleString("th-TH")}${unit ? ` ${unit}` : ""}`
}

function formatPeriodStart(periodStart: string | null): string {
  if (!periodStart) return "ไม่ระบุวันเริ่ม"

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(periodStart))
}

export default function KpiCard({ entry, canEdit, isMine, onEdit }: KpiCardProps) {
  const statusStyle = STATUS_STYLES[entry.status]
  const progressWidth = Math.max(0, Math.min(entry.achievementPercent ?? 0, 100))
  const isOverTarget = (entry.achievementPercent ?? 0) > 100
  const accountable = entry.accountable
  const targetLabel = formatValue(entry.target, entry.unit, false)
  const actualLabel = formatValue(entry.actual, entry.unit, entry.actualIsPercent)

  return (
    <div
      className={`glass-card flex h-full flex-col gap-4 rounded-[24px] border p-5 ${
        isMine
          ? "border-green-500/30 shadow-md shadow-green-500/10"
          : "border-white/10"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-emerald-400/12 bg-emerald-400/[0.05] px-3 py-2">
          <AccountableAvatar profile={accountable} size="md" />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-200/70">Accountable</p>
            <p className="truncate text-sm font-medium text-white">
              {accountable?.displayName ?? "ไม่ระบุ Accountable"}
            </p>
            <p className="truncate text-xs text-white/50">
              {accountable?.functionalRole || accountable?.fullName || "ยังไม่เชื่อม Users & Access"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/60">
            {entry.team}
          </span>
          <span className={`rounded-full border px-2.5 py-1 text-[11px] ${statusStyle.badge}`}>
            {entry.status}
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold leading-5 text-white">{entry.kpiName}</h3>
        <p className="mt-2 text-xs italic text-white/40">
          {entry.measurementMethod || "ยังไม่ได้ระบุวิธีวัด"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-xs text-white/45">เป้าหมาย</p>
          <p className="mt-2 text-base font-semibold text-white tabular-nums">
            {targetLabel}
          </p>
          <p className="mt-1 text-xs text-white/35">{entry.unit || " "}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-xs text-white/45">ผลจริง</p>
          <p className="mt-2 text-base font-semibold text-white tabular-nums">
            {actualLabel}
          </p>
          <p className="mt-1 text-xs text-white/35">
            {entry.actualIsPercent || entry.unit === "%" ? "%" : entry.unit || " "}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-white/45">Achievement</p>
            {isOverTarget && (
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-200">
                เกินเป้า
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] text-white/40">เทียบเป้าหมาย {targetLabel}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${statusStyle.bar}`}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
          <p className="mt-3 text-base font-semibold text-white tabular-nums">
            {entry.achievementPercent === null ? "-" : `${entry.achievementPercent}%`}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 text-sm text-white/45">
        <div className="min-w-0">
          <p className="truncate">{entry.period} / {entry.kpiType}</p>
          <p className="mt-1 truncate text-xs text-white/35">
            Period Start: {formatPeriodStart(entry.periodStart)}
          </p>
        </div>
        {canEdit && (
          <button
            className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-200 transition-colors hover:border-emerald-300/30 hover:bg-emerald-400/15"
            type="button"
            onClick={onEdit}
          >
            แก้ไข
          </button>
        )}
      </div>
    </div>
  )
}
