import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { hasAuthenticatedUser, hasBuAccess } from "@/lib/api-auth"
import { createQuoteSession, getPricingPackages } from "@/lib/notion"
import { buildServerQuote, QuoteValidationError } from "@/lib/quote-server"

export async function POST(req: Request) {
  const session = await auth()
  if (!hasAuthenticatedUser(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!hasBuAccess(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // G-01: ไม่ trust breakdown จาก client — อ่านราคาจาก Pricing DB แล้วคำนวณใหม่ฝั่ง server
    const pricingItems = await getPricingPackages(true)
    const { input, breakdown } = buildServerQuote(body.input, pricingItems)

    const result = await createQuoteSession({ input, breakdown })
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof QuoteValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("[API] quotes POST error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 })
  }
}
