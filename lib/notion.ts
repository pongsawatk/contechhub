/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from "@notionhq/client"
import type { UserProfile } from "@/types/user"
import type { PricingItem } from "@/types/pricing"
import type { KpiEntry } from "@/types/kpi"
import type { RevenueEntry } from "@/types/revenue"
import type { Customer, HotQuotation, SalesOrder } from "@/types/pipeline"

const notion = new Client({ auth: process.env.NOTION_TOKEN, notionVersion: "2026-03-11" })

function prop(page: any, name: string): any { return page.properties?.[name] }
function richText(p: any): string { return p?.rich_text?.map((t: any) => t.plain_text).join("") ?? "" }
function titleText(p: any): string { return p?.title?.map((t: any) => t.plain_text).join("") ?? "" }
function emailProp(p: any): string { return p?.email ?? "" }
function selectProp(p: any): string { return p?.select?.name ?? "" }
function checkboxProp(p: any): boolean { return p?.checkbox ?? false }
function numberProp(p: any): number { return p?.number ?? 0 }
function peopleName(p: any): string { return p?.people?.[0]?.name ?? "" }
function peopleEmail(p: any): string { return p?.people?.[0]?.person?.email ?? "" }
function dateProp(p: any): string | null { return p?.date?.start ?? null }
export async function getUserProfile(email: string): Promise<UserProfile | null> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_USERS_DB_ID!,
      filter: {
        and: [
          { property: "Email", email: { equals: email } },
          { property: "Active", checkbox: { equals: true } },
        ],
      },
    })
    if (response.results.length === 0) return null
    const page = response.results[0] as any
    return {
      displayName: titleText(prop(page, "Display Name")) || richText(prop(page, "Display Name")),
      email: emailProp(prop(page, "Email")) || email,
      team: selectProp(prop(page, "Team")) as UserProfile["team"],
      functionalRole: richText(prop(page, "Functional Role")) || selectProp(prop(page, "Functional Role")),
      appRole: selectProp(prop(page, "App Role")) as UserProfile["appRole"],
      buMembership: selectProp(prop(page, "BU Membership")) as UserProfile["buMembership"],
      salesLane: selectProp(prop(page, "Sales Lane")) as UserProfile["salesLane"],
      active: checkboxProp(prop(page, "Active")),
    }
  } catch (error) {
    console.error("[Notion] getUserProfile error:", error)
    return null
  }
}
export async function getPricingPackages(isContechBU = false): Promise<PricingItem[]> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_PRICING_DB_ID!,
      filter: { property: "Visibility", select: { does_not_equal: "Hidden" } } as any,
      sorts: [
        { property: "Sort Order", direction: "ascending" },
        { property: "Price (THB)", direction: "ascending" },
      ],
    })
    return (response.results as any[])
      .map((page: any) => {
        const visibility = selectProp(prop(page, "Visibility"))
        if (visibility === "Internal Only" && !isContechBU) return null
        return {
          id: page.id as string,
          packageName: titleText(prop(page, "Package Name")),
          product: selectProp(prop(page, "Product")) as PricingItem["product"],
          type: selectProp(prop(page, "Type")) as PricingItem["type"],
          price: numberProp(prop(page, "Price (THB)")),
          billing: selectProp(prop(page, "Billing")),
          activeSlots: numberProp(prop(page, "Active Slots")),
          keyInclusions: richText(prop(page, "Key Inclusions"))
            .split(" | ")
            .map((s: string) => s.trim())
            .filter(Boolean),
          targetProfile: richText(prop(page, "Target Profile")),
          lane: selectProp(prop(page, "Lane")) as PricingItem["lane"],
          notes: richText(prop(page, "Notes")),
          visibility: visibility as PricingItem["visibility"],
          sortOrder: prop(page, "Sort Order")?.number ?? 999,
          effectiveDate: prop(page, "Effective Date")?.date?.start ?? null,
        } as PricingItem
      })
      .filter(Boolean) as PricingItem[]
  } catch (error) {
    console.error("[Notion] getPricingPackages error:", error)
    return []
  }
}
export async function getKpiEntries(ownerEmail?: string): Promise<KpiEntry[]> {
  try {
    const response = await notion.dataSources.query({ data_source_id: process.env.NOTION_KPI_DB_ID! })
    const entries: KpiEntry[] = response.results.map((page: any) => ({
      id: page.id,
      kpiName: titleText(prop(page, "KPI Name")) || richText(prop(page, "KPI Name")),
      ownerName: peopleName(prop(page, "Owner")),
      ownerEmail: peopleEmail(prop(page, "Owner")),
      team: selectProp(prop(page, "Team")) as KpiEntry["team"],
      kpiType: selectProp(prop(page, "KPI Type")) || richText(prop(page, "KPI Type")),
      period: selectProp(prop(page, "Period")) as KpiEntry["period"],
      periodStart: dateProp(prop(page, "Period Start")),
      target: numberProp(prop(page, "Target")),
      actual: numberProp(prop(page, "Actual")),
      status: selectProp(prop(page, "Status")) as KpiEntry["status"],
      notes: richText(prop(page, "Notes")),
    }))
    if (ownerEmail) return entries.filter((e) => e.ownerEmail === ownerEmail)
    return entries
  } catch (error) {
    console.error("[Notion] getKpiEntries error:", error)
    return []
  }
}

export async function updateKpiEntry(
  id: string,
  data: { actual: number; notes: string; status: KpiEntry["status"] }
): Promise<void> {
  await notion.pages.update({
    page_id: id,
    properties: {
      "Actual": { number: data.actual },
      "Notes": { rich_text: [{ text: { content: data.notes } }] },
      "Status": { select: data.status ? { name: data.status } : null },
    } as any,
  })
}
export async function getRevenueEntries(month?: string): Promise<RevenueEntry[]> {
  try {
    const filter = month ? { property: "Month", select: { equals: month } } : undefined
    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_REVENUE_DB_ID!,
      ...(filter ? { filter } : {}),
    })
    return response.results.map((page: any) => ({
      id: page.id,
      entryName: titleText(prop(page, "Entry Name")) || richText(prop(page, "Entry Name")),
      month: selectProp(prop(page, "Month")),
      revenueType: selectProp(prop(page, "Revenue Type")) || richText(prop(page, "Revenue Type")),
      lane: selectProp(prop(page, "Lane")) as RevenueEntry["lane"],
      bookingAmount: numberProp(prop(page, "Booking Amount")),
      recognizedAmount: numberProp(prop(page, "Recognized Amount")),
      recognitionStatus: selectProp(prop(page, "Recognition Status")),
      ownerName: peopleName(prop(page, "Owner")),
      ownerEmail: peopleEmail(prop(page, "Owner")),
      customerName: richText(prop(page, "Customer Name")),
      goLiveDate: dateProp(prop(page, "Go-Live Date")),
      contractStart: dateProp(prop(page, "Contract Start")),
      contractEnd: dateProp(prop(page, "Contract End")),
      monthLocked: checkboxProp(prop(page, "Month Locked")),
      note: richText(prop(page, "Note")),
    }))
  } catch (error) {
    console.error("[Notion] getRevenueEntries error:", error)
    return []
  }
}
export async function createRevenueEntry(
  data: Omit<RevenueEntry, "id" | "monthLocked">
): Promise<string> {
  const page = await notion.pages.create({
    parent: { database_id: process.env.NOTION_REVENUE_DB_ID! },
    properties: {
      "Entry Name": { title: [{ text: { content: data.entryName } }] },
      "Month": { select: { name: data.month } },
      "Revenue Type": { select: { name: data.revenueType } },
      "Lane": data.lane ? { select: { name: data.lane } } : {},
      "Booking Amount": { number: data.bookingAmount },
      "Recognized Amount": { number: data.recognizedAmount },
      "Recognition Status": data.recognitionStatus ? { select: { name: data.recognitionStatus } } : {},
      "Customer Name": { rich_text: [{ text: { content: data.customerName } }] },
      "Go-Live Date": data.goLiveDate ? { date: { start: data.goLiveDate } } : {},
      "Contract Start": data.contractStart ? { date: { start: data.contractStart } } : {},
      "Contract End": data.contractEnd ? { date: { start: data.contractEnd } } : {},
      "Note": { rich_text: [{ text: { content: data.note } }] },
    } as any,
  })
  return page.id
}
export async function updateRevenueEntry(
  id: string,
  data: Partial<Omit<RevenueEntry, "id" | "monthLocked">>
): Promise<void> {
  const properties: Record<string, any> = {}
  if (data.entryName !== undefined)
    properties["Entry Name"] = { title: [{ text: { content: data.entryName } }] }
  if (data.month !== undefined)
    properties["Month"] = { select: { name: data.month } }
  if (data.revenueType !== undefined)
    properties["Revenue Type"] = { select: { name: data.revenueType } }
  if (data.lane !== undefined)
    properties["Lane"] = data.lane ? { select: { name: data.lane } } : {}
  if (data.bookingAmount !== undefined)
    properties["Booking Amount"] = { number: data.bookingAmount }
  if (data.recognizedAmount !== undefined)
    properties["Recognized Amount"] = { number: data.recognizedAmount }
  if (data.recognitionStatus !== undefined)
    properties["Recognition Status"] = data.recognitionStatus
      ? { select: { name: data.recognitionStatus } } : {}
  if (data.customerName !== undefined)
    properties["Customer Name"] = { rich_text: [{ text: { content: data.customerName } }] }
  if (data.goLiveDate !== undefined)
    properties["Go-Live Date"] = data.goLiveDate ? { date: { start: data.goLiveDate } } : {}
  if (data.contractStart !== undefined)
    properties["Contract Start"] = data.contractStart ? { date: { start: data.contractStart } } : {}
  if (data.contractEnd !== undefined)
    properties["Contract End"] = data.contractEnd ? { date: { start: data.contractEnd } } : {}
  if (data.note !== undefined)
    properties["Note"] = { rich_text: [{ text: { content: data.note } }] }
  await notion.pages.update({ page_id: id, properties })
}

export async function isMonthLocked(month: string): Promise<boolean> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_REVENUE_DB_ID!,
      filter: {
        and: [
          { property: "Month", select: { equals: month } },
          { property: "Month Locked", checkbox: { equals: true } },
        ],
      } as any,
    })
    return response.results.length > 0
  } catch {
    return false
  }
}
// ── Pipeline: Customer Master ─────────────────────────────────────────

export async function getCustomers(): Promise<Customer[]> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_CUSTOMER_DB_ID!,
      filter: { property: "Active", checkbox: { equals: true } } as any,
    })
    return response.results.map((page: any) => ({
      id: page.id,
      companyName: titleText(prop(page, "Company Name")),
      customerId: richText(prop(page, "Customer ID")),
      segment: selectProp(prop(page, "Segment")),
      region: selectProp(prop(page, "Region")),
      tier: selectProp(prop(page, "Tier")),
      primaryContact: richText(prop(page, "Primary Contact")),
      phone: prop(page, "Phone")?.phone_number ?? "",
      email: emailProp(prop(page, "Email")),
      source: selectProp(prop(page, "Source")),
      active: checkboxProp(prop(page, "Active")),
    }))
  } catch (error) {
    console.error("[Notion] getCustomers error:", error)
    return []
  }
}

export async function findCustomerByName(companyName: string): Promise<string | null> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_CUSTOMER_DB_ID!,
      filter: { property: "Company Name", title: { equals: companyName } } as any,
    })
    return response.results.length > 0 ? response.results[0].id : null
  } catch {
    return null
  }
}

export async function createCustomer(companyName: string): Promise<string> {
  const page = await notion.pages.create({
    parent: { database_id: process.env.NOTION_CUSTOMER_DB_ID! },
    properties: {
      "Company Name": { title: [{ text: { content: companyName } }] },
      "Source": { select: { name: "Jubili Import" } },
      "Active": { checkbox: true },
    } as any,
  })
  return page.id
}

export async function findOrCreateCustomer(companyName: string): Promise<string> {
  const existing = await findCustomerByName(companyName)
  if (existing) return existing
  return createCustomer(companyName)
}
// ── Pipeline: Hot Quotation ───────────────────────────────────────────
export async function getHotQuotations(): Promise<HotQuotation[]> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_HOT_QUOTATION_DB_ID!,
    })
    return response.results.map((page: any) => ({
      id: page.id,
      entryName: titleText(prop(page, "Entry Name")),
      quotationNo: richText(prop(page, "Quotation No.")),
      customerRelationId: prop(page, "Customer")?.relation?.[0]?.id ?? "",
      contactName: richText(prop(page, "Contact Name")),
      product: selectProp(prop(page, "Product")),
      quotationAmount: numberProp(prop(page, "Quotation Amount (THB)")),
      hotness: selectProp(prop(page, "Hotness")).replace(/\D.*/, ""),
      lane: selectProp(prop(page, "Lane")),
      stage: selectProp(prop(page, "Stage")),
      ownerName: peopleName(prop(page, "Sales Owner")),
      ownerEmail: peopleEmail(prop(page, "Sales Owner")),
      expectedClose: dateProp(prop(page, "Expected Close")),
      lastActivity: dateProp(prop(page, "Last Activity")),
      status: selectProp(prop(page, "Status")),
      importBatch: richText(prop(page, "Import Batch")),
      notes: richText(prop(page, "Notes")),
    })) as HotQuotation[]
  } catch (error) {
    console.error("[Notion] getHotQuotations error:", error)
    return []
  }
}

export async function findHotQuotation(quotationNo: string, product: string): Promise<string | null> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_HOT_QUOTATION_DB_ID!,
      filter: {
        and: [
          { property: "Quotation No.", rich_text: { equals: quotationNo } },
          { property: "Product", select: { equals: product } },
        ],
      } as any,
    })
    return response.results.length > 0 ? response.results[0].id : null
  } catch {
    return null
  }
}

export async function createHotQuotation(data: {
  quotationNo: string; product: string; customerId: string; contactName: string
  quotationAmount: number; hotness: string; lane: string; stage: string
  salesOwner: string; expectedClose: string; lastActivity: string
  status: string; importBatch: string; notes: string
}): Promise<string> {
  const hotnessMap: Record<string, string> = { "5": "5 \u2014 \u0e23\u0e49\u0e2d\u0e19\u0e21\u0e32\u0e01", "4": "4 \u2014 \u0e23\u0e49\u0e2d\u0e19" }
  const entryName = data.quotationNo + " \u2014 " + data.product
  const page = await notion.pages.create({
    parent: { database_id: process.env.NOTION_HOT_QUOTATION_DB_ID! },
    properties: {
      "Entry Name": { title: [{ text: { content: entryName } }] },
      "Quotation No.": { rich_text: [{ text: { content: data.quotationNo } }] },
      "Customer": data.customerId ? { relation: [{ id: data.customerId }] } : {},
      "Contact Name": { rich_text: [{ text: { content: data.contactName } }] },
      "Product": data.product ? { select: { name: data.product } } : {},
      "Quotation Amount (THB)": { number: data.quotationAmount },
      "Hotness": data.hotness ? { select: { name: hotnessMap[data.hotness] ?? data.hotness } } : {},
      "Lane": data.lane ? { select: { name: data.lane } } : {},
      "Stage": data.stage ? { select: { name: data.stage } } : {},
      "Status": { select: { name: data.status || "Active" } },
      "Expected Close": data.expectedClose ? { date: { start: data.expectedClose } } : {},
      "Last Activity": data.lastActivity ? { date: { start: data.lastActivity } } : {},
      "Import Batch": { rich_text: [{ text: { content: data.importBatch } }] },
      "Notes": { rich_text: [{ text: { content: data.notes } }] },
    } as any,
  })
  return page.id
}

export async function updateHotQuotation(id: string, data: Parameters<typeof createHotQuotation>[0]): Promise<void> {
  const hotnessMap: Record<string, string> = { "5": "5 \u2014 \u0e23\u0e49\u0e2d\u0e19\u0e21\u0e32\u0e01", "4": "4 \u2014 \u0e23\u0e49\u0e2d\u0e19" }
  await notion.pages.update({
    page_id: id,
    properties: {
      "Quotation No.": { rich_text: [{ text: { content: data.quotationNo } }] },
      "Customer": data.customerId ? { relation: [{ id: data.customerId }] } : {},
      "Contact Name": { rich_text: [{ text: { content: data.contactName } }] },
      "Product": data.product ? { select: { name: data.product } } : {},
      "Quotation Amount (THB)": { number: data.quotationAmount },
      "Hotness": data.hotness ? { select: { name: hotnessMap[data.hotness] ?? data.hotness } } : {},
      "Lane": data.lane ? { select: { name: data.lane } } : {},
      "Stage": data.stage ? { select: { name: data.stage } } : {},
      "Expected Close": data.expectedClose ? { date: { start: data.expectedClose } } : {},
      "Last Activity": data.lastActivity ? { date: { start: data.lastActivity } } : {},
      "Import Batch": { rich_text: [{ text: { content: data.importBatch } }] },
      "Notes": { rich_text: [{ text: { content: data.notes } }] },
    } as any,
  })
}
// ── Pipeline: Sales Order ─────────────────────────────────────────────
export async function getSalesOrders(): Promise<SalesOrder[]> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_SALES_ORDER_DB_ID!,
    })
    return response.results.map((page: any) => ({
      id: page.id,
      entryName: titleText(prop(page, "Entry Name")),
      orderNo: richText(prop(page, "Order No.")),
      quotationNo: richText(prop(page, "Quotation No.")),
      customerRelationId: prop(page, "Customer")?.relation?.[0]?.id ?? "",
      contactName: richText(prop(page, "Contact Name")),
      product: selectProp(prop(page, "Product")),
      orderAmount: numberProp(prop(page, "Order Amount (THB)")),
      lane: selectProp(prop(page, "Lane")),
      revenueType: selectProp(prop(page, "Revenue Type")),
      closeDate: dateProp(prop(page, "Close Date")),
      expectedGoLive: dateProp(prop(page, "Expected Go-live")),
      contractMonths: numberProp(prop(page, "Contract Months")),
      ownerName: peopleName(prop(page, "Sales Owner")),
      ownerEmail: peopleEmail(prop(page, "Sales Owner")),
      paymentTerms: selectProp(prop(page, "Payment Terms")),
      revenuePercent: numberProp(prop(page, "Revenue % Recognized")),
      revenueAmount: numberProp(prop(page, "Revenue Amount Recognized (THB)")),
      recognitionStatus: selectProp(prop(page, "Recognition Status")),
      importBatch: richText(prop(page, "Import Batch")),
      notes: richText(prop(page, "Notes")),
    })) as SalesOrder[]
  } catch (error) {
    console.error("[Notion] getSalesOrders error:", error)
    return []
  }
}

export async function findSalesOrder(orderNo: string): Promise<string | null> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_SALES_ORDER_DB_ID!,
      filter: { property: "Order No.", rich_text: { equals: orderNo } } as any,
    })
    return response.results.length > 0 ? response.results[0].id : null
  } catch {
    return null
  }
}

export async function findHotQuotationByNo(quotationNo: string): Promise<string | null> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_HOT_QUOTATION_DB_ID!,
      filter: { property: "Quotation No.", rich_text: { equals: quotationNo } } as any,
    })
    return response.results.length > 0 ? response.results[0].id : null
  } catch {
    return null
  }
}

export async function createSalesOrder(data: {
  orderNo: string; quotationNo: string; customerId: string; hotQuotationId: string
  contactName: string; product: string; orderAmount: number; lane: string
  revenueType: string; closeDate: string; expectedGoLive: string
  contractMonths: number; salesOwner: string; paymentTerms: string
  importBatch: string; notes: string
}): Promise<string> {
  const companyPart = data.orderNo
  const entryName = data.orderNo + " \u2014 " + data.product
  const page = await notion.pages.create({
    parent: { database_id: process.env.NOTION_SALES_ORDER_DB_ID! },
    properties: {
      "Entry Name": { title: [{ text: { content: entryName } }] },
      "Order No.": { rich_text: [{ text: { content: data.orderNo } }] },
      "Quotation No.": { rich_text: [{ text: { content: data.quotationNo } }] },
      "Customer": data.customerId ? { relation: [{ id: data.customerId }] } : {},
      "Hot Quotation": data.hotQuotationId ? { relation: [{ id: data.hotQuotationId }] } : {},
      "Contact Name": { rich_text: [{ text: { content: data.contactName } }] },
      "Product": data.product ? { select: { name: data.product } } : {},
      "Order Amount (THB)": { number: data.orderAmount },
      "Lane": data.lane ? { select: { name: data.lane } } : {},
      "Revenue Type": data.revenueType ? { select: { name: data.revenueType } } : {},
      "Close Date": data.closeDate ? { date: { start: data.closeDate } } : {},
      "Expected Go-live": data.expectedGoLive ? { date: { start: data.expectedGoLive } } : {},
      "Contract Months": { number: data.contractMonths },
      "Payment Terms": data.paymentTerms ? { select: { name: data.paymentTerms } } : {},
      "Recognition Status": { select: { name: "Pending" } },
      "Import Batch": { rich_text: [{ text: { content: data.importBatch } }] },
      "Notes": { rich_text: [{ text: { content: data.notes } }] },
    } as any,
  })
  void companyPart
  return page.id
}

export async function updateSalesOrderRevenue(
  id: string,
  data: { revenuePercent: number; revenueAmount: number; recognitionStatus: string }
): Promise<void> {
  await notion.pages.update({
    page_id: id,
    properties: {
      "Revenue % Recognized": { number: data.revenuePercent },
      "Revenue Amount Recognized (THB)": { number: data.revenueAmount },
      "Recognition Status": data.recognitionStatus ? { select: { name: data.recognitionStatus } } : {},
    } as any,
  })
}