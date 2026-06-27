import type { HotQuotation, PipelineRedFlag, SalesOrder } from "@/types/pipeline"

function toDate(value: string | null): Date | null {
  if (!value) return null
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? null : new Date(timestamp)
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function daysSince(value: string | null, today: Date): number | null {
  const date = toDate(value)
  if (!date) return null
  return Math.floor((startOfDay(today).getTime() - startOfDay(date).getTime()) / 86400000)
}

function isPast(value: string | null, today: Date): boolean {
  const date = toDate(value)
  return date ? startOfDay(date).getTime() < startOfDay(today).getTime() : false
}

function pushUnique(flags: PipelineRedFlag[], flag: PipelineRedFlag): void {
  if (!flags.some((existing) => existing.id === flag.id)) {
    flags.push(flag)
  }
}

export function getPipelineRedFlags(
  quotations: HotQuotation[],
  orders: SalesOrder[],
  today = new Date()
): PipelineRedFlag[] {
  const flags: PipelineRedFlag[] = []
  const activeQuotes = quotations.filter((quote) => quote.status === "Active")

  for (const quote of activeQuotes) {
    const label = quote.quotationNo || quote.entryName || quote.id
    if (!quote.ownerName) {
      pushUnique(flags, {
        id: `quote-owner-${quote.id}`,
        source: "Hot Quotation",
        severity: "critical",
        title: "Deal ไม่มี Sales Owner",
        detail: `${label} ต้องระบุ owner ก่อน review pipeline`,
        ownerName: "",
        amount: quote.quotationAmount,
        dueDate: quote.expectedClose,
      })
    }

    if (!quote.expectedClose) {
      pushUnique(flags, {
        id: `quote-close-${quote.id}`,
        source: "Hot Quotation",
        severity: "warning",
        title: "Deal ไม่มี Expected Close",
        detail: `${label} ยังไม่มีวันปิดดีลที่ใช้ forecast`,
        ownerName: quote.ownerName,
        amount: quote.quotationAmount,
        dueDate: null,
      })
    }

    const idleDays = daysSince(quote.lastActivity, today)
    if (idleDays !== null && idleDays >= 7 && quote.stage !== "Verbal Yes") {
      pushUnique(flags, {
        id: `quote-idle-${quote.id}`,
        source: "Hot Quotation",
        severity: "warning",
        title: "Quotation ไม่มี follow-up ล่าสุด",
        detail: `${label} ไม่ขยับมา ${idleDays} วัน`,
        ownerName: quote.ownerName,
        amount: quote.quotationAmount,
        dueDate: quote.lastActivity,
      })
    }

    if (quote.stage === "Verbal Yes" && isPast(quote.expectedClose, today)) {
      pushUnique(flags, {
        id: `quote-verbal-${quote.id}`,
        source: "Hot Quotation",
        severity: "critical",
        title: "Verbal Yes เลย Expected Close",
        detail: `${label} ควรเร่ง PO/payment หรือปรับ forecast`,
        ownerName: quote.ownerName,
        amount: quote.quotationAmount,
        dueDate: quote.expectedClose,
      })
    }
  }

  for (const order of orders) {
    const label = order.orderNo || order.entryName || order.id
    if (isPast(order.expectedGoLive, today) && order.recognitionStatus !== "Fully Recognized") {
      pushUnique(flags, {
        id: `order-golive-${order.id}`,
        source: "Sales Order",
        severity: "critical",
        title: "Go-live เลยกำหนดแต่ยังไม่รับรู้ครบ",
        detail: `${label} ต้องตรวจ onboarding / revenue trigger`,
        ownerName: order.ownerName,
        amount: order.orderAmount,
        dueDate: order.expectedGoLive,
      })
    }

    const closeAge = daysSince(order.closeDate, today)
    if (
      closeAge !== null &&
      closeAge >= 14 &&
      order.orderAmount > 0 &&
      order.revenueAmount < order.orderAmount &&
      order.recognitionStatus !== "Fully Recognized"
    ) {
      pushUnique(flags, {
        id: `order-revenue-${order.id}`,
        source: "Sales Order",
        severity: "warning",
        title: "Booked แล้วยัง recognize ไม่ครบ",
        detail: `${label} ปิดมา ${closeAge} วัน แต่ recognized ยังต่ำกว่า booking`,
        ownerName: order.ownerName,
        amount: order.orderAmount - order.revenueAmount,
        dueDate: order.closeDate,
      })
    }
  }

  const severityRank: Record<PipelineRedFlag["severity"], number> = {
    critical: 0,
    warning: 1,
    info: 2,
  }

  return flags.sort((a, b) => {
    const severityDiff = severityRank[a.severity] - severityRank[b.severity]
    if (severityDiff !== 0) return severityDiff
    return b.amount - a.amount
  })
}
