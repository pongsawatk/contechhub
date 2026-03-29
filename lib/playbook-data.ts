export type QuarterKey = "Q1" | "Q2" | "Q3" | "Q4"

export interface PlaybookOverview {
  revenueTarget: string
  revenueBreakdown: string
  segmentFocus: string
  corpPipeline: string
  strategicFocus: string
}

export interface WorkflowStep {
  label: string
}

export interface Callout {
  type: "danger" | "warning" | "info" | "success" | "tip"
  icon: string
  title: string
  body: string
}

export interface WorkstreamSection {
  title: string
  steps?: WorkflowStep[]
  callouts?: Callout[]
}

export interface WorkstreamData {
  id: string
  navLabel: string
  navSubtitle: string
  emoji: string
  title: string
  subtitle: string
  owners: string[]
  sections: WorkstreamSection[]
}

export interface TeamMember {
  name: string
  role: string
  engine: "hunter" | "farmer" | "innovation" | "lead"
  action: string
}

export interface KeyMessage {
  segment: string
  message: string
  accentColor: "blue" | "green" | "amber" | "purple" | "red"
}

export interface Ritual {
  name: string
  nameTH: string
  frequency: string
  participants: string
  goal: string
}

export interface PlaybookQuarter {
  quarter: QuarterKey
  year: number
  isActive: boolean
  overview: PlaybookOverview
  workstreams: WorkstreamData[]
  team: TeamMember[]
  keyMessages: KeyMessage[]
  rituals: Ritual[]
  weeklyAgenda: string[]
}

export const QUARTER_ORDER: QuarterKey[] = ["Q1", "Q2", "Q3", "Q4"]

export const PLAYBOOK_DATA: Record<QuarterKey, PlaybookQuarter> = {
  Q1: {
    quarter: "Q1",
    year: 2026,
    isActive: false,
    overview: {
      revenueTarget: "6.0 ล้านบาท",
      revenueBreakdown: "ม.ค. 1.5M / ก.พ. 2.0M / มี.ค. 2.5M",
      segmentFocus: "Warm Up + Corp แรกของปี",
      corpPipeline: ">= 4x เป้าไตรมาส",
      strategicFocus: "เคลียร์ดีลเก่า + ปั้น Lead Corp",
    },
    workstreams: [],
    team: [],
    keyMessages: [],
    rituals: [],
    weeklyAgenda: [],
  },
  Q2: {
    quarter: "Q2",
    year: 2026,
    isActive: true,
    overview: {
      revenueTarget: "3.5 ล้านบาท",
      revenueBreakdown: "เม.ย. 0.8M / พ.ค. 1.5M / มิ.ย. 1.2M",
      segmentFocus: "รับสร้างบ้าน + Interior -> Solar EPC ใน พ.ค.",
      corpPipeline: ">= 4x เป้าไตรมาส ก่อนสิ้น พ.ค.",
      strategicFocus: "Lock WIP + แก้ Hunter Velocity + วางระบบ Automation",
    },
    workstreams: [
      {
        id: "ws1",
        navLabel: "ขายรายย่อย",
        navSubtitle: "Biz Lane",
        emoji: "🎯",
        title: "WS1 — กระบวนการขายรายย่อย",
        subtitle: "Biz Lane: รับสร้างบ้าน > Interior > Solar EPC",
        owners: ["เติ้ล (เจ้าของงาน)", "ฝน (Lead Gen)", "บอส (Demo Data)"],
        sections: [
          {
            title: "รับ Lead และคัดกรอง",
            steps: [
              {
                label:
                  'Lead เข้าผ่าน LINE OA / เว็บไซต์ / โฆษณา -> บันทึกใน Intake Form อัตโนมัติ + แจ้งเตือนใน Group Chat <strong>"Contech Lead Bot"</strong>',
              },
              {
                label:
                  "เติ้ลจัดกลุ่มภายใน <strong>24 ชม.</strong>: ลูกค้ารายย่อย -> Group Demo / ลูกค้าองค์กร -> Tailored Demo",
              },
              { label: "Lead ที่ไม่ได้จอง Demo เอง -> เติ้ลโทรสอบถามและนัดหมาย" },
            ],
          },
          {
            title: "Group Demo (สาธิตสินค้าแบบกลุ่ม)",
            steps: [
              {
                label:
                  "Lead จอง Group Demo ผ่าน <strong>ลิงก์จองเอง (Self-booking Link)</strong> - ไม่ต้องผ่าน Sales ทุกราย",
              },
              { label: "บอสเตรียมข้อมูลตัวอย่างใน Insite ตามกลุ่มลูกค้าก่อน Session" },
              {
                label:
                  "<strong>เติ้ลนำเสนอ Demo</strong> แยกตาม Segment (รับสร้างบ้าน / Interior / Solar EPC)",
              },
              { label: "จบ Demo -> เสนอทันที: Kickstarter Offer (48 ชม.) หรือทดลองใช้ 14 วัน" },
              {
                label:
                  "<strong>ส่งข้อความติดตามอัตโนมัติ:</strong> วัน +1 (สรุป Demo) -> +3 (Case Study) -> +7 (ข้อเสนอสุดท้าย)",
              },
            ],
          },
          {
            title: "ปิดการขาย",
            steps: [
              {
                label:
                  "บันทึกปัญหาลูกค้า + เงื่อนไขตัดสินใจ + ขอบเขตงานใน <strong>Jubili CRM</strong> ก่อนทำใบเสนอราคา",
              },
              {
                label:
                  "เสนอ <strong>Kickstarter (สัญญา 2 ปีจ่ายล่วงหน้า)</strong> เป็นตัวเลือกแรกสำหรับลูกค้าที่ลังเล - ลด 20% + ยกเว้นค่าติดตั้งครั้งแรก",
              },
              { label: "ปิดการขาย -> สร้าง SO ใน CRM -> ออก Invoice ใน Pojjaman ERP" },
            ],
            callouts: [
              {
                type: "danger",
                icon: "⏰",
                title: "กฎดีลค้าง Biz",
                body: "ดีลค้างเกิน <strong>14 วัน</strong> -> หยุดติดตาม หรือส่งกลับให้ฝนดูแลต่อในระบบ Nurture",
              },
            ],
          },
        ],
      },
      {
        id: "ws2",
        navLabel: "ขายองค์กร",
        navSubtitle: "Corp Lane",
        emoji: "🏢",
        title: "WS2 — กระบวนการขายองค์กร",
        subtitle: "Corp Lane: Value Game เน้นมูลค่าต่อดีล",
        owners: ["จ้อ (ปิดดีล)", "เติ้ล (หาลูกค้า)", "เจมส์จิ (ออกแบบ Solution)"],
        sections: [
          {
            title: "พัฒนา Lead องค์กร",
            steps: [
              {
                label:
                  "Lead องค์กร -> เติ้ลโทรสอบถาม: ตรวจสอบ <strong>งบ / ไทม์ไลน์ / ผู้มีอำนาจตัดสินใจ</strong>",
              },
              {
                label:
                  "นัด Tailored Demo หรือเข้าพบหน้างาน - <strong>ไม่ใช้ Group Demo</strong> สำหรับ Corp",
              },
              {
                label:
                  "ดีลซับซ้อน -> <strong>เจมส์จิเข้าร่วม</strong> ออกแบบ Solution + ทำ Proposal",
              },
            ],
          },
          {
            title: "ทำ Proposal และปิดการขาย",
            steps: [
              {
                label:
                  "Proposal ต้องครบ 3 องค์ประกอบ: <strong>ออกแบบ Solution + คำนวณ ROI (ใช้ตัวเลขลูกค้าเอง) + กำหนด Pilot Scope</strong>",
              },
              {
                label:
                  "ติดตาม -> ปรับแก้ตาม Feedback -> นำเสนอ -> ต่อรองราคา - บันทึกทุกการติดต่อใน <strong>Jubili CRM</strong>",
              },
              {
                label:
                  "ปิดได้ -> SO -> Invoice | ปิดไม่ได้ -> <strong>บันทึกเหตุผล Win/Loss</strong>",
              },
            ],
            callouts: [
              {
                type: "danger",
                icon: "⚠️",
                title: "กฎดีลค้าง Corp",
                body: "ดีลค้าง Proposal เกิน <strong>30 วัน</strong> -> จ้อต้องนัดประชุมระดับผู้บริหาร (Executive Meeting) ทันที",
              },
              {
                type: "info",
                icon: "📊",
                title: "ความครอบคลุม Pipeline",
                body: "ต้องมี Lead มากกว่าเป้า <strong>อย่างน้อย 4 เท่า</strong> ก่อนสิ้น พ.ค. - ถ้าไม่พอ เติ้ลต้องโทรหาลูกค้าองค์กรโดยตรง <strong>5 รายต่อสัปดาห์</strong>",
              },
            ],
          },
        ],
      },
      {
        id: "ws3",
        navLabel: "ติดตั้งระบบ",
        navSubtitle: "Implementation",
        emoji: "⚙️",
        title: "WS3 — กระบวนการติดตั้งระบบ",
        subtitle: "Implementation: ตั้งต้นให้ถูก ลดปัญหาหน้างาน",
        owners: ["แจ๊พ (บริหาร - Gate Keeper)", "บอส (ลงมือทำ)"],
        sections: [
          {
            title: "ขั้นตอน",
            steps: [
              {
                label:
                  "<strong>Kick-off ร่วม (บังคับ):</strong> เติ้ล + แจ๊พ ต้องเข้าร่วมทั้งคู่ - ยืนยัน Scope + กำหนดการ + ผลสำเร็จที่คาดหวัง",
              },
              { label: "สร้างกลุ่ม LINE + ส่งข้อความต้อนรับ + แนะนำทีมงาน" },
              { label: "รับข้อมูลตั้งต้น: รายชื่อ User, ไฟล์แบบแปลน, ประเภทงาน Master" },
              { label: "นัด Training Online (2 วันทำการ) หรือ Onsite ตาม Package" },
              { label: "UAT - ลูกค้าทดสอบระบบจริงก่อน Go-Live" },
            ],
            callouts: [
              {
                type: "danger",
                icon: "🚨",
                title: "ประตูรับงาน (Iron Gate Protocol)",
                body: "ก่อนรับงานจาก Sales - ข้อมูลใน CRM ต้องครบ 100%: <strong>รายชื่อ User + ไฟล์แบบ + ขอบเขตงาน</strong> + ต้องมี Joint Kick-off ร่วมกัน ถ้าไม่ครบ CS <strong>ปฏิเสธรับงานได้ทันที</strong>",
              },
              {
                type: "warning",
                icon: "🔒",
                title: "ด่านตรวจความพร้อม (Readiness Gate)",
                body: "ลูกค้าต้องส่งรายชื่อ User + ไฟล์แบบครบ <strong>ก่อนวัน Kick-off</strong> - เลื่อนคิวทันที ไม่มีข้อยกเว้น",
              },
              {
                type: "warning",
                icon: "💳",
                title: "ไม่มีเงิน ไม่มีคิว (No Pay, No Slot)",
                body: "จองคิว Onsite ได้เมื่อมี PO หรือโอนมัดจำมาแล้วเท่านั้น",
              },
            ],
          },
        ],
      },
      {
        id: "ws4",
        navLabel: "Go-Live & TTV",
        navSubtitle: "30 วันแรก",
        emoji: "🚀",
        title: "WS4 — เริ่มใช้งานจริง & ติดตามคุณค่า 30 วันแรก",
        subtitle: "Go-Live & TTV: ลูกค้าใหม่ทุกรายต้องเห็นคุณค่าภายใน 30 วัน",
        owners: ["บอส (ลูกค้ารายย่อย)", "แจ๊พ (ลูกค้าองค์กร)"],
        sections: [
          {
            title: "Checklist วัน Go-Live",
            steps: [
              {
                label:
                  "ส่ง <strong>อีเมลยืนยัน Go-Live</strong> -> เริ่มนับวันที่ 1 ของสัญญา",
              },
              { label: "แจ้งช่องทาง Support (LINE / Ticket) ให้ลูกค้าทราบชัดเจน" },
              {
                label:
                  "บอสส่ง <strong>ลิงก์คลังวิดีโอสอนใช้งาน</strong> - ลูกค้าดู Self-service ก่อนส่ง Ticket",
              },
            ],
          },
          {
            title: "ตรวจสอบผลใน 30 วัน (TTV Day-30)",
            callouts: [
              {
                type: "success",
                icon: "🏠",
                title: "กลุ่มรายย่อย (Biz)",
                body: "ลูกค้า Export รายงานความคืบหน้าประจำสัปดาห์ได้จริง <strong>อย่างน้อย 1 ครั้ง</strong> ภายใน 30 วัน",
              },
              {
                type: "info",
                icon: "🏢",
                title: "กลุ่มองค์กร (Corp)",
                body: "ผู้บริหาร Login ดู Dashboard หรือได้รับ Executive Brief <strong>อย่างน้อย 1 ครั้ง</strong> ภายใน 30 วัน",
              },
              {
                type: "warning",
                icon: "⚡",
                title: "ถ้าไม่ผ่าน TTV",
                body: "แจ๊พเข้าช่วยทันที - เชิงรุก ไม่รอให้ลูกค้าร้องเรียนก่อน",
              },
            ],
          },
        ],
      },
      {
        id: "ws5",
        navLabel: "ดูแลรักษาลูกค้า",
        navSubtitle: "Retention & Upsell",
        emoji: "🌱",
        title: "WS5 — ติดตามการใช้งาน ดูแลรักษาลูกค้า & เสนอขายเพิ่ม",
        subtitle: "Retention & Upsell: Upsell >= 600k | Churn <= 5%",
        owners: ["แจ๊พ (Farmer)"],
        sections: [
          {
            title: "ตรวจสุขภาพลูกค้า — 3 ข้อที่เช็กทุกราย",
            steps: [
              { label: "Login Frequency <strong>>= 3 ครั้ง/สัปดาห์</strong> หรือเปล่า?" },
              {
                label:
                  "มีการบันทึก Task/ความคืบหน้า <strong>ใน 14 วันที่ผ่านมา</strong> หรือเปล่า?",
              },
              { label: "Ticket Support หลัง Go-Live <strong>สูงผิดปกติ</strong> หรือเปล่า?" },
            ],
            callouts: [
              {
                type: "tip",
                icon: "🚦",
                title: "สัญญาณไฟจราจร (Traffic Light)",
                body: "🟢 ใช้งานดี (Login >= 3x/สัปดาห์) | 🟡 เสี่ยง (Login น้อย) | 🔴 วิกฤต (ไม่มี Activity >= 14 วัน -> โทรภายใน 3 วัน)",
              },
            ],
          },
          {
            title: "เสนอขายเพิ่ม (Upsell) & ต่ออายุ (Renewal)",
            steps: [
              {
                label:
                  "<strong>สัญญาณที่ควรเสนอขายเพิ่ม:</strong> Slot เต็ม, มีโครงการใหม่, ใช้งานดีต่อเนื่อง >= 3 เดือน, ทีมขยาย",
              },
              {
                label:
                  "<strong>ต่ออายุ:</strong> ติดต่อล่วงหน้า <strong>60 วันก่อนหมดสัญญา</strong> เสมอ - ล็อก Early Renewal ก่อน Q3",
              },
            ],
            callouts: [
              {
                type: "tip",
                icon: "📈",
                title: "เป้า Upsell: >= 2 ดีล/เดือน ตั้งแต่ พ.ค.",
                body: "เม.ย.: แจ๊พตรวจ Health Check ลูกค้า Q1 ทุกราย (Manual) | พ.ค.-มิ.ย.: เอก+เต้ Build Usage Dashboard ใน Contech Hub",
              },
            ],
          },
        ],
      },
      {
        id: "ws6",
        navLabel: "Transformation",
        navSubtitle: "Service Delivery",
        emoji: "🔬",
        title: "WS6 — บริการ Transformation Service",
        subtitle: "เปลี่ยนองค์กรด้วย AI, Automation & BI",
        owners: ["เจมส์จิ (ออกแบบ Solution)", "จ้อ (ที่ปรึกษาหลัก)", "เต้ (Build)"],
        sections: [
          {
            title: "ตั้งแต่ขาย -> ถึงทำ Proposal",
            steps: [
              {
                label:
                  "<strong>Discovery Session (ประชุมสำรวจปัญหา):</strong> เก็บ Pain Point, ระบบที่ใช้อยู่, โจทย์ที่ลูกค้าอยากแก้",
              },
              { label: "Research + ออกแบบ Solution -> ทำ Proposal พร้อม ROI Analysis" },
              {
                label:
                  "นำเสนอ -> ติดตาม -> ปรับแก้ -> ปิดการขาย - บันทึกทุกขั้นตอนใน <strong>Jubili CRM</strong>",
              },
            ],
          },
          {
            title: "ส่งมอบงาน (Delivery)",
            steps: [
              {
                label:
                  "<strong>Kick-off:</strong> แนะนำทีมทั้ง 2 ฝ่าย + ยืนยัน Scope + กำหนดการ + ผลงานที่ต้องส่ง",
              },
              {
                label:
                  "พัฒนาและส่งงานเป็น <strong>รอบย่อย (Sprint) 2-3 สัปดาห์</strong> - ให้ลูกค้า Review ทุกรอบ",
              },
              { label: "วางบิล/เก็บเงินตามงวดที่ตกลงกัน" },
              { label: "UAT + Training เมื่อพร้อม Go-Live" },
              {
                label:
                  "Post-launch: เก็บตก Bug + ปรับปรุงรายละเอียดเล็กน้อยภายใน 2 สัปดาห์",
              },
            ],
            callouts: [
              {
                type: "warning",
                icon: "📋",
                title: "งานเพิ่มนอก Scope",
                body: "ต้องออก <strong>CR (Change Request — ใบขอเพิ่มงาน)</strong> + ประเมินราคาก่อนเสมอ ห้ามทำก่อนตกลงกัน",
              },
            ],
          },
        ],
      },
      {
        id: "ws7",
        navLabel: "การตลาด",
        navSubtitle: "Content & MQL",
        emoji: "📢",
        title: "WS7 — การตลาดและเนื้อหา",
        subtitle: "Problem-first Content สร้าง Trust ก่อนขาย",
        owners: ["ฝน (เจ้าของงาน)", "บอส (ข้อมูล Demo)", "เติ้ล (Story)", "เอก (Product Update)"],
        sections: [
          {
            title: "แผน Content 3 Phase",
            steps: [
              {
                label:
                  "<strong>Phase 1 (เม.ย.):</strong> รับสร้างบ้าน + Interior - Content เริ่มจากปัญหาลูกค้า + วิดีโอ Demo 5-7 นาที",
              },
              {
                label:
                  "<strong>Phase 2 (พ.ค.):</strong> Solar EPC + Main Con - ขยาย Segment Messaging + Case Study จาก Q1 Go-Live",
              },
              {
                label:
                  "<strong>Phase 3 (มิ.ย.):</strong> Mid-Year Recap + \"What's New\" Feature Update + Re-engagement ลูกค้าเก่า",
              },
            ],
          },
          {
            title: "หลักการ Content ใน Q2",
            steps: [
              {
                label:
                  "<strong>เริ่มจากปัญหาเสมอ:</strong> ทุกโพสต์เริ่มจากปัญหาลูกค้า - ไม่ใช่ฟีเจอร์ของเรา",
              },
              {
                label:
                  "<strong>สื่อสารในบริบทเศรษฐกิจ:</strong> เน้น \"ลดต้นทุนที่ซ่อนอยู่\" + \"หลักฐานป้องกันข้อพิพาท\"",
              },
              {
                label:
                  "<strong>Educational Content:</strong> เช่น \"5 ความผิดพลาดที่ผู้รับเหมารับสร้างบ้านมักเจอ\" - Build Trust ก่อนขาย",
              },
              {
                label:
                  "<strong>Success Story:</strong> ทุก Go-Live สำเร็จ -> ฝนสัมภาษณ์แจ๊พ/บอส -> เขียนเป็น Case Study ทันที",
              },
            ],
          },
        ],
      },
      {
        id: "ws8",
        navLabel: "Automation",
        navSubtitle: "Process & Build",
        emoji: "⚡",
        title: "WS8 — ระบบอัตโนมัติภายในทีม",
        subtitle: "Automation & Process: ลดงาน Routine >= 40 ชม./ไตรมาส",
        owners: ["เจมส์จิ (Lead)", "จ้อ (Contech Hub + ร่าง Process)", "เต้ (Build)"],
        sections: [
          {
            title: "แผน 3 Phase",
            steps: [
              {
                label:
                  "<strong>Phase 1 (เม.ย.):</strong> จ้อร่าง Process แต่ละ WS ใน Contech Hub | บอสเขียน SOP Onboarding 3 Package",
              },
              {
                label:
                  "<strong>Phase 2 (พ.ค.):</strong> Demo Self-booking + Auto Follow-up | Usage Alert -> แจ้งแจ๊พอัตโนมัติ | Weekly KPI Pull",
              },
              {
                label:
                  "<strong>Phase 3 (มิ.ย.):</strong> Transformation Template >= 1 ชุด (แนะนำ: Solar EPC Workflow)",
              },
            ],
            callouts: [
              {
                type: "danger",
                icon: "🎫",
                title: "กฎเหล็ก: ไม่มี Ticket ไม่มีงาน",
                body: "งานทุกชิ้นที่ส่งให้เต้ต้องผ่านระบบ Ticket โดยมีเจมส์จิหรือเอกจัด Priority เท่านั้น <strong>ห้ามสั่งปากเปล่าหรือทาง LINE โดยตรง</strong>",
              },
            ],
          },
        ],
      },
    ],
    team: [
      {
        name: "จ้อ",
        role: "Head of Contech & Principal Consultant",
        engine: "lead",
        action: "ปิด Corp Deals + Chair WIP Review ทุกศุกร์ + ร่าง Process ใน Contech Hub",
      },
      {
        name: "เติ้ล",
        role: "Business Development Manager",
        engine: "hunter",
        action: "Present Group Demo ตาม Segment + ติดตามดีลใน Jubili + Corp Outbound 5 ราย/สัปดาห์ (ถ้า Pipeline ไม่พอ)",
      },
      {
        name: "ฝน",
        role: "Growth & Content Marketer",
        engine: "hunter",
        action: "ผลิต Content Problem-first + วิดีโอ Demo Segment + สัมภาษณ์ Case Study ทุก Go-Live",
      },
      {
        name: "แจ๊พ",
        role: "Customer Success & Implementation Manager",
        engine: "farmer",
        action: "Health Check ลูกค้า Q1 ทุกราย (เม.ย.) + Switch ไป Account Review + เป้า Upsell 2 ดีล/เดือน ตั้งแต่ พ.ค.",
      },
      {
        name: "บอส",
        role: "Implementation Specialist",
        engine: "farmer",
        action: "เขียน SOP Onboarding 3 Package ก่อนสิ้น เม.ย. + เตรียม Demo Data ตาม Segment ให้เติ้ล",
      },
      {
        name: "เอก",
        role: "Product Owner (Contech)",
        engine: "innovation",
        action: "จัด Roadmap Q2-Q3 ที่โยงกับ Sales Impact + Release Note ทุก Sprint ให้ฝน",
      },
      {
        name: "เจมส์จิ",
        role: "Innovation & Data Solution Architect",
        engine: "innovation",
        action: "Lead WS8 Automation + เข้าร่วม Corp Proposal >= 2 ดีล + ทำ Transformation Template 1 ชุด",
      },
      {
        name: "เต้",
        role: "Junior Software & Solution Engineer",
        engine: "innovation",
        action: "Setup Self-booking Demo + Auto Follow-up Sequence + Usage Alert (รับงานผ่าน Ticket เท่านั้น)",
      },
    ],
    keyMessages: [
      {
        segment: "🏠 รับสร้างบ้าน",
        message: "ป้องกันการจ่าย Sub-con เกินงาน + มีหลักฐาน QC ส่ง Owner ได้ทันที - ตกบ้านละ ~1,000 บาทเท่านั้น",
        accentColor: "blue",
      },
      {
        segment: "🎨 Interior / Renovation",
        message: "ลูกค้าโทรตามความคืบหน้าน้อยลง + มีหลักฐาน Before/After ป้องกันข้อพิพาทหลังงานเสร็จ",
        accentColor: "green",
      },
      {
        segment: "☀️ Solar EPC Contractor",
        message: "บริหารหลายไซต์งานพร้อมกัน + มีหลักฐาน Photo ครบสำหรับขออนุมัติ MEA - ไม่ต้องรอเงินงวดสุดท้าย",
        accentColor: "amber",
      },
      {
        segment: "🏗️ Main Contractor",
        message: "PM รู้สถานะงานจริง Real-time - ไม่ต้องรอรายงานสิ้นวัน ป้องกัน Sub-con เบิกเงินเกินเนื้องาน",
        accentColor: "purple",
      },
      {
        segment: "🏢 Developer / องค์กร",
        message: "ผู้บริหารดูสถานะทุกไซต์งานแบบ Real-time - ไม่ต้องรอรายงานสิ้นเดือนอีกต่อไป",
        accentColor: "red",
      },
    ],
    rituals: [
      {
        name: "Weekly Pipeline Review",
        nameTH: "ทบทวน Pipeline รายสัปดาห์",
        frequency: "ทุกจันทร์เช้า",
        participants: "เติ้ล + ฝน + แจ๊พ + จ้อ",
        goal: "Pipeline Coverage + ดีลติดขัด + ขอ Support",
      },
      {
        name: "WIP Go-Live Review",
        nameTH: "ติดตามงานรอรับรู้รายได้",
        frequency: "ทุกศุกร์",
        participants: "จ้อ + แจ๊พ",
        goal: "ปลดบล็อก WIP + ป้องกันรายได้ Slip ออกจาก Q2",
      },
      {
        name: "Weekly Product Sync",
        nameTH: "ซิงค์ทีมพัฒนารายสัปดาห์",
        frequency: "ทุกสัปดาห์",
        participants: "เอก + เจมส์จิ + เต้ + บอส",
        goal: "อัปเดต Roadmap + Feedback จากหน้างาน",
      },
      {
        name: "Monthly Business Review",
        nameTH: "ทบทวนภาพรวมธุรกิจรายเดือน",
        frequency: "เดือนละครั้ง",
        participants: "ทีมทั้งหมด",
        goal: "P&L + Hero Case + KPI vs เป้า",
      },
    ],
    weeklyAgenda: [
      "Pipeline Coverage: Biz Lane >= 3x เป้าเดือนถัดไป / Corp Lane >= 4x เป้าไตรมาส - ถ้าไม่พอทำอะไรทันที?",
      "ดีลติดขัด (Stuck Deals): ดีลไหนเกิน Aging Rule? แผนปลดบล็อกคืออะไร?",
      "ขอ Support: สัปดาห์นี้ต้องใช้จ้อหรือเอก กี่ชั่วโมง เพื่ออะไร?",
    ],
  },
  Q3: {
    quarter: "Q3",
    year: 2026,
    isActive: false,
    overview: {
      revenueTarget: "6.5 ล้านบาท",
      revenueBreakdown: "ก.ค. 1.8M / ส.ค. 2.0M / ก.ย. 2.7M",
      segmentFocus: "All Segments — The Real Peak",
      corpPipeline: ">= 4x เป้าไตรมาส",
      strategicFocus: "All Hands Push + Pre-Closing ล่วงหน้า",
    },
    workstreams: [],
    team: [],
    keyMessages: [],
    rituals: [],
    weeklyAgenda: [],
  },
  Q4: {
    quarter: "Q4",
    year: 2026,
    isActive: false,
    overview: {
      revenueTarget: "4.0 ล้านบาท",
      revenueBreakdown: "ต.ค. 1.0M / พ.ย. 1.8M / ธ.ค. 1.2M",
      segmentFocus: "Budget Season — Pre-buy 2027",
      corpPipeline: ">= 4x เป้าไตรมาส",
      strategicFocus: "Collection + ขายสัญญาปีหน้า (Prepaid)",
    },
    workstreams: [],
    team: [],
    keyMessages: [],
    rituals: [],
    weeklyAgenda: [],
  },
}

export function getDefaultQuarterKey() {
  return QUARTER_ORDER.find((quarter) => PLAYBOOK_DATA[quarter].isActive) ?? "Q2"
}
