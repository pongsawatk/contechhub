import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getPricingPackages } from '@/lib/notion'
import { FEATURES } from '@/lib/features'
import PricingDisplay from './_components/PricingDisplay'

export const revalidate = 3600

export default async function PricingPage() {
  if (!FEATURES.pricing) redirect('/dashboard')

  const session = await auth()
  const isContechBU = session?.user?.profile?.buMembership === 'Contech BU'
  const appRole = session?.user?.profile?.appRole
  const isAdminOrBU = appRole === 'admin' || appRole === 'bu_member'
  const items = await getPricingPackages(isContechBU)

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <p className="text-white/50 text-sm">กำลังโหลดข้อมูลราคา...</p>
        </div>
      }
    >
      <PricingDisplay items={items} isAdminOrBU={isAdminOrBU} />
    </Suspense>
  )
}
