import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { hasAuthenticatedUser } from "@/lib/api-auth"
import { getKpiRecords, getUsersByNotionIds, updateKpiEntry } from "@/lib/notion"
import type { KpiRecord } from "@/types/kpi"

function isValidStatus(status: unknown): status is KpiRecord["status"] {
  return status === "On Track" || status === "At Risk" || status === "Off Track" || status === "Completed"
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!hasAuthenticatedUser(session)) {
      return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 })
    }

    const appRole = session.user.profile?.appRole
    const { id } = await params
    const records = await getKpiRecords()
    const entry = records.find((record) => record.id === id)

    if (!entry) {
      return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 })
    }

    const ownerProfiles = await getUsersByNotionIds(entry.ownerNotionIds)
    const isOwner = ownerProfiles.some(
      (profile) => profile.email.toLowerCase() === session.user.email.toLowerCase()
    )
    const isAdmin = appRole === "admin"

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 })
    }

    const body = await request.json()
    const payload: Parameters<typeof updateKpiEntry>[1] = {}

    if ("actual" in body) {
      if (body.actual !== null && (typeof body.actual !== "number" || Number.isNaN(body.actual))) {
        return NextResponse.json({ error: "ค่า Actual ไม่ถูกต้อง" }, { status: 400 })
      }
      payload.actual = body.actual
    }

    if ("notes" in body) {
      if (typeof body.notes !== "string") {
        return NextResponse.json({ error: "ค่า Notes ไม่ถูกต้อง" }, { status: 400 })
      }
      payload.notes = body.notes
    }

    if ("status" in body) {
      if (!isValidStatus(body.status)) {
        return NextResponse.json({ error: "ค่าสถานะไม่ถูกต้อง" }, { status: 400 })
      }
      payload.status = body.status
    }

    if ("unit" in body) {
      if (typeof body.unit !== "string") {
        return NextResponse.json({ error: "ค่า Unit ไม่ถูกต้อง" }, { status: 400 })
      }
      payload.unit = body.unit
    }

    if ("actualIsPercent" in body) {
      if (typeof body.actualIsPercent !== "boolean") {
        return NextResponse.json({ error: "ค่า Actual Is Percent ไม่ถูกต้อง" }, { status: 400 })
      }
      payload.actualIsPercent = body.actualIsPercent
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "ไม่มีข้อมูลที่ต้องอัปเดต" }, { status: 400 })
    }

    await updateKpiEntry(id, payload)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[API] KPI PATCH error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 })
  }
}
