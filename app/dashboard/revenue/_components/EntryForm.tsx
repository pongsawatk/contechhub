"use client"
import { useState } from "react"
import type { RevenueEntry } from "@/types/revenue"
import { MONTHS_ORDER } from "@/lib/revenue-targets"

interface Props {
  entry?: RevenueEntry
  defaultMonth: string
  onClose: () => void
  onSaved: () => void
}

const REVENUE_TYPES = ["New Booking", "Renewal", "Upsell", "Service", "Infrastructure"]
const RECOGNITION_STATUSES = ["Pending", "Recognized", "Cancelled"]

export default function EntryForm({ entry, defaultMonth, onClose, onSaved }: Props) {
  const isEdit = !!entry
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    entryName: entry?.entryName ?? "",
    month: entry?.month ?? defaultMonth,
    revenueType: entry?.revenueType ?? "New Booking",
    lane: (entry?.lane ?? "") as "Biz" | "Corp" | "",
    bookingAmount: entry?.bookingAmount ?? 0,
    recognizedAmount: entry?.recognizedAmount ?? 0,
    recognitionStatus: entry?.recognitionStatus ?? "Pending",
    customerName: entry?.customerName ?? "",
    goLiveDate: entry?.goLiveDate ?? "",
    contractStart: entry?.contractStart ?? "",
    contractEnd: entry?.contractEnd ?? "",
    note: entry?.note ?? "",
    ownerName: entry?.ownerName ?? "",
    ownerEmail: entry?.ownerEmail ?? "",
  })

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }))
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const url = isEdit ? "/api/internal/revenue/" + entry!.id : "/api/internal/revenue"
      const method = isEdit ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "เกิดข้อผิดพลาด")
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
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-lg bg-[rgba(5,13,50,0.97)] border-l border-accent-cyan/20 overflow-y-auto">
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-lg">{isEdit ? "แก้ไขรายการ" : "เพิ่มรายการรายได้"}</h2>
            <button onClick={onClose} className="text-white/50 hover:text-white text-xl leading-none">&times;</button>
          </div>
          {error && <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-1">ชื่อรายการ *</label>
              <input className="glass-input w-full px-3 py-2 text-sm" required value={form.entryName}
                onChange={(e) => set("entryName", e.target.value)} />
            </div>            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/70 text-sm mb-1">เดือน *</label>
                <select className="glass-input w-full px-3 py-2 text-sm" value={form.month}
                  onChange={(e) => set("month", e.target.value)}>
                  {MONTHS_ORDER.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">ประเภท</label>
                <select className="glass-input w-full px-3 py-2 text-sm" value={form.revenueType}
                  onChange={(e) => set("revenueType", e.target.value)}>
                  {REVENUE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1">ชื่อลูกค้า</label>
              <input className="glass-input w-full px-3 py-2 text-sm" value={form.customerName}
                onChange={(e) => set("customerName", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/70 text-sm mb-1">Lane</label>
                <select className="glass-input w-full px-3 py-2 text-sm" value={form.lane}
                  onChange={(e) => set("lane", e.target.value)}>
                  <option value="">-</option>
                  <option value="Biz">Biz</option>
                  <option value="Corp">Corp</option>
                </select>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">สถานะ</label>
                <select className="glass-input w-full px-3 py-2 text-sm" value={form.recognitionStatus}
                  onChange={(e) => set("recognitionStatus", e.target.value)}>
                  {RECOGNITION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/70 text-sm mb-1">Booking Amount (THB)</label>
                <input type="number" className="glass-input w-full px-3 py-2 text-sm" value={form.bookingAmount}
                  onChange={(e) => set("bookingAmount", Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Recognized Amount (THB)</label>
                <input type="number" className="glass-input w-full px-3 py-2 text-sm" value={form.recognizedAmount}
                  onChange={(e) => set("recognizedAmount", Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-white/70 text-sm mb-1">Contract Start</label>
                <input type="date" className="glass-input w-full px-3 py-2 text-sm" value={form.contractStart}
                  onChange={(e) => set("contractStart", e.target.value)} />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Contract End</label>
                <input type="date" className="glass-input w-full px-3 py-2 text-sm" value={form.contractEnd}
                  onChange={(e) => set("contractEnd", e.target.value)} />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Go-Live Date</label>
                <input type="date" className="glass-input w-full px-3 py-2 text-sm" value={form.goLiveDate}
                  onChange={(e) => set("goLiveDate", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1">หมายเหตุ</label>
              <textarea className="glass-input w-full px-3 py-2 text-sm" rows={3} value={form.note}
                onChange={(e) => set("note", e.target.value)} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 glass-ghost py-2 text-sm rounded-lg">ยกเลิก</button>
              <button type="submit" disabled={saving}
                className="flex-1 glass-btn py-2 text-sm rounded-lg disabled:opacity-50">
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}