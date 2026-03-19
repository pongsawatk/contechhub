"use client"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { HotQuotation, Customer } from "@/types/pipeline"
import type { UserProfile } from "@/types/user"
import { formatTHB, formatDate, hotnessDisplay, stageColor, statusColor, HOT_QUOTATION_PRODUCTS, HOT_QUOTATION_STAGES } from "@/lib/pipeline-helpers"
import { generateHotQuotationTemplate, downloadBlob } from "@/lib/excel-templates"
import ExcelImportModal from "./ExcelImportModal"

interface Props {
  quotations: HotQuotation[]
  customers: Customer[]
  currentUser: UserProfile | undefined
}

export default function HotQuotationTab({ quotations, customers, currentUser }: Props) {
  const router = useRouter()
  const [showImport, setShowImport] = useState(false)
  const [filterProduct, setFilterProduct] = useState("")
  const [filterStage, setFilterStage] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterHotness, setFilterHotness] = useState("")
  const [filterLane, setFilterLane] = useState("")
  const [filterOwner, setFilterOwner] = useState("")
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = quotations.filter((q) => {
    if (filterProduct && q.product !== filterProduct) return false
    if (filterStage && q.stage !== filterStage) return false
    if (filterStatus && q.status !== filterStatus) return false
    if (filterHotness && q.hotness !== filterHotness) return false
    if (filterLane && q.lane !== filterLane) return false
    if (filterOwner && !q.ownerName.toLowerCase().includes(filterOwner.toLowerCase())) return false
    if (search) {
      const s = search.toLowerCase()
      const hit = q.entryName.toLowerCase().includes(s) || q.quotationNo.toLowerCase().includes(s) || q.contactName.toLowerCase().includes(s)
      if (hit === false) return false
    }
    return true
  })

  const existingKeys = quotations.map((q) => q.quotationNo + "|" + q.product)
  const totalAmount = filtered.filter((q) => q.status === "Active").reduce((sum, q) => sum + q.quotationAmount, 0)
  const canImport = currentUser?.appRole === "admin" || currentUser?.appRole === "bu_member"

  const handleImportSuccess = useCallback(() => {
    setShowImport(false)
    router.refresh()
  }, [router])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหา..."
            className="glass-input px-3 py-1.5 text-sm rounded-lg w-48"
          />
          <select value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)} className="glass-input px-3 py-1.5 text-sm rounded-lg">
            <option value="">ทุก Product</option>
            {HOT_QUOTATION_PRODUCTS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)} className="glass-input px-3 py-1.5 text-sm rounded-lg">
            <option value="">ทุก Stage</option>
            {HOT_QUOTATION_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="glass-input px-3 py-1.5 text-sm rounded-lg">
            <option value="">ทุก Status</option>
            {["Active", "Won", "Lost", "On Hold"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterLane} onChange={(e) => setFilterLane(e.target.value)} className="glass-input px-3 py-1.5 text-sm rounded-lg">
            <option value="">ทุก Lane</option>
            {["Biz", "Corp"].map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <input
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
            placeholder="Owner..."
            className="glass-input px-3 py-1.5 text-sm rounded-lg w-32"
          />
          <select value={filterHotness} onChange={(e) => setFilterHotness(e.target.value)} className="glass-input px-3 py-1.5 text-sm rounded-lg">
            <option value="">ทุก Hotness</option>
            <option value="5">5 🔥🔥</option>
            <option value="4">4 🔥</option>
          </select>
        </div>
        {canImport && (
          <div className="flex gap-2">
            <button onClick={() => downloadBlob(generateHotQuotationTemplate(), "hot-quotation-template.xlsx")} className="glass-ghost px-3 py-1.5 text-sm rounded-lg">📥 Template</button>
            <button onClick={() => setShowImport(true)} className="glass-btn px-3 py-1.5 text-sm rounded-lg">📤 Import</button>
          </div>
        )}
      </div>

      <div className="text-sm text-white/50">แสดง {filtered.length} รายการ | Active: {formatTHB(totalAmount)} THB</div>

      <div className="space-y-2">
        {filtered.length === 0 && <div className="glass-card p-8 text-center text-white/40">ไม่มีข้อมูล</div>}
        {filtered.map((q) => {
          const isExpanded = expandedId === q.id
          const customerName = customers.find((c) => c.id === q.customerRelationId)?.companyName ?? q.contactName
          return (
            <div key={q.id} className="glass-card p-4">
              <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : q.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-medium text-sm">{q.quotationNo}</span>
                    <span className="text-white/40 text-xs">|</span>
                    <span className="text-cyan-300 text-xs">{q.product}</span>
                    <span className={stageColor(q.stage) + " text-xs"}>{q.stage}</span>
                    <span className={statusColor(q.status) + " text-xs"}>{q.status}</span>
                  </div>
                  <div className="text-white/60 text-xs mt-1 truncate">{customerName}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-white text-sm font-medium">{formatTHB(q.quotationAmount)}</div>
                  <div className="text-yellow-400 text-xs">{hotnessDisplay(q.hotness)}</div>
                </div>
                <div className="text-white/30 text-xs ml-2">{isExpanded ? "▲" : "▼"}</div>
              </div>
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-white/50">
                  <div><span className="text-white/30">Contact:</span> {q.contactName || "-"}</div>
                  <div><span className="text-white/30">Owner:</span> {q.ownerName || "-"}</div>
                  <div><span className="text-white/30">Expected Close:</span> {formatDate(q.expectedClose)}</div>
                  <div><span className="text-white/30">Last Activity:</span> {formatDate(q.lastActivity)}</div>
                  <div><span className="text-white/30">Lane:</span> {q.lane || "-"}</div>
                  <div><span className="text-white/30">Batch:</span> {q.importBatch || "-"}</div>
                  {q.notes && <div className="col-span-2"><span className="text-white/30">Notes:</span> {q.notes}</div>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showImport && (
        <ExcelImportModal
          type="hot-quotation"
          existingKeys={existingKeys}
          customers={customers}
          onClose={() => setShowImport(false)}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  )
}
