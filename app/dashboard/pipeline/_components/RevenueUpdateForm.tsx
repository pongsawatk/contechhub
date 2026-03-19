"use client"
import { useState } from "react"
import type { SalesOrder } from "@/types/pipeline"
import { RECOGNITION_STATUSES } from "@/lib/pipeline-helpers"

interface Props {
  order: SalesOrder
  onClose: () => void
  onSaved: () => void
}

export default function RevenueUpdateForm({ order, onClose, onSaved }: Props) {
  const [pct, setPct] = useState(String(order.revenuePercent || 0))
  const [amt, setAmt] = useState(String(order.revenueAmount || 0))
  const [status, setStatus] = useState(order.recognitionStatus || "Pending")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function handlePctChange(v: string) {
    setPct(v)
    const p = Number(v)
    if (!isNaN(p) && order.orderAmount > 0) {
      setAmt(String(Math.round(order.orderAmount * p / 100)))
    }
  }

  function handleAmtChange(v: string) {
    setAmt(v)
    const a = Number(v)
    if (!isNaN(a) && order.orderAmount > 0) {
      setPct(String(Math.round(a / order.orderAmount * 10000) / 100))
    }
  }

  async function handleSave() {
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/internal/pipeline/sales-order/" + order.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revenuePercent: Number(pct), revenueAmount: Number(amt), recognitionStatus: status }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? "เกิดข้อผิดพลาด")
      } else {
        onSaved()
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-2 p-4 rounded-lg border border-yellow-400/30 bg-yellow-400/5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-yellow-400 text-sm font-medium">อัปเดต Revenue</span>
        <button onClick={onClose} className="text-white/40 hover:text-white text-lg leading-none">&times;</button>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="block text-white/60 text-xs mb-1">Revenue % (0-100)</label>
          <input type="number" min="0" max="100" value={pct}
            onChange={(e) => handlePctChange(e.target.value)}
            className="glass-input w-full px-3 py-2 text-sm" />
        </div>
        <div className="text-white/40 text-sm pt-5">หรือ</div>
        <div className="flex-1">
          <label className="block text-white/60 text-xs mb-1">Revenue Amount (THB)</label>
          <input type="number" min="0" value={amt}
            onChange={(e) => handleAmtChange(e.target.value)}
            className="glass-input w-full px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-white/60 text-xs mb-1">Recognition Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="glass-input w-full px-3 py-2 text-sm">
          {RECOGNITION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 glass-ghost py-2 text-sm rounded-lg">ยกเลิก</button>
        <button onClick={handleSave} disabled={saving}
          className="flex-1 glass-btn py-2 text-sm rounded-lg disabled:opacity-50">
          {saving ? "บันทึก..." : "บันทึก"}
        </button>
      </div>
    </div>
  )
}