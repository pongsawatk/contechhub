import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getRevenueEntries } from "@/lib/notion"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month") ?? undefined

    const entries = await getRevenueEntries(month)
    return NextResponse.json(entries)
  } catch (error) {
    console.error("[API] revenue error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 })
  }
}
