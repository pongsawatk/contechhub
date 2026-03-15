/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from "@notionhq/client"
import type { UserProfile, PricingPackage, KpiEntry, RevenueEntry } from "@/types/user"

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

function multiSelectProp(p: any): string[] {
  return p?.multi_select?.map((s: any) => s.name) ?? []
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
export async function getPricingPackages(): Promise<PricingPackage[]> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: process.env.NOTION_PRICING_DB_ID!,
      sorts: [{ property: "Price (THB)", direction: "ascending" }],
    })

    return response.results.map((page: any) => ({
      id: page.id,
      name: titleText(prop(page, "Name")) || richText(prop(page, "Name")),
      description: richText(prop(page, "Description")),
      priceTHB: numberProp(prop(page, "Price (THB)")),
      features: multiSelectProp(prop(page, "Features")),
      category: selectProp(prop(page, "Category")),
    }))
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
