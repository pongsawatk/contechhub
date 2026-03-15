# Contech Hub Product Summary

Prepared from repository review on 2026-03-15

## 1. Executive Summary

Contech Hub is an internal web platform for the Contech BU that centralizes user access, pricing knowledge, and quote creation in one place. The current product is already functional through Phase 3 of the revised roadmap, with Phase 0 to Phase 3 implemented at different levels of completeness.

At this stage, the strongest parts of the product are:

- Microsoft SSO with internal user mapping and role-based route protection
- Pricing catalog display from Notion
- Multi-step pricing calculator with discount logic, approval flagging, quote save, copy summary, and PDF export

The main gaps are:

- KPI and Revenue are not yet delivered as working product modules
- Chatbot features are still placeholders
- Several APIs need stronger server-side authorization and data validation before broader rollout

## 2. Product Purpose

The product is designed to help Contech BU teams:

- access an internal workspace using Microsoft account login
- view current product/package pricing from a central data source
- calculate customer quotes using a guided form
- apply pricing rules and surface approval requirements
- save quote sessions back into Notion for tracking

In practical terms, this project is becoming the internal operating console for pricing and sales support.

## 3. Target Users

### Internal roles in current code

- `admin`
- `bu_member`
- `internal_viewer`

### Access behavior

- Only `@builk.com` accounts can sign in
- User access is mapped from the Notion Users database
- Inactive or unmapped users are denied access
- `internal_viewer` can access pricing and chatbot pages, but is blocked from calculator, KPI, and revenue pages

## 4. Current Scope by Phase

### Phase 0: Data foundation in Notion

Status: Completed

Implemented data sources already referenced in code:

- Users & Access
- Pricing
- KPI
- Revenue
- Quote Sessions

This confirms that Notion is currently the operational data backbone for the application.

### Phase 1: Microsoft SSO + user mapping

Status: Completed

Implemented capabilities:

- Microsoft Entra ID login
- domain restriction for `@builk.com`
- user lookup in Notion
- session enrichment with app role / BU membership / sales lane
- route protection through middleware

### Phase 2: Pricing display

Status: Completed

Implemented capabilities:

- pricing page under dashboard
- pricing data fetched from Notion
- filtering by visibility
- BU-aware visibility behavior
- categorized display by product and service type
- effective date / disclaimer style presentation

### Phase 3: Pricing calculator

Status: Completed as core workflow, with some hardening still needed

Implemented capabilities:

- form-first quote flow
- customer info and lane selection
- product/package/add-on selection
- pricing engine with business rules
- discount entry and approval warning when discount exceeds threshold
- quote summary panel
- copy-to-clipboard summary
- PDF/print export view
- quote save to Notion

Business rules currently visible in code:

- Super Combo discount
- Kickstarter 2-year prepaid offer
- Productivity Pack hint
- manual discount approval flag when discount is above 10%

### Phase 4: Revenue and KPI update

Status: Not delivered as a working user-facing module yet

Current state:

- KPI and Revenue helper/API functions exist
- KPI and Revenue pages are still placeholder screens
- source governance and access rules are not yet complete

### Phase 5: Pricing chatbot

Status: Placeholder only

Current state:

- dashboard route exists
- no active chatbot logic or model integration yet

### Phase 6: Staff chatbot

Status: Not implemented

Current state:

- related Notion environment variables exist for future knowledge sources
- no current application flow for staff chatbot

## 5. Current Product Capabilities

### What the product can do today

1. Authenticate internal users with Microsoft login
2. Check whether the user is active and mapped in Notion
3. Show pricing catalog by product area
4. Guide a BU user through quote creation
5. Calculate price totals and discount scenarios in real time
6. Flag approval-required scenarios
7. Save draft quotes into Notion
8. Export a printable quote sheet

### What is not fully done yet

1. KPI dashboard experience
2. Revenue dashboard experience
3. quote reload/share flow from saved quote id
4. chatbot functionality
5. production-grade access governance for sensitive APIs

## 6. Technology Stack Review

### Frontend

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS

### Authentication

- `next-auth` v5 beta
- Microsoft Entra ID provider

### Data / Backend integration

- Notion API as the primary system of record for current business data

### UI approach

- App Router pages + client/server component mix
- custom glassmorphism-style UI built on Tailwind utilities

### Strengths of the current stack

- fast to iterate for an internal business tool
- low infrastructure complexity
- pricing/content changes can be managed in Notion
- good fit for early product validation and BU rollout

### Risks / limitations of the current stack

- `next-auth` v5 beta adds some upgrade risk
- Notion is not ideal as a long-term transactional system for audit-heavy workflows
- limited validation boundary between client and server in current quote flow
- no automated tests found in the repository
- README is still mostly template content, so onboarding/documentation is still weak

## 7. Senior Developer Assessment

### Overall assessment

This is a solid Phase 3 internal product foundation. The team chose a pragmatic stack that is appropriate for speed and internal adoption. The product direction is clear, and the implemented pricing experience already has meaningful business value.

The next stage should not focus only on adding more features. It should focus on product hardening:

- server-side authorization
- server-side recalculation for quotes
- data governance for KPI/Revenue
- basic testing and operational readiness

If those are addressed, the project will be in a much healthier position for Phase 4 and future chatbot work.

## 8. Key Improvement Themes

### Theme A: Security and data governance

The biggest current risk is that some APIs are authenticated but not fully authorized by role and ownership rules.

### Theme B: Quote integrity

The quote save path currently trusts browser-submitted totals and should be moved to server-side validation/recalculation.

### Theme C: Product completeness

Dashboard navigation already exposes future modules, but KPI, Revenue, and Chatbot are not yet complete experiences.

### Theme D: Engineering maturity

The project needs tests, better operational logging discipline, and stronger documentation to support long-term maintenance.

## 9. Action Backlog

### High Impact

| ID | Action | Why it matters | Suggested owner |
| --- | --- | --- | --- |
| H1 | Add server-side authorization rules for KPI API | Prevent users from querying KPI data of other staff members | Backend |
| H2 | Add server-side authorization rules for Revenue API | Protect sensitive business revenue data by role/BU | Backend |
| H3 | Recalculate quote totals on the server before saving to Notion | Prevent manipulated client payloads from creating invalid quotes | Backend |
| H4 | Restrict quote detail lookup to valid quote records and permitted users | Prevent arbitrary Notion page access by id | Backend |
| H5 | Define source governance and access policy for Phase 4 data | Needed before KPI/Revenue can be safely released | Product + Data + Backend |

### Medium Impact

| ID | Action | Why it matters | Suggested owner |
| --- | --- | --- | --- |
| M1 | Implement quote reload/hydration by `quoteId` | Complete the share/reopen quote journey already implied by the URL behavior | Frontend + Backend |
| M2 | Store normalized quote breakdown fields in Notion | Improve reporting accuracy for quote sessions and downstream analytics | Backend |
| M3 | Remove production auth debug logging and PII-heavy console logs | Reduce noise and internal data exposure in logs | Backend |
| M4 | Separate pricing rules/configuration from UI logic more clearly | Make future rule changes safer and easier | Backend + Frontend |
| M5 | Replace placeholder KPI/Revenue screens with real role-aware views | Advance the product beyond Phase 3 into business usage | Frontend + Backend |

### Low Impact

| ID | Action | Why it matters | Suggested owner |
| --- | --- | --- | --- |
| L1 | Add unit tests for pricing engine rules | Protect business logic from regressions | Backend |
| L2 | Add E2E smoke tests for login, pricing, calculator, and save flow | Increase release confidence | QA / Frontend |
| L3 | Rewrite README with real setup, env, architecture, and Notion schema notes | Improve onboarding and maintenance | Engineering |
| L4 | Mark future modules more clearly as coming soon | Reduce user confusion from placeholder routes | Product + Frontend |

## 10. Immediate Recommended Next Sprint

Recommended priority order for the next sprint:

1. fix KPI/Revenue/Quote API authorization and validation
2. remove production auth debug logging
3. implement quote reload by saved id
4. prepare Phase 4 data governance rules
5. add initial automated tests around pricing engine and save flow

## 11. Conclusion

Contech Hub is already a meaningful internal product, not just a prototype. The implemented Phase 1 to Phase 3 scope delivers real operational value for pricing and quote generation. The project is now at the point where the highest return will come from hardening trust boundaries, tightening governance, and completing the next real business module rather than only expanding UI surface area.
