/** Number formatting helpers — ใช้ร่วมกันทั้ง app แทน toLocaleString ที่กระจายตามไฟล์ */

/** จำนวนเงินบาทเต็มจำนวน เช่น 1,234,567 */
export function formatTHB(n: number): string {
  return n.toLocaleString('th-TH')
}

/** จำนวนเงินแบบย่อสำหรับ card/grid เช่น 1.5M, 800K */
export function formatTHBCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return formatTHB(n)
}

/** ค่า KPI พร้อมหน่วย (%, THB, x หรือหน่วยอิสระ เช่น ราย/ดีล) */
export function formatKpiValue(value: number | null, unit: string, isPercent: boolean): string {
  if (value === null) return '-'
  if (isPercent || unit === '%') return `${value}%`
  if (unit === 'THB') return `฿${formatTHB(value)}`
  if (unit === 'x') return `${value}x`
  return `${formatTHB(value)}${unit ? ` ${unit}` : ''}`
}
