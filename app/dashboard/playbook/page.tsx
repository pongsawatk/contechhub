import { auth } from "@/auth"
import { redirect } from "next/navigation"
import PlaybookShell from "./_components/PlaybookShell"
import { FEATURES } from "@/lib/features"
import { PLAYBOOK_DATA, getDefaultQuarterKey } from "@/lib/playbook-data"

export const revalidate = 0

export default async function PlaybookPage() {
  if (!FEATURES.playbook) redirect("/dashboard")

  const session = await auth()
  if (!session?.user?.profile) redirect("/login")

  const appRole = session.user.profile.appRole
  if (appRole !== "admin" && appRole !== "bu_member") redirect("/dashboard")

  return (
    <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen -translate-x-1/2 px-4 sm:px-6">
      <div
        className="min-h-[calc(100vh-7rem)] py-6 sm:py-8"
        style={{
          background: "linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 50%, #071a14 100%)",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <PlaybookShell
            defaultQuarter={getDefaultQuarterKey()}
            quarters={PLAYBOOK_DATA}
          />
        </div>
      </div>
    </div>
  )
}
