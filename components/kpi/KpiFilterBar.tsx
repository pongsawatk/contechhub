"use client"

import { useEffect, useRef, useState } from "react"
import type { KpiRecord, OwnerProfile } from "@/types/kpi"
import OwnerAvatar from "@/components/kpi/OwnerAvatar"

interface KpiFilterBarProps {
  filterOwner: string
  filterTeam: "All" | KpiRecord["team"]
  isAdmin: boolean
  owners: OwnerProfile[]
  showMineOnly: boolean
  onOwnerChange: (ownerId: string) => void
  onShowMineOnlyChange: (value: boolean) => void
  onTeamChange: (team: "All" | KpiRecord["team"]) => void
}

const TEAM_FILTERS: Array<{ label: string; value: "All" | KpiRecord["team"] }> = [
  { label: "All", value: "All" },
  { label: "BU", value: "BU (Jor)" },
  { label: "Acquisition", value: "Acquisition" },
  { label: "Retention", value: "Retention" },
  { label: "Innovation", value: "Innovation" },
]

export default function KpiFilterBar({
  filterOwner,
  filterTeam,
  isAdmin,
  owners,
  showMineOnly,
  onOwnerChange,
  onShowMineOnlyChange,
  onTeamChange,
}: KpiFilterBarProps) {
  const [isOwnerMenuOpen, setIsOwnerMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const selectedOwner = owners.find((owner) => owner.notionUserId === filterOwner) ?? null

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOwnerMenuOpen(false)
      }
    }

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOwnerMenuOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handlePointerDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handlePointerDown)
    }
  }, [])

  return (
    <div className="glass-card flex flex-col gap-4 rounded-2xl border border-white/10 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {TEAM_FILTERS.map((team) => (
          <button
            key={team.value}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              filterTeam === team.value
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white"
            }`}
            type="button"
            onClick={() => onTeamChange(team.value)}
          >
            {team.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative" ref={menuRef}>
          <button
            aria-expanded={isOwnerMenuOpen}
            className="glass-input flex min-w-[220px] items-center justify-between gap-3 px-3 py-2 text-left text-sm"
            type="button"
            onClick={() => setIsOwnerMenuOpen((open) => !open)}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="text-white/45">Owner:</span>
              {selectedOwner ? (
                <>
                  <OwnerAvatar maxVisible={1} owners={[selectedOwner]} size="sm" />
                  <span className="truncate text-white">{selectedOwner.displayName}</span>
                </>
              ) : (
                <span className="truncate text-white">ทั้งหมด</span>
              )}
            </div>
            <span className="text-white/45">▼</span>
          </button>

          {isOwnerMenuOpen && (
            <div className="absolute right-0 z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl shadow-slate-950/50 backdrop-blur-xl">
              <button
                className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                  filterOwner === "all" ? "bg-emerald-400/10 text-emerald-200" : "text-white/80 hover:bg-white/5"
                }`}
                type="button"
                onClick={() => {
                  onOwnerChange("all")
                  setIsOwnerMenuOpen(false)
                }}
              >
                ทั้งหมด
              </button>
              {owners.map((owner) => (
                <button
                  key={owner.notionUserId}
                  className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    filterOwner === owner.notionUserId
                      ? "bg-emerald-400/10 text-emerald-200"
                      : "text-white/80 hover:bg-white/5"
                  }`}
                  title={owner.functionalRole}
                  type="button"
                  onClick={() => {
                    onOwnerChange(owner.notionUserId)
                    setIsOwnerMenuOpen(false)
                  }}
                >
                  <OwnerAvatar maxVisible={1} owners={[owner]} size="sm" />
                  <div className="min-w-0">
                    <div className="truncate">{owner.displayName}</div>
                    {owner.functionalRole && (
                      <div className="truncate text-xs text-white/40">{owner.functionalRole}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <label className={`flex items-center gap-2 text-sm ${isAdmin ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}>
          <input
            checked={showMineOnly}
            className="h-4 w-4 accent-emerald-400"
            disabled={!isAdmin}
            type="checkbox"
            onChange={(event) => onShowMineOnlyChange(event.target.checked)}
          />
          <span className="text-white/70">เฉพาะของฉัน</span>
        </label>
      </div>
    </div>
  )
}
