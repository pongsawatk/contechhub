"use client"

import { useCallback, useEffect, useState } from "react"
import type { AccountableProfile, KpiRecord } from "@/types/kpi"
import KpiCard from "@/components/kpi/KpiCard"
import KpiEditModal from "@/components/kpi/KpiEditModal"
import KpiFilterBar from "@/components/kpi/KpiFilterBar"

interface Props {
  appRole: string
  userEmail: string
}

function KpiSummarySkeleton() {
  return (
    <div className="glass-card p-4">
      <div className="h-8 w-14 animate-pulse rounded bg-white/10" />
      <div className="mt-3 h-4 w-24 animate-pulse rounded bg-white/10" />
      <div className="mt-2 h-3 w-24 animate-pulse rounded bg-white/5" />
    </div>
  )
}

function KpiCardSkeleton() {
  return (
    <div className="glass-card space-y-4 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
          <div className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-20 animate-pulse rounded bg-white/5" />
          </div>
        </div>
        <div className="h-6 w-20 animate-pulse rounded-full bg-white/10" />
      </div>
      <div className="h-5 w-4/5 animate-pulse rounded bg-white/10" />
      <div className="h-4 w-full animate-pulse rounded bg-white/5" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="h-3 w-12 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-6 w-20 animate-pulse rounded bg-white/10" />
            <div className="mt-2 h-3 w-10 animate-pulse rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function KpiDisplay({ appRole, userEmail }: Props) {
  const isAdmin = appRole === "admin"
  const [records, setRecords] = useState<KpiRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<"All" | KpiRecord["team"]>("All")
  const [selectedEmail, setSelectedEmail] = useState("")
  const [showOnlyMine, setShowOnlyMine] = useState(!isAdmin)
  const [editingRecord, setEditingRecord] = useState<KpiRecord | null>(null)

  const loadRecords = useCallback(async (showSkeleton = false) => {
    setError("")
    if (showSkeleton) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }

    try {
      const response = await fetch("/api/internal/kpi", { cache: "no-store" })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "เกิดข้อผิดพลาดในการโหลด KPI")
      }

      setRecords(data as KpiRecord[])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "เกิดข้อผิดพลาดในการโหลด KPI")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void loadRecords(true)
  }, [loadRecords])

  const sessionEmail = userEmail.toLowerCase()
  const accountableOptions: AccountableProfile[] = Array.from(
    new Map(
      records
        .filter((record) => record.accountable)
        .map((record) => [record.accountable!.email, record.accountable!] as const)
    ).values()
  ).sort((a, b) => a.displayName.localeCompare(b.displayName, "th"))

  const filtered = records.filter((record) => {
    const teamOk = selectedTeam === "All" || record.team === selectedTeam
    const personOk = !selectedEmail || record.accountable?.email === selectedEmail
    const mineOk = !showOnlyMine || record.accountable?.email.toLowerCase() === sessionEmail
    return teamOk && personOk && mineOk
  })

  const counts = {
    onTrack: filtered.filter((record) => record.status === "On Track").length,
    atRisk: filtered.filter((record) => record.status === "At Risk").length,
    offTrack: filtered.filter((record) => record.status === "Off Track").length,
    completed: filtered.filter((record) => record.status === "Completed").length,
  }

  return (
    <>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">KPI Dashboard</h1>
            <p className="mt-1 text-sm text-white/50">ติดตาม KPI ที่ผูกกับ Accountable จาก Users & Access</p>
          </div>
          {refreshing && <p className="text-xs text-white/40">กำลังรีเฟรชข้อมูลล่าสุด...</p>}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <KpiSummarySkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "On Track", color: "text-emerald-300", count: counts.onTrack },
              { label: "At Risk", color: "text-amber-300", count: counts.atRisk },
              { label: "Off Track", color: "text-rose-300", count: counts.offTrack },
              { label: "Completed", color: "text-sky-300", count: counts.completed },
            ].map((card) => (
              <div key={card.label} className="glass-card p-4">
                <div className={`text-3xl font-semibold tabular-nums ${card.color}`}>{card.count}</div>
                <div className="mt-2 text-sm text-white/75">{card.label}</div>
                <div className="mt-1 text-xs text-white/40">จาก {filtered.length} KPI</div>
              </div>
            ))}
          </div>
        )}

        <KpiFilterBar
          accountableOptions={accountableOptions}
          isAdmin={isAdmin}
          selectedEmail={selectedEmail}
          selectedTeam={selectedTeam}
          showOnlyMine={showOnlyMine}
          onSelectedEmailChange={setSelectedEmail}
          onSelectedTeamChange={setSelectedTeam}
          onShowOnlyMineChange={setShowOnlyMine}
        />

        {error ? (
          <div className="glass-card rounded-2xl border border-rose-400/30 p-6 text-sm text-rose-200">
            {error}
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <KpiCardSkeleton key={index} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center text-sm text-white/50">
            ไม่พบ KPI ที่ตรงกับเงื่อนไขที่เลือก
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filtered.map((record) => {
              const isMine = record.accountable?.email.toLowerCase() === sessionEmail

              return (
                <KpiCard
                  key={record.id}
                  canEdit={isAdmin || isMine}
                  entry={record}
                  isMine={Boolean(isMine)}
                  onEdit={() => setEditingRecord(record)}
                />
              )
            })}
          </div>
        )}
      </div>

      <KpiEditModal
        entry={editingRecord}
        open={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        onSaved={async () => {
          setEditingRecord(null)
          await loadRecords()
        }}
      />
    </>
  )
}
