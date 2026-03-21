import type { PricingItem } from '@/types/pricing'

export interface ProductConfig {
  color: string
  logo: string
  tabId: string
  nameTH: string
  tagline: string
}

const BILLING_LABELS: Record<string, string> = {
  'Per Year': 'ต่อปี',
  'Per Project': 'ต่อโครงการ',
  'Per Month': 'ต่อเดือน',
  'One-time': 'ครั้งเดียว',
}

const FALLBACK_PRODUCT_COLOR = '#38bdf8'
const FALLBACK_PRODUCT_LOGO = '/logos/contech_logo.png'

export const PRODUCT_CONFIG: Record<string, ProductConfig> = {
  'Builk Insite': {
    color: '#378ADD',
    logo: '/logos/iNSITE_Logo.png',
    tabId: 'insite',
    nameTH: 'บริหารโครงการ',
    tagline: 'เชื่อมแผนงาน คุณภาพ และต้นทุนไว้ในที่เดียว',
  },
  'Builk 360': {
    color: '#1D9E75',
    logo: '/logos/builk360_Logo.png',
    tabId: '360',
    nameTH: 'ติดตามไซต์งาน',
    tagline: 'ยกไซต์งานมาไว้บนหน้าจอ ด้วยภาพ 360 องศา',
  },
  Kwanjai: {
    color: '#7F77DD',
    logo: '/logos/Kwanjai_Logo.png',
    tabId: 'kwanjai',
    nameTH: 'บริการหลังการขาย',
    tagline: 'บริหารงานซ่อมและบริการหลังการขายผ่าน LINE',
  },
  Bundle: {
    color: '#EF9F27',
    logo: '/logos/contech_logo.png',
    tabId: 'bundle',
    nameTH: 'Bundle Package',
    tagline: 'ข้อเสนอพิเศษสำหรับการซื้อหลายผลิตภัณฑ์ร่วมกัน',
  },
}

export const PRODUCT_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(PRODUCT_CONFIG).map(([product, config]) => [product, config.color])
)

export const PRODUCT_LOGOS: Record<string, string> = Object.fromEntries(
  Object.entries(PRODUCT_CONFIG).map(([product, config]) => [product, config.logo])
)

function slugifyProductName(product: string): string {
  const slug = product
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'product'
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('th-TH').format(n)
}

export function formatBilling(billing: string): string {
  return BILLING_LABELS[billing] ?? billing
}

export function formatPrice(price: number, billing: string): string {
  if (price === 0) return 'ติดต่อฝ่ายขาย'
  return `${formatNumber(price)} ${formatBilling(billing)}`
}

export function getProductConfig(product: string): ProductConfig {
  const config = PRODUCT_CONFIG[product]
  if (config) return config

  return {
    color: FALLBACK_PRODUCT_COLOR,
    logo: FALLBACK_PRODUCT_LOGO,
    tabId: slugifyProductName(product),
    nameTH: product,
    tagline: '',
  }
}

export function getProductTabId(product: string): string {
  return getProductConfig(product).tabId
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
