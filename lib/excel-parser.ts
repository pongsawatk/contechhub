/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from "xlsx"
import type { ParsedHotQuotation, ParsedSalesOrder, ParsedRow, ParseResult, RowError } from "@/types/pipeline"
import { HOT_QUOTATION_PRODUCTS, parseDateDMY } from "@/lib/pipeline-helpers"

function normalizeKey(k: string): string {
  return k.trim().toLowerCase().replace(/\s+/g, " ")
}

function getCol(row: Record<string, any>, ...keys: string[]): string {
  for (const k of keys) {
    const norm = normalizeKey(k)
    for (const [rk, rv] of Object.entries(row)) {
      if (normalizeKey(rk) === norm && rv !== undefined && rv !== null && rv !== "") {
        return String(rv).trim()
      }
    }
  }
  return ""
}

function getNum(row: Record<string, any>, ...keys: string[]): number {
  const v = getCol(row, ...keys)
  if (!v) return 0
  const n = Number(v.replace(/,/g, ""))
  return isNaN(n) ? 0 : n
}

function isValidNum(row: Record<string, any>, ...keys: string[]): boolean {
  const v = getCol(row, ...keys)
  if (!v) return true // empty is ok (defaults to 0)
  return !isNaN(Number(v.replace(/,/g, "")))
}

function sheetToRows(buffer: ArrayBuffer): Record<string, any>[] {
  const wb = XLSX.read(buffer, { type: "array", cellDates: false })
  const ws = wb.Sheets[wb.SheetNames[0]]
  return XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" }) as Record<string, any>[]
}

/** strict=true → push to errors (blocks import); false → push to warnings */
function validateDate(
  v: string,
  field: string,
  errors: RowError[],
  warnings: RowError[],
  rowIndex: number,
  strict = false
): string {
  if (!v) return ""
  const d = parseDateDMY(v)
  if (!d) {
    const target = strict ? errors : warnings
    target.push({ row: rowIndex, field, message: "รูปแบบวันที่ไม่ถูกต้อง ต้องเป็น DD/MM/YYYY (ปี ค.ศ.)" })
  }
  return d ?? ""
}

export function parseHotQuotation(buffer: ArrayBuffer): ParseResult {
  const rows = sheetToRows(buffer)
  const all: ParsedRow[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const errors: RowError[] = []
    const warnings: RowError[] = []
    const rowIndex = i + 2 // 1-based, row 1 = header

    const quotationNo = getCol(row, "Quotation No.", "Quotation No", "quotation no")
    const rawProduct = getCol(row, "Product")
    const companyName = getCol(row, "Company Name", "company name")
    const hotness = getCol(row, "Hotness")

    if (!quotationNo) errors.push({ row: rowIndex, field: "Quotation No.", message: "จำเป็นต้องกรอก" })
    if (!companyName) errors.push({ row: rowIndex, field: "Company Name", message: "จำเป็นต้องกรอก" })
    if (!hotness) errors.push({ row: rowIndex, field: "Hotness", message: "จำเป็นต้องกรอก (4 หรือ 5)" })
    else if (hotness !== "4" && hotness !== "5") errors.push({ row: rowIndex, field: "Hotness", message: "ต้องเป็น 4 หรือ 5 เท่านั้น" })
    if (!isValidNum(row, "Quotation Amount", "Amount")) errors.push({ row: rowIndex, field: "Quotation Amount", message: "ต้องเป็นตัวเลขเท่านั้น (เช่น 500000)" })

    // Handle bundle products: split " | " into multiple rows
    const products = rawProduct ? rawProduct.split(" | ").map((p: string) => p.trim()).filter(Boolean) : [rawProduct || ""]

    for (const product of products) {
      const errs = [...errors]
      if (!product) errs.push({ row: rowIndex, field: "Product", message: "จำเป็นต้องกรอก" })
      else if (!HOT_QUOTATION_PRODUCTS.includes(product as any)) {
        errs.push({ row: rowIndex, field: "Product", message: "ต้องเป็นหนึ่งใน: " + HOT_QUOTATION_PRODUCTS.join(", ") })
      }

      const data: ParsedHotQuotation = {
        quotationNo,
        product,
        companyName,
        contactName: getCol(row, "Contact Name"),
        quotationAmount: getNum(row, "Quotation Amount", "Amount"),
        hotness: String(hotness),
        lane: getCol(row, "Lane"),
        stage: getCol(row, "Stage"),
        salesOwner: getCol(row, "Sales Owner"),
        expectedClose: validateDate(getCol(row, "Expected Close"), "Expected Close", errs, warnings, rowIndex, false),
        lastActivity: validateDate(getCol(row, "Last Activity"), "Last Activity", errs, warnings, rowIndex, false),
        notes: getCol(row, "Notes"),
      }

      const parsedRow: ParsedRow = { rowIndex, data, errors: errs, warnings }
      all.push(parsedRow)
    }
  }

  return {
    valid: all.filter((r) => r.errors.length === 0),
    invalid: all.filter((r) => r.errors.length > 0),
    all,
  }
}

export function parseSalesOrder(buffer: ArrayBuffer): ParseResult {
  const rows = sheetToRows(buffer)
  const all: ParsedRow[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const errors: RowError[] = []
    const warnings: RowError[] = []
    const rowIndex = i + 2

    const orderNo = getCol(row, "Order No.", "Order No")
    const companyName = getCol(row, "Company Name")
    const orderAmount = getNum(row, "Order Amount", "Amount")

    if (!orderNo) errors.push({ row: rowIndex, field: "Order No.", message: "จำเป็นต้องกรอก" })
    if (!companyName) errors.push({ row: rowIndex, field: "Company Name", message: "จำเป็นต้องกรอก" })
    if (!isValidNum(row, "Order Amount", "Amount")) errors.push({ row: rowIndex, field: "Order Amount", message: "ต้องเป็นตัวเลขเท่านั้น (เช่น 500000)" })
    else if (orderAmount <= 0) warnings.push({ row: rowIndex, field: "Order Amount", message: "จำนวนเงินควรมากกว่า 0" })

    const data: ParsedSalesOrder = {
      orderNo,
      quotationNo: getCol(row, "Quotation No.", "Quotation No"),
      product: getCol(row, "Product"),
      companyName,
      contactName: getCol(row, "Contact Name"),
      orderAmount,
      lane: getCol(row, "Lane"),
      revenueType: getCol(row, "Revenue Type"),
      closeDate: validateDate(getCol(row, "Close Date"), "Close Date", errors, warnings, rowIndex, true),
      expectedGoLive: validateDate(getCol(row, "Expected Go-live", "Expected Go Live"), "Expected Go-live", errors, warnings, rowIndex, false),
      contractMonths: getNum(row, "Contract Months"),
      salesOwner: getCol(row, "Sales Owner"),
      paymentTerms: getCol(row, "Payment Terms"),
      notes: getCol(row, "Notes"),
    }

    all.push({ rowIndex, data, errors, warnings })
  }

  return {
    valid: all.filter((r) => r.errors.length === 0),
    invalid: all.filter((r) => r.errors.length > 0),
    all,
  }
}