import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

type TextItem = {
  plain_text: string
}

type QuoteProperty = {
  rich_text?: TextItem[]
  title?: TextItem[]
  select?: { name?: string | null } | null
  number?: number | null
  checkbox?: boolean | null
}

type QuoteProperties = Record<string, QuoteProperty>

function richText(p?: QuoteProperty): string {
  return p?.rich_text?.map((t) => t.plain_text).join('') ?? ''
}

function titleText(p?: QuoteProperty): string {
  return p?.title?.map((t) => t.plain_text).join('') ?? ''
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const notion = new Client({
    auth: process.env.NOTION_TOKEN,
    notionVersion: '2026-03-11',
  })

  const page = await notion.pages.retrieve({ page_id: id })
  const props = 'properties' in page ? (page.properties as QuoteProperties) : null

  if (!props) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  }

  return NextResponse.json({
    quoteName: titleText(props['Quote Name']),
    customerName: richText(props['Customer Name']),
    lane: props['Lane']?.select?.name ?? 'Biz',
    status: props['Status']?.select?.name ?? 'Draft',
    finalPrice: props['Final Price (THB)']?.number ?? 0,
    summaryJson: richText(props['Quote Summary (JSON)']),
    approvalRequired: props['Approval Required']?.checkbox ?? false,
  })
}
