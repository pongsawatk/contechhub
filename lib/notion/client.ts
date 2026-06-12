/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from "@notionhq/client"

export const notion = new Client({ auth: process.env.NOTION_TOKEN, notionVersion: "2026-03-11" })

// ── Property readers ──────────────────────────────────────────────────
export function prop(page: any, name: string): any { return page.properties?.[name] }
export function propAny(page: any, names: string[]): any {
  for (const name of names) {
    if (page.properties?.[name] !== undefined) {
      return page.properties[name]
    }
  }
  return undefined
}
export function richText(p: any): string { return p?.rich_text?.map((t: any) => t.plain_text).join("") ?? "" }
export function titleText(p: any): string { return p?.title?.map((t: any) => t.plain_text).join("") ?? "" }
export function emailProp(p: any): string { return p?.email ?? "" }
export function selectProp(p: any): string { return p?.select?.name ?? "" }
export function checkboxProp(p: any): boolean { return p?.checkbox ?? false }
export function numberProp(p: any): number { return p?.number ?? 0 }
export function nullableNumberProp(p: any): number | null {
  return typeof p?.number === "number" ? p.number : null
}
export function peopleName(p: any): string { return p?.people?.[0]?.name ?? "" }
export function peopleEmail(p: any): string { return p?.people?.[0]?.person?.email ?? "" }
export function dateProp(p: any): string | null { return p?.date?.start ?? null }

// ── Property writers / misc ───────────────────────────────────────────
export function richTextProperty(content: string): { rich_text: Array<{ text: { content: string } }> } | { rich_text: [] } {
  return content ? { rich_text: [{ text: { content } }] } : { rich_text: [] }
}
export function normalizeLookupValue(value: string): string { return value.trim().toLowerCase().replace(/\s+/g, " ") }
export function buildInitials(displayName: string, fullName: string): string {
  const source = displayName || fullName
  return source.slice(0, 2).toUpperCase() || "??"
}
export function splitRichText(content: string, chunkSize = 1800): Array<{ type: "text"; text: { content: string } }> {
  if (!content) return [{ type: "text", text: { content: "" } }]
  const chunks = content.match(new RegExp(`[\\s\\S]{1,${chunkSize}}`, "g")) ?? [content]
  return chunks.map((chunk) => ({ type: "text", text: { content: chunk } }))
}
export function getBlockPlainText(block: any): string {
  const blockData = block?.[block?.type]
  const richTextItems = Array.isArray(blockData?.rich_text) ? blockData.rich_text : []
  return richTextItems.map((item: any) => item.plain_text ?? item.text?.content ?? "").join("")
}

export async function queryAllDataSourcePages(dataSourceId: string, filter?: any, sorts?: any[]): Promise<any[]> {
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
