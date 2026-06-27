# Contech Hub — Project Work Log

> บันทึกการทำงานของโปรเจกต์ Contech Hub (development history / changelog)
> **Last Updated:** 12 June 2026 · **Owner:** จ้อ (Head of Contech BU)
> **Single Source of Truth:** [Notion — Contech Hub Application Blueprint](https://app.notion.com/p/32b46733f68081beab2acc87dcb3e088) ภายใต้ page [Contech Operation](https://app.notion.com/p/32346733f68080279845e5b370bd4c20)

เอกสารนี้สรุป "งานที่ทำไปแล้ว" ของโปรเจกต์ ทั้งในมุม phase และมุม commit history เพื่อให้ทีม + AI Copilot เห็นภาพรวมว่าระบบเดินทางมาถึงจุดไหน อ้างอิงจาก git history (15 Mar – 4 May 2026) และ Notion Blueprint (อัปเดต 3 May 2026)

---

## 1. สรุปสถานะปัจจุบัน (Snapshot)

Contech Hub คือ Internal Web App สำหรับทีม Contech BU (Builk One Group) 8 คน ทำหน้าที่เป็น Command Center กลางสำหรับงานขาย, pricing, revenue และ KPI ปี 2026 (เป้ารายได้ **20M THB**)

ทุก feature flag ใน `lib/features.ts` เปิด `true` ทั้งหมดแล้ว — โปรเจกต์เดินผ่าน Phase 0–5 + 4.5/4.6 ครบ และผ่าน Hardening + Refactor pass (12 Jun 2026) ที่ปิด G-01/G-02 แล้ว (ดู §4)

| Phase | Feature | สถานะ |
| --- | --- | --- |
| 0 | Notion Foundation (13 DBs ภายใต้ Contech Operation) | ✅ Live |
| 1 | Microsoft SSO + User Mapping + Profile Photo | ✅ Live |
| 2 | Pricing Display | ✅ Live |
| 3 | Pricing Calculator (Transformation Service, Kickstarter 2-year, Mandatory Fee) | ✅ Live |
| 4 | Revenue Tracker + KPI Dashboard | ✅ Live |
| 4.5 | Sales Pipeline + Excel Import | ✅ Live |
| 4.6 | BU Playbook | ✅ Live |
| 5 | Pricing Calculator Chatbot (Gemini Flash → Claude Sonnet via OpenRouter) | ✅ Live (BU roles) |
| 6 | Staff Chatbot (role-aware) | 🟢 Backlog |
| — | Admin/Config Page, Audit Log | ⏳ Deferred |

---

## 2. Timeline แบบ Phase

### Phase 0 — Notion Foundation
วาง Notion เป็น system of record: Users & Access, Pricing & Packages, KPI Tracker, Revenue Tracker, Quote Sessions, Customer Master, Hot Quotation, Sales Order, Knowledge Base, Chat Sessions, Lead Intake, Products & Features, Sales Materials — รวม 13 databases ใต้ page **Contech Operation**

### Phase 1 — Authentication (15 Mar 2026)
- Microsoft Entra ID (Auth.js / next-auth v5 beta) — provider `MicrosoftEntraID` ไม่ใช่ v4 `AzureAD`
- จำกัดเฉพาะ `@builk.com` + ตรวจ `Active = true` ใน Users & Access DB
- Enrich session ด้วย `appRole` / BU Membership / `salesLane`
- Route protection ผ่าน `middleware.ts`
- ต่อมาเพิ่ม Microsoft Graph profile photo (navbar) พร้อม initials fallback

### Phase 2 — Pricing Display (15 Mar 2026)
- `/dashboard/pricing` ดึงจาก Pricing & Packages DB, cache `revalidate = 3600`
- Tabs derive จาก active package data (ไม่ hardcode) + Overview / Bundle / Transformation Service
- Visibility filter (`Internal Only` ซ่อนจาก non-Contech BU), Enterprise Matrix callout ตาม role

### Phase 3 — Pricing Calculator (15–21 Mar 2026)
- Multi-product quote: Builk Insite, Builk 360, Kwanjai
- Step flow: Customer Info → Product Select → Package Config → Services → Special Options → Summary
- Business rules: Super Combo, Kickstarter 2-year prepaid, Mandatory Implementation fee (Online/Onsite), Enterprise Base/Premium, Top-up quantity stepper (อ่านจาก Notion), manual discount + approval flag
- Transformation Service standalone flow (project name, engagement model, task notes)
- บันทึก quote → `POST /api/internal/quotes` → push `?quote=` ; เปิด quote เดิมจาก calculator state (`CONTECH_QUOTE_STATE_V1`)
- Export PDF/print แนบ Key Inclusions, Target Profile, Notes, Enterprise notes, Add-ons, Top-ups
- ลบ hardcoded pricing content ออกทั้งหมด — อ่านจาก Notion DB

### Phase 4 — Revenue Tracker + KPI Dashboard (16 Mar 2026, enhance ต่อเนื่อง)
- **Revenue** `/dashboard/revenue` — live data (`revalidate = 0`), Annual Progress เทียบเป้า 20M, Month Grid, Revenue Table, Add/Edit form, `Month Locked` guard (client + server)
- **KPI** `/dashboard/kpi` — live data, Accountable model (1 KPI : 1 คน) ผ่าน **Relation → Users & Access** (เลิกใช้ People `Owner`), avatar จาก MS Graph, Filter bar (Team / Accountable / เฉพาะของฉัน), Grouped Lane layout
- เข้าถึงเฉพาะ `admin` / `bu_member`

### Phase 4.5 — Sales Pipeline + Excel Import (19 Mar 2026)
- `/dashboard/pipeline` 3 tabs: ภาพรวม Pipeline, Hot Quotation, Sales Order
- Import flow: Upload Excel → Parse → Preview → Duplicate Handling → Auto-create Customer → Confirm
- Unique key: `Quotation No. + Product` (Hot Quotation), `Order No.` (Sales Order)
- Revenue update บน Sales Order: `%` หรือ `Amount` (validate ไม่เกิน Order Amount)
- แก้ครบ 6 Senior Dev findings + Sales Owner matching + strict validation

### Phase 4.6 — BU Playbook (29 Mar 2026)
- `/dashboard/playbook` — Overview, Team, Workstream, Rituals, Messages + sidebar nav
- ข้อมูลจาก `lib/playbook-data.ts`

### Phase 5 — Pricing Calculator Chatbot (22 Mar 2026)
- `/dashboard/chatbot` เปิดสำหรับ `admin` / `bu_member`
- Routing: Gemini 2.5 Flash (default) → escalate Claude Sonnet 4.6 เมื่อ intent ต้อง reasoning — ผ่าน OpenRouter (M2, 13 Jun 2026)
- Source: Pricing DB + Verified Knowledge Base (50 entries) ; `lib/chatbot-*` (router, prompt, parser, notion) + `lib/openrouter.ts`

### March 22 Hardening Pass (G-01 → G-05)
- G-01: enforce `hasBuAccess()` บน GET ของ KPI / Revenue / Pipeline
- G-02: จำกัด quote detail lookup ให้เป็น record ใน Quotes DB + BU access
- G-03: align Revenue field naming code ↔ live schema
- G-04: quote hydration จาก `?quote=` (ยังไม่สมบูรณ์สำหรับ legacy records)
- G-05: เคลียร์ lint warnings (`StepServices.tsx`, `ExcelImportModal.tsx`)
- บันทึกไว้ที่ `BLUEPRINT_SYNC_CHANGELOG_2026-03-22.md`

### May 2026 — Quote Export + Access Modal (4 May 2026)
- เพิ่ม package terms / What's Included จาก Notion เข้าใบเสนอราคา (แก้ปัญหาใบเสนอราคา "โล้น") + sync Blueprint
- Access Permissions modal ใน user menu (เพิ่ม → refine layout → improve presentation)

### June 2026 — Hardening + Refactor Pass (12 Jun 2026)
- **G-01 ✅** Server-side quote recalculation — `lib/quote-server.ts` validate payload + re-resolve ราคาทุกตัวจาก Pricing DB ด้วย item ID แล้ว recalculate ด้วย pricing engine ฝั่ง server (ไม่ trust breakdown จาก client); `POST /api/internal/quotes` ตอบ 400 เมื่อ payload ไม่ถูกต้อง
- **G-02 ✅** Normalized quote fields — Base/Add-on split จริง + เพิ่ม `One-time Total (THB)`, `First Year Total (THB)` ใน Quote Sessions DB; Quote Summary JSON เป็น version 2
- **Security/hygiene** — NextAuth debug เฉพาะ dev + ตัด PII logging ตอน sign-in; middleware บล็อก `internal_viewer` ครบทุก route (เพิ่ม pipeline/chatbot/playbook); เลิก track `.env` + ลบไฟล์ debug debris ออกจาก repo
- **Performance** — xlsx lazy-load ผ่าน dynamic import: หน้า pipeline ลดจาก 149 kB เหลือ 8.2 kB (First Load 254→114 kB)
- **Refactor** — แยก `lib/notion.ts` (1,020 บรรทัด) เป็น domain modules ใน `lib/notion/` (barrel re-export ที่เดิม); user lookup cache มี TTL 5 นาที; รวมศูนย์ number formatting ที่ `lib/format.ts`; feature flags บังคับที่ page level ทุก feature

---

## 3. Commit History (git, ย่อ)

| วันที่ | งานสำคัญ |
| --- | --- |
| 2026-03-15 | Initial Next.js + Auth.js v5 + Notion API v5 ; glassmorphism palette ; Phase 2 pricing ; Phase 3 calculator |
| 2026-03-16 | Production hardening (error boundaries, feature flags, security headers) ; Phase 4 revenue + KPI |
| 2026-03-19 | Phase 4.5 pipeline + Excel import ; แก้ 6 Senior Dev findings ; Sales Owner matching + validation |
| 2026-03-20 | Calculator top-up support (quantity stepper จาก Notion) |
| 2026-03-21 | Enterprise tier pricing (Base/Premium) ; ลบ hardcoded pricing ; transformation service tab + standalone calc ; mandatory impl fee ; kickstarter 2-year ; navbar profile photo ; hybrid product selection |
| 2026-03-22 | G-01→G-05 hardening ; Phase 5 chatbot ; KPI upgrade (Accountable via Relation) ; build fixes |
| 2026-03-23 | KPI Dashboard — grouped lane layout |
| 2026-03-24 | แก้ bug Excel import |
| 2026-03-29 | Phase 4.6 Playbook + sidebar nav |
| 2026-05-04 | Package terms ในใบเสนอราคา + sync blueprint ; access permissions modal (3 commits) |
| 2026-06-11 | docs: README ใหม่ + PROJECT_LOG + refresh product docs |
| 2026-06-12 | Hardening + Refactor pass: G-01 server-side quote recalculation ; G-02 normalized fields ; auth/middleware hygiene ; xlsx lazy-load ; แยก lib/notion/ ; lib/format.ts ; feature flags ที่ page level |
| 2026-06-27 | Docs/status sync: อ่าน `.md` ทั้งหมดแบบ forced recursive scan รวม hidden folders, ยืนยัน `.claude/` ไม่มี `.md`, sync README / PRODUCT_SUMMARY / PROJECT_LOG กับ M1/M2 + Lead-to-Cash SOP ล่าสุด |
| 2026-06-27 | Security hygiene: redact plaintext credentials จาก Notion page เก่า `🏠 Contech Hub`; ยังต้อง rotate credential ที่เคยถูกเผยแพร่จาก provider ต้นทางก่อน deploy/ops ต่อ |

---

## 4. งานที่ยังค้าง (Open Gaps / Next)

| # | งาน | ระดับ | รายละเอียด |
| --- | --- | --- | --- |
| G-01 | Server-side quote integrity | ✅ Resolved (12 Jun 2026) | `lib/quote-server.ts` validate + recalculate ฝั่ง server ด้วย Pricing DB — ไม่ trust breakdown จาก client |
| G-02 | Quote reporting fields | ✅ Resolved (12 Jun 2026) | Base/Add-on split จริง + เพิ่ม `One-time Total (THB)`, `First Year Total (THB)` ใน Quote Sessions DB |
| G-03 | README onboarding | ✅ Resolved (7 Jun 2026) | README.md ฉบับใหม่ + PROJECT_LOG.md |
| G-04 | Auth.js Edge warning | 🟢 Low | build ผ่าน แต่ยังมี `jose` warning เรื่อง CompressionStream/DecompressionStream ใน Edge Runtime |
| M1 | Automated tests (pricing engine + quote-server) | ✅ Resolved (13 Jun 2026) | Vitest + 55 tests — `lib/__tests__/` ครอบคลุม pricing-engine, quote-server (G-01), chatbot router/openrouter |
| M2 | Chatbot ย้ายไป OpenRouter + multi-model routing | ✅ Resolved (13 Jun 2026) | `lib/openrouter.ts` gateway เดียว — key ผ่าน Authorization header (เลิกใส่ใน URL) ; route fast=Gemini Flash → escalation=Claude Sonnet 4.6 |
| — | Staff Chatbot (Phase 6) | 🟢 Backlog | role-aware AI ; KB source: Verified KB → Product → Pricing → Sales Blueprint |
| — | Admin/Config Page, Audit Log | ⏳ Deferred | |

**Next priority:** E2E smoke test รอบ login → pricing → calculator → save และ Lead-to-Cash foundation จาก Notion SOP ล่าสุด: Onboarding Tracker, Invoice & Collection Schedule, Recurring/Customer Health, Red Flag dashboard

---

## 5. Convention การอัปเดตเอกสาร

- เอกสารต้นทาง (SSOT) คือ **Notion Blueprint** — อัปเดตทุกครั้งที่เปลี่ยนโครงสร้าง DB / เพิ่ม feature / แก้ bug สำคัญ
- ไฟล์ md ในโปรเจกต์เป็นเงาของ Blueprint สำหรับ developer ที่ทำงานใน repo:
  - `README.md` — setup / architecture / env
  - `PRODUCT_SUMMARY.md` — สรุปผลิตภัณฑ์ + assessment
  - `PROJECT_LOG.md` (ไฟล์นี้) — work log / changelog
  - `POST_DEPLOY_CHECKLIST.md`, `VERCEL_ENV_SETUP.md` — deploy / env
- เมื่อ merge งานใหม่: เพิ่มบรรทัดใน §3 และอัปเดต §1/§4 ให้ตรงสถานะจริง
