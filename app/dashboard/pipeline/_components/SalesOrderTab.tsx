"use client"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { SalesOrder, Customer } from "@/types/pipeline"
import type { UserProfile } from "@/types/user"
import { formatTHB, formatDate, recognitionColor, REVENUE_TYPES } from "@/lib/pipeline-helpers"
import { generateSalesOrderTemplate, downloadBlob } from "@/lib/excel-templates"
import ExcelImportModal from "./ExcelImportModal"
import RevenueUpdateForm from "./RevenueUpdateForm"

interface Props {
  orders: SalesOrder[]
  customers: Customer[]
  currentUser: UserProfile | undefined
}

export default function SalesOrderTab({ orders, customers, currentUser }: Props) {
  const router = useRouter()
  const [showImport, setShowImport] = useState(false)
  const [filterRevType, setFilterRevType] = useState("")
  const [filterRecog, setFilterRecog] = useState("")
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [revenueFormId, setRevenueFormId] = useState<string | null>(null)

  const filtered = orders.filter((o) => {
    if (filterRevType && o.revenueType !== filterRevType) return false
    if (filterRecog && o.recognitionStatus !== filterRecog) return false
    if (search) {
      const s = search.toLowerCase()
      const hit = o.entryName.toLowerCase().includes(s) || o.orderNo.toLowerCase().includes(s) || o.contactName.toLowerCase().includes(s)
      if (hit === false) return false
    }
    return true
  })

  const existingKeys = orders.map((o) => o.orderNo)
  const totalAmount = filtered.reduce((sum, o) => sum + o.orderAmount, 0)
  const totalRecognized = filtered.reduce((sum, o) => sum + o.revenueAmount, 0)
  const canImport = currentUser?.appRole === "admin" || currentUser?.appRole === "bu_member"

  const handleImportSuccess = useCallback(() => {
    setShowImport(false)
    router.refresh()
  }, [router])

  const handleRevenueUpdate = useCallback(() => {
    setRevenueFormId(null)
    router.refresh()
  }, [router])
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="\u0e04\u0e49\u0e19\u0e2b\u0e32..." className="glass-input px-3 py-1.5 text-sm rounded-lg w-48" />
          <select value={filterRevType} onChange={(e) => setFilterRevType(e.target.value)} className="glass-input px-3 py-1.5 text-sm rounded-lg">
            <option value="">\u0e17\u0e38\u0e01 Revenue Type</option>
            {REVENUE_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filterRecog} onChange={(e) => setFilterRecog(e.target.value)} className="glass-input px-3 py-1.5 text-sm rounded-lg">
            <option value="">\u0e17\u0e38\u0e01 Recognition</option>
            {["Pending", "Partially Recognized", "Fully Recognized", "Cancelled"].map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        {canImport && (
          <div className="flex gap-2">
            <button onClick={() => downloadBlob(generateSalesOrderTemplate(), "sales-order-template.xlsx")} className="glass-ghost px-3 py-1.5 text-sm rounded-lg">\uD83D\uDCE5 Template</button>
            <button onClick={() => setShowImport(true)} className="glass-btn px-3 py-1.5 text-sm rounded-lg">\uD83D\uDCE4 Import</button>
          </div>
        )}
      </div>
      <div className="text-sm text-white/50">\u0e41\u0e2a\u0e14\u0e07 {filtered.length} \u0e23\u0e32\u0e22\u0e01\u0e32\u0e23 | \u0e23\u0e27\u0e21 {formatTHB(totalAmount)} | Recognized {formatTHB(totalRecognized)} THB</div>
      <div className="space-y-2">
        {filtered.length === 0 && <div className="glass-card p-8 text-center text-white/40">\u0e44\u0e21\u0e48\u0e21\u0e35\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25</div>}
        {filtered.map((o) => {
          const isExpanded = expandedId === o.id
          const customerName = customers.find((c) => c.id === o.customerRelationId)?.companyName ?? o.contactName
          return (
            <div key={o.id} className="glass-card p-4">
              <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : o.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-medium text-sm">{o.orderNo}</span>
                    <span className="text-white/40 text-xs">|</span>
                    <span className="text-cyan-300 text-xs">{o.product}</span>
                    <span className="text-white/50 text-xs">{o.revenueType}</span>
                    <span className={recognitionColor(o.recognitionStatus) + " text-xs"}>{o.recognitionStatus}</span>
                  </div>
                  <div className="text-white/60 text-xs mt-1">{customerName}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-white text-sm font-medium">{formatTHB(o.orderAmount)}</div>
                  <div className="text-white/40 text-xs">{o.lane}</div>
                </div>
                <div className="text-white/30 text-xs ml-2">{isExpanded ? "\u25b2" : "\u25bc"}</div>
              </div>
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-white/50">
                    <div><span className="text-white/30">Contact:</span> {o.contactName || "-"}</div>
                    <div><span className="text-white/30">Owner:</span> {o.ownerName || "-"}</div>
                    <div><span className="text-white/30">Close Date:</span> {formatDate(o.closeDate)}</div>
                    <div><span className="text-white/30">Go-live:</span> {formatDate(o.expectedGoLive)}</div>
                    <div><span className="text-white/30">Contract:</span> {o.contractMonths ? o.contractMonths + " \u0e40\u0e14\u0e37\u0e2d\u0e19" : "-"}</div>
                    <div><span className="text-white/30">Payment:</span> {o.paymentTerms || "-"}</div>
                    <div><span className="text-white/30">Revenue %:</span> {o.revenuePercent}%</div>
                    <div><span className="text-white/30">Recognized:</span> {formatTHB(o.revenueAmount)}</div>
                    {o.notes && <div className="col-span-2"><span className="text-white/30">Notes:</span> {o.notes}</div>}
                  </div>
                  {canImport && revenueFormId !== o.id && (
                    <button onClick={() => setRevenueFormId(o.id)} className="glass-ghost px-3 py-1.5 text-xs rounded-lg">\u0e2d\u0e31\u0e1b\u0e40\u0e14\u0e15 Revenue</button>
                  )}
                  {canImport && revenueFormId === o.id && (
                    <RevenueUpdateForm order={o} onClose={() => setRevenueFormId(null)} onSaved={handleRevenueUpdate} />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {showImport && (
        <ExcelImportModal type="sales-order" existingKeys={existingKeys} customers={customers} onClose={() => setShowImport(false)} onSuccess={handleImportSuccess} />
      )}
    </div>
  )
}