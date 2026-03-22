import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import ChatWindow from './_components/ChatWindow'
import PricingCardPanel from './_components/PricingCardPanel'

export default async function ChatbotPage() {
  const session = await auth()
  if (!session?.user?.profile) redirect('/login')

  const { appRole } = session.user.profile
  if (appRole !== 'admin' && appRole !== 'bu_member') redirect('/unauthorized')

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      <div className="flex-1 min-w-0">
        <ChatWindow userProfile={session.user.profile} />
      </div>
      <div className="hidden w-80 shrink-0 lg:block">
        <PricingCardPanel />
      </div>
    </div>
  )
}
