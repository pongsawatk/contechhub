'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import type { PricingItem } from '@/types/pricing'
import { PRODUCT_COLORS, PRODUCT_LOGOS } from '@/lib/pricing-utils'
import OverviewTab from './OverviewTab'
import ProductTab from './ProductTab'
import BundleTab from './BundleTab'
import ServicesTab from './ServicesTab'
import PricingFooter from './PricingFooter'

type Tab = 'overview' | 'insite' | '360' | 'kwanjai' | 'bundle' | 'services'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'ภาพรวม' },
  { id: 'insite', label: 'Builk Insite' },
  { id: '360', label: 'Builk 360' },
  { id: 'kwanjai', label: 'Kwanjai' },
  { id: 'bundle', label: 'Bundle Package' },
  { id: 'services', label: 'Professional Services' },
]

const VALID_TABS: Tab[] = ['overview', 'insite', '360', 'kwanjai', 'bundle', 'services']

interface Props {
  items: PricingItem[]
}

export default function PricingDisplay({ items }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const tabParam = searchParams.get('tab') ?? 'overview'
  const activeTab: Tab = VALID_TABS.includes(tabParam as Tab)
    ? (tabParam as Tab)
    : 'overview'

  function setActiveTab(id: string) {
    router.replace(`?tab=${id}`, { scroll: false })
  }

  const latestDate = items
    .map((i) => i.effectiveDate)
    .filter(Boolean)
    .sort()
    .reverse()[0] ?? null

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab items={items} onTabChange={setActiveTab} />
      case 'insite':
        return (
          <ProductTab
            items={items.filter((i) => i.product === 'Builk Insite')}
            productName="Builk Insite"
            productColor={PRODUCT_COLORS['Builk Insite']}
            productLogo={PRODUCT_LOGOS['Builk Insite']}
          />
        )
      case '360':
        return (
          <ProductTab
            items={items.filter((i) => i.product === 'Builk 360')}
            productName="Builk 360"
            productColor={PRODUCT_COLORS['Builk 360']}
            productLogo={PRODUCT_LOGOS['Builk 360']}
          />
        )
      case 'kwanjai':
        return (
          <ProductTab
            items={items.filter((i) => i.product === 'Kwanjai')}
            productName="Kwanjai"
            productColor={PRODUCT_COLORS['Kwanjai']}
            productLogo={PRODUCT_LOGOS['Kwanjai']}
          />
        )
      case 'bundle':
        return <BundleTab items={items} />
      case 'services':
        return <ServicesTab items={items} />
      default:
        return <OverviewTab items={items} onTabChange={setActiveTab} />
    }
  }

  return (
    <div>
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="mb-8">
        <p className="text-white/40 text-sm font-light mb-3">
          Contech Hub  ›  ราคาและแพ็กเกจ
        </p>
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left: landscape logo + title */}
          <div className="flex items-center gap-5">
            {/* Contech landscape logo — white bg */}
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
            {/* Title */}
            <div>
              <h1 className="text-3xl font-semibold text-white leading-tight">
                ราคาและแพ็กเกจ
              </h1>
              <p className="text-white/60 font-light mt-1 text-sm">
                โซลูชันครบวงจรสำหรับธุรกิจก่อสร้างยุคดิจิทัล
              </p>
            </div>
          </div>
          {/* Right: disclaimer */}
          <p className="text-white/[0.35] text-xs italic self-end">
            ราคาเพื่อการนำเสนอ อาจเปลี่ยนตาม scope จริง · มีผล ม.ค. 2026
          </p>
        </div>
      </div>

      {/* ── Sticky Tab Bar ───────────────────────────────────────────── */}
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
          {TABS.map((tab) => (
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

      {/* ── Tab Content ──────────────────────────────────────────────── */}
      {renderContent()}

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <PricingFooter effectiveDateNote={latestDate ?? undefined} />
    </div>
  )
}
