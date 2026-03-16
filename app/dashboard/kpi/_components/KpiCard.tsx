"use client"
import { useState } from "react"
import type { KpiEntry } from "@/types/kpi"

interface Props {
  entry: KpiEntry
  canEdit: boolean
  onUpdated: () => void
}

const STATUS_COLORS: Record<string, string> = {
  "On Track": "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  "At Risk": "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  "Off Track": "text-red-400 bg-red-400/10 border-red-400/30",
  "Completed": "text-green-400 bg-green-400/10 border-green-400/30",
}

export default function KpiCard({ entry, canEdit, onUpdated }: Props) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [actual, setActual] = useState(String(entry.actual))
  const [notes, setNotes] = useState(entry.notes)
  const [status, setStatus] = useState(entry.status)

  const pct = entry.target > 0 ? Math.min(100, Math.round((entry.actual / entry.target) * 100)) : 0
  const statusColor = STATUS_COLORS[entry.status] ?? "text-white/60 bg-white/5 border-white/10"

  async function handleSave() {
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/internal/kpi/" + entry.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actual: Number(actual), notes, status }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "เกิดข้อผิดพลาด")
      } else {
        setOpen(false)
        onUpdated()
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-sm truncate">{entry.kpiName}</h3>
          <p className="text-white/50 text-xs mt-0.5">{entry.ownerName} {entry.team ? "· " + entry.team : ""}</p>
        </div>
        <span className={"shrink-0 text-xs px-2 py-0.5 rounded border " + statusColor}>{entry.status || "No Status"}</span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-white/60">
          <span>Actual: <span className="text-white font-semibold">{entry.actual.toLocaleString()}</span></span>
          <span>Target: {entry.target.toLocaleString()}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className={"h-2 rounded-full transition-all " + (pct >= 100 ? "bg-cyan-400" : pct >= 70 ? "bg-blue-400" : "bg-blue-700")}
            style={{ width: pct + "%" }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-white/40">{entry.kpiType}{entry.period ? " · " + entry.period : ""}</span>
          <span className="text-white/60">{pct}%</span>
        </div>
      </div>

      {entry.notes && !open && (
        <p className="text-white/50 text-xs line-clamp-2">{entry.notes}</p>
      )}

      {canEdit && !open && (
        <button onClick={() => setOpen(true)}
          className="text-xs text-accent-cyan hover:text-white transition-colors">
          อัปเดต KPI
        </button>
      )}

      {open && (
        <div className="space-y-3 pt-2 border-t border-white/10">
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div>
            <label className="block text-white/60 text-xs mb-1">Actual</label>
            <input type="number" value={actual} onChange={(e) => setActual(e.target.value)}
              className="glass-input w-full px-3 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-white/60 text-xs mb-1">สถานะ</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as KpiEntry["status"])}
              className="glass-input w-full px-3 py-1.5 text-sm">
              <option value="">-</option>
              <option>On Track</option>
              <option>At Risk</option>
              <option>Off Track</option>
              <option>Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-white/60 text-xs mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              className="glass-input w-full px-3 py-1.5 text-sm" rows={2} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setOpen(false)}
              className="flex-1 text-xs glass-ghost py-1.5 rounded-lg">ยกเลิก</button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 text-xs glass-btn py-1.5 rounded-lg disabled:opacity-50">
              {saving ? "บันทึก..." : "บันทึก"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}