import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getKpiEntries, updateKpiEntry } from "@/lib/notion"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 })
    }
    const appRole = session.user?.profile?.appRole
    const { id } = await params
    const entries = await getKpiEntries()
    const entry = entries.find((e) => e.id === id)
    if (!entry) {
      return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 })
    }
    const isOwner = entry.ownerEmail === session.user.email
    const isAdmin = appRole === "admin"
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 })
    }
    const body = await request.json()
    await updateKpiEntry(id, body)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[API] kpi PATCH error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 })
  }
}