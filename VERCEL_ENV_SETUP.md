# Vercel Environment Variables
# Add all of these in: Vercel Dashboard -> Project -> Settings -> Environment Variables
# Select: Production + Preview + Development for each

AUTH_SECRET=              # generate: openssl rand -base64 32
AUTH_URL=                 # https://contech-hub.vercel.app

AZURE_AD_CLIENT_ID=       # from Azure Portal -> App registrations -> Contech Hub
AZURE_AD_CLIENT_SECRET=   # ROTATE THIS - get new value from Azure Portal
AZURE_AD_TENANT_ID=       # from Azure Portal

NOTION_TOKEN=             # from notion.so/my-integrations
NOTION_USERS_DB_ID=4583b5d9-6624-4538-b60e-63789a1ae7ff
NOTION_PRICING_DB_ID=90c2223b-72da-43c4-a0fe-a50144149c68
NOTION_KPI_DB_ID=ca73b73e-afb4-4d94-a77a-df6fc276f3e8
NOTION_REVENUE_DB_ID=f34a46f4-9eff-4ef2-a84f-df28604fdcd3
NOTION_PRODUCTS_DB_ID=d0a39040-925a-4300-a482-29582c98522f
NOTION_KNOWLEDGE_DB_ID=40c064b6-6512-4a91-b63e-13b36d55db53
NOTION_QUOTES_DB_ID=cd894e76-44ee-40bd-b172-dba4e27b97da
NOTION_SALES_MATERIALS_DB_ID=793a63d8-2bfd-4b45-a30c-c247e5f2d53b
