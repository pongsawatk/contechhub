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
    { id: "overview", label: "ภาพรวม Pipeline" },
    { id: "hot-quotation", label: "Hot Quotation 🔥" },
    { id: "sales-order", label: "Sales Order 💼" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-white mb-1">Sales Pipeline</h1>
        <p className="text-secondary text-sm">ติดตามการขายตั้งแต่ Hot Quotation จนถึง Revenue</p>
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
