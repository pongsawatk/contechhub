import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getKpiEntries } from "@/lib/notion"
import KpiDisplay from "./_components/KpiDisplay"

export const revalidate = 0

export default async function KpiPage() {
  const session = await auth()
  if (!session?.user?.profile) redirect("/login")
  const appRole = session.user.profile.appRole
  if (appRole !== "admin" && appRole !== "bu_member") redirect("/dashboard")

  const allEntries = await getKpiEntries()
  const userEmail = session.user.email ?? ""
  return (
    <KpiDisplay
      entries={allEntries}
      appRole={appRole}
      userEmail={userEmail}
    />
  )
}