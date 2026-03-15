/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from "@notionhq/client"
import type { UserProfile, KpiEntry, RevenueEntry } from "@/types/user"
import type { PricingItem } from "@/types/pricing"

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  notionVersion: "2026-03-11",
})

// ── Helper to safely read Notion properties ──────────────────────────
function prop(page: any, name: string): any {
  return page.properties?.[name]
}

function richText(p: any): string {
  return p?.rich_text?.map((t: any) => t.plain_text).join("") ?? ""
}

function titleText(p: any): string {
  return p?.title?.map((t: any) => t.plain_text).join("") ?? ""
}

function emailProp(p: any): string {
  return p?.email ?? ""
}

function selectProp(p: any): string {
  return p?.select?.name ?? ""
}

function checkboxProp(p: any): boolean {
  return p?.checkbox ?? false
}

function numberProp(p: any): number {
  return p?.number ?? 0
}


// ── getUserProfile ───────────────────────────────────────────────────
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

// ── getPricingPackages ───────────────────────────────────────────────
export async function getPricingPackages(isContechBU = false): Promise<PricingItem[]> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_PRICING_DB_ID!,
      filter: {
        property: "Visibility",
        select: { does_not_equal: "Hidden" },
      } as any,
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

// ── getKpiEntries ────────────────────────────────────────────────────
export async function getKpiEntries(ownerEmail?: string): Promise<KpiEntry[]> {
  try {
    const filter = ownerEmail
      ? { property: "Owner", email: { equals: ownerEmail } }
      : undefined

    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_KPI_DB_ID!,
      ...(filter ? { filter } : {}),
    })

    return response.results.map((page: any) => ({
      id: page.id,
      kpiName: titleText(prop(page, "KPI Name")) || richText(prop(page, "KPI Name")),
      ownerEmail: emailProp(prop(page, "Owner")),
      ownerName: richText(prop(page, "Owner Name")),
      target: numberProp(prop(page, "Target")),
      actual: numberProp(prop(page, "Actual")),
      unit: richText(prop(page, "Unit")) || selectProp(prop(page, "Unit")),
      month: selectProp(prop(page, "Month")) || richText(prop(page, "Month")),
      status: selectProp(prop(page, "Status")),
    }))
  } catch (error) {
    console.error("[Notion] getKpiEntries error:", error)
    return []
  }
}

// ── getRevenueEntries ────────────────────────────────────────────────
export async function getRevenueEntries(month?: string): Promise<RevenueEntry[]> {
  try {
    const filter = month
      ? { property: "Month", select: { equals: month } }
      : undefined

    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_REVENUE_DB_ID!,
      ...(filter ? { filter } : {}),
    })

    return response.results.map((page: any) => ({
      id: page.id,
      month: selectProp(prop(page, "Month")) || richText(prop(page, "Month")),
      product: richText(prop(page, "Product")) || titleText(prop(page, "Product")),
      amount: numberProp(prop(page, "Amount")),
      currency: selectProp(prop(page, "Currency")) || "THB",
      salesLane: selectProp(prop(page, "Sales Lane")),
      status: selectProp(prop(page, "Status")),
    }))
  } catch (error) {
    console.error("[Notion] getRevenueEntries error:", error)
    return []
  }
}
