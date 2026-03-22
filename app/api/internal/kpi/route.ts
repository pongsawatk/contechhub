import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { hasAuthenticatedUser, hasBuAccess } from "@/lib/api-auth"
import { getKpiEntries } from "@/lib/notion"

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
    const ownerEmail = mine ? session.user.email : (searchParams.get("owner") ?? undefined)
    const entries = await getKpiEntries(ownerEmail)
    return NextResponse.json(entries)
  } catch (error) {
    console.error("[API] kpi GET error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 })
  }
}
