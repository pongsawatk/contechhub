import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { hasAuthenticatedUser, hasBuAccess } from "@/lib/api-auth"
import { getKpiRecords, getUserProfileByPageId } from "@/lib/notion"
import type { AccountableProfile, KpiRecord } from "@/types/kpi"

async function fetchAvatarAsBase64(
  email: string,
  accessToken: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(email)}/photo/$value`,
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

    const mime = response.headers.get("content-type") ?? "image/jpeg"
    const buffer = await response.arrayBuffer()
    return `data:${mime};base64,${Buffer.from(buffer).toString("base64")}`
  } catch (error) {
    console.error("[API] KPI avatar fetch error:", error)
    return null
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!hasAuthenticatedUser(session)) {
      return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 })
    }
    if (!hasBuAccess(session)) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 })
    }

    const records = await getKpiRecords()
    const accountablePageIds = Array.from(
      new Set(
        records
          .map((record) => record.accountablePageId)
          .filter((pageId): pageId is string => Boolean(pageId))
      )
    )

    const profiles = await Promise.all(
      accountablePageIds.map((pageId) => getUserProfileByPageId(pageId))
    )
    const profileMap = new Map(
      accountablePageIds.map((pageId, index) => [pageId, profiles[index] ?? null] as const)
    )

    const accessToken = session.accessToken
    const enrichedProfiles = await Promise.all(
      Array.from(profileMap.entries()).map(async ([pageId, profile]) => {
        if (!profile) {
          return [pageId, null] as const
        }

        const avatarUrl = accessToken
          ? await fetchAvatarAsBase64(profile.email, accessToken)
          : null

        return [pageId, { ...profile, avatarUrl }] as const
      })
    )
    const enrichedProfileMap = new Map<string, AccountableProfile | null>(enrichedProfiles)

    const result: KpiRecord[] = records.map((record) => ({
      ...record,
      accountable: record.accountablePageId
        ? (enrichedProfileMap.get(record.accountablePageId) ?? null)
        : null,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("[API] KPI GET error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 })
  }
}
