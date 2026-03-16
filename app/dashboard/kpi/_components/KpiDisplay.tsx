"use client"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { KpiEntry } from "@/types/kpi"
import KpiCard from "./KpiCard"

interface Props {
  entries: KpiEntry[]
  appRole: string
  userEmail: string
}

const TEAMS = ["All", "BU", "Acquisition", "Retention", "Innovation"]

export default function KpiDisplay({ entries, appRole, userEmail }: Props) {
  const router = useRouter()
  const isAdmin = appRole === "admin"
  const [filterTeam, setFilterTeam] = useState("All")
  const [showMineOnly, setShowMineOnly] = useState(!isAdmin)

  const handleUpdated = useCallback(() => { router.refresh() }, [router])

  const filtered = entries.filter((e) => {
    if (showMineOnly && e.ownerEmail !== userEmail) return false
    if (filterTeam !== "All" && e.team !== filterTeam) return false
    return true
  })

  const byStatus = {
    onTrack: filtered.filter((e) => e.status === "On Track").length,
    atRisk: filtered.filter((e) => e.status === "At Risk").length,
    offTrack: filtered.filter((e) => e.status === "Off Track").length,
    completed: filtered.filter((e) => e.status === "Completed").length,
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-white">KPI Dashboard</h1>
        <p className="text-white/50 text-sm mt-1">ติดตามและอัปเดต KPI ส่วนตัว</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "On Track", count: byStatus.onTrack, color: "text-cyan-400" },
          { label: "At Risk", count: byStatus.atRisk, color: "text-yellow-400" },
          { label: "Off Track", count: byStatus.offTrack, color: "text-red-400" },
          { label: "Completed", count: byStatus.completed, color: "text-green-400" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <div className={"text-3xl font-bold " + s.color}>{s.count}</div>
            <div className="text-white/60 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          {TEAMS.map((t) => (
            <button key={t} onClick={() => setFilterTeam(t)}
              className={"text-xs px-3 py-1 rounded-full border transition-all " +
                (filterTeam === t
                  ? "border-accent-cyan text-accent-cyan bg-accent-cyan/10"
                  : "border-white/20 text-white/60 hover:border-white/40")}>
              {t}
            </button>
          ))}
        </div>
        {isAdmin && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showMineOnly} onChange={(e) => setShowMineOnly(e.target.checked)}
              className="accent-cyan-400" />
            <span className="text-white/60 text-xs">เฉพาะของฉัน</span>
          </label>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-8 text-center text-white/50">
          ไม่พบ KPI ที่ตรงกับเงื่อนไข
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((entry) => (
            <KpiCard
              key={entry.id}
              entry={entry}
              canEdit={isAdmin || entry.ownerEmail === userEmail}
              onUpdated={handleUpdated}
            />
          ))}
        </div>
      )}
    </div>
  )
}