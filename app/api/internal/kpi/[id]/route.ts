import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { hasAuthenticatedUser } from "@/lib/api-auth"
import { getKpiRecordById, getUserProfileByPageId, updateKpiEntry } from "@/lib/notion"
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
    if (!hasAuthenticatedUser(session) || !session.user.profile) {
      return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 })
    }

    const { id } = await params
    const record = await getKpiRecordById(id)
    if (!record) {
      return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 })
    }

    const accountableProfile = record.accountablePageId
      ? await getUserProfileByPageId(record.accountablePageId)
      : null
    const isAccountable =
      accountableProfile?.email.toLowerCase() === session.user.email.toLowerCase()
    const isAdmin = session.user.profile.appRole === "admin"

    if (!isAccountable && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - ไม่ใช่ Accountable ของ KPI นี้" },
        { status: 403 }
      )
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
