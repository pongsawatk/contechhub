export interface AccountableProfile {
  pageId: string
  displayName: string
  fullName: string
  email: string
  functionalRole: string
  team: string
  avatarUrl: string | null
  initials: string
}

export interface KpiRecord {
  id: string
  kpiName: string
  team: "BU (Jor)" | "Acquisition" | "Retention" | "Innovation"
  kpiType: string
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
  accountablePageId: string | null
  accountable: AccountableProfile | null
}

export type KpiEntry = KpiRecord
