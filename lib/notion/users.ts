/* eslint-disable @typescript-eslint/no-explicit-any */
import { unstable_cache } from "next/cache"
import type { UserProfile } from "@/types/user"
import type { AccountableProfile } from "@/types/kpi"
import {
  notion,
  prop,
  richText,
  titleText,
  emailProp,
  selectProp,
  checkboxProp,
  normalizeLookupValue,
  buildInitials,
} from "./client"

// cache รายชื่อ user มี TTL — เพิ่ม/แก้ user ใน Notion แล้วเห็นผลภายใน 5 นาที
const USER_CACHE_TTL_MS = 5 * 60 * 1000

interface TimedCache<T> {
  fetchedAt: number
  data: T
}

let notionUsersCache: TimedCache<{ id: string; name: string; email: string }[]> | null = null
let accessUsersCache: TimedCache<{ fullName: string; displayName: string; email: string }[]> | null = null

function isFresh<T>(cache: TimedCache<T> | null): cache is TimedCache<T> {
  return cache !== null && Date.now() - cache.fetchedAt < USER_CACHE_TTL_MS
}

async function findAccessUserEmailByName(name: string): Promise<string | null> {
  if (!name || !process.env.NOTION_USERS_DB_ID) return null
  try {
    if (!isFresh(accessUsersCache)) {
      const response = await notion.dataSources.query({
        data_source_id: process.env.NOTION_USERS_DB_ID,
        page_size: 100,
      })

      accessUsersCache = {
        fetchedAt: Date.now(),
        data: response.results.map((page: any) => ({
          fullName: titleText(prop(page, "Full Name")),
          displayName: richText(prop(page, "Display Name")),
          email: emailProp(prop(page, "Email")),
        })),
      }
    }

    const lookup = normalizeLookupValue(name)
    const match = accessUsersCache.data.find((user) =>
      normalizeLookupValue(user.fullName) === lookup ||
      normalizeLookupValue(user.displayName) === lookup ||
      normalizeLookupValue(user.email) === lookup
    )

    return match?.email ?? null
  } catch {
    return null
  }
}

export async function findNotionUserByName(name: string): Promise<string | null> {
  if (!name) return null
  try {
    if (!isFresh(notionUsersCache)) {
      const r = await notion.users.list({})
      notionUsersCache = {
        fetchedAt: Date.now(),
        data: r.results.map((u: any) => ({
          id: u.id,
          name: (u.name ?? "") as string,
          email: (u.person?.email ?? "") as string,
        })),
      }
    }

    const users = notionUsersCache.data
    const lookup = normalizeLookupValue(name)
    const directMatch =
      users.find((user) => normalizeLookupValue(user.name) === lookup)?.id ??
      users.find((user) => normalizeLookupValue(user.email) === lookup)?.id

    if (directMatch) return directMatch

    const mappedEmail = await findAccessUserEmailByName(name)
    if (!mappedEmail) return null

    return users.find((user) => normalizeLookupValue(user.email) === normalizeLookupValue(mappedEmail))?.id ?? null
  } catch {
    return null
  }
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

      const avatarUrl =
        props["Avatar"]?.files?.[0]?.file?.url ||
        props["Avatar"]?.files?.[0]?.external?.url ||
        props["Profile Picture"]?.files?.[0]?.file?.url ||
        props["Profile Picture"]?.files?.[0]?.external?.url ||
        null;

      return {
        pageId,
        displayName: displayName || fullName,
        fullName,
        email,
        functionalRole,
        team,
        avatarUrl,
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
