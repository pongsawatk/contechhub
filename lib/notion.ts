/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from "@notionhq/client"
import type { UserProfile } from "@/types/user"
import type { PricingItem } from "@/types/pricing"
import type { KpiEntry } from "@/types/kpi"
import type { RevenueEntry } from "@/types/revenue"

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