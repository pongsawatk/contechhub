/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CalculatorInput, PriceBreakdown } from "@/types/calculator"
import type { QuoteSessionRecord, StoredQuoteState } from "@/types/quote"
import {
  notion,
  prop,
  richText,
  titleText,
  selectProp,
  checkboxProp,
  numberProp,
  splitRichText,
  getBlockPlainText,
} from "./client"

const QUOTE_STATE_MARKER = "CONTECH_QUOTE_STATE_V1:"

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

export async function createQuoteSession(data: {
  input: CalculatorInput
  breakdown: PriceBreakdown
}): Promise<{ quoteId: string; quoteName: string }> {
  const products = buildQuoteProducts(data.input)
  const productList = products.join(" + ") || "Transformation Service"
  const quoteName = `${data.input.customerName} - ${productList}`

  // G-02: แยก recurring เป็น package vs add-on/top-up สำหรับ reporting
  const addonTotal = data.input.selections.reduce(
    (sum, selection) =>
      sum +
      selection.addons.reduce((addonSum, addon) => addonSum + addon.price, 0) +
      (selection.topups ?? []).reduce(
        (topupSum, topup) => topupSum + topup.unitPrice * topup.quantity,
        0
      ),
    0
  )
  const packageSubtotal = data.breakdown.subtotal - addonTotal

  const summaryJson = JSON.stringify({
    version: 2,
    lane: data.input.lane,
    products,
    packageSubtotal,
    addonTotal,
    discountAmount: data.breakdown.discountAmount,
    annualTotal: data.breakdown.annualTotal,
    oneTimeTotal: data.breakdown.oneTimeTotal,
    firstYearTotal: data.breakdown.firstYearTotal,
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
    parent: { data_source_id: process.env.NOTION_QUOTES_DB_ID! },
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
        number: packageSubtotal,
      },
      "Add-on Price (THB)": {
        number: addonTotal,
      },
      "Discount (THB)": {
        number: data.breakdown.discountAmount,
      },
      "Final Price (THB)": {
        number: data.breakdown.total,
      },
      "One-time Total (THB)": {
        number: data.breakdown.oneTimeTotal,
      },
      "First Year Total (THB)": {
        number: data.breakdown.firstYearTotal,
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
