export interface UserProfile {
  displayName: string
  email: string
  team: "BU Head" | "Acquisition" | "Retention" | "Innovation"
  functionalRole: string
  appRole: "admin" | "bu_member" | "internal_viewer"
  buMembership: "Contech BU" | "Builk Internal"
  salesLane: "Biz" | "Corp" | "Both" | "N/A"
  active: boolean
}

export interface PricingPackage {
  id: string
  name: string
  description: string
  priceTHB: number
  features: string[]
  category: string
}

export interface KpiEntry {
  id: string
  kpiName: string
  ownerEmail: string
  ownerName: string
  target: number
  actual: number
  unit: string
  month: string
  status: string
}

export interface RevenueEntry {
  id: string
  month: string
  product: string
  amount: number
  currency: string
  salesLane: string
  status: string
}

// ── NextAuth v5 type augmentation ──────────────────────────────────
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      profile: UserProfile
    } & DefaultSession["user"]
  }
}

// JWT augmentation via @auth/core (re-exported by next-auth/jwt)
declare module "@auth/core/jwt" {
  interface JWT {
    userProfile?: UserProfile
  }
}
