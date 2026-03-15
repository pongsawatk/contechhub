import type { PricingItem } from '@/types/pricing'

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('th-TH').format(n)
}

export function formatBilling(billing: string): string {
  const map: Record<string, string> = {
    'Per Year': 'บาท/ปี',
    'Per Project': 'บาท/โครงการ',
    'Per Month': 'บาท/เดือน',
    'One-time': 'บาท (ครั้งเดียว)',
  }
  return map[billing] ?? 'บาท'
}

export function formatPrice(price: number, billing: string): string {
  if (price === 0) return 'ติดต่อฝ่ายขาย'
  return `${formatNumber(price)} ${formatBilling(billing)}`
}

export const PRODUCT_COLORS: Record<string, string> = {
  'Builk Insite': '#378ADD',
  'Builk 360': '#1D9E75',
  'Kwanjai': '#7F77DD',
  'Bundle': '#EF9F27',
}

export const PRODUCT_LOGOS: Record<string, string> = {
  'Builk Insite': '/logos/iNSITE_Logo.png',
  'Builk 360': '/logos/builk360_Logo.png',
  'Kwanjai': '/logos/Kwanjai_Logo.png',
  'Bundle': '/logos/contech_logo.png',
}

interface LaneBadgeProps {
  lane: PricingItem['lane']
}

export function LaneBadge({ lane }: LaneBadgeProps) {
  const configs: Record<string, { bg: string; border: string; text: string }> = {
    Biz: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(96,165,250,0.3)', text: '#93c5fd' },
    Corp: { bg: 'rgba(234,88,12,0.15)', border: 'rgba(251,146,60,0.3)', text: '#fdba74' },
    Both: { bg: 'rgba(22,163,74,0.15)', border: 'rgba(74,222,128,0.3)', text: '#86efac' },
  }
  const config = lane ? configs[lane] : undefined
  if (!config) return null
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full border"
      style={{ background: config.bg, borderColor: config.border, color: config.text }}
    >
      {lane}
    </span>
  )
}
