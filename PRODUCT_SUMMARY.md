# Contech Hub — Product Summary

> อัปเดต: **7 June 2026** (ฉบับก่อนหน้า 15 Mar 2026 ล้าสมัยแล้ว — ตอนนั้น KPI/Revenue/Chatbot ยังไม่เสร็จ ปัจจุบัน Live ครบ)
> อ้างอิงสถานะจาก git history (ถึง 4 May 2026) + [Notion Blueprint](https://app.notion.com/p/32b46733f68081beab2acc87dcb3e088) (3 May 2026)

---

## 1. Executive Summary

Contech Hub คือ internal web platform ของ Contech BU ที่รวม user access, pricing knowledge, quote creation, revenue tracking, KPI และ sales pipeline ไว้ที่เดียว ปัจจุบันเดินผ่าน **Phase 0–5 + 4.5/4.6 ครบ** (feature flags เปิด `true` ทั้งหมด) จาก prototype กลายเป็น operating console จริงของทีมแล้ว

**จุดแข็งปัจจุบัน:**

- Microsoft SSO + internal user mapping + role-based route protection
- Pricing catalog จาก Notion (visibility / enterprise matrix ตาม role)
- Multi-step pricing calculator พร้อม business rules, approval flagging, save, copy summary, PDF export (แนบ package terms จาก Notion)
- Revenue Tracker + KPI Dashboard ที่ enforce role-level authorization แล้ว
- Sales Pipeline + Excel import (Hot Quotation / Sales Order / Customer auto-create)
- Pricing chatbot (Gemini + Claude Haiku) สำหรับ BU roles

**ช่องว่างหลักที่เหลือ:**

- Quote save ยัง trust ค่า breakdown จาก client — ควร recalculate ฝั่ง server (G-01)
- Quote reporting fields ยังไม่ normalized (G-02)
- ยังไม่มี automated tests ใน repo
- Auth.js Edge runtime warning จาก `jose` (ไม่บล็อก build)

---

## 2. Target Users & Roles

เฉพาะบัญชี `@builk.com` ที่ `Active = true` ใน Users & Access DB เท่านั้นจึง login ได้ ; unmapped/inactive → `/unauthorized`

| Role | ใคร | สิทธิ์ |
| --- | --- | --- |
| `admin` | จ้อ, เอก | ทุก feature + admin config |
| `bu_member` | เติ้ล, ฝน, แจ๊พ, บอส, เจมจิ, เต้ | ทุก feature ยกเว้น admin config |
| `internal_viewer` | Builk staff นอก BU | Pricing display เท่านั้น (Calculator/KPI/Revenue/Pipeline/Chatbot ถูกบล็อก) |

---

## 3. Scope by Phase (สถานะปัจจุบัน)

| Phase | Feature | สถานะ | หมายเหตุ |
| --- | --- | --- | --- |
| 0 | Notion Foundation (13 DBs) | ✅ Live | system of record |
| 1 | Microsoft SSO + user mapping + profile photo | ✅ Live | Entra ID, middleware protection |
| 2 | Pricing Display | ✅ Live | `revalidate=3600`, visibility/enterprise ตาม role |
| 3 | Pricing Calculator | ✅ Live | multi-product, Transformation Service, Kickstarter 2-year, mandatory fee, enterprise Base/Premium, PDF export |
| 4 | Revenue Tracker + KPI Dashboard | ✅ Live | live data, role-gated, KPI Accountable via Relation, MS Graph avatars |
| 4.5 | Sales Pipeline + Excel Import | ✅ Live | Hot Quotation / Sales Order / Customer auto-create |
| 4.6 | BU Playbook | ✅ Live | overview/team/workstream/rituals/messages |
| 5 | Pricing Chatbot | ✅ Live (BU) | Gemini 2.5 Flash → Claude Haiku escalation, Pricing DB + Verified KB |
| 6 | Staff Chatbot | 🟢 Backlog | role-aware, KB layered |
| — | Admin/Config, Audit Log | ⏳ Deferred | |

> เทียบกับฉบับ 15 Mar 2026: ตอนนั้น Phase 4 (KPI/Revenue) ระบุว่า "Not delivered" และ chatbot เป็น placeholder — ปัจจุบัน **ทำเสร็จและ Live ทั้งหมด**

---

## 4. Current Product Capabilities

ระบบทำได้แล้ววันนี้:

1. Authenticate internal users ด้วย Microsoft login + ตรวจ active/mapped ใน Notion
2. แสดง pricing catalog แยกตาม product area + role visibility
3. นำ BU user ผ่าน quote creation flow และคำนวณราคา/ส่วนลดแบบ real time
4. Flag scenario ที่ต้อง approval + save quote ลง Notion + เปิด quote เดิมจาก `?quote=`
5. Export ใบเสนอราคา (พร้อม package terms / What's Included)
6. แสดง Revenue progress เทียบเป้า 20M + add/edit (month-lock guard)
7. แสดง KPI dashboard แบบ accountable พร้อม avatar + filter
8. Import sales pipeline จาก Excel + auto-create customer
9. ตอบคำถาม pricing ผ่าน chatbot สำหรับ BU roles

ยังไม่สมบูรณ์: server-side quote recalculation, normalized quote reporting fields, automated tests, Staff Chatbot (Phase 6)

---

## 5. Technology Stack

- **Frontend:** Next.js 15 App Router, React 19, TypeScript (strict), Tailwind (glassmorphism)
- **Auth:** next-auth v5 beta + Microsoft Entra ID
- **Data:** Notion API (`@notionhq/client` v5) เป็น system of record
- **Excel:** xlsx (SheetJS)
- **AI:** Gemini 2.5 Flash + Claude Haiku 4.5

**Strengths:** iterate เร็ว, infra ต่ำ, pricing/content แก้ที่ Notion ได้, เหมาะกับ early validation + BU rollout
**Risks:** next-auth v5 beta upgrade risk, Notion ไม่เหมาะเป็น transactional system ระยะยาวสำหรับ audit-heavy flow, ยังไม่มี automated tests, validation boundary ฝั่ง server ของ quote ยังบาง

---

## 6. Senior Developer Assessment

โปรเจกต์ผ่านจุด "prototype" มาเป็น internal product จริงที่มี business value ชัดเจน (pricing + quote + revenue + KPI + pipeline ใช้งานได้) งานช่วงต่อไปควรเน้น **hardening มากกว่าเพิ่ม UI**:

- Server-side recalculation สำหรับ quote (กัน client payload ถูกแก้)
- Normalized quote reporting fields (analytics แม่นขึ้น)
- เริ่ม automated tests รอบ pricing engine + save flow
- Data governance สำหรับ revenue/KPI ที่ sensitive

---

## 7. Action Backlog

### High Impact
| ID | Action | Why |
| --- | --- | --- |
| H1 | Recalculate quote totals ฝั่ง server ก่อน save (G-01) | กัน manipulated client payload |
| H2 | Normalize quote breakdown fields ใน Quote Sessions (G-02) | reporting/analytics แม่นขึ้น |

### Medium Impact
| ID | Action | Why |
| --- | --- | --- |
| M1 | เพิ่ม unit tests ให้ pricing engine | กัน regression ของ business rule |
| M2 | E2E smoke test: login → pricing → calculator → save | release confidence |
| M3 | Backfill legacy quotes ให้ hydrate `?quote=` ได้ครบ | optional, ไม่บล็อก |

### Low Impact
| ID | Action | Why |
| --- | --- | --- |
| L1 | แก้ Auth.js `jose` Edge warning (G-04) | ลด noise ตอน build |
| L2 | เริ่ม Phase 6 Staff Chatbot | ขยาย value ต่อ |

---

## 8. Conclusion

Contech Hub เป็น internal product ที่มี value จริง ไม่ใช่แค่ prototype อีกต่อไป Phase 1–5 + 4.5/4.6 ส่งมอบ operational value ครบสำหรับ pricing, quote, revenue, KPI และ pipeline ขั้นต่อไปที่ให้ผลตอบแทนสูงสุดคือ **ทำให้ trust boundary ฝั่ง server แน่นขึ้น** (quote recalculation + reporting fields + tests) มากกว่าการเพิ่ม UI surface ใหม่
