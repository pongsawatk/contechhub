import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { hasAuthenticatedUser, hasBuAccess } from "@/lib/api-auth"
import { getQuoteSession } from "@/lib/notion"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!hasAuthenticatedUser(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!hasBuAccess(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const quote = await getQuoteSession(id)
  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 })
  }

  return NextResponse.json({
    quoteName: quote.quoteName,
    customerName: quote.customerName,
    lane: quote.lane,
    status: quote.status,
    finalPrice: quote.finalPrice,
    summaryJson: quote.summaryJson,
    approvalRequired: quote.approvalRequired,
    calculatorInput: quote.calculatorInput,
  })
}
