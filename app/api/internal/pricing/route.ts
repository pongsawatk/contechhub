import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getPricingPackages } from "@/lib/notion"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 })
    }

    const packages = await getPricingPackages()
    return NextResponse.json(packages)
  } catch (error) {
    console.error("[API] pricing error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 })
  }
}
