import { Client } from '@notionhq/client'
import type { CreatePageParameters, UpdatePageParameters } from '@notionhq/client/build/src/api-endpoints'

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  notionVersion: '2026-03-11',
})

const CHAT_SESSIONS_DB = process.env.NOTION_CHAT_SESSIONS_DB_ID!

interface SessionMessage {
  role: string
  content: string
}

interface SessionData {
  sessionName: string
  userEmail: string
  userRole: string
  salesLane: string
  messageCount: number
  conversationLog: SessionMessage[]
  topicsDiscussed: string[]
  calculatorOpened?: boolean
  calculatorPrefillData?: string
  quoteSaved?: boolean
  modelUsed?: string
}

function truncate(value: string, maxLength = 2000): string {
  return value.length > maxLength ? value.slice(0, maxLength) : value
}

function buildConversationText(conversationLog: SessionMessage[]): string {
  return truncate(JSON.stringify(conversationLog))
}

function buildProperties(data: Partial<SessionData>): Record<string, unknown> {
  const properties: Record<string, unknown> = {}

  if (data.sessionName !== undefined) {
    properties['Session Name'] = { title: [{ text: { content: data.sessionName } }] }
  }
  if (data.userEmail !== undefined) {
    properties['User Email'] = { email: data.userEmail }
  }
  if (data.userRole !== undefined) {
    properties['User Role'] = data.userRole ? { select: { name: data.userRole } } : null
  }
  if (data.salesLane !== undefined) {
    properties['Sales Lane'] = data.salesLane ? { select: { name: data.salesLane } } : null
  }
  if (data.messageCount !== undefined) {
    properties['Message Count'] = { number: data.messageCount }
  }
  if (data.conversationLog !== undefined) {
    properties['Conversation Log'] = {
      rich_text: [{ text: { content: buildConversationText(data.conversationLog) } }],
    }
  }
  if (data.topicsDiscussed !== undefined) {
    properties['Topics Discussed'] = {
      multi_select: data.topicsDiscussed
        .filter(Boolean)
        .slice(0, 25)
        .map((topic) => ({ name: topic })),
    }
  }
  if (data.calculatorOpened !== undefined) {
    properties['Calculator Opened'] = { checkbox: data.calculatorOpened }
  }
  if (data.calculatorPrefillData !== undefined) {
    properties['Calculator Prefill Data'] = data.calculatorPrefillData
      ? { rich_text: [{ text: { content: truncate(data.calculatorPrefillData) } }] }
      : { rich_text: [] }
  }
  if (data.quoteSaved !== undefined) {
    properties['Quote Saved'] = { checkbox: data.quoteSaved }
  }
  if (data.modelUsed !== undefined) {
    properties['Model Used'] = data.modelUsed ? { select: { name: data.modelUsed } } : null
  }

  return properties
}

export async function createChatSession(data: SessionData): Promise<string> {
  const page = await notion.pages.create({
    parent: { database_id: CHAT_SESSIONS_DB },
    properties: buildProperties(data) as CreatePageParameters["properties"],
  } as CreatePageParameters)

  return page.id
}

export async function updateChatSession(pageId: string, data: Partial<SessionData>): Promise<void> {
  const properties = buildProperties(data)
  await notion.pages.update({
    page_id: pageId,
    properties: properties as UpdatePageParameters["properties"],
  } as UpdatePageParameters)
}
