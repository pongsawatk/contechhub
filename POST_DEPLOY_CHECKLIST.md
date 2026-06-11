# Post-Deploy Checklist

> อัปเดต 7 Jun 2026 — ปัจจุบัน KPI / Revenue / Pipeline / Playbook / Chatbot Live แล้ว (feature flags เปิดครบ) ไม่ใช่ hidden เหมือนตอน deploy แรก

## Azure Portal (ทำทันทีหลัง deploy ครั้งแรก)
เพิ่ม production Redirect URI (อย่าลบ localhost ออก — ต้องมีทั้งคู่):
  https://contech-hub.vercel.app/api/auth/callback/microsoft-entra-id
  http://localhost:3000/api/auth/callback/microsoft-entra-id
ตรวจ API Permissions: `User.Read`, `profile` (Delegated) + grant admin consent

## Auth Tests
- [ ] https://contech-hub.vercel.app → redirect ไป /login
- [ ] Login ด้วย Builk account ที่อยู่ใน Users DB (Active=true) → ถึง /dashboard
- [ ] Login ด้วย email ที่ไม่อยู่ใน Users DB → /unauthorized
- [ ] Profile photo ขึ้นใน navbar (fallback เป็น initials ถ้าไม่มีรูป)
- [ ] `internal_viewer` เห็นเฉพาะ Pricing ; Calculator/KPI/Revenue/Pipeline/Chatbot ถูกบล็อก

## Pricing Tests
- [ ] /dashboard/pricing โหลดถูกต้อง
- [ ] Builk Insite tab: เรียง Lite → Business → Professional → Enterprise
- [ ] Infrastructure section แสดงใต้ packages
- [ ] Key Inclusions split ด้วย " | " (ไม่ใช่ comma)
- [ ] Enterprise Matrix callout ขึ้นเฉพาะ admin / bu_member

## Calculator Tests
- [ ] Insite Pro + 360 Pro → Super Combo 10% trigger
- [ ] Business + 4 add-ons → Productivity Pack hint
- [ ] Discount > 10% → Approval Required warning
- [ ] Transformation Service → เข้า standalone flow (ข้าม package step)
- [ ] Kickstarter 2-year prepaid คำนวณถูก
- [ ] Save quote → ขึ้นใน Notion Quote Sessions DB
- [ ] เปิด `?quote=` ของ quote ที่เพิ่ง save → hydrate calculator state กลับมา
- [ ] Export PDF → มี Key Inclusions / package terms / What's Included (ใบไม่โล้น)

## Revenue Tests
- [ ] /dashboard/revenue เข้าได้เฉพาะ admin / bu_member
- [ ] Annual Progress เทียบเป้า 20M ถูกต้อง
- [ ] Add/Edit entry บันทึกลง Notion
- [ ] `Month Locked = true` → แก้ไม่ได้ทั้ง client + server

## KPI Tests
- [ ] /dashboard/kpi เข้าได้เฉพาะ admin / bu_member
- [ ] KPI card แสดง avatar + ชื่อ Accountable (ดึงจาก Relation → Users & Access)
- [ ] Filter: Team / Accountable / "เฉพาะของฉัน" ทำงาน
- [ ] แก้ Actual ได้เฉพาะ accountable เจ้าของ KPI หรือ admin

## Pipeline Tests
- [ ] /dashboard/pipeline 3 tabs โหลด (ภาพรวม / Hot Quotation / Sales Order)
- [ ] Excel import: Upload → Preview → Duplicate handling → Confirm
- [ ] Auto-create Customer เมื่อชื่อบริษัทยังไม่มีในระบบ
- [ ] Revenue update บน Sales Order: validate ไม่เกิน Order Amount

## Chatbot Test
- [ ] /dashboard/chatbot เปิดสำหรับ admin / bu_member
- [ ] ตอบคำถาม pricing โดยอ้าง Pricing DB + Verified KB

## Build Health
- [ ] `npm run lint` ผ่าน (0 warnings)
- [ ] `npm run build` ผ่าน (jose/Edge warning ยอมรับได้ — ไม่บล็อก)

## Share
ส่ง URL ให้สมาชิกทีมทั้ง 8 คนใน Users & Access Notion DB
