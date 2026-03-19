import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getHotQuotations, getSalesOrders, getCustomers } from "@/lib/notion"
import PipelineDashboard from "./_components/PipelineDashboard"

export const revalidate = 0

export default async function PipelinePage() {
  const session = await auth()
  if (!session?.user?.profile) redirect("/login")
  const appRole = session.user.profile.appRole
  if (appRole !== "admin" && appRole !== "bu_member") redirect("/dashboard")

  const [quotations, orders, customers] = await Promise.all([
    getHotQuotations(),
    getSalesOrders(),
    getCustomers(),
  ])

  return (
    <PipelineDashboard
      quotations={quotations}
      orders={orders}
      customers={customers}
      currentUser={session.user.profile}
    />
  )
}