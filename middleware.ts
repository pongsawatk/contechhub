import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const appRole = session?.user?.profile?.appRole

  // Unauthenticated → /login
  if (!session && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // internal_viewer blocked routes
  if (appRole === "internal_viewer") {
    const blocked = ["/dashboard/calculator", "/dashboard/kpi", "/dashboard/revenue"]
    if (blocked.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/api/internal/:path*"],
}
