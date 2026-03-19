import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getSalesOrders, updateSalesOrderRevenue } from "@/lib/notion"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 })
    const appRole = session.user?.profile?.appRole
    if (appRole !== "admin" && appRole !== "bu_member") return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 })

    const { id } = await params
    const orders = await getSalesOrders()
    const order = orders.find((o) => o.id === id)
    if (!order) return NextResponse.json({ error: "ไม่พบรายการ" }, { status: 404 })

    const body: { revenuePercent?: number; revenueAmount?: number; recognitionStatus: string } = await request.json()

    let pct = body.revenuePercent ?? 0
    let amt = body.revenueAmount ?? 0

    if (body.revenuePercent !== undefined) {
      if (pct < 0 || pct > 100) return NextResponse.json({ error: "% ต้องอยู่ระหว่าง 0-100" }, { status: 400 })
      amt = order.orderAmount * (pct / 100)
    } else if (body.revenueAmount !== undefined) {
      if (amt > order.orderAmount) return NextResponse.json({ error: "จำนวนเงินเกิน Order Amount" }, { status: 400 })
      pct = order.orderAmount > 0 ? (amt / order.orderAmount) * 100 : 0
    }

    await updateSalesOrderRevenue(id, {
      revenuePercent: Math.round(pct * 100) / 100,
      revenueAmount: Math.round(amt),
      recognitionStatus: body.recognitionStatus,
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[API] sales-order PATCH error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 })
  }
}