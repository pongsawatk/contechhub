'use client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { getProductConfig, getProductTabId } from '@/lib/pricing-utils'
import type { PricingItem } from '@/types/pricing'
import BundleTab from './BundleTab'
import OverviewTab from './OverviewTab'
import PricingFooter from './PricingFooter'
import ProductTab from './ProductTab'
import ServicesTab from './ServicesTab'

interface Props {
  items: PricingItem[]
  isAdminOrBU?: boolean
}

interface PricingTab {
  id: string
  label: string
  productName?: string
}

export default function PricingDisplay({ items, isAdminOrBU }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const productNames = Array.from(
    new Set(
      items
        .filter(
          (item) => item.type === 'Package' && item.product !== 'Bundle' && !item.isInfrastructure
        )
        .map((item) => item.product)
    )
  )

  const tabs: PricingTab[] = [
    { id: 'overview', label: 'ภาพรวม' },
    ...productNames.map((productName) => ({
      id: getProductTabId(productName),
      label: productName,
      productName,
    })),
    { id: 'bundle', label: 'Bundle Package' },
    { id: 'transformation', label: '🚀 Transformation Service' },
  ]

  const activeTabParam = searchParams.get('tab') ?? 'overview'
  const normalizedActiveTab = activeTabParam === 'services' ? 'transformation' : activeTabParam
  const validTabIds = new Set(tabs.map((tab) => tab.id))
  const activeTab = validTabIds.has(normalizedActiveTab) ? normalizedActiveTab : 'overview'

  function setActiveTab(id: string) {
    router.replace(`?tab=${id}`, { scroll: false })
  }

  const latestDate =
    items
      .map((item) => item.effectiveDate)
      .filter(Boolean)
      .sort()
      .reverse()[0] ?? null

  const activeProductTab = tabs.find((tab) => tab.id === activeTab)?.productName

  const renderContent = () => {
    if (activeTab === 'overview') {
      return <OverviewTab items={items} onTabChange={setActiveTab} />
    }

    if (activeTab === 'bundle') {
      return <BundleTab items={items} />
    }

    if (activeTab === 'transformation') {
      return <ServicesTab items={items} />
    }

    if (activeProductTab) {
      const config = getProductConfig(activeProductTab)
      return (
        <ProductTab
          items={items.filter((item) => item.product === activeProductTab)}
          productName={activeProductTab}
          productColor={config.color}
          productLogo={config.logo}
          isAdminOrBU={isAdminOrBU}
        />
      )
    }

    return <OverviewTab items={items} onTabChange={setActiveTab} />
  }

  return (
    <div>
      <div className="mb-8">
        <p className="mb-3 text-sm font-light text-white/40">Contech Hub • ราคาและแพ็กเกจ</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div
              className="flex h-14 min-w-[160px] flex-shrink-0 items-center justify-center rounded-xl px-3 py-2"
              style={{ background: '#ffffff' }}
            >
              <Image
                src="/logos/contech_logo_lan.png"
                alt="Contech Hub"
                width={148}
                height={44}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-3xl font-semibold leading-tight text-white">ราคาและแพ็กเกจ</h1>
              <p className="mt-1 text-sm font-light text-white/60">
                โซลูชันครบวงจรสำหรับธุรกิจก่อสร้างยุคดิจิทัล
              </p>
            </div>
          </div>
          <p className="self-end text-xs italic text-white/[0.35]">
            ราคาเพื่อการนำเสนอ อาจเปลี่ยนตาม scope จริง มีผล ม.ค. 2026
          </p>
        </div>
      </div>

      <div
        className="sticky top-[64px] z-40 -mx-4 mb-8 sm:-mx-6"
        style={{
          background: 'rgba(10,22,40,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="scrollbar-hide flex gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-lg px-5 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-b-2 border-[#4ade80] bg-[rgba(15,110,86,0.15)] text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/85'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {renderContent()}

      <PricingFooter effectiveDateNote={latestDate ?? undefined} />
    </div>
  )
}
