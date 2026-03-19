import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getCustomers, createCustomer } from "@/lib/notion"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 })
    const customers = await getCustomers()
    return NextResponse.json(customers)
  } catch (error) {
    console.error("[API] customer GET error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 })
    const appRole = session.user?.profile?.appRole
    if (appRole !== "admin" && appRole !== "bu_member") return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 })
    const body = await request.json()
    const id = await createCustomer(body.companyName)
    return NextResponse.json({ id })
  } catch (error) {
    console.error("[API] customer POST error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 })
  }
}