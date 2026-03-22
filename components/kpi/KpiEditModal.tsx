"use client"

import { useEffect, useState } from "react"
import type { KpiRecord } from "@/types/kpi"

interface KpiEditModalProps {
  entry: KpiRecord | null
  open: boolean
  onClose: () => void
  onSaved: () => Promise<void> | void
}

function getActualLabel(entry: KpiRecord) {
  if (entry.actualIsPercent || entry.unit === "%") {
    return "ผลจริง (%)"
  }

  return entry.unit ? `ผลจริง (${entry.unit})` : "ผลจริง"
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

export default function KpiEditModal({ entry, open, onClose, onSaved }: KpiEditModalProps) {
  const [actual, setActual] = useState("")
  const [status, setStatus] = useState<KpiRecord["status"]>("On Track")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!entry) {
      return
    }

    setActual(entry.actual === null ? "" : String(entry.actual))
    setStatus(entry.status)
    setNotes(entry.notes)
    setError("")
  }, [entry])

  useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose, open])

  if (!open || !entry) {
    return null
  }

  const currentEntry = entry
  const actualNumber = actual.trim() === "" ? null : Number(actual)
  const liveAchievement =
    actualNumber === null || Number.isNaN(actualNumber) || !currentEntry.target || currentEntry.target <= 0
      ? null
      : Math.round((actualNumber / currentEntry.target) * 100)

  async function handleSave() {
    if (actual.trim() !== "" && Number.isNaN(actualNumber)) {
      setError("ค่า Actual ต้องเป็นตัวเลข")
      return
    }

    setSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/internal/kpi/${currentEntry.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actual: actualNumber,
          status,
          notes,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "บันทึกไม่สำเร็จ")
      }

      await onSaved()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "เกิดข้อผิดพลาดในการบันทึก")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="glass-card w-full max-w-xl rounded-[28px] border border-white/10 p-6 shadow-2xl shadow-slate-950/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/70">Edit KPI</p>
            <h2 className="mt-2 text-xl font-semibold text-white">{currentEntry.kpiName}</h2>
          </div>
          <button
            className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/60 transition-colors hover:text-white"
            type="button"
            onClick={onClose}
          >
            ปิด
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="text-xs text-white/45">Target</div>
            <div className="mt-1 text-sm font-medium text-white tabular-nums">
              {formatValue(currentEntry.target, currentEntry.unit, false)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="text-xs text-white/45">Period Start</div>
            <div className="mt-1 text-sm font-medium text-white">{formatPeriodStart(currentEntry.periodStart)}</div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {error && (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm text-white/60">{getActualLabel(currentEntry)}</label>
            <input
              className="glass-input w-full px-4 py-3 text-base tabular-nums"
              inputMode="decimal"
              type="number"
              value={actual}
              onChange={(event) => setActual(event.target.value)}
            />
            <p className="mt-2 text-xs text-white/40">
              เป้าหมายปัจจุบัน: {formatValue(currentEntry.target, currentEntry.unit, false)}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/60">Achievement %</label>
            <div className="glass-input flex min-h-12 items-center px-4 py-3 text-base text-white/80 tabular-nums">
              {liveAchievement === null ? "-" : `${liveAchievement}%`}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/60">Status</label>
            <select
              className="glass-input w-full px-4 py-3 text-base"
              value={status}
              onChange={(event) => setStatus(event.target.value as KpiRecord["status"])}
            >
              <option value="On Track">On Track</option>
              <option value="At Risk">At Risk</option>
              <option value="Off Track">Off Track</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/60">Blocker / หมายเหตุ</label>
            <textarea
              className="glass-input min-h-28 w-full px-4 py-3 text-base"
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="glass-ghost px-4 py-2 text-sm"
            type="button"
            onClick={onClose}
          >
            ยกเลิก
          </button>
          <button
            className="glass-btn px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={saving}
            type="button"
            onClick={handleSave}
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  )
}
