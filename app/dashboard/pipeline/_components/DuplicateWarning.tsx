interface Props {
  duplicates: string[]
  perRowAction: Record<string, "skip" | "overwrite">
  onRowAction: (key: string, action: "skip" | "overwrite") => void
}

export default function DuplicateWarning({ duplicates, perRowAction, onRowAction }: Props) {
  if (duplicates.length === 0) return null

  function applyAll(action: "skip" | "overwrite") {
    duplicates.forEach((d) => onRowAction(d, action))
  }

  const allSkip = duplicates.every((d) => perRowAction[d] === "skip")
  const allOverwrite = duplicates.every((d) => perRowAction[d] === "overwrite")

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-sm">⚠️</span>
          <span className="text-yellow-400 text-sm font-medium">พบรายการซ้ำ {duplicates.length} รายการ</span>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => applyAll("skip")}
            className={"px-3 py-1 rounded border transition-all " +
              (allSkip ? "border-accent-cyan text-accent-cyan bg-accent-cyan/10" : "border-white/20 text-white/50 hover:border-white/40")}
          >
            Skip ทั้งหมด
          </button>
          <button
            onClick={() => applyAll("overwrite")}
            className={"px-3 py-1 rounded border transition-all " +
              (allOverwrite ? "border-yellow-400 text-yellow-400 bg-yellow-400/10" : "border-white/20 text-white/50 hover:border-white/40")}
          >
            Overwrite ทั้งหมด
          </button>
        </div>
      </div>
      <div className="max-h-40 overflow-y-auto space-y-1">
        {duplicates.map((d) => {
          const rowAction = perRowAction[d] ?? "skip"
          return (
            <div key={d} className="flex items-center justify-between px-3 py-1.5 bg-yellow-400/5 rounded text-xs">
              <span className="text-white/60 truncate flex-1 mr-2">{d}</span>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => onRowAction(d, "skip")}
                  className={"px-2 py-0.5 rounded border text-xs transition-all " +
                    (rowAction === "skip" ? "border-accent-cyan text-accent-cyan bg-accent-cyan/10" : "border-white/20 text-white/40")}
                >
                  Skip
                </button>
                <button
                  onClick={() => onRowAction(d, "overwrite")}
                  className={"px-2 py-0.5 rounded border text-xs transition-all " +
                    (rowAction === "overwrite" ? "border-yellow-400 text-yellow-400 bg-yellow-400/10" : "border-white/20 text-white/40")}
                >
                  Overwrite
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
