import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getRevenueEntries, updateRevenueEntry } from "@/lib/notion"

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
    if (appRole !== "admin" && appRole !== "bu_member") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 })
    }
    const { id } = await params
    const entries = await getRevenueEntries()
    const entry = entries.find((e) => e.id === id)
    if (!entry) {
      return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 })
    }
    if (entry.monthLocked) {
      return NextResponse.json({ error: "เดือนนี้ถูกล็อคแล้ว" }, { status: 403 })
    }
    const body = await request.json()
    await updateRevenueEntry(id, body)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[API] revenue PATCH error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 })
  }
}