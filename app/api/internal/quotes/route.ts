import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import type { CalculatorInput, PriceBreakdown } from '@/types/calculator'

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: { input: CalculatorInput; breakdown: PriceBreakdown } =
    await req.json()

  const notion = new Client({
    auth: process.env.NOTION_TOKEN,
    notionVersion: '2026-03-11',
  })

  // Build Quote Name
  const productList = body.input.selections
    .map((s) => s.product)
    .join(' + ')
  const quoteName = `${body.input.customerName} — ${productList}`

  const page = await notion.pages.create({
    parent: { database_id: process.env.NOTION_QUOTES_DB_ID! },
    properties: {
      'Quote Name': {
        title: [{ text: { content: quoteName } }],
      },
      'Customer Name': {
        rich_text: [{ text: { content: body.input.customerName } }],
      },
      'Lane': {
        select: { name: body.input.lane },
      },
      'Input Mode': {
        select: { name: 'Form' },
      },
      'Products Selected': {
        multi_select: body.input.selections.map((s) => ({ name: s.product })),
      },
      'Base Price (THB)': {
        number: body.breakdown.subtotal,
      },
      'Add-on Price (THB)': {
        number: 0,
      },
      'Discount (THB)': {
        number: body.breakdown.discountAmount,
      },
      'Final Price (THB)': {
        number: body.breakdown.total,
      },
      'Discount Reason': {
        rich_text: [{ text: { content: body.input.discountReason || '' } }],
      },
      'Approval Required': {
        checkbox: body.breakdown.approvalRequired,
      },
      'Status': {
        select: { name: 'Draft' },
      },
      'Quote Summary (JSON)': {
        rich_text: [
          {
            text: {
              content: JSON.stringify(body.breakdown.lineItems).substring(
                0,
                2000
              ),
            },
          },
        ],
      },
      'Notes': {
        rich_text: [
          {
            text: {
              content: body.input.twoYearPrepaid
                ? 'Kickstarter 2-year prepaid'
                : '',
            },
          },
        ],
      },
    },
  })

  return NextResponse.json({ quoteId: page.id, quoteName })
}
