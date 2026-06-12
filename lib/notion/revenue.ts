/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RevenueEntry } from "@/types/revenue"
import {
  notion,
  prop,
  propAny,
  richText,
  titleText,
  selectProp,
  checkboxProp,
  numberProp,
  dateProp,
  peopleName,
  peopleEmail,
} from "./client"

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
      bookingAmount: numberProp(propAny(page, ["Booking Amount (THB)", "Booking Amount"])),
      recognizedAmount: numberProp(propAny(page, ["Recognized Amount (THB)", "Recognized Amount"])),
      recognitionStatus: selectProp(prop(page, "Recognition Status")),
      ownerName: peopleName(prop(page, "Owner")),
      ownerEmail: peopleEmail(prop(page, "Owner")),
      customerName: richText(prop(page, "Customer Name")),
      goLiveDate: dateProp(propAny(page, ["Go-live Date", "Go-Live Date"])),
      contractStart: dateProp(prop(page, "Contract Start")),
      contractEnd: dateProp(prop(page, "Contract End")),
      monthLocked: checkboxProp(prop(page, "Month Locked")),
      note: richText(propAny(page, ["Note / Blocker", "Note"])),
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
    parent: { data_source_id: process.env.NOTION_REVENUE_DB_ID! },
    properties: {
      "Entry Name": { title: [{ text: { content: data.entryName } }] },
      "Month": { select: { name: data.month } },
      "Revenue Type": { select: { name: data.revenueType } },
      "Lane": data.lane ? { select: { name: data.lane } } : {},
      "Booking Amount (THB)": { number: data.bookingAmount },
      "Recognized Amount (THB)": { number: data.recognizedAmount },
      "Recognition Status": data.recognitionStatus ? { select: { name: data.recognitionStatus } } : {},
      "Customer Name": { rich_text: [{ text: { content: data.customerName } }] },
      "Go-live Date": data.goLiveDate ? { date: { start: data.goLiveDate } } : {},
      "Contract Start": data.contractStart ? { date: { start: data.contractStart } } : {},
      "Contract End": data.contractEnd ? { date: { start: data.contractEnd } } : {},
      "Note / Blocker": { rich_text: [{ text: { content: data.note } }] },
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
    properties["Booking Amount (THB)"] = { number: data.bookingAmount }
  if (data.recognizedAmount !== undefined)
    properties["Recognized Amount (THB)"] = { number: data.recognizedAmount }
  if (data.recognitionStatus !== undefined)
    properties["Recognition Status"] = data.recognitionStatus
      ? { select: { name: data.recognitionStatus } } : {}
  if (data.customerName !== undefined)
    properties["Customer Name"] = { rich_text: [{ text: { content: data.customerName } }] }
  if (data.goLiveDate !== undefined)
    properties["Go-live Date"] = data.goLiveDate ? { date: { start: data.goLiveDate } } : {}
  if (data.contractStart !== undefined)
    properties["Contract Start"] = data.contractStart ? { date: { start: data.contractStart } } : {}
  if (data.contractEnd !== undefined)
    properties["Contract End"] = data.contractEnd ? { date: { start: data.contractEnd } } : {}
  if (data.note !== undefined)
    properties["Note / Blocker"] = { rich_text: [{ text: { content: data.note } }] }
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
