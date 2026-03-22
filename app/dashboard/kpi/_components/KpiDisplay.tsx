"use client"

import { useCallback, useEffect, useState } from "react"
import type { KpiRecord } from "@/types/kpi"
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
      <div className="mt-2 h-3 w-28 animate-pulse rounded bg-white/5" />
    </div>
  )
}

function KpiCardSkeleton() {
  return (
    <div className="glass-card space-y-4 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
          <div className="space-y-2">
            <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
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
      <div className="h-9 w-20 animate-pulse rounded-xl bg-white/10" />
    </div>
  )
}

export default function KpiDisplay({ appRole, userEmail }: Props) {
  const isAdmin = appRole === "admin"
  const [entries, setEntries] = useState<KpiRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [filterTeam, setFilterTeam] = useState<"All" | KpiRecord["team"]>("All")
  const [filterOwner, setFilterOwner] = useState("all")
  const [showMineOnly, setShowMineOnly] = useState(!isAdmin)
  const [editingEntry, setEditingEntry] = useState<KpiRecord | null>(null)

  const loadEntries = useCallback(async (showSkeleton = false) => {
    setError("")
    if (showSkeleton) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }

    try {
      const response = await fetch("/api/internal/kpi", {
        cache: "no-store",
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "เกิดข้อผิดพลาดในการโหลด KPI")
      }

      setEntries(data as KpiRecord[])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "เกิดข้อผิดพลาดในการโหลด KPI")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void loadEntries(true)
  }, [loadEntries])

  const normalizedUserEmail = userEmail.toLowerCase()
  const ownerDirectory = Array.from(
    new Map(
      entries
        .flatMap((entry) => entry.ownerProfiles)
        .map((profile) => [profile.notionUserId || profile.email || profile.displayName, profile] as const)
    ).values()
  )

  const filteredEntries = entries.filter((entry) => {
    if (filterTeam !== "All" && entry.team !== filterTeam) {
      return false
    }

    if (filterOwner !== "all" && !entry.ownerProfiles.some((profile) => profile.notionUserId === filterOwner)) {
      return false
    }

    if (showMineOnly && !entry.ownerProfiles.some((profile) => profile.email.toLowerCase() === normalizedUserEmail)) {
      return false
    }

    return true
  })

  const summaryCards = [
    { label: "On Track", color: "text-emerald-300", count: filteredEntries.filter((entry) => entry.status === "On Track").length },
    { label: "At Risk", color: "text-amber-300", count: filteredEntries.filter((entry) => entry.status === "At Risk").length },
    { label: "Off Track", color: "text-rose-300", count: filteredEntries.filter((entry) => entry.status === "Off Track").length },
    { label: "Completed", color: "text-sky-300", count: filteredEntries.filter((entry) => entry.status === "Completed").length },
  ]

  return (
    <>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">KPI Dashboard</h1>
            <p className="mt-1 text-sm text-white/50">ติดตาม KPI, owner, และความคืบหน้าจากเป้าหมายล่าสุด</p>
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
            {summaryCards.map((card) => (
              <div key={card.label} className="glass-card p-4">
                <div className={`text-3xl font-semibold tabular-nums ${card.color}`}>{card.count}</div>
                <div className="mt-2 text-sm text-white/75">{card.label}</div>
                <div className="mt-1 text-xs text-white/40">จาก {filteredEntries.length} KPI ทั้งหมด</div>
              </div>
            ))}
          </div>
        )}

        <KpiFilterBar
          filterOwner={filterOwner}
          filterTeam={filterTeam}
          isAdmin={isAdmin}
          owners={ownerDirectory}
          showMineOnly={showMineOnly}
          onOwnerChange={setFilterOwner}
          onShowMineOnlyChange={setShowMineOnly}
          onTeamChange={setFilterTeam}
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
        ) : filteredEntries.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center text-sm text-white/50">
            ไม่พบ KPI ที่ตรงกับเงื่อนไขที่เลือก
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filteredEntries.map((entry) => {
              const isMine = entry.ownerProfiles.some(
                (profile) => profile.email.toLowerCase() === normalizedUserEmail
              )

              return (
                <KpiCard
                  key={entry.id}
                  canEdit={isAdmin || isMine}
                  entry={entry}
                  isMine={isMine}
                  onEdit={() => setEditingEntry(entry)}
                />
              )
            })}
          </div>
        )}
      </div>

      <KpiEditModal
        entry={editingEntry}
        open={Boolean(editingEntry)}
        onClose={() => setEditingEntry(null)}
        onSaved={async () => {
          setEditingEntry(null)
          await loadEntries()
        }}
      />
    </>
  )
}
