export interface RevenueEntry {
  id: string
  entryName: string
  month: string
  revenueType: string
  lane: 'Biz' | 'Corp' | ''
  bookingAmount: number
  recognizedAmount: number
  recognitionStatus: string
  ownerName: string
  ownerEmail: string
  customerName: string
  goLiveDate: string | null
  contractStart: string | null
  contractEnd: string | null
  monthLocked: boolean
  note: string
}
