/* eslint-disable @typescript-eslint/no-explicit-any */
import type { KpiRecord, KpiEntry } from "@/types/kpi"
import {
  notion,
  prop,
  propAny,
  richText,
  titleText,
  selectProp,
  nullableNumberProp,
  dateProp,
  queryAllDataSourcePages,
} from "./client"
import { getUserProfileByPageId } from "./users"

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
    unit: selectProp(prop(page, "Unit")) || richText(prop(page, "Unit")),
    measurementMethod: selectProp(prop(page, "Measurement Method")) || richText(prop(page, "Measurement Method")),
    actualIsPercent: prop(page, "Actual Is Percent")?.checkbox ?? false,
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
