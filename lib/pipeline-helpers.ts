export const HOT_QUOTATION_PRODUCTS = ["Builk Insite", "Builk 360", "Kwanjai", "Bundle"] as const
export const HOT_QUOTATION_STAGES = ["Sent", "Follow-up", "Negotiation", "Verbal Yes"] as const
export const HOT_QUOTATION_STATUSES = ["Active", "Won", "Lost", "On Hold"] as const
export const REVENUE_TYPES = ["New Logo Biz", "New Logo Corp", "Add-on", "Renewal", "Service"] as const
export const PAYMENT_TERMS = ["30 Days", "Prepaid", "On Delivery", "Other"] as const
export const RECOGNITION_STATUSES = ["Pending", "Partially Recognized", "Fully Recognized", "Cancelled"] as const

export const HOTNESS_MAP: Record<string, string> = {
  "5": "5 \u2014 \u0e23\u0e49\u0e2d\u0e19\u0e21\u0e32\u0e01",
  "4": "4 \u2014 \u0e23\u0e49\u0e2d\u0e19",
}

export function formatTHB(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M"
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K"
  return n.toLocaleString()
}

export function formatTHBFull(n: number): string {
  return n.toLocaleString("th-TH")
}

export function formatDate(d: string | null): string {
  if (!d) return "-"
  try {
    return new Date(d).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "2-digit" })
  } catch {
    return d
  }
}

export function parseDateDMY(s: string): string | null {
  if (!s) return null
  const parts = s.split("/")
  if (parts.length === 3) {
    const [d, m, y] = parts
    const year = Number(y) > 100 ? Number(y) : 2000 + Number(y)
    const date = new Date(year, Number(m) - 1, Number(d))
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0]
    }
  }
  // Try ISO format as fallback
  const d = new Date(s)
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0]
  return null
}

export function hotnessDisplay(h: string): string {
  if (h === "5" || h === "5 \u2014 \u0e23\u0e49\u0e2d\u0e19\u0e21\u0e32\u0e01") return "5 \uD83D\uDD25\uD83D\uDD25"
  if (h === "4" || h === "4 \u2014 \u0e23\u0e49\u0e2d\u0e19") return "4 \uD83D\uDD25"
  return h || "-"
}

export function stageColor(stage: string): string {
  switch (stage) {
    case "Verbal Yes": return "text-cyan-400"
    case "Negotiation": return "text-blue-400"
    case "Follow-up": return "text-yellow-400"
    case "Sent": return "text-white/60"
    default: return "text-white/40"
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case "Active": return "text-green-400"
    case "Won": return "text-cyan-400"
    case "Lost": return "text-red-400"
    case "On Hold": return "text-yellow-400"
    default: return "text-white/40"
  }
}

export function recognitionColor(s: string): string {
  switch (s) {
    case "Fully Recognized": return "text-cyan-400"
    case "Partially Recognized": return "text-blue-400"
    case "Pending": return "text-yellow-400"
    case "Cancelled": return "text-red-400"
    default: return "text-white/40"
  }
}