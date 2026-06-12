/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Customer, HotQuotation, SalesOrder } from "@/types/pipeline"
import {
  notion,
  prop,
  richText,
  titleText,
  emailProp,
  selectProp,
  checkboxProp,
  numberProp,
  dateProp,
  peopleName,
  peopleEmail,
  richTextProperty,
} from "./client"
import { findNotionUserByName } from "./users"

// ── Customer Master ───────────────────────────────────────────────────

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
    parent: { data_source_id: process.env.NOTION_CUSTOMER_DB_ID! },
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

// ── Hot Quotation ─────────────────────────────────────────────────────

const HOTNESS_LABELS: Record<string, string> = { "5": "5 — ร้อนมาก", "4": "4 — ร้อน" }

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

export async function createHotQuotation(data: {
  quotationNo: string; product: string; customerId: string; contactName: string
  quotationAmount: number; hotness: string; lane: string; stage: string
  salesOwner: string; expectedClose: string; lastActivity: string
  status: string; importBatch: string; notes: string
}): Promise<string> {
  const entryName = data.quotationNo + " — " + data.product
  const ownerId = await findNotionUserByName(data.salesOwner)
  const properties: Record<string, any> = {
    "Entry Name": { title: [{ text: { content: entryName } }] },
    "Quotation No.": richTextProperty(data.quotationNo),
    "Contact Name": richTextProperty(data.contactName),
    "Quotation Amount (THB)": { number: data.quotationAmount },
    "Status": { select: { name: data.status || "Active" } },
    "Import Batch": richTextProperty(data.importBatch),
    "Notes": richTextProperty(data.notes),
  }

  if (data.customerId) properties["Customer"] = { relation: [{ id: data.customerId }] }
  if (data.product) properties["Product"] = { select: { name: data.product } }
  if (data.hotness) properties["Hotness"] = { select: { name: HOTNESS_LABELS[data.hotness] ?? data.hotness } }
  if (data.lane) properties["Lane"] = { select: { name: data.lane } }
  if (data.stage) properties["Stage"] = { select: { name: data.stage } }
  if (ownerId) properties["Sales Owner"] = { people: [{ id: ownerId }] }
  if (data.expectedClose) properties["Expected Close"] = { date: { start: data.expectedClose } }
  if (data.lastActivity) properties["Last Activity"] = { date: { start: data.lastActivity } }

  const page = await notion.pages.create({
    parent: { data_source_id: process.env.NOTION_HOT_QUOTATION_DB_ID! },
    properties: properties as any,
  })
  return page.id
}

export async function updateHotQuotation(id: string, data: Parameters<typeof createHotQuotation>[0]): Promise<void> {
  const ownerId = await findNotionUserByName(data.salesOwner)
  const properties: Record<string, any> = {
    "Quotation No.": richTextProperty(data.quotationNo),
    "Customer": { relation: data.customerId ? [{ id: data.customerId }] : [] },
    "Contact Name": richTextProperty(data.contactName),
    "Product": { select: data.product ? { name: data.product } : null },
    "Quotation Amount (THB)": { number: data.quotationAmount },
    "Hotness": { select: data.hotness ? { name: HOTNESS_LABELS[data.hotness] ?? data.hotness } : null },
    "Lane": { select: data.lane ? { name: data.lane } : null },
    "Stage": { select: data.stage ? { name: data.stage } : null },
    "Sales Owner": { people: ownerId ? [{ id: ownerId }] : [] },
    "Expected Close": { date: data.expectedClose ? { start: data.expectedClose } : null },
    "Last Activity": { date: data.lastActivity ? { start: data.lastActivity } : null },
    "Import Batch": richTextProperty(data.importBatch),
    "Notes": richTextProperty(data.notes),
  }

  await notion.pages.update({
    page_id: id,
    properties: properties as any,
  })
}

// ── Sales Order ───────────────────────────────────────────────────────

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

export async function createSalesOrder(data: {
  orderNo: string; quotationNo: string; customerId: string; hotQuotationId: string
  contactName: string; product: string; orderAmount: number; lane: string
  revenueType: string; closeDate: string; expectedGoLive: string
  contractMonths: number; salesOwner: string; paymentTerms: string
  importBatch: string; notes: string
}): Promise<string> {
  const entryName = data.orderNo + " — " + data.product
  const ownerId = await findNotionUserByName(data.salesOwner)
  const properties: Record<string, any> = {
    "Entry Name": { title: [{ text: { content: entryName } }] },
    "Order No.": richTextProperty(data.orderNo),
    "Quotation No.": richTextProperty(data.quotationNo),
    "Contact Name": richTextProperty(data.contactName),
    "Order Amount (THB)": { number: data.orderAmount },
    "Contract Months": { number: data.contractMonths },
    "Recognition Status": { select: { name: "Pending" } },
    "Import Batch": richTextProperty(data.importBatch),
    "Notes": richTextProperty(data.notes),
  }

  if (data.customerId) properties["Customer"] = { relation: [{ id: data.customerId }] }
  if (data.hotQuotationId) properties["Hot Quotation"] = { relation: [{ id: data.hotQuotationId }] }
  if (data.product) properties["Product"] = { select: { name: data.product } }
  if (data.lane) properties["Lane"] = { select: { name: data.lane } }
  if (data.revenueType) properties["Revenue Type"] = { select: { name: data.revenueType } }
  if (data.closeDate) properties["Close Date"] = { date: { start: data.closeDate } }
  if (data.expectedGoLive) properties["Expected Go-live"] = { date: { start: data.expectedGoLive } }
  if (ownerId) properties["Sales Owner"] = { people: [{ id: ownerId }] }
  if (data.paymentTerms) properties["Payment Terms"] = { select: { name: data.paymentTerms } }

  const page = await notion.pages.create({
    parent: { data_source_id: process.env.NOTION_SALES_ORDER_DB_ID! },
    properties: properties as any,
  })
  return page.id
}

export async function updateSalesOrder(id: string, data: Parameters<typeof createSalesOrder>[0]): Promise<void> {
  const ownerId = await findNotionUserByName(data.salesOwner)
  const properties: Record<string, any> = {
    "Quotation No.": richTextProperty(data.quotationNo),
    "Customer": { relation: data.customerId ? [{ id: data.customerId }] : [] },
    "Hot Quotation": { relation: data.hotQuotationId ? [{ id: data.hotQuotationId }] : [] },
    "Contact Name": richTextProperty(data.contactName),
    "Product": { select: data.product ? { name: data.product } : null },
    "Order Amount (THB)": { number: data.orderAmount },
    "Lane": { select: data.lane ? { name: data.lane } : null },
    "Revenue Type": { select: data.revenueType ? { name: data.revenueType } : null },
    "Close Date": { date: data.closeDate ? { start: data.closeDate } : null },
    "Expected Go-live": { date: data.expectedGoLive ? { start: data.expectedGoLive } : null },
    "Contract Months": { number: data.contractMonths },
    "Sales Owner": { people: ownerId ? [{ id: ownerId }] : [] },
    "Payment Terms": { select: data.paymentTerms ? { name: data.paymentTerms } : null },
    "Import Batch": richTextProperty(data.importBatch),
    "Notes": richTextProperty(data.notes),
  }

  await notion.pages.update({
    page_id: id,
    properties: properties as any,
  })
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
