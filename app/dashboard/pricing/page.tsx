import { Suspense } from 'react'
import { auth } from '@/auth'
import { getPricingPackages } from '@/lib/notion'
import PricingDisplay from './_components/PricingDisplay'

export const revalidate = 3600

export default async function PricingPage() {
  const session = await auth()
  const isContechBU = session?.user?.profile?.buMembership === 'Contech BU'
  const items = await getPricingPackages(isContechBU)

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <p className="text-white/50 text-sm">กำลังโหลดข้อมูลราคา...</p>
        </div>
      }
    >
      <PricingDisplay items={items} />
    </Suspense>
  )
}
