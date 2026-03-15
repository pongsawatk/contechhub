import { auth } from '@/auth'
import { getPricingPackages } from '@/lib/notion'
import CalculatorShell from './_components/CalculatorShell'

export default async function CalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ quote?: string }>
}) {
  const session = await auth()
  const isContechBU = session?.user?.profile?.buMembership === 'Contech BU'
  const pricingItems = await getPricingPackages(isContechBU)
  const { quote: quoteId } = await searchParams

  return (
    <CalculatorShell
      pricingItems={pricingItems}
      currentUser={session?.user?.profile}
      initialQuoteId={quoteId}
    />
  )
}
