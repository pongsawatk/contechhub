/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from "xlsx"

function applyHeaderStyle(ws: any, range: string, bgColor = "0F6E56") {
  const r = XLSX.utils.decode_range(range)
  for (let c = r.s.c; c <= r.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: r.s.r, c })
    if (!ws[addr]) ws[addr] = {}
    ws[addr].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { patternType: "solid", fgColor: { rgb: bgColor } },
      alignment: { horizontal: "center" },
    }
  }
}

function applyExampleStyle(ws: any, range: string) {
  const r = XLSX.utils.decode_range(range)
  for (let c = r.s.c; c <= r.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: r.s.r, c })
    if (!ws[addr]) ws[addr] = {}
    ws[addr].s = {
      fill: { patternType: "solid", fgColor: { rgb: "E8E8E8" } },
    }
  }
}

function applyHintStyle(ws: any, range: string) {
  const r = XLSX.utils.decode_range(range)
  for (let c = r.s.c; c <= r.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: r.s.r, c })
    if (!ws[addr]) ws[addr] = {}
    ws[addr].s = {
      font: { italic: true, color: { rgb: "888888" } },
      fill: { patternType: "solid", fgColor: { rgb: "F5F5F5" } },
    }
  }
}

export function generateHotQuotationTemplate(): Blob {
  const wb = XLSX.utils.book_new()
  const headers = [
    "Quotation No.", "Product", "Company Name", "Contact Name",
    "Quotation Amount", "Hotness", "Lane", "Stage",
    "Sales Owner", "Expected Close", "Last Activity", "Notes",
  ]
  const example = [
    "QT-2026-001", "Builk Insite", "บริษัท เอบีซี จำกัด", "คุณสมชาย",
    500000, 5, "Biz", "Follow-up",
    "Somchai Jaidee", "30/03/2026", "15/03/2026", "ลูกค้าสนใจมาก",
  ]
  const hints = [
    "", "Builk Insite / Builk 360 / Kwanjai / Bundle", "", "",
    "ตัวเลขเท่านั้น", "4 หรือ 5 เท่านั้น", "Biz หรือ Corp", "Sent / Follow-up / Negotiation / Verbal Yes",
    "ชื่อผู้ใช้ใน Notion (ไม่ใช่ email)", "DD/MM/YYYY", "DD/MM/YYYY", "",
  ]
  const ws = XLSX.utils.aoa_to_sheet([headers, example, hints])
  ws["!cols"] = headers.map((_, i) => ({ wch: Math.max((hints[i]?.length ?? 0) + 2, 18) }))
  applyHeaderStyle(ws, "A1:L1")
  applyExampleStyle(ws, "A2:L2")
  applyHintStyle(ws, "A3:L3")
  XLSX.utils.book_append_sheet(wb, ws, "Hot Quotation")
  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" })
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
}

export function generateSalesOrderTemplate(): Blob {
  const wb = XLSX.utils.book_new()
  const headers = [
    "Order No.", "Quotation No.", "Product", "Company Name",
    "Contact Name", "Order Amount", "Lane", "Revenue Type",
    "Close Date", "Expected Go-live", "Contract Months",
    "Sales Owner", "Payment Terms", "Notes",
  ]
  const example = [
    "SO-2026-001", "QT-2026-001", "Builk Insite", "บริษัท เอบีซี จำกัด",
    "คุณสมชาย", 500000, "Biz", "New Logo Biz",
    "30/03/2026", "01/05/2026", 12,
    "Somchai Jaidee", "30 Days", "ลูกค้า sign แล้ว",
  ]
  const hints = [
    "", "", "Builk Insite / Builk 360 / Kwanjai / Bundle", "",
    "", "ตัวเลขเท่านั้น", "Biz หรือ Corp", "New Logo Biz / New Logo Corp / Add-on / Renewal / Service",
    "DD/MM/YYYY", "DD/MM/YYYY", "จำนวนเต็ม (เดือน)",
    "ชื่อผู้ใช้ใน Notion (ไม่ใช่ email)", "30 Days / Prepaid / On Delivery / Other", "",
  ]
  const ws = XLSX.utils.aoa_to_sheet([headers, example, hints])
  ws["!cols"] = headers.map((_, i) => ({ wch: Math.max((hints[i]?.length ?? 0) + 2, 18) }))
  applyHeaderStyle(ws, "A1:N1", "1E3A5F")
  applyExampleStyle(ws, "A2:N2")
  applyHintStyle(ws, "A3:N3")
  XLSX.utils.book_append_sheet(wb, ws, "Sales Order")
  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" })
  return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}