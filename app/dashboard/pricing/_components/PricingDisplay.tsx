'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import type { PricingItem } from '@/types/pricing'
import { getProductConfig, getProductTabId } from '@/lib/pricing-utils'
import OverviewTab from './OverviewTab'
import ProductTab from './ProductTab'
import BundleTab from './BundleTab'
import ServicesTab from './ServicesTab'
import PricingFooter from './PricingFooter'

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
        .filter((item) => item.type === 'Package' && item.product !== 'Bundle' && !item.isInfrastructure)
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
    { id: 'services', label: 'Professional Services' },
  ]

  const activeTabParam = searchParams.get('tab') ?? 'overview'
  const validTabIds = new Set(tabs.map((tab) => tab.id))
  const activeTab = validTabIds.has(activeTabParam) ? activeTabParam : 'overview'

  function setActiveTab(id: string) {
    router.replace(`?tab=${id}`, { scroll: false })
  }

  const latestDate = items
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

    if (activeTab === 'services') {
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
        <p className="text-white/40 text-sm font-light mb-3">
          Contech Hub  •  ราคาและแพ็กเกจ
        </p>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-5">
            <div
              className="flex items-center justify-center rounded-xl px-3 py-2 flex-shrink-0"
              style={{
                background: '#ffffff',
                minWidth: '160px',
                height: '56px',
              }}
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
              <h1 className="text-3xl font-semibold text-white leading-tight">
                ราคาและแพ็กเกจ
              </h1>
              <p className="text-white/60 font-light mt-1 text-sm">
                โซลูชันครบวงจรสำหรับธุรกิจก่อสร้างยุคดิจิทัล
              </p>
            </div>
          </div>
          <p className="text-white/[0.35] text-xs italic self-end">
            ราคาเพื่อการนำเสนอ อาจเปลี่ยนตาม scope จริง • มีผล ม.ค. 2026
          </p>
        </div>
      </div>

      <div
        className="sticky top-[64px] z-40 -mx-4 sm:-mx-6 mb-8"
        style={{
          background: 'rgba(10,22,40,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex gap-1 px-4 sm:px-6 py-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-[#4ade80] bg-[rgba(15,110,86,0.15)]'
                  : 'text-white/50 hover:text-white/85 hover:bg-white/5'
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
