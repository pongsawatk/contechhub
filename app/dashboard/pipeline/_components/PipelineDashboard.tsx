"use client"
import { useState } from "react"
import type { HotQuotation, SalesOrder, Customer } from "@/types/pipeline"
import type { UserProfile } from "@/types/user"
import PipelineSummary from "./PipelineSummary"
import HotQuotationTab from "./HotQuotationTab"
import SalesOrderTab from "./SalesOrderTab"

interface Props {
  quotations: HotQuotation[]
  orders: SalesOrder[]
  customers: Customer[]
  currentUser: UserProfile | undefined
}

type Tab = "overview" | "hot-quotation" | "sales-order"

export default function PipelineDashboard({ quotations, orders, customers, currentUser }: Props) {
  const [tab, setTab] = useState<Tab>("overview")
  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "\u0e20\u0e32\u0e1e\u0e23\u0e27\u0e21 Pipeline" },
    { id: "hot-quotation", label: "Hot Quotation \uD83D\uDD25" },
    { id: "sales-order", label: "Sales Order \uD83D\uDCBC" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-white mb-1">Sales Pipeline</h1>
        <p className="text-secondary text-sm">\u0e15\u0e34\u0e14\u0e15\u0e32\u0e21\u0e01\u0e32\u0e23\u0e02\u0e32\u0e22\u0e15\u0e31\u0e49\u0e07\u0e41\u0e15\u0e48 Hot Quotation \u0e08\u0e19\u0e16\u0e36\u0e07 Revenue</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={tab === t.id ? "px-4 py-2 rounded-lg text-sm font-medium bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30" : "px-4 py-2 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 border border-transparent"}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <PipelineSummary quotations={quotations} orders={orders} />
      )}
      {tab === "hot-quotation" && (
        <HotQuotationTab quotations={quotations} customers={customers} currentUser={currentUser} />
      )}
      {tab === "sales-order" && (
        <SalesOrderTab orders={orders} customers={customers} currentUser={currentUser} />
      )}
    </div>
  )
}