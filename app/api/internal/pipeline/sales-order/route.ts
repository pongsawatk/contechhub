import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getSalesOrders, findSalesOrder, createSalesOrder, findOrCreateCustomer, findHotQuotationByNo } from "@/lib/notion"
import type { ParsedSalesOrder } from "@/types/pipeline"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 })
    const data = await getSalesOrders()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] sales-order GET error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 })
    const appRole = session.user?.profile?.appRole
    if (appRole !== "admin" && appRole !== "bu_member") return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 })

    const body: { rows: ParsedSalesOrder[]; importBatch: string; skipDuplicates: boolean } = await request.json()
    let created = 0; let skipped = 0
    const errors: string[] = []

    for (const row of body.rows) {
      try {
        const existingId = await findSalesOrder(row.orderNo)
        if (existingId && body.skipDuplicates) { skipped++; continue }

        const customerId = await findOrCreateCustomer(row.companyName)
        const hotQuotationId = row.quotationNo ? (await findHotQuotationByNo(row.quotationNo)) ?? "" : ""

        await createSalesOrder({
          orderNo: row.orderNo, quotationNo: row.quotationNo, customerId, hotQuotationId,
          contactName: row.contactName, product: row.product, orderAmount: row.orderAmount,
          lane: row.lane, revenueType: row.revenueType, closeDate: row.closeDate,
          expectedGoLive: row.expectedGoLive, contractMonths: row.contractMonths,
          salesOwner: row.salesOwner, paymentTerms: row.paymentTerms,
          importBatch: body.importBatch, notes: row.notes,
        })
        created++
      } catch (err) {
        errors.push(String(err))
      }
    }

    return NextResponse.json({ created, skipped, errors })
  } catch (error) {
    console.error("[API] sales-order POST error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 })
  }
}