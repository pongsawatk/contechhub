import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { hasAuthenticatedUser, hasBuAccess } from "@/lib/api-auth"
import { getKpiRecords, getUsersByNotionIds } from "@/lib/notion"
import type { KpiRecord, OwnerProfile } from "@/types/kpi"

async function getAvatarUrl(profile: OwnerProfile, sessionEmail: string, accessToken?: string) {
  if (!profile.email || !accessToken) {
    return null
  }

  if (profile.email.toLowerCase() === sessionEmail.toLowerCase()) {
    return "/api/me/photo"
  }

  try {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(profile.email)}/photo/$value`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    )

    if (!response.ok) {
      return null
    }

    const contentType = response.headers.get("content-type") ?? "image/jpeg"
    const photoBuffer = Buffer.from(await response.arrayBuffer())
    return `data:${contentType};base64,${photoBuffer.toString("base64")}`
  } catch (error) {
    console.error("[API] KPI avatar fetch error:", error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!hasAuthenticatedUser(session)) {
      return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 })
    }
    if (!hasBuAccess(session)) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const mine = searchParams.get("mine") === "true"
    const ownerFilter = searchParams.get("owner")
    const sessionEmail = session.user.email.toLowerCase()
    const records = await getKpiRecords()
    const ownerIds = Array.from(new Set(records.flatMap((record) => record.ownerNotionIds)))
    const ownerProfiles = await getUsersByNotionIds(ownerIds)
    const enrichedOwnerProfiles = await Promise.all(
      ownerProfiles.map(async (profile) => ({
        ...profile,
        avatarUrl: await getAvatarUrl(profile, session.user.email, session.accessToken),
      }))
    )
    const ownerProfilesById = new Map(
      enrichedOwnerProfiles.map((profile) => [profile.notionUserId, profile])
    )

    const entries: KpiRecord[] = records.map((record) => ({
      ...record,
      ownerProfiles: record.ownerNotionIds
        .map((ownerId) => ownerProfilesById.get(ownerId))
        .filter((profile): profile is OwnerProfile => Boolean(profile)),
    }))

    const filteredEntries = entries.filter((entry) => {
      if (mine && !entry.ownerProfiles.some((profile) => profile.email.toLowerCase() === sessionEmail)) {
        return false
      }

      if (!ownerFilter) {
        return true
      }

      const normalizedOwnerFilter = ownerFilter.toLowerCase()
      return entry.ownerProfiles.some((profile) =>
        profile.notionUserId === ownerFilter ||
        profile.email.toLowerCase() === normalizedOwnerFilter ||
        profile.displayName.toLowerCase() === normalizedOwnerFilter
      )
    })

    return NextResponse.json(filteredEntries)
  } catch (error) {
    console.error("[API] KPI GET error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 })
  }
}
