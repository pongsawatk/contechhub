import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getPricingPackages } from '@/lib/notion'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isContechBU = session.user.profile?.buMembership === 'Contech BU'
  const data = await getPricingPackages(isContechBU)
  return NextResponse.json(data)
}
