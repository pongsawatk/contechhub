import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { hasAuthenticatedUser, hasBuAccess } from "@/lib/api-auth"
import { getHotQuotations, findHotQuotation, createHotQuotation, updateHotQuotation, findOrCreateCustomer, findCustomerByName } from "@/lib/notion"
import type { ParsedHotQuotation } from "@/types/pipeline"

export async function GET() {
  try {
    const session = await auth()
    if (!hasAuthenticatedUser(session)) return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 })
    if (!hasBuAccess(session)) return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 })

    const data = await getHotQuotations()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] hot-quotation GET error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!hasAuthenticatedUser(session)) return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 })
    if (!hasBuAccess(session)) return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 })

    const body: { rows: ParsedHotQuotation[]; importBatch: string; skipKeys: string[]; autoCreate: boolean } = await request.json()
    let created = 0; let updated = 0; let skipped = 0
    const errors: string[] = []

    for (const row of body.rows) {
      try {
        const rowKey = row.quotationNo + "|" + row.product
        const existingId = await findHotQuotation(row.quotationNo, row.product)
        if (existingId && body.skipKeys.includes(rowKey)) { skipped++; continue }

        const customerId = body.autoCreate
          ? await findOrCreateCustomer(row.companyName)
          : (await findCustomerByName(row.companyName)) ?? ""
        const payload = {
          quotationNo: row.quotationNo, product: row.product, customerId,
          contactName: row.contactName, quotationAmount: row.quotationAmount,
          hotness: row.hotness, lane: row.lane, stage: row.stage,
          salesOwner: row.salesOwner, expectedClose: row.expectedClose,
          lastActivity: row.lastActivity, status: "Active",
          importBatch: body.importBatch, notes: row.notes,
        }
        if (existingId) {
          await updateHotQuotation(existingId, payload)
          updated++
        } else {
          await createHotQuotation(payload)
          created++
        }
      } catch (err) {
        errors.push(String(err))
      }
    }

    return NextResponse.json({ created, updated, skipped, errors })
  } catch (error) {
    console.error("[API] hot-quotation POST error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 })
  }
}
