import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { hasAuthenticatedUser, hasBuAccess } from "@/lib/api-auth"
import { getSalesOrders, findSalesOrder, createSalesOrder, updateSalesOrder, findOrCreateCustomer, findCustomerByName, findHotQuotationByNo } from "@/lib/notion"
import type { ParsedSalesOrder } from "@/types/pipeline"

export async function GET() {
  try {
    const session = await auth()
    if (!hasAuthenticatedUser(session)) return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 })
    if (!hasBuAccess(session)) return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 })

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
    if (!hasAuthenticatedUser(session)) return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 })
    if (!hasBuAccess(session)) return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 })

    const body: { rows: ParsedSalesOrder[]; importBatch: string; skipKeys: string[]; autoCreate: boolean } = await request.json()
    let created = 0; let updated = 0; let skipped = 0
    const errors: string[] = []

    for (const row of body.rows) {
      try {
        const existingId = await findSalesOrder(row.orderNo)
        if (existingId && body.skipKeys.includes(row.orderNo)) { skipped++; continue }

        const customerId = body.autoCreate
          ? await findOrCreateCustomer(row.companyName)
          : (await findCustomerByName(row.companyName)) ?? ""
        const hotQuotationId = row.quotationNo ? (await findHotQuotationByNo(row.quotationNo)) ?? "" : ""
        const payload = {
          orderNo: row.orderNo, quotationNo: row.quotationNo, customerId, hotQuotationId,
          contactName: row.contactName, product: row.product, orderAmount: row.orderAmount,
          lane: row.lane, revenueType: row.revenueType, closeDate: row.closeDate,
          expectedGoLive: row.expectedGoLive, contractMonths: row.contractMonths,
          salesOwner: row.salesOwner, paymentTerms: row.paymentTerms,
          importBatch: body.importBatch, notes: row.notes,
        }

        if (existingId) {
          await updateSalesOrder(existingId, payload)
          updated++
        } else {
          await createSalesOrder(payload)
          created++
        }
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err)
        errors.push(`${row.orderNo}: ${detail}`)
      }
    }

    if (errors.length > 0 && created === 0 && updated === 0 && skipped === 0) {
      return NextResponse.json(
        { error: "Import Sales Order ไม่สำเร็จ", created, updated, skipped, errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ created, updated, skipped, errors })
  } catch (error) {
    console.error("[API] sales-order POST error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 })
  }
}
