"use client"

import type { KpiRecord } from "@/types/kpi"
import OwnerAvatar from "@/components/kpi/OwnerAvatar"

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

function getMetricValue(value: number | null, unit: string, actualIsPercent: boolean) {
  if (value === null) {
    return { valueLabel: "—", unitLabel: "" }
  }

  if (unit === "THB") {
    return {
      valueLabel: `฿${value.toLocaleString("th-TH")}`,
      unitLabel: "THB",
    }
  }

  if (actualIsPercent || unit === "%") {
    return {
      valueLabel: `${value}%`,
      unitLabel: "%",
    }
  }

  return {
    valueLabel: value.toLocaleString("th-TH"),
    unitLabel: unit,
  }
}

function getOwnerLabel(entry: KpiRecord) {
  if (entry.ownerProfiles.length === 0) {
    return "Unassigned"
  }

  if (entry.ownerProfiles.length === 1) {
    return entry.ownerProfiles[0].displayName
  }

  const firstTwo = entry.ownerProfiles.slice(0, 2).map((owner) => owner.displayName).join(", ")
  const remaining = entry.ownerProfiles.length - 2
  return remaining > 0 ? `${firstTwo} +${remaining}` : firstTwo
}

export default function KpiCard({ entry, canEdit, isMine, onEdit }: KpiCardProps) {
  const targetMetric = getMetricValue(entry.target, entry.unit, false)
  const actualMetric = getMetricValue(entry.actual, entry.unit, entry.actualIsPercent)
  const achievementLabel = entry.achievementPercent === null ? "—" : `${entry.achievementPercent}%`
  const progressWidth = Math.max(0, Math.min(entry.achievementPercent ?? 0, 100))
  const statusStyle = STATUS_STYLES[entry.status]

  return (
    <div
      className={`glass-card flex h-full flex-col gap-4 rounded-[24px] border p-5 ${
        isMine ? "border-emerald-500/30" : "border-white/10"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <OwnerAvatar owners={entry.ownerProfiles} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm text-white">{getOwnerLabel(entry)}</p>
            <p className="truncate text-xs text-white/45">{entry.team}</p>
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
        <h3 className="text-lg font-semibold leading-snug text-white">{entry.kpiName}</h3>
        <p className="mt-2 text-sm text-white/50">
          วิธีวัด: {entry.measurementMethod || "ยังไม่ได้ระบุ"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-xs text-white/45">Target</p>
          <p className="mt-2 text-lg font-semibold text-white tabular-nums">{targetMetric.valueLabel}</p>
          <p className="mt-1 text-xs text-white/35">{targetMetric.unitLabel || " "}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-xs text-white/45">Actual</p>
          <p className="mt-2 text-lg font-semibold text-white tabular-nums">{actualMetric.valueLabel}</p>
          <p className="mt-1 text-xs text-white/35">{actualMetric.unitLabel || entry.unit || " "}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-xs text-white/45">Achievement %</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${statusStyle.bar}`}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
          <p className="mt-3 text-lg font-semibold text-white tabular-nums">{achievementLabel}</p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 text-sm text-white/45">
        <p className="truncate">
          {entry.period} · {entry.kpiType}
        </p>
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
