/* eslint-disable @typescript-eslint/no-explicit-any */
import { notion, prop, richText, titleText, selectProp } from "./client"

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
