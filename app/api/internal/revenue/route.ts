import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { hasAuthenticatedUser, hasBuAccess } from "@/lib/api-auth"
import { getRevenueEntries, createRevenueEntry, isMonthLocked } from "@/lib/notion"

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
    const month = searchParams.get("month") ?? undefined
    const entries = await getRevenueEntries(month)
    return NextResponse.json(entries)
  } catch (error) {
    console.error("[API] revenue GET error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!hasAuthenticatedUser(session)) {
      return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 })
    }
    if (!hasBuAccess(session)) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 })
    }

    const body = await request.json()
    const locked = await isMonthLocked(body.month)
    if (locked) {
      return NextResponse.json({ error: "เดือนนี้ถูกล็อคแล้ว" }, { status: 403 })
    }

    const id = await createRevenueEntry(body)
    return NextResponse.json({ id })
  } catch (error) {
    console.error("[API] revenue POST error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 })
  }
}
