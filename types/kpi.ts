export interface OwnerProfile {
  notionUserId: string
  displayName: string
  email: string
  team: string
  functionalRole: string
  avatarUrl: string | null
}

export interface KpiRecord {
  id: string
  kpiName: string
  team: "BU (Jor)" | "Acquisition" | "Retention" | "Innovation"
  kpiType:
    | "Revenue"
    | "New Logo"
    | "Retention / NRR"
    | "Adoption"
    | "Quality"
    | "Efficiency"
    | "Content"
  period: "Weekly" | "Monthly" | "Quarterly"
  periodStart: string | null
  target: number | null
  actual: number | null
  achievementPercent: number | null
  status: "On Track" | "At Risk" | "Off Track" | "Completed"
  notes: string
  unit: string
  measurementMethod: string
  actualIsPercent: boolean
  ownerNotionIds: string[]
  ownerProfiles: OwnerProfile[]
}

export type KpiEntry = KpiRecord
