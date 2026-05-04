# phases.md — GSLC / NASHCO Build Phases
> This file defines the exact execution order for the remaining project work.
> Claude Code reads this file at the start of every session to know what to do next.
> Do not skip phases. Do not merge phases. Complete and validate each one before starting the next.
> Current progress is tracked in `status.md`.

---

## How Phases Work

Each phase has:
- **Objective** — what gets built
- **Tasks** — granular steps in order
- **Gate 1** — human tests manually after each task (Claude Code tells you exactly what to click)
- **Gate 2** — Claude Code runs the browser autonomously at phase end, produces pass/fail QA report
- **Done criteria** — the phase is not done until every item is checked

---

## 🔴 Phase 1 — Commercial: Quotes

**Objective:** Build CommercialQuotes — full CRUD, connected to real backend.

**Tasks:**
1. Read `routes/api.php` — identify all `/commercial/quotes` endpoints
2. Read existing commercial pages to extract the UI pattern used in this module
3. Add all required translation keys to `fr.json`, `en.json`, `ar.json`
4. Create `resources/js/services/quotesService.ts`
5. Build `CommercialQuotes.tsx` — list with TanStack Query, skeleton, empty state, error state
6. Add create/edit modal with validation and toast feedback
7. Add delete with confirmation modal → Corbeille
8. Add `canEdit` permission gates on all action buttons
9. Add route to `app.tsx`
10. Run `npm run build` — 0 errors
11. Produce Task Report + Gate 1 checklist

**Gate 2 QA (Claude Code runs browser):**
- [ ] Page loads with skeleton then data
- [ ] Empty state shown when no quotes exist
- [ ] Create form validates, submits, shows success toast
- [ ] Edit loads existing data, updates correctly
- [ ] Delete → confirmation modal → Corbeille → success toast
- [ ] Action buttons hidden for niveau > 3
- [ ] FR / EN / AR — no broken keys
- [ ] RTL correct in Arabic
- [ ] Mobile responsive

**Done criteria:** All Gate 2 items pass with evidence. Build at 0 errors.

---

## 🔴 Phase 2 — Commercial: Contracts

**Objective:** Build CommercialContracts — full CRUD, connected to real backend.

**Tasks:**
1. Read `routes/api.php` — identify all `/commercial/contracts` endpoints
2. Add all translation keys to all 3 locale files
3. Create `resources/js/services/contractsService.ts`
4. Build `CommercialContracts.tsx` — list with status badges (actif / expiré / résilié)
5. Add create/edit form with client selector and date fields
6. Add delete → Corbeille
7. Add permission gates
8. Add route to `app.tsx`
9. Run `npm run build` — 0 errors
10. Produce Task Report + Gate 1 checklist

**Gate 2 QA:**
- [ ] Page loads with skeleton then data
- [ ] Status badges display correctly per state
- [ ] Create/edit works end-to-end
- [ ] Delete → Corbeille works
- [ ] Permission gates correct per role
- [ ] FR / EN / AR — no broken keys, RTL correct, mobile responsive

**Done criteria:** All Gate 2 items pass with evidence. Build at 0 errors.

---

## 🔴 Phase 3 — Commercial: Vessels + Full Module QA

**Objective:** Build CommercialVessels, then run full Commercial module Gate 2 QA.

**Tasks:**
1. Read `routes/api.php` — identify all `/commercial/vessels` or `/navires` endpoints
2. Add all translation keys to all 3 locale files
3. Create `resources/js/services/vesselsService.ts`
4. Build `CommercialVessels.tsx` — list with vessel status indicators
5. Add create/edit form
6. Add delete → Corbeille
7. Add permission gates
8. Add route to `app.tsx`
9. Run `npm run build` — 0 errors
10. Produce Task Report + Gate 1 checklist
11. **Full Commercial Module Gate 2 QA** — browser through ALL commercial pages

**Gate 2 QA (full module):**
- [ ] All commercial pages load correctly
- [ ] All CRUD operations work on all pages
- [ ] Sidebar navigation between commercial pages works
- [ ] Role-based visibility correct on all pages
- [ ] No console errors on any page
- [ ] FR / EN / AR — no broken keys on all pages
- [ ] RTL correct on all pages
- [ ] Mobile responsive on all pages

**Done criteria:** Full module QA clean. Zero failures. Build at 0 errors. Only then move to Phase 4.

---

## 🟡 Phase 4 — Client Portal: Dashboard + Demands

**Objective:** Build Client Portal foundation — dashboard and demands.

**Tasks:**
1. Read `routes/api.php` — identify all `/client` endpoints
2. Verify `ProtectedRoute` handles Client role correctly
3. Add all translation keys to all 3 locale files
4. Create `resources/js/services/clientService.ts`
5. Build `ClientDashboard.tsx` — summary cards (active demands, pending quotes, open invoices)
6. Build `ClientDemands.tsx` — this client's demands only (data isolation enforced)
7. Add routes to `app.tsx`
8. Run `npm run build` — 0 errors
9. Produce Task Report + Gate 1 checklist

**Gate 2 QA:**
- [ ] Client role cannot access Admin or Commercial pages
- [ ] Dashboard shows only logged-in client's data
- [ ] Demands list shows only this client's records — not others
- [ ] FR / EN / AR — no broken keys, RTL correct, mobile responsive

**Done criteria:** Gate 2 clean. Build at 0 errors.

---

## 🟡 Phase 5 — Client Portal: Quotes + Contracts + Invoices + Full QA

**Objective:** Complete the Client Portal, then run full Gate 2 QA.

**Tasks:**
1. Add all translation keys to all 3 locale files
2. Build `ClientQuotes.tsx` — read-only list for this client
3. Build `ClientContracts.tsx` — read-only list for this client
4. Build `ClientInvoices.tsx` — invoices with payment status
5. Add routes to `app.tsx`
6. Run `npm run build` — 0 errors
7. Produce Task Report + Gate 1 checklist
8. **Full Client Portal Gate 2 QA**

**Gate 2 QA (full module):**
- [ ] All client pages load correctly
- [ ] No page exposes another client's data
- [ ] No forbidden action buttons visible
- [ ] Quotes, Contracts, Invoices read-only where required
- [ ] No console errors
- [ ] FR / EN / AR correct, RTL correct, mobile responsive

**Done criteria:** Full module QA clean. Zero failures. Build at 0 errors.

---

## 🟠 Phase 6 — Logistique: Dashboard + Containers

**Objective:** Build Logistique Dashboard and Containers pages.

**Tasks:**
1. Read `routes/api.php` — identify all `/logistique` endpoints
2. Add all translation keys to all 3 locale files
3. Create `resources/js/services/logistiqueService.ts`
4. Build `LogistiqueDashboard.tsx` — KPI cards (active containers, movements today, surestarie alerts)
5. Build `LogistiqueContainers.tsx` — list with container status and cargo type badge
6. Add create/edit form
7. Add delete → Corbeille
8. Add permission gates
9. Add routes to `app.tsx`
10. Run `npm run build` — 0 errors
11. Produce Task Report + Gate 1 checklist

**Gate 2 QA:**
- [ ] Dashboard KPIs load with real data
- [ ] Containers list loads with status badges
- [ ] CRUD works end-to-end
- [ ] Permission gates correct
- [ ] FR / EN / AR correct, RTL correct

**Done criteria:** Gate 2 clean. Build at 0 errors.

---

## 🟠 Phase 7 — Logistique: Movements + Surestarie + Full QA

**Objective:** Complete Logistique module, run full Gate 2 QA.

**Tasks:**
1. Add all translation keys to all 3 locale files
2. Build `LogistiqueMovements.tsx` — movement log per container, filterable by date/container
3. Build `LogistiqueSurestarie.tsx` — demurrage tracking, days overdue, cost calculation
4. Add routes to `app.tsx`
5. Run `npm run build` — 0 errors
6. Produce Task Report + Gate 1 checklist
7. **Full Logistique Module Gate 2 QA**

**Gate 2 QA (full module):**
- [ ] All 4 pages load correctly
- [ ] Movement log filters work
- [ ] Surestarie calculations are correct
- [ ] All CRUD and permission gates work
- [ ] No console errors
- [ ] FR / EN / AR correct, RTL correct, mobile responsive

**Done criteria:** Full module QA clean. Zero failures. Build at 0 errors.

---

## 🔵 Phase 8 — Finance: Full Build + QA

**Objective:** Build all Finance pages.

**Tasks:**
1. Read `routes/api.php` — identify all `/finance` endpoints
2. Add all translation keys to all 3 locale files
3. Create `resources/js/services/financeService.ts`
4. Build `FinanceDashboard.tsx` — revenue KPIs, payment status summary, overdue alerts
5. Build `FinanceInvoices.tsx` — invoice list with status (payée / en attente / en retard)
6. Build `FinancePayments.tsx` — payment log linked to invoices
7. Add routes to `app.tsx`
8. Run `npm run build` — 0 errors
9. Produce Task Report + Gate 1 checklist
10. **Full Finance Module Gate 2 QA**

**Gate 2 QA (full module):**
- [ ] All 3 pages load with real data
- [ ] Invoice status badges correct
- [ ] Payment creation links to correct invoice
- [ ] Permission gates correct
- [ ] No console errors
- [ ] FR / EN / AR correct, RTL correct, mobile responsive

**Done criteria:** Full module QA clean. Zero failures. Build at 0 errors.

---

## 🔵 Phase 9 — Directeur: Full Build + QA

**Objective:** Build all Directeur pages.

**Tasks:**
1. Read `routes/api.php` — identify all `/directeur` endpoints
2. Add all translation keys to all 3 locale files
3. Create `resources/js/services/directeurService.ts`
4. Build `DirecteurDashboard.tsx` — cross-module KPIs, risk score summary, pending approvals count
5. Build `DirecteurApprovals.tsx` — pending items awaiting sign-off
6. Build `DirecteurReports.tsx` — exportable reports (PDF or print view)
7. Add routes to `app.tsx`
8. Run `npm run build` — 0 errors
9. Produce Task Report + Gate 1 checklist
10. **Full Directeur Module Gate 2 QA**

**Gate 2 QA (full module):**
- [ ] All 3 pages load with real data
- [ ] Approvals can be approved or rejected with audit log entry
- [ ] Reports render and are exportable
- [ ] Only niveau <= 2 can access these pages
- [ ] No console errors
- [ ] FR / EN / AR correct, RTL correct, mobile responsive

**Done criteria:** Full module QA clean. Zero failures. Build at 0 errors.

---

## 🟣 Phase 10 — Corbeille System: Full Build + QA

**Objective:** Build the shared Corbeille (soft delete manager).

**Tasks:**
1. Verify `corbeille` migration exists — if not, create it
2. Verify `HasCorbeille` trait exists — if not, create it
3. Verify `CorbeilleController` exists with restore + force-delete endpoints
4. Add all translation keys to all 3 locale files
5. Build `CorbeilleManager.tsx` — filterable by module, expiry countdown per record
6. Add restore button — Responsable only (niveau <= 3)
7. Add force-delete button — Admin only (niveau <= 1)
8. Add route to `app.tsx`
9. Test with records from at least 2 different modules
10. Run `npm run build` — 0 errors
11. Produce Task Report + Gate 1 checklist

**Gate 2 QA:**
- [ ] Deleted records from all modules appear in Corbeille
- [ ] Filter by module works
- [ ] Expiry countdown displays correctly
- [ ] Restore works — record reappears in its original module
- [ ] Force delete — Admin only
- [ ] Restore hidden for niveau > 3
- [ ] Force delete hidden for niveau > 1
- [ ] FR / EN / AR correct, RTL correct

**Done criteria:** Gate 2 clean. Build at 0 errors.

---

## 🟣 Phase 11 — Innovations: Workflow + Risk Scoring + Port API

**Objective:** Build the 3 jury-facing innovations.

### Innovation 1 — Dynamic Multi-Path Workflow Engine
1. Add `type_cargo` enum (Standard / Réfrigéré / Dangereux / Urgent)
2. Create `RègleWorkflow` model with branching logic
3. Update `WorkflowService` to select path based on `type_cargo`
4. Build frontend workflow timeline visualization component
5. Integrate timeline into relevant Logistique page

### Innovation 2 — Predictive Risk Scoring
1. Build `RiskScoringService` with rule-based scoring weights
2. Create scheduled job for nightly recalculation
3. Add event-driven trigger on invoice payment
4. Add risk score badges to CommercialClients, DirecteurDashboard, FinanceDashboard

### Innovation 3 — Port Data API
1. Wire `NavireController` to Marine API (MarineTraffic or VesselFinder free tier)
2. Display live vessel status on CommercialVessels page
3. Verify currency rate integration on Finance pages

**Gate 2 QA:**
- [ ] Workflow selects correct path for all 4 cargo types — demonstrate each
- [ ] Risk scores calculate and display on all dashboard badges
- [ ] Marine API returns vessel data and shows on Vessels page
- [ ] Currency rates load from external API

**Done criteria:** All 3 innovations demonstrable end-to-end. Build at 0 errors.

**Jury talking points:**
- *Workflow:* cargo type → `RègleWorkflow` lookup → ordered `EtapeWorkflow` steps
- *Risk scoring:* rule-based, explainable, auditable — industry standard weights
- *APIs:* Currency-API (live rates) + Marine API (vessel tracking)

---

## ⚫ Phase 12 — Security Sprint + Production Deployment

**Objective:** Harden security, deploy online before June 2.

### Security Sprint — Backend
- [ ] `LoginRateLimiter` — lockout after 5 failed attempts (15 min block)
- [ ] `SecurityHeadersMiddleware` — HSTS, CSP, X-Frame-Options
- [ ] Token revocation on password change
- [ ] Concurrent session limit (1 active token per user)
- [ ] File upload security — MIME validation, size limits, private storage
- [ ] `ownsResource()` authorization trait
- [ ] Per-route rate limiting groups
- [ ] CORS locked to production frontend URL
- [ ] Suspicious login alert (10+ failures → email admin)
- [ ] All auth events logged to JournalAudit
- [ ] All destructive actions logged

### Security Sprint — Frontend
- [ ] `SessionTimeoutModal` — warns 2 min before expiry, rendered in React tree (not body portal)
- [ ] `useApiError` hook — strips raw errors globally
- [ ] DOMPurify on all fields rendering HTML
- [ ] Axios interceptor hardening (401 / 403 / 429)
- [ ] No sensitive data in localStorage

### Production Deployment
1. Provision VPS (Railway / Render / Hostinger)
2. Set `APP_DEBUG=false`, `APP_ENV=production`
3. Configure HTTPS + SSL certificate
4. Set CORS to production frontend URL only
5. Configure production database
6. Run migrations + seed jury demo data
7. Final security audit — verify all checklist items above
8. Load test — multiple concurrent users

**Done criteria:** App live at public HTTPS URL. All security items checked. Jury demo data seeded. Build at 0 errors.

---

## Phase Summary

| Phase | Module | Priority | Status |
|---|---|---|---|
| 1 | Commercial — Quotes | — | ✅ Done |
| 2 | Commercial — Contracts | — | ✅ Done |
| 3 | Commercial — Vessels + finishing touches + Full QA | 🔴 Now | 🔄 In Progress |
| 4 | Client Portal — Dashboard + Demands | — | ✅ Done |
| 5 | Client Portal — Full Build + QA | — | ✅ Built — Gate 2 QA pending |
| 6 | Logistique — Dashboard + Containers | 🟠 Next | ⏳ |
| 7 | Logistique — Movements + Surestarie + Full QA | 🟠 Next | ⏳ |
| 8 | Finance — Full Build + QA | 🔵 After | ⏳ |
| 9 | Directeur — Full Build + QA | 🔵 After | ⏳ |
| 10 | Corbeille System | 🟣 After | ⏳ |
| 11 | Innovations (Workflow + Risk + Port API) | 🟣 After | ⏳ |
| 12 | Security Sprint + Deployment | ⚫ Final | ⏳ — Deadline June 2 |

---

*Last updated: May 2026*
*Update status column and `status.md` after completing each phase.*
