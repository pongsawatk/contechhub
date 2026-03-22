"use client"

import type { KpiRecord } from "@/types/kpi"
import AccountableAvatar from "@/components/kpi/AccountableAvatar"

interface KpiCardProps {
  entry: KpiRecord
  canEdit: boolean
  isMine: boolean
  onEdit: () => void
}

const teamColor: Record<string, string> = {
  Acquisition: "bg-blue-500/15 text-blue-400",
  Retention: "bg-green-500/15 text-green-400",
  Innovation: "bg-violet-500/15 text-violet-400",
  "BU (Jor)": "bg-slate-500/15 text-slate-300",
}

const statusColor: Record<string, string> = {
  "On Track": "bg-green-500/15 text-green-400",
  "At Risk": "bg-amber-500/15 text-amber-400",
  "Off Track": "bg-red-500/15 text-red-400",
  Completed: "bg-blue-500/15 text-blue-400",
}

function formatValue(value: number | null, unit: string, isPercent: boolean): string {
  if (value === null) return "-"
  if (isPercent || unit === "%") return `${value}%`
  if (unit === "THB") return `฿${value.toLocaleString("th-TH")}`
  if (unit === "x") return `${value}x`
  return `${value.toLocaleString("th-TH")}${unit ? ` ${unit}` : ""}`
}

function formatThaiDate(date: string | null): string {
  if (!date) return "ไม่ระบุ"

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export default function KpiCard({ entry, canEdit, isMine, onEdit }: KpiCardProps) {
  const progressBarColor =
    entry.status === "On Track"
      ? "bg-green-500"
      : entry.status === "At Risk"
        ? "bg-amber-500"
        : entry.status === "Off Track"
          ? "bg-red-500"
          : "bg-blue-500"

  const statusTextColor =
    entry.status === "On Track"
      ? "text-green-400"
      : entry.status === "At Risk"
        ? "text-amber-400"
        : entry.status === "Off Track"
          ? "text-red-400"
          : "text-blue-400"

  const actualTone =
    (entry.achievementPercent ?? 0) >= 100
      ? "text-green-400"
      : (entry.achievementPercent ?? 0) >= 70
        ? "text-white"
        : "text-amber-400"

  return (
    <div
      className={`glass-card flex flex-col gap-0 p-4 transition-all ${
        isMine ? "border border-green-500/25 shadow-md shadow-green-500/10" : ""
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <AccountableAvatar profile={entry.accountable} shape="rounded" size="sm" showTooltip />

        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium leading-tight text-white">
            {entry.accountable?.displayName ?? "-"}
          </div>
          <div className="truncate text-[10px] leading-tight text-white/40">
            {entry.accountable?.functionalRole ?? ""}
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1">
          <span
            className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium ${
              teamColor[entry.team] ?? "bg-white/10 text-white/50"
            }`}
          >
            {entry.team.replace(" (Jor)", "")}
          </span>
          <span
            className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium ${
              statusColor[entry.status]
            }`}
          >
            {entry.status === "On Track"
              ? "✓ On Track"
              : entry.status === "At Risk"
                ? "⚠ At Risk"
                : entry.status === "Off Track"
                  ? "✗ Off Track"
                  : "✓ Done"}
          </span>
        </div>
      </div>

      <h3 className="mb-1 line-clamp-2 text-sm font-semibold leading-snug text-white">
        {entry.kpiName}
      </h3>

      {entry.measurementMethod && (
        <p className="mb-3 line-clamp-2 text-[11px] italic leading-tight text-white/35">
          {entry.measurementMethod}
        </p>
      )}

      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <span className="whitespace-nowrap text-white/35">เป้า</span>
            <span className="font-semibold text-white tabular-nums">
              {formatValue(entry.target, entry.unit, false)}
            </span>
          </div>

          <div className="h-3 w-px flex-shrink-0 bg-white/10" />

          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <span className="whitespace-nowrap text-white/35">จริง</span>
            <span className={`font-semibold tabular-nums ${actualTone}`}>
              {formatValue(entry.actual, entry.unit, entry.actualIsPercent)}
            </span>
          </div>

          <div className="h-3 w-px flex-shrink-0 bg-white/10" />

          <div className="flex flex-shrink-0 items-center gap-1">
            <span className={`text-sm font-bold tabular-nums ${statusTextColor}`}>
              {entry.achievementPercent !== null ? `${Math.round(entry.achievementPercent)}%` : "-"}
            </span>
            {(entry.achievementPercent ?? 0) > 100 && (
              <span className="rounded bg-green-500/10 px-1 text-[9px] text-green-400">
                เกินเป้า
              </span>
            )}
          </div>
        </div>

        <div className="relative h-1.5 overflow-hidden rounded-full bg-white/8">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
            style={{ width: `${Math.min(entry.achievementPercent ?? 0, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="text-[10px] text-white/30">
          <span>{entry.period}</span>
          <span className="mx-1">·</span>
          <span>{entry.kpiType}</span>
          {entry.periodStart && (
            <>
              <br />
              <span>Period Start: {formatThaiDate(entry.periodStart)}</span>
            </>
          )}
        </div>

        {canEdit && (
          <button
            className="glass-ghost rounded-lg px-3 py-1 text-xs"
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
