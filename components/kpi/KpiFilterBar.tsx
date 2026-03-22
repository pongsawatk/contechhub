"use client"

import { useEffect, useRef, useState } from "react"
import type { AccountableProfile, KpiRecord } from "@/types/kpi"
import AccountableAvatar from "@/components/kpi/AccountableAvatar"

interface KpiFilterBarProps {
  accountableOptions: AccountableProfile[]
  isAdmin: boolean
  selectedEmail: string
  selectedTeam: "All" | KpiRecord["team"]
  showOnlyMine: boolean
  onSelectedEmailChange: (email: string) => void
  onSelectedTeamChange: (team: "All" | KpiRecord["team"]) => void
  onShowOnlyMineChange: (value: boolean) => void
}

const TEAM_FILTERS: Array<{ label: string; value: "All" | KpiRecord["team"] }> = [
  { label: "All", value: "All" },
  { label: "BU", value: "BU (Jor)" },
  { label: "Acquisition", value: "Acquisition" },
  { label: "Retention", value: "Retention" },
  { label: "Innovation", value: "Innovation" },
]

export default function KpiFilterBar({
  accountableOptions,
  isAdmin,
  selectedEmail,
  selectedTeam,
  showOnlyMine,
  onSelectedEmailChange,
  onSelectedTeamChange,
  onShowOnlyMineChange,
}: KpiFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const selectedProfile = accountableOptions.find((profile) => profile.email === selectedEmail) ?? null

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    function handlePointerDown(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
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
    <div className="glass-card flex flex-col gap-4 rounded-2xl border border-white/10 p-4">
      <div className="flex flex-wrap items-center gap-2">
        {TEAM_FILTERS.map((team) => (
          <button
            key={team.value}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              selectedTeam === team.value
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white"
            }`}
            type="button"
            onClick={() => onSelectedTeamChange(team.value)}
          >
            {team.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs" ref={dropdownRef}>
          <button
            aria-expanded={isOpen}
            className="glass-input flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm"
            type="button"
            onClick={() => setIsOpen((open) => !open)}
          >
            <div className="flex min-w-0 items-center gap-3">
              <AccountableAvatar profile={selectedProfile} size="sm" />
              <span className="truncate text-white">
                {selectedProfile ? selectedProfile.displayName : "ทุกคน"}
              </span>
            </div>
            <span className="text-white/45">v</span>
          </button>

          {isOpen && (
            <div className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl shadow-slate-950/50 backdrop-blur-xl">
              <button
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                  !selectedEmail ? "bg-emerald-400/10 text-emerald-200" : "text-white/80 hover:bg-white/5"
                }`}
                type="button"
                onClick={() => {
                  onSelectedEmailChange("")
                  setIsOpen(false)
                }}
              >
                <AccountableAvatar profile={null} size="sm" />
                <span className="truncate">ทุกคน</span>
              </button>

              {accountableOptions.map((profile) => (
                <button
                  key={profile.pageId}
                  className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    selectedEmail === profile.email
                      ? "bg-emerald-400/10 text-emerald-200"
                      : "text-white/80 hover:bg-white/5"
                  }`}
                  type="button"
                  onClick={() => {
                    onSelectedEmailChange(profile.email)
                    setIsOpen(false)
                  }}
                >
                  <AccountableAvatar profile={profile} size="sm" />
                  <div className="min-w-0">
                    <div className="truncate">{profile.displayName}</div>
                    <div className="truncate text-xs text-white/40">
                      {profile.functionalRole ? `${profile.displayName} - ${profile.functionalRole}` : profile.displayName}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <label className={`flex items-center gap-2 text-sm ${isAdmin ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}>
          <input
            checked={showOnlyMine}
            className="h-4 w-4 accent-emerald-400"
            disabled={!isAdmin}
            type="checkbox"
            onChange={(event) => onShowOnlyMineChange(event.target.checked)}
          />
          <span className="text-white/70">เฉพาะของฉัน</span>
        </label>
      </div>
    </div>
  )
}
