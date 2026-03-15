import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getUserProfile } from "@/lib/notion"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 })
    }

    const profile = await getUserProfile(session.user.email)
    if (!profile) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("[API] user-profile error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 })
  }
}
