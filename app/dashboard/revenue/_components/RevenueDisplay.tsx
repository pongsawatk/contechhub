"use client"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { RevenueEntry } from "@/types/revenue"
import BUProgressCard from "./BUProgressCard"
import MonthGrid from "./MonthGrid"
import RevenueTable from "./RevenueTable"
import EntryForm from "./EntryForm"
import { MONTHS_ORDER } from "@/lib/revenue-targets"

interface Props {
  entries: RevenueEntry[]
  appRole: string
  userEmail: string
}

function getCurrentMonth(): string {
  const now = new Date()
  const monthMap: Record<number, string> = {
    0: "Jan-26", 1: "Feb-26", 2: "Mar-26", 3: "Apr-26",
    4: "May-26", 5: "Jun-26", 6: "Jul-26", 7: "Aug-26",
    8: "Sep-26", 9: "Oct-26", 10: "Nov-26", 11: "Dec-26",
  }
  return monthMap[now.getMonth()] ?? MONTHS_ORDER[0]
}

export default function RevenueDisplay({ entries, appRole }: Props) {
  const router = useRouter()
  const canEdit = appRole === "admin" || appRole === "bu_member"
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth)
  const [showForm, setShowForm] = useState(false)
  const [editEntry, setEditEntry] = useState<RevenueEntry | undefined>(undefined)

  const filteredEntries = entries.filter((e) => e.month === selectedMonth)

  const handleSaved = useCallback(() => {
    setShowForm(false)
    setEditEntry(undefined)
    router.refresh()
  }, [router])

  const handleEdit = useCallback((entry: RevenueEntry) => {
    setEditEntry(entry)
    setShowForm(true)
  }, [])

  const handleAdd = useCallback(() => {
    setEditEntry(undefined)
    setShowForm(true)
  }, [])

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Revenue Tracker</h1>
          <p className="text-white/50 text-sm mt-1">ติดตามรายได้ BU ปี 2026</p>
        </div>
        {canEdit && (
          <button onClick={handleAdd} className="glass-btn px-4 py-2 text-sm rounded-lg">
            + เพิ่มรายการ
          </button>
        )}
      </div>

      <BUProgressCard entries={entries} />

      <div>
        <h2 className="text-white/70 text-sm font-medium mb-3">เลือกเดือน</h2>
        <MonthGrid entries={entries} selectedMonth={selectedMonth} onSelect={setSelectedMonth} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-medium">
            รายการ — {selectedMonth}
            <span className="text-white/50 text-sm ml-2">({filteredEntries.length} รายการ)</span>
          </h2>
        </div>
        <RevenueTable entries={filteredEntries} canEdit={canEdit} onEdit={handleEdit} />
      </div>

      {showForm && (
        <EntryForm
          entry={editEntry}
          defaultMonth={selectedMonth}
          onClose={() => { setShowForm(false); setEditEntry(undefined) }}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}