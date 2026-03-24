/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useRef, useState } from "react"
import type { Customer, ParsedHotQuotation, ParsedRow, ParsedSalesOrder } from "@/types/pipeline"
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
type ImportSummary = { created: number; updated: number; skipped: number; errors: string[] }

export default function ExcelImportModal({ type, existingKeys, customers, onClose, onSuccess }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [duplicates, setDuplicates] = useState<string[]>([])
  const [perRowAction, setPerRowAction] = useState<Record<string, "skip" | "overwrite">>({})
  const [newCompanies, setNewCompanies] = useState<string[]>([])
  const [autoCreate, setAutoCreate] = useState(true)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportSummary | null>(null)
  const [parseError, setParseError] = useState("")
  const customerNames = new Set(customers.map((customer) => customer.companyName))

  async function handleFile(selectedFile: File) {
    setFile(selectedFile)
    setParseError("")
    setResult(null)

    try {
      const buffer = await selectedFile.arrayBuffer()
      const parsed = type === "hot-quotation" ? parseHotQuotation(buffer) : parseSalesOrder(buffer)
      setRows(parsed.all)

      const nextDuplicates: string[] = []
      for (const row of parsed.valid) {
        const data = row.data as any
        const key = type === "hot-quotation"
          ? (data as ParsedHotQuotation).quotationNo + "|" + (data as ParsedHotQuotation).product
          : (data as ParsedSalesOrder).orderNo

        if (existingKeys.includes(key)) nextDuplicates.push(key)
      }

      setDuplicates(nextDuplicates)

      const nextActions: Record<string, "skip" | "overwrite"> = {}
      nextDuplicates.forEach((key) => { nextActions[key] = "skip" })
      setPerRowAction(nextActions)

      const companies = new Set(parsed.all.map((row) => (row.data as any).companyName).filter(Boolean))
      setNewCompanies([...companies].filter((company) => !customerNames.has(company)))
      setStep("preview")
    } catch (error) {
      setParseError("Cannot read Excel file: " + String(error))
    }
  }

  async function handleImport() {
    setStep("importing")
    setProgress(10)
    setParseError("")

    const validRows = rows.filter((row) => row.errors.length === 0)

    try {
      setProgress(40)

      const response = await fetch("/api/internal/pipeline/" + type, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: validRows.map((row) => row.data),
          importBatch: file?.name ?? "import",
          skipKeys: Object.entries(perRowAction)
            .filter(([, action]) => action === "skip")
            .map(([key]) => key),
          autoCreate,
        }),
      })

      setProgress(90)
      const data = await response.json()

      if (!response.ok) {
        const details = Array.isArray(data.errors) ? data.errors.join("\n") : ""
        throw new Error([data.error, details].filter(Boolean).join("\n"))
      }

      const summary: ImportSummary = {
        created: data.created ?? 0,
        updated: data.updated ?? 0,
        skipped: data.skipped ?? 0,
        errors: Array.isArray(data.errors) ? data.errors : [],
      }

      setProgress(100)
      setResult(summary)
      setStep("done")
      onSuccess({ created: summary.created, updated: summary.updated, skipped: summary.skipped })
    } catch (error) {
      setParseError(String(error))
      setStep("preview")
    }
  }

  const validCount = rows.filter((row) => row.errors.length === 0).length
  const invalidCount = rows.filter((row) => row.errors.length > 0).length
  const warnCount = rows.filter((row) => row.errors.length === 0 && row.warnings.length > 0).length
  const title = type === "hot-quotation" ? "Import Hot Quotation" : "Import Sales Order"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="glass-card max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <div className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button onClick={onClose} className="text-xl leading-none text-white/50 hover:text-white">&times;</button>
          </div>

          {parseError && (
            <p className="whitespace-pre-wrap rounded-lg bg-red-400/10 p-3 text-sm text-red-400">
              {parseError}
            </p>
          )}

          {step === "upload" && (
            <div
              className="cursor-pointer rounded-xl border-2 border-dashed border-white/20 p-10 text-center transition-all hover:border-accent-cyan/40"
              onClick={() => fileRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                const droppedFile = event.dataTransfer.files[0]
                if (droppedFile) handleFile(droppedFile)
              }}
            >
              <div className="mb-3 text-4xl">+</div>
              <div className="font-medium text-white">Drop an Excel file here or click to choose one</div>
              <div className="mt-1 text-sm text-white/40">Accepted: .xlsx, .xls</div>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0]
                  if (selectedFile) handleFile(selectedFile)
                }}
              />
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-400">Valid: {validCount}</span>
                {warnCount > 0 && <span className="text-yellow-400">Warnings: {warnCount}</span>}
                {invalidCount > 0 && <span className="text-red-400">Invalid: {invalidCount}</span>}
              </div>

              <ImportPreviewTable rows={rows} type={type} />

              {duplicates.length > 0 && (
                <DuplicateWarning
                  duplicates={duplicates}
                  perRowAction={perRowAction}
                  onRowAction={(key, action) => setPerRowAction((current) => ({ ...current, [key]: action }))}
                />
              )}

              {newCompanies.length > 0 && (
                <CustomerAutoCreate newCompanies={newCompanies} autoCreate={autoCreate} onToggle={setAutoCreate} />
              )}

              <div className="rounded-lg bg-white/5 p-3 text-sm text-white/60">
                {(() => {
                  const skipCount = Object.values(perRowAction).filter((action) => action === "skip").length
                  const overwriteCount = Object.values(perRowAction).filter((action) => action === "overwrite").length

                  return (
                    <>
                      Importing {validCount} valid row(s)
                      {skipCount > 0 && <span className="text-white/40"> | Skip duplicates: {skipCount}</span>}
                      {overwriteCount > 0 && <span className="text-yellow-400/70"> | Overwrite duplicates: {overwriteCount}</span>}
                      {newCompanies.length > 0 && autoCreate && (
                        <span className="text-accent-cyan/70"> | Auto-create customers: {newCompanies.length}</span>
                      )}
                    </>
                  )
                })()}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep("upload")
                    setRows([])
                    setDuplicates([])
                    setPerRowAction({})
                    setNewCompanies([])
                    setParseError("")
                    setResult(null)
                  }}
                  className="glass-ghost flex-1 rounded-lg py-2 text-sm"
                >
                  Choose another file
                </button>

                <button
                  onClick={handleImport}
                  disabled={validCount === 0}
                  className="glass-btn flex-1 rounded-lg py-2 text-sm disabled:opacity-50"
                >
                  Confirm Import ({validCount})
                </button>
              </div>
            </div>
          )}

          {step === "importing" && (
            <div className="space-y-4 py-8">
              <div className="text-center text-white">Importing...</div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-green-500 to-cyan-400 transition-all duration-500"
                  style={{ width: progress + "%" }}
                />
              </div>
            </div>
          )}

          {step === "done" && result && (
            <div className="space-y-4 py-8 text-center">
              <div className="text-5xl">OK</div>
              <div className="text-lg font-semibold text-white">Import finished</div>
              <div className="space-y-1 text-sm text-white/60">
                <div>Created: {result.created}</div>
                {result.updated > 0 && <div>Updated: {result.updated}</div>}
                {result.skipped > 0 && <div>Skipped: {result.skipped}</div>}
              </div>

              {result.errors.length > 0 && (
                <div className="whitespace-pre-wrap rounded-lg bg-red-400/10 p-4 text-left text-sm text-red-300">
                  {result.errors.join("\n")}
                </div>
              )}

              <button onClick={onClose} className="glass-btn rounded-lg px-6 py-2 text-sm">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
