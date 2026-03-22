"use client"

import Image from "next/image"
import { useState } from "react"
import type { OwnerProfile } from "@/types/kpi"

interface OwnerAvatarProps {
  owners: OwnerProfile[]
  maxVisible?: number
  size?: "sm" | "md"
}

function getInitials(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "?"
}

function Avatar({ owner, size }: { owner: OwnerProfile; size: "sm" | "md" }) {
  const [hasError, setHasError] = useState(false)
  const sizeClass = size === "sm" ? "h-8 w-8 text-[11px]" : "h-10 w-10 text-xs"
  const title = owner.functionalRole
    ? `${owner.displayName} • ${owner.functionalRole}`
    : owner.displayName

  if (owner.avatarUrl && !hasError) {
    return (
      <div className={`relative overflow-hidden rounded-full ring-2 ring-slate-950/70 ${sizeClass}`} title={title}>
        <Image
          alt={owner.displayName}
          className="object-cover"
          fill
          sizes={size === "sm" ? "32px" : "40px"}
          src={owner.avatarUrl}
          unoptimized
          onError={() => setHasError(true)}
        />
      </div>
    )
  }

  return (
    <div
      aria-label={owner.displayName}
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/75 via-sky-400/70 to-cyan-500/75 font-semibold text-slate-950 ring-2 ring-slate-950/70 ${sizeClass}`}
      title={title}
    >
      {getInitials(owner.displayName)}
    </div>
  )
}

export default function OwnerAvatar({
  owners,
  maxVisible = 3,
  size = "sm",
}: OwnerAvatarProps) {
  const visibleOwners = owners.slice(0, maxVisible)
  const extraOwners = owners.slice(maxVisible)
  const extraLabel = extraOwners.map((owner) => owner.displayName).join(", ")
  const overlapClass = size === "sm" ? "-ml-2" : "-ml-3"

  return (
    <div className="flex items-center">
      {visibleOwners.map((owner, index) => (
        <div key={owner.notionUserId} className={index === 0 ? "" : overlapClass}>
          <Avatar owner={owner} size={size} />
        </div>
      ))}
      {extraOwners.length > 0 && (
        <div
          className={`flex items-center justify-center rounded-full border border-white/15 bg-slate-900/90 font-semibold text-white/75 ring-2 ring-slate-950/70 ${size === "sm" ? "ml-2 h-8 w-8 text-[11px]" : "ml-2 h-10 w-10 text-xs"}`}
          title={extraLabel}
        >
          +{extraOwners.length}
        </div>
      )}
    </div>
  )
}
