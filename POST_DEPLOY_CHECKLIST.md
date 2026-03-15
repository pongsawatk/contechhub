# Post-Deploy Checklist

## Azure Portal (do this immediately after first deploy)
Add production Redirect URI:
  https://contech-hub.vercel.app/api/auth/callback/microsoft-entra-id
  (localhost one already exists - do not remove it)

## Auth Tests
[ ] https://contech-hub.vercel.app -> redirects to /login
[ ] Login with Builk Microsoft account in Users DB -> reaches /dashboard
[ ] Login with email NOT in Users DB -> /unauthorized
[ ] Nav shows only: ราคา, คิดราคา (KPI/Revenue/Chatbot hidden)

## Pricing Tests
[ ] /dashboard/pricing loads correctly
[ ] Builk Insite tab: Lite -> Business -> Professional -> Enterprise order
[ ] Infrastructure section appears below packages
[ ] Key Inclusions split by " | " (not comma)

## Calculator Tests
[ ] Insite Pro + 360 Pro -> Super Combo 10% triggers
[ ] Business + 4 add-ons -> Productivity Pack hint appears
[ ] Discount > 10% -> Approval Required warning
[ ] Save quote -> appears in Notion Quote Sessions DB

## Share
Send URL to all 8 team members listed in Users & Access Notion DB.
