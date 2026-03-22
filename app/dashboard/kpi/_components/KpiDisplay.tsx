"use client"

import { useCallback, useEffect, useState, type CSSProperties } from "react"
import type { AccountableProfile, KpiRecord } from "@/types/kpi"
import AccountableAvatar from "@/components/kpi/AccountableAvatar"
import KpiCard from "@/components/kpi/KpiCard"
import KpiEditModal from "@/components/kpi/KpiEditModal"

interface Props {
  appRole: string
  userEmail: string
}

const TEAM_ORDER = ["BU (Jor)", "Acquisition", "Retention", "Innovation"] as const
const BU_MAX_CARDS = 3

const LANE_CONFIG = {
  "BU (Jor)": {
    label: "BU",
    borderColor: "border-l-gray-400",
    bgColor: "bg-gray-400/10",
    textColor: "text-gray-300",
    countColor: "text-gray-400",
  },
  Acquisition: {
    label: "Acquisition",
    borderColor: "border-l-blue-400",
    bgColor: "bg-blue-400/5",
    textColor: "text-blue-300",
    countColor: "text-blue-400",
  },
  Retention: {
    label: "Retention",
    borderColor: "border-l-green-400",
    bgColor: "bg-green-400/5",
    textColor: "text-green-300",
    countColor: "text-green-400",
  },
  Innovation: {
    label: "Innovation",
    borderColor: "border-l-purple-400",
    bgColor: "bg-purple-400/5",
    textColor: "text-purple-300",
    countColor: "text-purple-400",
  },
} as const

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

function LaneSectionHeader({
  team,
  count,
}: {
  team: keyof typeof LANE_CONFIG
  count: number
}) {
  const config = LANE_CONFIG[team]

  return (
    <div className={`mb-3 flex items-center gap-3 border-l-2 pl-3 ${config.borderColor}`}>
      <span className={`text-sm font-semibold ${config.textColor}`}>{config.label}</span>
      <span className={`text-xs tabular-nums ${config.countColor}`}>· {count} KPI</span>
    </div>
  )
}

function EmptyLane({ team }: { team: keyof typeof LANE_CONFIG }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
      <span className="text-xs text-white/25">ไม่มี KPI ใน {LANE_CONFIG[team].label}</span>
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
  const [personOpen, setPersonOpen] = useState(false)
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

  useEffect(() => {
    if (!personOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPersonOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [personOpen])

  const sessionEmail = userEmail.toLowerCase()
  const accountableOptions: AccountableProfile[] = Array.from(
    new Map(
      records
        .filter((record) => record.accountable)
        .map((record) => [record.accountable!.email, record.accountable!] as const)
    ).values()
  ).sort((a, b) => a.displayName.localeCompare(b.displayName, "th"))
  const selectedAccountable =
    accountableOptions.find((profile) => profile.email === selectedEmail) ?? null

  const filtered = records.filter((record) => {
    const teamOk = selectedTeam === "All" || record.team === selectedTeam
    const personOk = !selectedEmail || record.accountable?.email === selectedEmail
    const mineOk = !showOnlyMine || record.accountable?.email.toLowerCase() === sessionEmail
    return teamOk && personOk && mineOk
  })

  const isGroupedMode = selectedTeam === "All"
  const activeRecords = filtered.filter((record) => !record.kpiName.startsWith("[หมดอายุ]"))
  const groupedByTeam = TEAM_ORDER.reduce(
    (acc, team) => {
      acc[team] = activeRecords.filter((record) => record.team === team)
      return acc
    },
    {} as Record<(typeof TEAM_ORDER)[number], KpiRecord[]>
  )

  const counts = {
    onTrack: filtered.filter((record) => record.status === "On Track").length,
    atRisk: filtered.filter((record) => record.status === "At Risk").length,
    offTrack: filtered.filter((record) => record.status === "Off Track").length,
    completed: filtered.filter((record) => record.status === "Completed").length,
  }

  const renderCard = (record: KpiRecord) => {
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
  }

  return (
    <>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">KPI Dashboard</h1>
            <p className="mt-1 text-sm text-white/50">
              ติดตาม KPI ที่ผูกกับ Accountable จาก Users & Access
            </p>
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

        <div className="relative z-20 flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              className="glass-input flex min-w-[140px] items-center gap-2 rounded-lg px-3 py-1.5 text-sm"
              type="button"
              onClick={() => setPersonOpen((prev) => !prev)}
            >
              {selectedAccountable ? (
                <>
                  <AccountableAvatar profile={selectedAccountable} showTooltip={false} size="sm" />
                  <span className="max-w-[80px] truncate text-white">
                    {selectedAccountable.displayName}
                  </span>
                </>
              ) : (
                <>
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10">
                    <span className="h-2 w-2 rounded-full bg-white/45" />
                  </span>
                  <span className="text-white/70">ทุกคน</span>
                </>
              )}
              <span className="ml-auto flex-shrink-0 text-[10px] text-white/40">▼</span>
            </button>

            {personOpen && (
              <>
                <button
                  aria-label="Close accountable dropdown"
                  className="fixed inset-0 z-40"
                  type="button"
                  onClick={() => setPersonOpen(false)}
                />
                <div className="glass-card absolute left-0 top-full z-50 mt-1 min-w-[180px] py-1 shadow-2xl">
                  <button
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/5 ${
                      !selectedAccountable ? "text-green-400" : "text-white/70"
                    }`}
                    type="button"
                    onClick={() => {
                      setSelectedEmail("")
                      setPersonOpen(false)
                    }}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10">
                      <span className="h-2 w-2 rounded-full bg-white/45" />
                    </span>
                    ทุกคน
                  </button>

                  {accountableOptions.map((profile) => (
                    <button
                      key={profile.email}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/5 ${
                        selectedAccountable?.email === profile.email
                          ? "text-green-400"
                          : "text-white/70"
                      }`}
                      type="button"
                      onClick={() => {
                        setSelectedEmail(profile.email)
                        setPersonOpen(false)
                      }}
                    >
                      <AccountableAvatar profile={profile} showTooltip={false} size="sm" />
                      <span className="truncate">{profile.displayName}</span>
                      <span className="ml-auto text-xs text-white/30">
                        {profile.functionalRole?.split(" ")[0] ?? ""}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="h-6 w-px bg-white/10" />

          {(["All", "BU (Jor)", "Acquisition", "Retention", "Innovation"] as const).map((team) => (
            <button
              key={team}
              className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                selectedTeam === team
                  ? "border border-green-500/30 bg-green-500/20 text-green-400"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              }`}
              type="button"
              onClick={() => setSelectedTeam(team)}
            >
              {team === "BU (Jor)" ? "BU" : team}
            </button>
          ))}

          <div className="flex-1" />

          <label className="flex cursor-pointer items-center gap-2 text-sm text-white/60 hover:text-white/80">
            <input
              checked={showOnlyMine}
              className="h-4 w-4 rounded accent-green-500"
              type="checkbox"
              onChange={(event) => setShowOnlyMine(event.target.checked)}
            />
            เฉพาะของฉัน
          </label>
        </div>

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
        ) : activeRecords.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center text-sm text-white/50">
            ไม่พบ KPI ที่ตรงกับเงื่อนไขที่เลือก
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              {isGroupedMode ? (
                <div className="space-y-6">
                  {groupedByTeam["BU (Jor)"].length > 0 && (
                    <section className={`rounded-2xl border border-white/8 p-4 ${LANE_CONFIG["BU (Jor)"].bgColor}`}>
                      <LaneSectionHeader team="BU (Jor)" count={groupedByTeam["BU (Jor)"].length} />
                      <div
                        className="grid grid-cols-1 gap-4 md:[grid-template-columns:repeat(var(--bu-cols),minmax(0,1fr))]"
                        style={{ "--bu-cols": BU_MAX_CARDS } as CSSProperties}
                      >
                        {groupedByTeam["BU (Jor)"].map(renderCard)}
                      </div>
                    </section>
                  )}

                  <div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-3">
                    {(["Acquisition", "Retention", "Innovation"] as const).map((team) => (
                      <section
                        key={team}
                        className={`rounded-2xl border border-white/8 p-4 ${LANE_CONFIG[team].bgColor}`}
                      >
                        <LaneSectionHeader team={team} count={groupedByTeam[team].length} />
                        <div className="flex flex-col gap-4">
                          {groupedByTeam[team].length > 0
                            ? groupedByTeam[team].map(renderCard)
                            : <EmptyLane team={team} />}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeRecords.map(renderCard)}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 md:hidden">
              {TEAM_ORDER.flatMap((team) => groupedByTeam[team].map(renderCard))}
            </div>
          </>
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
