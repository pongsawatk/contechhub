/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from "@notionhq/client"
import { unstable_cache } from "next/cache"
import type { CalculatorInput, PriceBreakdown } from "@/types/calculator"
import type { UserProfile } from "@/types/user"
import type { PricingItem } from "@/types/pricing"
import type { AccountableProfile, KpiRecord, KpiEntry } from "@/types/kpi"
import type { RevenueEntry } from "@/types/revenue"
import type { Customer, HotQuotation, SalesOrder } from "@/types/pipeline"
import type { QuoteSessionRecord, StoredQuoteState } from "@/types/quote"

const notion = new Client({ auth: process.env.NOTION_TOKEN, notionVersion: "2026-03-11" })
const QUOTE_STATE_MARKER = "CONTECH_QUOTE_STATE_V1:"

function prop(page: any, name: string): any { return page.properties?.[name] }
function propAny(page: any, names: string[]): any {
  for (const name of names) {
    if (page.properties?.[name] !== undefined) {
      return page.properties[name]
    }
  }
  return undefined
}
function richText(p: any): string { return p?.rich_text?.map((t: any) => t.plain_text).join("") ?? "" }
function titleText(p: any): string { return p?.title?.map((t: any) => t.plain_text).join("") ?? "" }
function emailProp(p: any): string { return p?.email ?? "" }
function selectProp(p: any): string { return p?.select?.name ?? "" }
function checkboxProp(p: any): boolean { return p?.checkbox ?? false }
function numberProp(p: any): number { return p?.number ?? 0 }
function nullableNumberProp(p: any): number | null {
  return typeof p?.number === "number" ? p.number : null
}
function peopleName(p: any): string { return p?.people?.[0]?.name ?? "" }
function peopleEmail(p: any): string { return p?.people?.[0]?.person?.email ?? "" }

let _notionUsersCache: { id: string; name: string; email: string }[] | null = null
async function findNotionUserByName(name: string): Promise<string | null> {
  if (!name) return null
  try {
    if (!_notionUsersCache) {
      const r = await notion.users.list({})
      _notionUsersCache = r.results.map((u: any) => ({
        id: u.id,
        name: (u.name ?? "") as string,
        email: (u.person?.email ?? "") as string,
      }))
    }
    const lower = name.toLowerCase()
    // Match by display name first, then email as fallback (backward compat)
    return (
      _notionUsersCache.find((u) => u.name.toLowerCase() === lower)?.id ??
      _notionUsersCache.find((u) => u.email.toLowerCase() === lower)?.id ??
      null
    )
  } catch {
    return null
  }
}
function dateProp(p: any): string | null { return p?.date?.start ?? null }

async function queryAllDataSourcePages(dataSourceId: string, filter?: any, sorts?: any[]): Promise<any[]> {
  const results: any[] = []
  let cursor: string | undefined

  do {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      ...(filter ? { filter } : {}),
      ...(sorts ? { sorts } : {}),
      ...(cursor ? { start_cursor: cursor } : {}),
      page_size: 100,
    })

    results.push(...response.results)
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined
  } while (cursor)

  return results
}

function buildInitials(displayName: string, fullName: string): string {
  const source = displayName || fullName
  return source.slice(0, 2).toUpperCase() || "??"
}
function splitRichText(content: string, chunkSize = 1800): Array<{ type: "text"; text: { content: string } }> {
  if (!content) return [{ type: "text", text: { content: "" } }]
  const chunks = content.match(new RegExp(`[\\s\\S]{1,${chunkSize}}`, "g")) ?? [content]
  return chunks.map((chunk) => ({ type: "text", text: { content: chunk } }))
}
function getBlockPlainText(block: any): string {
  const blockData = block?.[block?.type]
  const richTextItems = Array.isArray(blockData?.rich_text) ? blockData.rich_text : []
  return richTextItems.map((item: any) => item.plain_text ?? item.text?.content ?? "").join("")
}
function buildQuoteProducts(input: CalculatorInput): string[] {
  const products = input.selections.map((selection) => selection.product) as string[]
  if (input.transformationQuote) {
    products.push("Transformation Service")
  }
  return Array.from(new Set(products))
}
function isStoredQuoteState(value: unknown): value is StoredQuoteState {
  if (!value || typeof value !== "object") return false
  const input = (value as StoredQuoteState).input
  return Boolean(
    input &&
    typeof input.customerName === "string" &&
    typeof input.lane === "string" &&
    Array.isArray(input.selections)
  )
}
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
        const packageName = titleText(prop(page, "Package Name"))
        if (packageName.startsWith("[DEPRECATED]")) return null
        return {
          id: page.id as string,
          packageName,
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
          applicablePackages: (prop(page, "Applicable Packages")?.multi_select ?? [])
            .map((s: any) => s.name),
          quantityEnabled: prop(page, "Quantity Enabled")?.checkbox ?? false,
          quantityUnit: prop(page, "Quantity Unit")?.rich_text?.[0]?.plain_text ?? '',
          maxQuantity: prop(page, "Max Quantity")?.number ?? 0,
          enterprisePriceMin: prop(page, "Enterprise Price Min")?.number ?? null,
          enterprisePriceMax: prop(page, "Enterprise Price Max")?.number ?? null,
          enterpriseAnchorPrice: prop(page, "Enterprise Anchor Price")?.number ?? null,
          enterpriseBaseNote: prop(page, "Enterprise Base Note")?.rich_text?.[0]?.plain_text ?? '',
          enterprisePremiumNote: prop(page, "Enterprise Premium Note")?.rich_text?.[0]?.plain_text ?? '',
          isInfrastructure: prop(page, "Is Infrastructure")?.checkbox ?? false,
          showEnterpriseMatrix: prop(page, "Show Enterprise Matrix")?.checkbox ?? false,
          serviceCategory: prop(page, "Service Category")?.select?.name ?? null,
          implementationMode: prop(page, "Implementation Mode")?.select?.name ?? null,
          isMandatoryImplementation: prop(page, "Is Mandatory Implementation")?.checkbox ?? false,
        } as PricingItem
      })
      .filter(Boolean) as PricingItem[]
  } catch (error) {
    console.error("[Notion] getPricingPackages error:", error)
    return []
  }
}

export interface KBEntry {
  question: string
  answer: string
  entryType: string | null
  lane: string | null
  category: string | null
  product: string[]
  customerSegment: string[]
  tags: string[]
}

export async function getKBEntries(salesLane?: string): Promise<KBEntry[]> {
  const dbId = process.env.NOTION_KNOWLEDGE_DB_ID!

  const filters: object[] = [
    { property: "Verified", checkbox: { equals: true } },
  ]

  if (salesLane === "Biz") {
    filters.push({
      or: [
        { property: "Lane", select: { equals: "Biz" } },
        { property: "Lane", select: { equals: "Both" } },
        { property: "Lane", select: { is_empty: true } },
      ],
    })
  } else if (salesLane === "Corp") {
    filters.push({
      or: [
        { property: "Lane", select: { equals: "Corp" } },
        { property: "Lane", select: { equals: "Both" } },
        { property: "Lane", select: { is_empty: true } },
      ],
    })
  }

  try {
    const response = await notion.dataSources.query({
      data_source_id: dbId,
      filter: { and: filters } as any,
      sorts: [{ property: "Entry Type", direction: "ascending" }],
      page_size: 40,
    })

    return response.results
      .map((page: any) => ({
        question: titleText(prop(page, "Question")) || richText(prop(page, "Question")),
        answer: richText(prop(page, "Answer")) || titleText(prop(page, "Answer")),
        entryType: selectProp(prop(page, "Entry Type")) || null,
        lane: selectProp(prop(page, "Lane")) || null,
        category: selectProp(prop(page, "Category")) || null,
        product: (prop(page, "Product")?.multi_select ?? []).map((s: any) => s.name),
        customerSegment: (prop(page, "Customer Segment")?.multi_select ?? []).map((s: any) => s.name),
        tags: (prop(page, "Tags")?.multi_select ?? []).map((s: any) => s.name),
      }))
      .filter((entry: KBEntry) => entry.question && entry.answer)
  } catch (error) {
    console.error("[Notion] getKBEntries error:", error)
    return []
  }
}

function mapKpiRecord(page: any): KpiRecord {
  const target = nullableNumberProp(prop(page, "Target"))
  const actual = nullableNumberProp(prop(page, "Actual"))
  const accountableRelations = page.properties["Accountable"]?.relation ?? []
  const accountablePageId = accountableRelations[0]?.id ?? null
  const achievementPercent =
    nullableNumberProp(propAny(page, ["Achievement %", "Achievement Percent"])) ??
    (target && actual !== null ? Math.round((actual / target) * 100) : null)

  return {
    id: page.id as string,
    kpiName: titleText(prop(page, "KPI Name")) || richText(prop(page, "KPI Name")),
    team: selectProp(prop(page, "Team")) as KpiRecord["team"],
    kpiType: (selectProp(prop(page, "KPI Type")) || richText(prop(page, "KPI Type"))) as KpiRecord["kpiType"],
    period: selectProp(prop(page, "Period")) as KpiRecord["period"],
    periodStart: dateProp(prop(page, "Period Start")),
    target,
    actual,
    achievementPercent,
    status: selectProp(prop(page, "Status")) as KpiRecord["status"],
    notes: richText(prop(page, "Notes")),
    unit: page.properties["Unit"]?.rich_text?.[0]?.plain_text ?? "",
    measurementMethod: page.properties["Measurement Method"]?.rich_text?.[0]?.plain_text ?? "",
    actualIsPercent: page.properties["Actual Is Percent"]?.checkbox ?? false,
    accountablePageId,
    accountable: null,
  }
}

export async function getKpiRecords(): Promise<KpiRecord[]> {
  try {
    const pages = await queryAllDataSourcePages(process.env.NOTION_KPI_DB_ID!)
    return pages.map((page: any) => mapKpiRecord(page))
  } catch (error) {
    console.error("[Notion] getKpiRecords error:", error)
    return []
  }
}

export const getUserProfileByPageId = unstable_cache(
  async (pageId: string): Promise<AccountableProfile | null> => {
    try {
      const page = await notion.pages.retrieve({ page_id: pageId })
      if (!("properties" in page)) {
        return null
      }

      const props = (page as any).properties
      const displayName = richText(props["Display Name"])
      const fullName = titleText(props["Full Name"])
      const email = emailProp(props["Email"])
      const functionalRole = selectProp(props["Functional Role"]) || richText(props["Functional Role"])
      const team = selectProp(props["Team"]) || richText(props["Team"])
      const active = checkboxProp(props["Active"])

      if (!active || !email) {
        return null
      }

      return {
        pageId,
        displayName: displayName || fullName,
        fullName,
        email,
        functionalRole,
        team,
        avatarUrl: null,
        initials: buildInitials(displayName, fullName),
      }
    } catch (error) {
      console.error("[Notion] getUserProfileByPageId error:", error)
      return null
    }
  },
  ["users-access-profile-by-page-id"],
  { revalidate: 3600 }
)

export async function getKpiRecordById(id: string): Promise<KpiRecord | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: id })
    if (!("properties" in page)) {
      return null
    }
    return mapKpiRecord(page)
  } catch (error) {
    console.error("[Notion] getKpiRecordById error:", error)
    return null
  }
}

export async function getKpiEntries(ownerEmail?: string): Promise<KpiEntry[]> {
  const entries = await getKpiRecords()
  if (!ownerEmail) {
    return entries
  }

  const normalizedEmail = ownerEmail.toLowerCase()
  const enrichedEntries = await Promise.all(
    entries.map(async (entry) => ({
      ...entry,
      accountable: entry.accountablePageId
        ? await getUserProfileByPageId(entry.accountablePageId)
        : null,
    }))
  )

  return enrichedEntries.filter((entry) => entry.accountable?.email.toLowerCase() === normalizedEmail)
}

export async function updateKpiEntry(
  id: string,
  data: Partial<{
    actual: number | null
    notes: string
    status: KpiRecord["status"]
  }>
): Promise<void> {
  const properties: Record<string, any> = {}

  if (data.actual !== undefined) {
    properties["Actual"] = { number: data.actual }
  }
  if (data.notes !== undefined) {
    properties["Notes"] = data.notes
      ? { rich_text: [{ text: { content: data.notes } }] }
      : { rich_text: [] }
  }
  if (data.status !== undefined) {
    properties["Status"] = { select: { name: data.status } }
  }

  await notion.pages.update({
    page_id: id,
    properties,
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
    parent: { database_id: process.env.NOTION_REVENUE_DB_ID! },
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
// ── Pipeline: Customer Master ─────────────────────────────────────────

export async function createQuoteSession(data: {
  input: CalculatorInput
  breakdown: PriceBreakdown
}): Promise<{ quoteId: string; quoteName: string }> {
  const products = buildQuoteProducts(data.input)
  const productList = products.join(" + ") || "Transformation Service"
  const quoteName = `${data.input.customerName} - ${productList}`
  const summaryJson = JSON.stringify({
    version: 1,
    lane: data.input.lane,
    products,
    annualTotal: data.breakdown.annualTotal,
    oneTimeTotal: data.breakdown.oneTimeTotal,
    finalPrice: data.breakdown.total,
    approvalRequired: data.breakdown.approvalRequired,
    hasTransformation: Boolean(data.input.transformationQuote),
  })
  const storedState: StoredQuoteState = {
    version: 1,
    savedAt: new Date().toISOString(),
    input: data.input,
  }

  const page = await notion.pages.create({
    parent: { database_id: process.env.NOTION_QUOTES_DB_ID! },
    properties: {
      "Quote Name": {
        title: [{ text: { content: quoteName } }],
      },
      "Customer Name": {
        rich_text: [{ text: { content: data.input.customerName } }],
      },
      "Lane": {
        select: { name: data.input.lane },
      },
      "Input Mode": {
        select: { name: "Form" },
      },
      "Products Selected": {
        multi_select: products.map((product) => ({ name: product })),
      },
      "Base Price (THB)": {
        number: data.breakdown.subtotal,
      },
      "Add-on Price (THB)": {
        number: 0,
      },
      "Discount (THB)": {
        number: data.breakdown.discountAmount,
      },
      "Final Price (THB)": {
        number: data.breakdown.total,
      },
      "Discount Reason": {
        rich_text: [{ text: { content: data.input.discountReason || "" } }],
      },
      "Approval Required": {
        checkbox: data.breakdown.approvalRequired,
      },
      "Status": {
        select: { name: "Draft" },
      },
      "Quote Summary (JSON)": {
        rich_text: splitRichText(summaryJson),
      },
      "Notes": {
        rich_text: [
          {
            text: {
              content: data.input.twoYearPrepaid ? "Kickstarter 2-year prepaid" : "",
            },
          },
        ],
      },
    } as any,
  })

  await notion.blocks.children.append({
    block_id: page.id,
    children: [
      {
        object: "block",
        type: "code",
        code: {
          language: "json",
          rich_text: splitRichText(`${QUOTE_STATE_MARKER}${JSON.stringify(storedState)}`),
        },
      },
    ] as any,
  })

  return { quoteId: page.id, quoteName }
}

export async function getQuoteSession(id: string): Promise<QuoteSessionRecord | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: id })
    if (!("properties" in page)) {
      return null
    }

    const parentId = (page as any)?.parent?.data_source_id ?? (page as any)?.parent?.database_id
    if (parentId !== process.env.NOTION_QUOTES_DB_ID) {
      return null
    }

    const blocks = await notion.blocks.children.list({ block_id: id, page_size: 100 })
    let calculatorInput: CalculatorInput | null = null

    for (const block of blocks.results as any[]) {
      const plainText = getBlockPlainText(block)
      if (!plainText.startsWith(QUOTE_STATE_MARKER)) {
        continue
      }
      const parsed = JSON.parse(plainText.slice(QUOTE_STATE_MARKER.length))
      if (isStoredQuoteState(parsed)) {
        calculatorInput = parsed.input
      }
      break
    }

    if (!calculatorInput) {
      const fallbackSummary = richText(prop(page, "Quote Summary (JSON)"))
      if (fallbackSummary) {
        try {
          const parsed = JSON.parse(fallbackSummary)
          if (isStoredQuoteState(parsed)) {
            calculatorInput = parsed.input
          }
        } catch {
          // Older records stored summary only, so client hydration remains unavailable for them.
        }
      }
    }

    return {
      id: page.id,
      quoteName: titleText(prop(page, "Quote Name")),
      customerName: richText(prop(page, "Customer Name")),
      lane: selectProp(prop(page, "Lane")) || "Biz",
      status: selectProp(prop(page, "Status")) || "Draft",
      finalPrice: numberProp(prop(page, "Final Price (THB)")),
      summaryJson: richText(prop(page, "Quote Summary (JSON)")),
      approvalRequired: checkboxProp(prop(page, "Approval Required")),
      calculatorInput,
    }
  } catch (error) {
    console.error("[Notion] getQuoteSession error:", error)
    return null
  }
}

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
  const ownerId = await findNotionUserByName(data.salesOwner)
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
      "Sales Owner": ownerId ? { people: [{ id: ownerId }] } : {},
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
  const ownerId = await findNotionUserByName(data.salesOwner)
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
      "Sales Owner": ownerId ? { people: [{ id: ownerId }] } : {},
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
  const entryName = data.orderNo + " \u2014 " + data.product
  const ownerId = await findNotionUserByName(data.salesOwner)
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
      "Sales Owner": ownerId ? { people: [{ id: ownerId }] } : {},
      "Payment Terms": data.paymentTerms ? { select: { name: data.paymentTerms } } : {},
      "Recognition Status": { select: { name: "Pending" } },
      "Import Batch": { rich_text: [{ text: { content: data.importBatch } }] },
      "Notes": { rich_text: [{ text: { content: data.notes } }] },
    } as any,
  })
  return page.id
}

export async function updateSalesOrder(id: string, data: Parameters<typeof createSalesOrder>[0]): Promise<void> {
  const ownerId = await findNotionUserByName(data.salesOwner)
  await notion.pages.update({
    page_id: id,
    properties: {
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
      "Sales Owner": ownerId ? { people: [{ id: ownerId }] } : {},
      "Payment Terms": data.paymentTerms ? { select: { name: data.paymentTerms } } : {},
      "Import Batch": { rich_text: [{ text: { content: data.importBatch } }] },
      "Notes": { rich_text: [{ text: { content: data.notes } }] },
    } as any,
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
