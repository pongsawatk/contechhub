import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { hasAuthenticatedUser, hasBuAccess } from "@/lib/api-auth"
import { createQuoteSession } from "@/lib/notion"

export async function POST(req: Request) {
  const session = await auth()
  if (!hasAuthenticatedUser(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!hasBuAccess(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const result = await createQuoteSession(body)
  return NextResponse.json(result)
}
