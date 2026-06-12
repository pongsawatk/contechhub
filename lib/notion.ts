/**
 * Notion queries รวมศูนย์ — แยก implementation ตาม domain ใน lib/notion/
 * ทุก consumer import ผ่านไฟล์นี้เหมือนเดิม (convention ตาม Blueprint §5.3)
 */
export { getUserProfile, getUserProfileByPageId, findNotionUserByName } from "./notion/users"
export { getPricingPackages } from "./notion/pricing"
export { getKBEntries } from "./notion/knowledge"
export type { KBEntry } from "./notion/knowledge"
export { getKpiRecords, getKpiRecordById, getKpiEntries, updateKpiEntry } from "./notion/kpi"
export { getRevenueEntries, createRevenueEntry, updateRevenueEntry, isMonthLocked } from "./notion/revenue"
export { createQuoteSession, getQuoteSession } from "./notion/quotes"
export {
  getCustomers,
  findCustomerByName,
  createCustomer,
  findOrCreateCustomer,
  getHotQuotations,
  findHotQuotation,
  findHotQuotationByNo,
  createHotQuotation,
  updateHotQuotation,
  getSalesOrders,
  findSalesOrder,
  createSalesOrder,
  updateSalesOrder,
  updateSalesOrderRevenue,
} from "./notion/pipeline"
