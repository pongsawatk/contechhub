import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function richText(p: any): string {
  return p?.rich_text?.map((t: any) => t.plain_text).join('') ?? ''
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function titleText(p: any): string {
  return p?.title?.map((t: any) => t.plain_text).join('') ?? ''
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const page = (await notion.pages.retrieve({ page_id: id })) as any
  const props = page.properties

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
