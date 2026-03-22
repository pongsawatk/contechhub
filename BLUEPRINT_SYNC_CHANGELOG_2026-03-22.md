# Blueprint Sync Changelog — 2026-03-22

## What changed

- Hardened internal GET APIs for KPI, Revenue, Pipeline, and Customer so they now enforce `admin` / `bu_member` access at the API layer.
- Restricted quote detail lookup to authorized BU roles and validated that the requested record belongs to the Quotes database.
- Aligned Revenue property names in code with the live Notion schema:
  - `Booking Amount (THB)`
  - `Recognized Amount (THB)`
  - `Go-live Date`
  - `Note / Blocker`
- Implemented quote reopen / hydration from `?quote=` for quotes saved after this sync by persisting calculator state with each saved quote.
- Cleared the two lint warnings in `StepServices.tsx` and `ExcelImportModal.tsx`.

## User-facing impact

- The Blueprint page in Notion now matches the current repository state after the hardening pass.
- Saved quotes can now reopen directly into the calculator flow when they were created with the current quote-state format.
- Revenue, KPI, and Pipeline data are no longer readable through internal GET endpoints by any authenticated user.

## Verification

- `npm run lint` — passed
- `npm run build` — passed

## Follow-up note

- Legacy quote records that were saved before calculator-state persistence may still open without full form hydration. A backfill is optional, not blocking.
