interface Props {
  duplicates: string[]
  action: "skip" | "overwrite"
  onAction: (a: "skip" | "overwrite") => void
}

export default function DuplicateWarning({ duplicates, action, onAction }: Props) {
  if (duplicates.length === 0) return null
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-yellow-400 text-sm">\u26a0\ufe0f</span>
        <span className="text-yellow-400 text-sm font-medium">พบรายการซ้ำ {duplicates.length} รายการ</span>
      </div>
      <div className="max-h-32 overflow-y-auto space-y-1">
        {duplicates.map((d, i) => (
          <div key={i} className="text-xs text-white/60 px-3 py-1 bg-yellow-400/5 rounded">{d}</div>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onAction("skip")}
          className={("flex-1 py-2 text-sm rounded-lg border transition-all " +
            (action === "skip"
              ? "border-accent-cyan text-accent-cyan bg-accent-cyan/10"
              : "border-white/20 text-white/60 hover:border-white/40"))}
        >
          ข้ามรายการซ้ำ (Skip)
        </button>
        <button
          onClick={() => onAction("overwrite")}
          className={("flex-1 py-2 text-sm rounded-lg border transition-all " +
            (action === "overwrite"
              ? "border-yellow-400 text-yellow-400 bg-yellow-400/10"
              : "border-white/20 text-white/60 hover:border-white/40"))}
        >
          อัปเดตรายการซ้ำ (Overwrite)
        </button>
      </div>
    </div>
  )
}