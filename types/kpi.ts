export interface KpiEntry {
  id: string
  kpiName: string
  ownerName: string
  ownerEmail: string
  team: 'BU' | 'Acquisition' | 'Retention' | 'Innovation' | ''
  kpiType: string
  period: 'Weekly' | 'Monthly' | 'Quarterly' | ''
  periodStart: string | null
  target: number
  actual: number
  status: 'On Track' | 'At Risk' | 'Off Track' | 'Completed' | ''
  notes: string
}
