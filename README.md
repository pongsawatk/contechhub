# Contech Hub

Internal Web Application สำหรับทีม **Contech BU (Builk One Group)** — Command Center กลางสำหรับงานขาย, pricing, quote, revenue, KPI และ sales pipeline ปี 2026 (เป้ารายได้ **20M THB**)

> 📘 **Single Source of Truth:** [Notion — Contech Hub Application Blueprint](https://app.notion.com/p/32b46733f68081beab2acc87dcb3e088) (อ่านก่อนเขียนโค้ดทุกครั้ง)
> 🧭 **Latest operating direction:** [Notion — ContechHub Lead-to-Cash SOP & Improvement Blueprint](https://app.notion.com/p/031e6432a911431db8ba5830995dbec6)
> 📝 **Work log / changelog:** [`PROJECT_LOG.md`](./PROJECT_LOG.md)

> 🔎 **Docs scan note (27 Jun 2026):** forced recursive scan รวม hidden folders แล้วพบ `.md` ใน repo 6 ไฟล์เท่านั้น: `README.md`, `PRODUCT_SUMMARY.md`, `PROJECT_LOG.md`, `POST_DEPLOY_CHECKLIST.md`, `VERCEL_ENV_SETUP.md`, `BLUEPRINT_SYNC_CHANGELOG_2026-03-22.md`. โฟลเดอร์ `.claude/` มีเฉพาะ local config (`launch.json`, `settings.local.json`) ไม่มี `.md` เพิ่ม

---

## Tech Stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js `^15.3.4` (App Router, Server Components) |
| UI | React `^19`, TypeScript `^5` (strict), Tailwind CSS `^3.4` (glassmorphism dark navy/green) |
| Auth | Auth.js / `next-auth@^5.0.0-beta.30` — Microsoft Entra ID provider |
| Data | Notion เป็น system of record — `@notionhq/client@^5.9.0` (notionVersion `2026-03-11`) |
| Excel | `xlsx` (SheetJS) `^0.18.5` — pipeline import + template |
| AI (Chatbot) | OpenRouter — Gemini 2.5 Flash (default) → Claude Sonnet 4.6 (escalation) |
| Fonts | Sarabun (ไทย) + Inter ผ่าน `next/font/google` |

> ⚠️ **ห้าม install npm package ใหม่โดยไม่ได้รับอนุญาต** — `xlsx` เป็น dependency เดียวนอกเหนือ core ที่อนุมัติแล้ว

---

## Getting Started

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. สร้าง .env.local (ดู Environment Variables ด้านล่าง / VERCEL_ENV_SETUP.md)

# 3. dev server
npm run dev          # http://localhost:3000

# ก่อน push เสมอ
npm run lint         # ต้อง 0 warnings/errors
npm run build        # ต้อง 0 errors
```

Claude local config ที่พบ:

- `.claude/launch.json` มี launch target สำหรับ Next.js dev server และ production preview ที่ port `3000`
- `.claude/settings.local.json` เป็น local permission allowlist สำหรับ Claude tooling เช่น `npm run build`, `npx tsc --noEmit`, Notion fetch/search และ preview tooling ไม่ใช่ source of truth ของ product status

---

## Project Structure

```
app/
  login/  unauthorized/            หน้า auth
  dashboard/
    pricing/      Phase 2 — Pricing display
    calculator/   Phase 3 — Quote calculator (+ export/, _components/ step flow)
    revenue/      Phase 4 — Revenue tracker
    kpi/          Phase 4 — KPI dashboard
    pipeline/     Phase 4.5 — Sales pipeline + Excel import
    playbook/     Phase 4.6 — BU Playbook
    chatbot/      Phase 5 — Pricing chatbot
  api/
    auth/[...nextauth]            Auth.js handler
    me/photo                      MS Graph profile photo proxy
    internal/                     ทุก business API (validate session ก่อนเสมอ)
lib/
  notion.ts                       Barrel — Notion queries แยกตาม domain ใน notion/
  notion/                         client · users · pricing · knowledge · kpi · revenue · quotes · pipeline
  pricing-engine.ts               Pricing business logic (Form + Chatbot ใช้ร่วม)
  quote-server.ts                 Server-side quote validation + recalculation (G-01)
  format.ts                       formatTHB / formatTHBCompact / formatKpiValue
  pricing-utils.tsx  features.ts  revenue-targets.ts
  excel-parser.ts  excel-templates.ts  pipeline-helpers.ts   (xlsx ถูก lazy-load)
  chatbot-router.ts  chatbot-prompt.ts  chatbot-parser.ts  chatbot-notion.ts
  playbook-data.ts  quote-export.ts  api-auth.ts (hasBuAccess)
types/    pricing · calculator · kpi · revenue · pipeline · quote · chatbot · user · next-auth.d
components/   NavBar · UserAvatar · kpi/*
middleware.ts   auth.ts            route protection + Auth.js config
```

---

## Architecture Notes

- **Server Components เป็น default** — ใส่ `'use client'` เฉพาะที่ต้องการ state/interaction
- **Notion queries** รวมที่ `lib/notion.ts` — ทุก DB ID มาจาก env (ดู §Environment)
- **API routes** อยู่ที่ `app/api/internal/*` ทุกตัว validate session ก่อน:
  ```typescript
  const session = await auth()
  if (!session?.user?.profile) return NextResponse.json({}, { status: 401 })
  const { appRole, email } = session.user.profile
  ```
- **Role-level authorization** — GET ของ KPI / Revenue / Pipeline enforce `hasBuAccess(session)` ; KPI `PATCH` จำกัด accountable หรือ admin ; Revenue `POST/PATCH` มี month-lock guard
- **Quote integrity (G-01)** — `POST /api/internal/quotes` ไม่ trust breakdown จาก client: `lib/quote-server.ts` re-resolve ราคาทุกตัวจาก Pricing DB ด้วย item ID แล้ว recalculate ฝั่ง server ก่อน save
- **Pricing logic** อยู่ที่ `lib/pricing-engine.ts` ที่เดียว ใช้ทั้ง form / chatbot / server recalculation
- **Feature flags** ที่ `lib/features.ts` — ปิด flag แล้วทั้ง NavBar/Dashboard ซ่อนลิงก์ และ page redirect กลับ `/dashboard`

### Roles (จาก Users & Access DB)

| Role | ใคร | สิทธิ์ |
| --- | --- | --- |
| `admin` | จ้อ, เอก | ทุก feature + admin config |
| `bu_member` | เติ้ล, ฝน, แจ๊พ, บอส, เจมจิ, เต้ | ทุก feature ยกเว้น admin config |
| `internal_viewer` | Builk staff นอก BU | Pricing display เท่านั้น |

---

## Notion Databases

ทุก DB อยู่ใต้ page **Contech Operation** (`32346733-f680-8027-9845-e5b370bd4c20`) — schema เต็มอยู่ใน Blueprint §4

| DB | ID (env) |
| --- | --- |
| Users & Access | `NOTION_USERS_DB_ID` |
| Pricing & Packages | `NOTION_PRICING_DB_ID` |
| KPI Tracker | `NOTION_KPI_DB_ID` |
| Revenue Tracker | `NOTION_REVENUE_DB_ID` |
| Quote Sessions | `NOTION_QUOTES_DB_ID` |
| Customer Master | `NOTION_CUSTOMER_DB_ID` |
| Hot Quotation | `NOTION_HOT_QUOTATION_DB_ID` |
| Sales Order | `NOTION_SALES_ORDER_DB_ID` |
| Knowledge Base (Chatbot KB, 50 entries) | `NOTION_KNOWLEDGE_DB_ID` |
| Chat Sessions | `NOTION_CHAT_SESSIONS_DB_ID` |
| Lead Intake (n8n + AI qualification) | `NOTION_LEAD_INTAKE_DB_ID` |

Notion page ล่าสุดที่เกี่ยวข้องกับ product direction คือ **ContechHub Lead-to-Cash SOP & Improvement Blueprint** ซึ่งขยาย Contech Hub จาก pricing/quote/pipeline console ไปเป็น Lead-to-Cash monitor layer: Lead → Sales → Onboarding → Invoice/Collection → Revenue Recognition → Recurring Health.

---

## Environment Variables

ดูรายการเต็ม + ค่า DB ID ที่ [`VERCEL_ENV_SETUP.md`](./VERCEL_ENV_SETUP.md) สรุปกลุ่มหลัก:

```bash
# Auth
AUTH_SECRET=                 # openssl rand -base64 32
AUTH_URL=                    # https://contech-hub.vercel.app

# Microsoft Entra ID
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=      # ⚠️ rotate ที่ Azure Portal
AZURE_AD_TENANT_ID=

# Notion (token + DB IDs ทั้งหมด — ดู VERCEL_ENV_SETUP.md)
NOTION_TOKEN=                # ntn_... จาก notion.so/my-integrations

# Phase 5 Chatbot (OpenRouter gateway — gateway เดียวทั้ง Gemini + Claude)
OPENROUTER_API_KEY=          # sk-or-v1-... จาก openrouter.ai/keys
NOTION_CHAT_SESSIONS_DB_ID=
```

---

## Deployment

- GitHub `main` → Vercel auto-deploy (~2–3 นาที)
- ใส่ env ครบทั้ง Production + Preview + Development
- Azure AD ต้องมี redirect URI ทั้ง dev + prod (intentional):
  - `http://localhost:3000/api/auth/callback/microsoft-entra-id`
  - `https://contech-hub.vercel.app/api/auth/callback/microsoft-entra-id`
- หลัง deploy ครั้งแรก: ทำตาม [`POST_DEPLOY_CHECKLIST.md`](./POST_DEPLOY_CHECKLIST.md)

**Workflow:** แก้โค้ด → `npm run build` (0 errors) → `git commit` → `git push origin main` → Vercel deploy → ทดสอบหน้างาน

---

## Known Gaps

ดู [`PROJECT_LOG.md` §4](./PROJECT_LOG.md) — G-01/G-02 ปิดแล้ว 12 Jun 2026 และ M1/M2 ปิดแล้ว 13 Jun 2026 (`npm test` = 55 tests). ที่เหลือหลักคือ E2E smoke test, `jose` Edge warning (G-04), และงาน Lead-to-Cash monitor layer จาก SOP ล่าสุด: Onboarding, Invoice/Collection, Recurring Health, Red Flag dashboard.
