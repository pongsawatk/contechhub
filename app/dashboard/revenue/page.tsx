import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getRevenueEntries } from "@/lib/notion"
import { FEATURES } from "@/lib/features"
import RevenueDisplay from "./_components/RevenueDisplay"

export const revalidate = 0

export default async function RevenuePage() {
  if (!FEATURES.revenue) redirect("/dashboard")

  const session = await auth()
  if (!session?.user?.profile) redirect("/login")
  const appRole = session.user.profile.appRole
  if (appRole !== "admin" && appRole !== "bu_member") redirect("/dashboard")

  const entries = await getRevenueEntries()
  return <RevenueDisplay entries={entries} appRole={appRole} userEmail={session.user.email ?? ""} />
}