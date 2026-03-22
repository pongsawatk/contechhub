import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { hasAuthenticatedUser, hasBuAccess } from '@/lib/api-auth'
import { createChatSession, updateChatSession } from '@/lib/chatbot-notion'

export async function POST(req: Request) {
  const session = await auth()
  if (!hasAuthenticatedUser(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasBuAccess(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { sessionId, ...data } = body

  try {
    if (sessionId) {
      await updateChatSession(sessionId, data)
      return NextResponse.json({ sessionId })
    }

    const newId = await createChatSession({
      sessionName:
        data.sessionName ?? `${session.user.profile.displayName} - ${new Date().toLocaleDateString('th-TH')}`,
      userEmail: session.user.email ?? session.user.profile.email,
      userRole: session.user.profile.appRole,
      salesLane: session.user.profile.salesLane ?? 'N/A',
      messageCount: data.messageCount ?? 0,
      conversationLog: data.conversationLog ?? [],
      topicsDiscussed: data.topicsDiscussed ?? [],
      calculatorOpened: data.calculatorOpened ?? false,
      calculatorPrefillData: data.calculatorPrefillData,
      quoteSaved: data.quoteSaved ?? false,
      modelUsed: data.modelUsed,
    })

    return NextResponse.json({ sessionId: newId })
  } catch (error) {
    console.error('[Chatbot] session save error:', error)
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 })
  }
}
