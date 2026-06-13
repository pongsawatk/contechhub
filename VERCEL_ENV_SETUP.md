# Vercel Environment Variables
# Add all of these in: Vercel Dashboard -> Project -> Settings -> Environment Variables
# Select: Production + Preview + Development for each
# Updated: 13 Jun 2026 — Chatbot migrated to OpenRouter (single OPENROUTER_API_KEY)

# --- Auth ---
AUTH_SECRET=              # generate: openssl rand -base64 32
AUTH_URL=                 # https://contech-hub.vercel.app

# --- Microsoft Entra ID ---
AZURE_AD_CLIENT_ID=       # Azure Portal -> App registrations -> Contech Hub
AZURE_AD_CLIENT_SECRET=   # ROTATE THIS - get new value from Azure Portal
AZURE_AD_TENANT_ID=       # Azure Portal

# --- Notion (token + DB IDs) ---
NOTION_TOKEN=             # ntn_... from notion.so/my-integrations
NOTION_USERS_DB_ID=4583b5d9-6624-4538-b60e-63789a1ae7ff
NOTION_PRICING_DB_ID=90c2223b-72da-43c4-a0fe-a50144149c68
NOTION_KPI_DB_ID=ca73b73e-afb4-4d94-a77a-df6fc276f3e8
NOTION_REVENUE_DB_ID=f34a46f4-9eff-4ef2-a84f-df28604fdcd3
NOTION_QUOTES_DB_ID=cd894e76-44ee-40bd-b172-dba4e27b97da
NOTION_CUSTOMER_DB_ID=6fc1abf0-869b-48d3-984f-0b1b6c3d5f90
NOTION_HOT_QUOTATION_DB_ID=3935d3e1-8444-4b76-9f7b-081bff2b6ccb
NOTION_SALES_ORDER_DB_ID=6ebe48d3-8670-4204-86d3-f91a5c03d9f8
NOTION_KNOWLEDGE_DB_ID=40c064b6-6512-4a91-b63e-13b36d55db53   # Phase 5 Chatbot KB source (50 verified entries)

# --- Phase 5 Chatbot (OpenRouter — single gateway for all models) ---
OPENROUTER_API_KEY=       # openrouter.ai/keys (sk-or-v1-...) - routes fast=gemini-2.5-flash, escalation=claude-sonnet-4.6
NOTION_CHAT_SESSIONS_DB_ID=ec0f3a1c-25c4-422f-9e49-d365a664577c
# GOOGLE_AI_API_KEY / ANTHROPIC_API_KEY — เลิกใช้แล้ว (M2 migrate ไป OpenRouter) ลบออกจาก Vercel ได้

# --- Lead Intake (Phase 7 - n8n automation) ---
NOTION_LEAD_INTAKE_DB_ID=f42e7db3-d025-4c04-82de-8d4ae790e23d

# --- มีใน .env แต่ยังไม่ถูกใช้ใน app flow ปัจจุบัน ---
NOTION_PRODUCTS_DB_ID=d0a39040-925a-4300-a482-29582c98522f
NOTION_SALES_MATERIALS_DB_ID=793a63d8-2bfd-4b45-a30c-c247e5f2d53b
