interface Props {
  newCompanies: string[]
  autoCreate: boolean
  onToggle: (v: boolean) => void
}

export default function CustomerAutoCreate({ newCompanies, autoCreate, onToggle }: Props) {
  if (newCompanies.length === 0) return null
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-blue-400 text-sm">🏢</span>
        <span className="text-blue-400 text-sm font-medium">พบลูกค้าใหม่ {newCompanies.length} ราย</span>
      </div>
      <div className="max-h-28 overflow-y-auto space-y-1">
        {newCompanies.map((c, i) => (
          <div key={i} className="text-xs text-white/70 px-3 py-1 bg-blue-400/5 rounded">{c}</div>
        ))}
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={autoCreate}
          onChange={(e) => onToggle(e.target.checked)}
          className="accent-cyan-400 w-4 h-4"
        />
        <span className="text-white/70 text-sm">สร้าง Customer Master ให้อัตโนมัติ</span>
      </label>
    </div>
  )
}
