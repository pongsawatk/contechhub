"use client"

import Image from "next/image"
import { useState } from "react"
import type { AccountableProfile } from "@/types/kpi"

interface Props {
  profile: AccountableProfile | null
  size?: "sm" | "md"
  showTooltip?: boolean
}

const gradientByTeam: Record<string, string> = {
  Acquisition: "from-blue-500 to-blue-700",
  Retention: "from-green-500 to-green-700",
  Innovation: "from-violet-500 to-violet-700",
  "BU Head": "from-slate-500 to-slate-700",
  "BU (Jor)": "from-sky-500 to-cyan-700",
}

export default function AccountableAvatar({
  profile,
  size = "md",
  showTooltip = true,
}: Props) {
  const [showTip, setShowTip] = useState(false)
  const [hasImageError, setHasImageError] = useState(false)
  const dim = size === "sm" ? 28 : 36
  const gradient = gradientByTeam[profile?.team ?? ""] ?? "from-slate-500 to-slate-700"

  if (!profile) {
    return (
      <div
        aria-label="ไม่ระบุ Accountable"
        className="flex items-center justify-center rounded-full border border-white/20 bg-white/10"
        style={{ height: dim, width: dim }}
      >
        <span className="text-xs text-white/40">-</span>
      </div>
    )
  }

  const initials = profile.initials || "??"

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      {profile.avatarUrl && !hasImageError ? (
        <Image
          alt={profile.displayName}
          className="rounded-full border border-white/20 object-cover"
          height={dim}
          src={profile.avatarUrl}
          unoptimized
          width={dim}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <div
          aria-label={profile.displayName}
          className={`flex items-center justify-center rounded-full border border-white/20 bg-gradient-to-br ${gradient}`}
          role="img"
          style={{ height: dim, width: dim }}
        >
          <span className="text-xs font-semibold text-white tabular-nums">{initials}</span>
        </div>
      )}

      {showTooltip && showTip && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2">
          <div className="glass-card whitespace-nowrap px-3 py-2 text-xs">
            <div className="font-medium text-white">{profile.displayName}</div>
            <div className="text-white/50">{profile.functionalRole}</div>
          </div>
        </div>
      )}
    </div>
  )
}
