/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useRef, useCallback } from "react"
import type { Customer, ParsedRow, ParsedHotQuotation, ParsedSalesOrder } from "@/types/pipeline"
import { parseHotQuotation, parseSalesOrder } from "@/lib/excel-parser"
import ImportPreviewTable from "./ImportPreviewTable"
import DuplicateWarning from "./DuplicateWarning"
import CustomerAutoCreate from "./CustomerAutoCreate"

interface Props {
  type: "hot-quotation" | "sales-order"
  existingKeys: string[]
  customers: Customer[]
  onClose: () => void
  onSuccess: (result: { created: number; updated: number; skipped: number }) => void
}

type Step = "upload" | "preview" | "importing" | "done"

export default function ExcelImportModal({ type, existingKeys, customers, onClose, onSuccess }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [duplicates, setDuplicates] = useState<string[]>([])
  const [dupAction, setDupAction] = useState<"skip" | "overwrite">("skip")
  const [newCompanies, setNewCompanies] = useState<string[]>([])
  const [autoCreate, setAutoCreate] = useState(true)

  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ created: number; updated: number; skipped: number } | null>(null)
  const [parseError, setParseError] = useState("")
  const customerNames = new Set(customers.map((c) => c.companyName))

  const handleFile = useCallback(async (f: File) => {
    setFile(f)
    setParseError("")
    try {
      const buf = await f.arrayBuffer()
      const parsed = type === "hot-quotation" ? parseHotQuotation(buf) : parseSalesOrder(buf)
      setRows(parsed.all)
      const dups: string[] = []
      for (const r of parsed.valid) {
        const d = r.data as any
        const key = type === "hot-quotation"
          ? (d as ParsedHotQuotation).quotationNo + "|" + (d as ParsedHotQuotation).product
          : (d as ParsedSalesOrder).orderNo
        if (existingKeys.includes(key)) dups.push(key)
      }
      setDuplicates(dups)
      const companies = new Set(parsed.all.map((r) => (r.data as any).companyName).filter(Boolean))
      setNewCompanies([...companies].filter((c) => !customerNames.has(c)))
      setStep("preview")
    } catch (e) {
      setParseError("ไม่สามารถอ่านไฟล์ได้: " + String(e))
    }
  }, [type, existingKeys, customerNames])
  async function handleImport() {
    setStep("importing")
    setProgress(10)
    const validRows = rows.filter((r) => r.errors.length === 0)
    try {
      setProgress(40)
      const res = await fetch("/api/internal/pipeline/" + type, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: validRows.map((r) => r.data),
          importBatch: file?.name ?? "import",
          skipDuplicates: dupAction === "skip",
        }),
      })
      setProgress(90)
      if (!res.ok) throw new Error((await res.json()).error)
      const data = await res.json()
      setProgress(100)
      const r = { created: data.created ?? 0, updated: data.updated ?? 0, skipped: data.skipped ?? 0 }
      setResult(r)
      setStep("done")
      onSuccess(r)
    } catch (e) {
      setParseError(String(e))
      setStep("preview")
    }
  }

  const validCount = rows.filter((r) => r.errors.length === 0).length
  const invalidCount = rows.filter((r) => r.errors.length > 0).length
  const warnCount = rows.filter((r) => r.errors.length === 0 && r.warnings.length > 0).length
  const title = type === "hot-quotation" ? "Import Hot Quotation" : "Import Sales Order"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-lg">{title}</h2>
            <button onClick={onClose} className="text-white/50 hover:text-white text-xl leading-none">&times;</button>
          </div>
          {parseError && <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">{parseError}</p>}

          {step === "upload" && (
            <div className="border-2 border-dashed border-white/20 rounded-xl p-10 text-center cursor-pointer hover:border-accent-cyan/40 transition-all"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}>
              <div className="text-4xl mb-3">\uD83D\uDCCA</div>
              <div className="text-white font-medium">\u0e25\u0e32\u0e01\u0e44\u0e1f\u0e25\u0e4c\u0e21\u0e32\u0e27\u0e32\u0e07 \u0e2b\u0e23\u0e37\u0e2d\u0e04\u0e25\u0e34\u0e01\u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e40\u0e25\u0e37\u0e2d\u0e01</div>
              <div className="text-white/40 text-sm mt-1">.xlsx \u0e2b\u0e23\u0e37\u0e2d .xls</div>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-400">\u2713 {validCount} \u0e41\u0e16\u0e27\u0e16\u0e39\u0e01\u0e15\u0e49\u0e2d\u0e07</span>
                {warnCount > 0 && <span className="text-yellow-400">\u26a0\ufe0f {warnCount} \u0e41\u0e16\u0e27\u0e21\u0e35\u0e04\u0e33\u0e40\u0e15\u0e37\u0e2d\u0e19</span>}
                {invalidCount > 0 && <span className="text-red-400">\u2717 {invalidCount} \u0e41\u0e16\u0e27\u0e21\u0e35\u0e02\u0e49\u0e2d\u0e1c\u0e34\u0e14\u0e1e\u0e25\u0e32\u0e14</span>}
              </div>
              <ImportPreviewTable rows={rows} type={type} />
              {duplicates.length > 0 && <DuplicateWarning duplicates={duplicates} action={dupAction} onAction={setDupAction} />}
              {newCompanies.length > 0 && <CustomerAutoCreate newCompanies={newCompanies} autoCreate={autoCreate} onToggle={setAutoCreate} />}
              <div className="bg-white/5 rounded-lg p-3 text-sm text-white/60">
                \u0e08\u0e30 Import {validCount} \u0e23\u0e32\u0e22\u0e01\u0e32\u0e23
                {dupAction === "skip" && duplicates.length > 0 ? " (\u0e02\u0e49\u0e32\u0e21 " + duplicates.length + " \u0e0b\u0e49\u0e33)" : ""}
                {newCompanies.length > 0 && autoCreate ? " \u0e2a\u0e23\u0e49\u0e32\u0e07\u0e25\u0e39\u0e01\u0e04\u0e49\u0e32\u0e43\u0e2b\u0e21\u0e48 " + newCompanies.length + " \u0e23\u0e32\u0e22" : ""}
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setStep("upload"); setRows([]) }} className="flex-1 glass-ghost py-2 text-sm rounded-lg">\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e44\u0e1f\u0e25\u0e4c\u0e43\u0e2b\u0e21\u0e48</button>
                <button onClick={handleImport} disabled={validCount === 0}
                  className="flex-1 glass-btn py-2 text-sm rounded-lg disabled:opacity-50">
                  \u0e22\u0e37\u0e19\u0e22\u0e31\u0e19 Import ({validCount} \u0e23\u0e32\u0e22\u0e01\u0e32\u0e23)
                </button>
              </div>
            </div>
          )}

          {step === "importing" && (
            <div className="py-8 space-y-4">
              <div className="text-center text-white">\u0e01\u0e33\u0e25\u0e31\u0e07 Import...</div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div className="h-3 rounded-full bg-gradient-to-r from-green-500 to-cyan-400 transition-all duration-500"
                  style={{ width: progress + "%" }} />
              </div>
            </div>
          )}

          {step === "done" && result && (
            <div className="py-8 text-center space-y-4">
              <div className="text-5xl">\u2705</div>
              <div className="text-white font-semibold text-lg">Import \u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08</div>
              <div className="text-white/60 text-sm space-y-1">
                <div>\u0e2a\u0e23\u0e49\u0e32\u0e07\u0e43\u0e2b\u0e21\u0e48: {result.created} \u0e23\u0e32\u0e22\u0e01\u0e32\u0e23</div>
                {result.updated > 0 && <div>\u0e2d\u0e31\u0e1b\u0e40\u0e14\u0e15: {result.updated} \u0e23\u0e32\u0e22\u0e01\u0e32\u0e23</div>}
                {result.skipped > 0 && <div>\u0e02\u0e49\u0e32\u0e21: {result.skipped} \u0e23\u0e32\u0e22\u0e01\u0e32\u0e23</div>}
              </div>
              <button onClick={onClose} className="glass-btn px-6 py-2 text-sm rounded-lg">\u0e1b\u0e34\u0e14</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}