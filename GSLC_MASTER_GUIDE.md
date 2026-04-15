# GSLC/NASHCO — Master Project Guide
> **READ THIS ENTIRE FILE BEFORE TOUCHING ANY CODE.**
> This is the single source of truth for the project. Any AI agent, developer, or collaborator must read this first, analyze the project, produce a status report, and wait for approval before doing anything.

---

## 🔴 GOLDEN RULES — NON-NEGOTIABLE

1. **Read before you write.** Always read the full file before editing it.
2. **Surgical edits only.** Never rewrite a whole component. Change only what needs to change.
3. **Run `npm run build` after every change.** If it fails, fix it before moving on.
4. **Never break existing logic.** If a feature works, do not touch it.
5. **One task at a time.** Complete and verify one step before starting the next.
6. **Report first, act second.** When starting fresh, produce a full status report and wait for human approval before writing any code.
7. **No placeholder components.** Every page built must be functional, not "Coming Soon".
8. **Enterprise standards always.** Every page must meet the UI/UX, security, and i18n checklist defined in this document.

---

## 📁 Project Overview

| Item | Value |
|---|---|
| **Project name** | GSLC / NASHCO |
| **Type** | Logistics & Shipping Management Platform |
| **Context** | PFE (Final Year Engineering Project) — to be demoed online to a jury |
| **Languages** | French (primary), English, Arabic (with RTL support) |
| **Backend** | Laravel 11 + Sanctum |
| **Frontend** | React 18 + TypeScript + Vite |
| **Key libraries** | TanStack Query, react-i18next, Tailwind CSS, react-router-dom |
| **Local path** | `C:\xampp\htdocs\GSLC` |
| **API base** | `/api` (Sanctum protected) |
| **SPA entry** | `resources/js/app.tsx` |
| **React pages** | `resources/js/pages/` |
| **i18n locales** | `resources/js/i18n/locales/` (fr.json, en.json, ar.json) |

---

## 🏗️ Architecture

```
GSLC/
├── app/
│   ├── Http/
│   │   ├── Controllers/         # All API controllers
│   │   ├── Middleware/          # Auth, roles, permissions, security headers
│   │   └── Requests/           # FormRequest validation classes
│   ├── Models/                 # 50+ Eloquent models
│   ├── Services/               # Business logic (SurestarieService, DeviseService, etc.)
│   └── Mail/                   # Email templates
├── resources/js/
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Toast, Modal, Skeleton, etc.
│   │   ├── auth/               # ProtectedRoute
│   │   └── layout/             # Navbar, Sidebar
│   ├── i18n/locales/           # fr.json, en.json, ar.json
│   ├── pages/                  # Feature pages per module
│   │   ├── admin/
│   │   ├── commercial/
│   │   ├── auth/
│   │   └── staff/
│   ├── services/               # Axios API calls
│   ├── hooks/                  # Custom React hooks
│   ├── contexts/               # AuthContext (user, role, niveau)
│   └── app.tsx                 # React Router config
├── routes/
│   ├── api.php                 # All REST endpoints
│   └── web.php                 # SPA entry point (single route)
└── database/migrations/        # All table schemas
```

---

## 👥 Role & Permission System

### Role Hierarchy

| Role | Niveau | Description |
|---|---|---|
| Admin / IT | 1 | Full system access |
| Directeur | 2 | Approvals, reporting, oversight |
| Responsable | 3 | Department head — full CRUD in their module |
| Agent | 4 | Operational — read + basic actions only |
| Secrétaire | 5 | Read-only + data entry |
| Client | — | External portal access only |

### Permission Gate Pattern (React)
```tsx
// Get from AuthContext — NEVER hardcode
const { user } = useAuth();
const canEdit = user?.role?.niveau <= 3;

// Apply on every action button
{canEdit && <button>Modifier</button>}
{canEdit && <button>Supprimer</button>}
{canEdit && <button>Approuver</button>}

// RULES:
// - ONE component per page — conditional rendering, not separate components
// - Do NOT block routes on the frontend
// - Real security = Laravel middleware (backend)
// - Frontend restriction = visual only (UX)
```

### Backend Middleware
- `auth:sanctum` — all protected routes
- `role:admin` / `role:commercial` / etc. — module access
- `permission:users.view` / `permission:users.create` / etc. — granular actions

---

## 🔐 Security Standards (Enterprise Level)

Every feature built must comply with ALL of the following:

### Authentication
- [x] Sanctum token auth
- [ ] Token expiry configured in `sanctum.php`
- [ ] Force token revocation on password change
- [ ] Concurrent session limit (1 active token per user)
- [ ] Login lockout after 5 failed attempts (15min block) → `LoginRateLimiter`
- [x] Force password change on first login

### API Security
- [ ] `SecurityHeadersMiddleware` (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)
- [ ] Per-route rate limiting: login 5/min, API 60/min, uploads 10/min
- [ ] CORS restricted to frontend domain only
- [ ] Request size limit (max 10MB)
- [x] SQL injection protection (Eloquent ORM)
- [ ] XSS input sanitization on all inputs
- [x] CSRF via Sanctum SPA

### File Upload Security
- [ ] Real MIME type validation (not just extension)
- [ ] File size limits per type (PDF: 10MB, image: 2MB)
- [ ] Filename sanitization (no path traversal)
- [ ] Store in `storage/app/private/` (never public/)
- [ ] Signed URLs for all downloads (time-limited)

### Authorization
- [x] Role middleware on all routes
- [x] Permission middleware (granular)
- [ ] Resource ownership check (user can only access their own records)
- [ ] Client data isolation (Client X cannot see Client Y's data)
- [ ] Admin impersonation logged to JournalAudit

### Audit & Monitoring
- [x] JournalAudit system exists
- [ ] All auth events logged (login, logout, failed attempts)
- [ ] All destructive actions logged (delete, restore, approve)
- [ ] 403 denials logged to audit
- [ ] Suspicious login alert (10+ failures → email admin)

### Production Hardening
- [ ] HTTPS enforced
- [ ] `APP_DEBUG=false` in production `.env`
- [ ] `.env` in `.gitignore` (verify — never commit secrets)
- [ ] Security headers middleware active
- [ ] DB port closed to public (only app connects)
- [ ] No hardcoded secrets in code

### Frontend Security
- [ ] No sensitive data in localStorage (tokens in memory or httpOnly cookies)
- [ ] API errors never expose internals (generic messages to user)
- [ ] `SessionTimeoutModal` global component (warns 2min before expiry)
- [ ] DOMPurify on any field rendering HTML
- [ ] Axios interceptor handles 401/403/429 globally

---

## 🗑️ Corbeille (Trash / Soft Delete System)

Every module uses the Corbeille instead of hard deletes.

### Database Schema
```sql
CREATE TABLE corbeille (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  module        VARCHAR(100) NOT NULL,     -- 'users', 'clients', 'contracts', etc.
  record_id     BIGINT UNSIGNED NOT NULL,  -- original ID in its table
  data          JSON NOT NULL,             -- full snapshot of deleted record
  deleted_by    BIGINT UNSIGNED NOT NULL,  -- user_id who deleted
  deleted_at    TIMESTAMP NOT NULL,
  expires_at    TIMESTAMP NOT NULL,        -- deleted_at + 30 days
  restored_at   TIMESTAMP NULL DEFAULT NULL
);
-- Note: No created_at/updated_at — deleted_at and restored_at serve those purposes
```

### Laravel Trait
```php
// Drop into any model with one line:
use HasCorbeille;

// This automatically:
// 1. Intercepts delete() calls
// 2. Snapshots the record to corbeille
// 3. Soft-deletes the original
// 4. Sets expires_at = now() + 30 days
```

### React Corbeille Page
- Shared UI used by all modules
- Filterable by module
- Restore button (Responsable only — niveau <= 3)
- Force delete button (Admin only — niveau <= 1)
- Auto-expires shown as countdown

---

## 🌐 i18n / RTL Standards

- **All text must use `t('key')` — never hardcode strings**
- **Arabic DB values must NOT be passed through `t()`** — display raw from DB
- **RTL switching**: inject `dir="rtl"` on `<html>` when language is `ar`
- **Every new translation key** must be added to fr.json, en.json, AND ar.json
- **Translation file sizes**: fr ~24KB, en ~22KB, ar ~31KB

```tsx
// CORRECT
<p>{t('users.title')}</p>

// WRONG — Arabic DB values must not be translated
<p>{t(user.nom_role)}</p>  // ❌ renders as ???????
<p>{user.nom_role}</p>     // ✅ raw DB value
```

---

## ✅ Per-Page Build Checklist

Every single page built must have:

### Backend
- [ ] Routes in `api.php` with correct middleware (`auth:sanctum`, role, permission)
- [ ] Controller with `FormRequest` validation
- [ ] Resource ownership check
- [ ] Soft delete → writes to `corbeille` table via `HasCorbeille` trait
- [ ] All mutating actions logged to `JournalAudit`
- [ ] Rate limiting on mutating endpoints

### Frontend
- [ ] TanStack Query for all data fetching (no raw useEffect for API calls)
- [ ] Loading skeletons (not spinners)
- [ ] Empty state with action button
- [ ] Error boundary / error state
- [ ] Toast notifications for all operations (success + error)
- [ ] Confirmation modal before any destructive action
- [ ] `canEdit` permission gate on ALL action buttons
- [ ] Full FR/EN/AR translations (all keys in all 3 files)
- [ ] RTL layout works correctly
- [ ] Responsive (mobile-friendly — jury may test on phone)
- [ ] Generic error messages (never raw API errors shown to user)

---

## 🚀 Three Core Innovations (Jury will ask about these)

### Innovation 1 — 🔄 Dynamic Multi-Path Workflow Engine
**What it does:** Instead of a single linear workflow, GSLC automatically selects the process path based on cargo type.

| Cargo Type | Description |
|---|---|
| Standard | Normal import process |
| Réfrigéré | Cold chain requirements added |
| Dangereux | Safety checks + regulatory steps added |
| Urgent | Accelerated path, fewer steps |

**Current status:** `WorkflowService.php` exists with linear logic. `Workflow` and `InstanceWorkflow` models exist. **Cargo type branching is NOT yet implemented.**

**What needs to be built:**
1. Add `type_cargo` enum to container/workflow tables
2. Add `RègleWorkflow` model with branching logic
3. Update `WorkflowService` to select path based on `type_cargo`
4. Build frontend workflow timeline visualization component

**Jury question to prepare:** *"How does the system know which path to take?"*
**Answer:** The cargo type on the container triggers a rule lookup in `RègleWorkflow` that maps to a specific ordered sequence of `EtapeWorkflow` steps.

---

### Innovation 2 — 🧠 Predictive Risk Scoring
**What it does:** Clients are scored LOW → MEDIUM → HIGH → CRITICAL based on behavior history, anticipating problems before they happen.

**Score factors:**
- Payment delay history (from `Facture` / `Paiement` tables)
- Frequency of surestarie (demurrage) incidents
- Port congestion seasonality

**Current status:** `score_risque` column exists in `clients` table. `DirecteurController` groups clients by score. **No calculation logic exists — field is static/manual.**

**What needs to be built:**
1. `RiskScoringService` — rule-based calculation engine
2. Scoring weights (e.g., +20 per late payment, +50 per litigation)
3. Scheduled job (nightly recalculation)
4. Event-driven trigger (recalculate on invoice payment)
5. Score badges visible across all relevant dashboards

**Jury question to prepare:** *"Is this real ML or rule-based?"*
**Answer:** Rule-based scoring — fully explainable, auditable, and appropriate for the domain. Each weight is justified by industry logistics standards.

---

### Innovation 3 — 🌐 Multi-Source Integration
**What it does:** GSLC connects to external data sources instead of being a closed silo.

| Source | Status | Details |
|---|---|---|
| Currency rates (EUR/USD/DZD) | ✅ DONE | `DeviseService` hits `cdn.jsdelivr.net` (Currency-API), cached 6h |
| Port data / ship manifests | ❌ NOT STARTED | Manual entry only, no external API |
| Document management (BL, invoices) | ⚠️ PARTIAL | Upload exists, no OCR/parsing |

**What needs to be built:**
1. Wire `NavireController` to a Marine API (MarineTraffic or free VesselFinder)
2. Automated manifest (EDI/XML) parsing into `Manifeste` model
3. Port arrival auto-detection

**Jury question to prepare:** *"Which external APIs do you call?"*
**Answer:** Currency-API (live rates), and [Marine API name] for vessel tracking and port calls.

---

## 📊 Module Completion Status

| Module | Backend | Frontend | Overall |
|---|---|---|---|
| **Authentication** | ✅ 100% | ✅ 100% | **DONE** |
| **Admin** | ✅ 100% | ✅ 95% | **DONE** |
| **Commercial** | ✅ 100% | ⚠️ 60% | **IN PROGRESS** |
| **Logistique** | ✅ 80% | ❌ 0% | **FRONTEND MISSING** |
| **Finance** | ✅ 70% | ❌ 0% | **FRONTEND MISSING** |
| **Directeur** | ✅ 60% | ❌ 0% | **FRONTEND MISSING** |
| **Client Portal** | ✅ 100% | ❌ 0% | **FRONTEND MISSING** |
| **i18n / RTL** | — | ✅ 95% | **DONE** |
| **Corbeille** | ❌ 0% | ❌ 0% | **NOT STARTED** |
| **Security Sprint** | ❌ 0% | ❌ 0% | **NOT STARTED** |
| **Workflow Engine (Innovation 1)** | ⚠️ 30% | ❌ 0% | **PARTIAL** |
| **Risk Scoring (Innovation 2)** | ⚠️ 10% | ❌ 0% | **NOT STARTED** |
| **Multi-Source API (Innovation 3)** | ⚠️ 40% | ❌ 0% | **PARTIAL** |

### Page Inventory

| Module | Page | Status |
|---|---|---|
| Auth | Login / Register / Forgot Password | ✅ EXISTS |
| Auth | ForcePasswordChange | ✅ EXISTS |
| Admin | AdminDashboard | ✅ EXISTS |
| Admin | AdminUsers | ✅ EXISTS |
| Admin | AdminRegistrations | ✅ EXISTS |
| Admin | AdminRoles / AdminPermissions | ✅ EXISTS |
| Admin | AuditPage | ✅ EXISTS |
| Admin | ConfigPage | ✅ EXISTS |
| Admin | DepartmentsPage / AdminPositions | ✅ EXISTS |
| Commercial | CommercialDashboard | ✅ EXISTS |
| Commercial | CommercialDemands | ✅ EXISTS |
| Commercial | CommercialClients | ✅ EXISTS |
| Commercial | CommercialQuotes | ⚠️ PLACEHOLDER |
| Commercial | CommercialContracts | ⚠️ PLACEHOLDER |
| Commercial | CommercialVessels | ⚠️ PLACEHOLDER |
| Logistique | LogistiqueDashboard | ❌ MISSING |
| Logistique | LogistiqueContainers | ❌ MISSING |
| Logistique | LogistiqueMovements | ❌ MISSING |
| Logistique | LogistiqueSurestarie | ❌ MISSING |
| Finance | FinanceDashboard | ❌ MISSING |
| Finance | FinanceInvoices | ❌ MISSING |
| Finance | FinancePayments | ❌ MISSING |
| Directeur | DirecteurDashboard | ❌ MISSING |
| Directeur | DirecteurApprovals | ❌ MISSING |
| Directeur | DirecteurReports | ❌ MISSING |
| Client | ClientDashboard | ❌ MISSING |
| Client | ClientDemands | ❌ MISSING |
| Client | ClientQuotes | ❌ MISSING |
| Client | ClientContracts | ❌ MISSING |
| Client | ClientInvoices | ❌ MISSING |
| Shared | CorbeilleManager | ❌ MISSING |

---

## 🗓️ Build Order (Recommended)

### Phase 0 — Security Sprint (DO THIS FIRST)
Build once, applies to everything after.

**Backend:**
1. `LoginRateLimiter` middleware — lockout after 5 failed attempts
2. `SecurityHeadersMiddleware` — HSTS, CSP, X-Frame-Options
3. Token revocation on password change
4. Concurrent session limit (1 active token per user)
5. `FormRequest` base classes for all modules
6. File upload security (MIME, size, signed URLs, private storage)
7. `ownsResource()` authorization trait
8. Per-route rate limiting groups
9. CORS lockdown to frontend domain
10. Suspicious login email alert

**Frontend:**
1. `SessionTimeoutModal` — global, warns 2min before expiry
2. `useApiError` hook — strips raw errors
3. DOMPurify integration
4. Axios interceptor hardening (401/403/429 handling)

**Corbeille system:**
1. Migration for `corbeille` table
2. `HasCorbeille` trait
3. `CorbeilleService`
4. `CorbeilleController`
5. `CorbeilleManager.tsx` React page

---

### Phase 1 — Complete All Module Frontends

Build in this order (backend already exists for all):

1. **Commercial** — Quotes, Contracts, Vessels pages
2. **Client Portal** — Dashboard, Demands, Quotes, Contracts, Invoices
3. **Logistique** — Dashboard, Containers, Movements, Surestarie
4. **Finance** — Dashboard, Invoices, Payments
5. **Directeur** — Dashboard, Approvals, Reports

---

### Phase 2 — Integrate the 3 Innovations

After all panels exist:

1. **Workflow Engine** — add cargo type branching + frontend timeline
2. **Risk Scoring** — build `RiskScoringService` + badges across dashboards
3. **Port Data API** — wire Marine API to NavireController

---

### Phase 3 — Final Phase Config Connections

1. Connect `system_config` DB values to Laravel runtime config
   - `app_name` → `config('app.name')` + Navbar.tsx
   - `smtp_*` → override mail config from DB
   - `maintenance_mode` → middleware check
   - `app_url` → `config('app.url')`
2. Build maintenance middleware
3. Connect notification toggles to email sending logic

---

### Phase 4 — Production Deployment

1. Provision VPS (Railway / Render / Hostinger)
2. Set `APP_DEBUG=false`, `APP_ENV=production`
3. Configure HTTPS + SSL certificate
4. Set CORS to production frontend URL
5. Configure production DB (not localhost)
6. Run migrations + seed demo data for jury
7. Final security audit pass
8. Load test (jury will test online)

---

## 🤖 Instructions for AI Agents Reading This File

**You are an AI coding agent working on the GSLC/NASHCO project.**

### Step 1 — Analyze the project (READ ONLY)
Read the following files before doing anything:
- `resources/js/app.tsx` — all defined routes
- `routes/api.php` — all backend endpoints
- `resources/js/pages/` — all existing pages
- `app/Http/Controllers/` — all controllers
- `app/Models/` — key models
- `resources/js/i18n/locales/` — translation files

### Step 2 — Produce a status report
Write a report covering:
1. Which pages in the Page Inventory above are actually built vs missing
2. Which security items in the Security Standards section are implemented
3. Which build phase we are currently in (Phase 0, 1, 2, 3, or 4)
4. Any bugs, broken logic, or regressions you detect
5. What the next logical step is according to the Build Order

**Format your report as:**
```
## Current Phase: [Phase X — Name]
## Last Completed Step: [description]
## Issues Found: [list with file:line references]
## Recommended Next Step: [specific task]
## Estimated Files to Touch: [list]
```

### Step 3 — WAIT
Do not write, edit, or create any file until the human reads your report and explicitly tells you to proceed.

### Step 4 — Execute (only after approval)
- Apply surgical targeted edits only
- Never rewrite whole components
- Run `npm run build` after every change
- Report result after each file touched

---

## 🔧 Common Patterns & Code Snippets

### TanStack Query (standard fetch pattern)
```tsx
const { data, isLoading, isError } = useQuery({
  queryKey: ['module', 'resource'],
  queryFn: () => apiService.getResource(),
});

if (isLoading) return <SkeletonLoader />;
if (isError) return <ErrorState />;
if (!data?.length) return <EmptyState />;
```

### Toast Notification
```tsx
import { toast } from '@/components/ui/Toast';
toast.success(t('common.saved'));
toast.error(t('common.error'));
```

### Confirmation Modal
```tsx
const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

{confirmDelete && (
  <ConfirmModal
    message={t('common.confirmDelete')}
    onConfirm={() => handleDelete(confirmDelete)}
    onCancel={() => setConfirmDelete(null)}
  />
)}
```

### Permission Gate
```tsx
const { user } = useAuth();
const canEdit = user?.role?.niveau <= 3;
const isAdmin = user?.role?.niveau <= 1;
```

### RTL-aware class
```tsx
const { i18n } = useTranslation();
const isRTL = i18n.language === 'ar';

<div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
```

---

*Last updated: April 2026 — maintained by project owner*
*Any agent modifying this file must update the "Last updated" date and add a changelog entry below.*

## Changelog
| Date | Change | By |
|---|---|---|
| April 2026 | Initial master guide created | Claude (Anthropic) |
