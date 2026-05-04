# CLAUDE.md — GSLC / NASHCO
> **READ THIS ENTIRE FILE BEFORE TOUCHING ANY CODE.**
> You are an AI coding agent working on the GSLC/NASHCO project.
> Analyze the project, produce a status report, and wait for approval before doing anything.

---

## 🔴 THE 15 GOLDEN RULES — NON-NEGOTIABLE

Violating any rule invalidates the task. No exceptions.

| # | Rule |
|---|---|
| 1 | **No raw API errors shown to users.** Always display a generic translated message. Never `setError(error.message)` and render it. |
| 2 | **No `useEffect` for data fetching.** TanStack Query only. Any `useEffect` calling an API is a violation. |
| 3 | **No component longer than 300 lines.** If a page exceeds 300 lines, split it into named subcomponents before continuing. |
| 4 | **Translation keys must exist in all 3 files before the component is built.** Add to `fr.json`, `en.json`, AND `ar.json` first. Never add "later." |
| 5 | **`npm run build` at zero errors = the only definition of "done."** A task is not done if the build fails or has TypeScript errors. |
| 6 | **Never create a new component without checking if one already exists.** Search `resources/js/components/` before creating anything. |
| 7 | **One page component per file. No exceptions.** Never bundle two pages in one file because "they are related." |
| 8 | **Never hardcode colors, spacing, or shadows.** Tailwind classes only. If a value is not in Tailwind defaults, it must be declared in `uidesign.md` as an approved custom value. |
| 9 | **API calls live in `/services/` only.** Never write `axios.get()` or `axios.post()` inside a page or component. |
| 10 | **When uncertain about scope — stop and ask. Never assume.** Uncertainty is not permission to expand scope. |
| 11 | **Gate 1 — Human validation after every task.** After every completed build or fix, tell the human exactly what to test (specific page, button, action, expected result), then stop completely and wait for confirmation before touching anything else. |
| 12 | **Gate 2 — Full autonomous module QA.** When an entire module is complete, use the browser tool to navigate every page, click every button, test every form, modal, toast, permission gate, empty state, and error state. Every claim in the QA report must be backed by a screenshot or console output. No evidence = UNTESTED, not PASS. Zero failures before moving to the next module. |
| 13 | **Every task produces a before/after audit report.** Format defined below. The accident log is mandatory — write "None" if clean, never omit it. |
| 14 | **Forbidden from touching out-of-scope files without explicit permission.** If a task requires modifying a file not listed in the initial plan, stop completely, name the file, explain why it is needed, and wait for the human to authorize it before touching it. |
| 15 | **Back up every existing file before modifying it.** New files created from scratch do not need a backup. Any existing file being modified gets backed up to `.backups/<ISO-8601-timestamp>/<original-filename>` before the first edit. |
| 16 | **Every completed task appends its full report to `report.md`.** Fixes and builds alike. Format: timestamp header + full report. Never summarize or truncate. If `report.md` does not exist, create it. This file is the permanent audit trail of the entire project. |

---

## 📋 Task Report Format

Every completed task — build or fix — must produce this report before Gate 1:

```
## Task Report — [Task Name]

### What was built / fixed
[Plain English — one paragraph]

### Files touched
| File | Action | Lines changed |
|---|---|---|
| path/to/file.tsx | Modified / Created | ~N lines |

### Before / After
[For every modified existing file — show exact before and after with reasoning]

**Before:**
[original code]

**After:**
[new code]

**Why:** [one sentence — reasoning for this specific change]

### Accident log
[Every line touched that was not required by the task — file name + line number + what changed]
— OR — None

### What to test (Gate 1)
1. Navigate to [specific URL]
2. Click [specific button / action]
3. Expected result: [what should happen]
4. Also verify: [edge case or permission check]

### Build status
npm run build — 0 errors ✅ / ❌ [list errors if any]
```

---

## 📁 Project Overview

| Item | Value |
|---|---|
| **Project name** | GSLC / NASHCO |
| **Type** | Logistics & Shipping Management Platform |
| **Context** | PFE (Final Year Engineering Project) — demoed online to jury |
| **Deadline** | June 2 — must be deployed and online |
| **Languages** | French (primary), English, Arabic (RTL) |
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
│   ├── Services/               # Business logic layer
│   └── Mail/                   # Email templates
├── resources/js/
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Toast, Modal, Skeleton, etc.
│   │   ├── auth/               # ProtectedRoute, SessionTimeoutModal
│   │   └── layout/             # Navbar, Sidebar
│   ├── i18n/locales/           # fr.json, en.json, ar.json
│   ├── pages/                  # Feature pages per module
│   │   ├── admin/
│   │   ├── commercial/
│   │   ├── auth/
│   │   ├── logistique/
│   │   ├── finance/
│   │   ├── directeur/
│   │   └── client/
│   ├── services/               # ALL API calls live here — nowhere else
│   ├── hooks/                  # Custom React hooks
│   ├── contexts/               # AuthContext (user, role, niveau)
│   └── app.tsx                 # React Router config
├── routes/
│   ├── api.php                 # All REST endpoints
│   └── web.php                 # SPA entry point
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
// Always get from AuthContext — NEVER hardcode role checks
const { user } = useAuth();
const canEdit = user?.role?.niveau <= 3;
const isAdmin = user?.role?.niveau <= 1;

// Apply on every action button
{canEdit && <button>Modifier</button>}
{canEdit && <button>Supprimer</button>}
{canEdit && <button>Approuver</button>}
```

**Rules:**
- ONE component per page — conditional rendering, not separate components
- Do NOT block routes on the frontend — real security lives in Laravel middleware
- Frontend role checks = visual/UX only

### Backend Middleware
- `auth:sanctum` — all protected routes
- `role:admin` / `role:commercial` / etc. — module access
- `permission:users.view` / `permission:users.create` / etc. — granular actions

---

## 🌐 i18n / RTL Standards

- **All UI text must use `t('key')` — never hardcode strings in JSX**
- **Arabic DB values must NOT pass through `t()`** — display raw from DB
- **RTL switching**: inject `dir="rtl"` on `<html>` when language is `ar`
- **Every new key** must be added to `fr.json`, `en.json`, AND `ar.json` before use

```tsx
// ✅ CORRECT
<p>{t('users.title')}</p>

// ❌ WRONG — Arabic DB values must not go through t()
<p>{t(user.nom_role)}</p>   // renders as ???????
<p>{user.nom_role}</p>       // ✅ raw DB value
```

---

## 🔐 Security Standards

Every feature built must comply with ALL of the following:

### Authentication
- Sanctum token auth
- Force password change on first login
- Session timeout modal (warns 2 min before expiry)
- Login lockout after 5 failed attempts (15 min block)

### API Security
- SecurityHeadersMiddleware on all routes
- Per-route rate limiting: login 5/min, API 60/min, uploads 10/min
- CORS restricted to frontend domain only
- SQL injection protection via Eloquent ORM
- CSRF via Sanctum SPA

### Authorization
- Role middleware on all routes
- Permission middleware (granular)
- Resource ownership check
- Client data isolation (Client X cannot see Client Y data)

### Frontend Security
- No sensitive data in localStorage
- API errors never expose internals — generic translated messages only (Rule 1)
- DOMPurify on any field rendering HTML
- Axios interceptor handles 401 / 403 / 429 globally

---

## 🗑️ Corbeille (Soft Delete System)

Every module uses Corbeille instead of hard deletes.

```php
// Drop into any model with one line:
use HasCorbeille;
// Automatically: intercepts delete(), snapshots to corbeille,
// soft-deletes original, sets expires_at = now() + 30 days
```

**React Corbeille Page rules:**
- Filterable by module
- Restore button: Responsable only (niveau <= 3)
- Force delete: Admin only (niveau <= 1)
- Auto-expire countdown shown per record

---

## ✅ Per-Page Build Checklist

Every page must pass ALL items before it is considered done:

### Backend
- [ ] Routes in `api.php` with correct middleware (`auth:sanctum`, role, permission)
- [ ] Controller with `FormRequest` validation
- [ ] Resource ownership check
- [ ] Soft delete → writes to `corbeille` via `HasCorbeille`
- [ ] All mutating actions logged to `JournalAudit`
- [ ] Rate limiting on mutating endpoints

### Frontend
- [ ] TanStack Query for all data fetching — no raw `useEffect` for API calls
- [ ] Loading skeletons (not spinners)
- [ ] Empty state with action button
- [ ] Error state
- [ ] Toast notifications for all operations (success + error)
- [ ] Confirmation modal before any destructive action
- [ ] `canEdit` permission gate on ALL action buttons
- [ ] Full FR/EN/AR translations — keys in all 3 files
- [ ] RTL layout works correctly
- [ ] Responsive — mobile-friendly (jury may test on phone)
- [ ] Generic error messages only — never raw API errors shown to user

---

## 🔧 Standard Code Patterns

### TanStack Query — mandatory fetch pattern

```tsx
const { data, isLoading, isError } = useQuery({
  queryKey: ['module', 'resource'],
  queryFn: () => moduleService.getResource(),
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

### RTL-aware layout

```tsx
const { i18n } = useTranslation();
const isRTL = i18n.language === 'ar';

<div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
```

### Service file pattern — all API calls go here

```tsx
// resources/js/services/commercialService.ts
import api from './api';

export const commercialService = {
  getClients: () => api.get('/commercial/clients').then(r => r.data),
  createClient: (data: ClientForm) => api.post('/commercial/clients', data).then(r => r.data),
  updateClient: (id: number, data: ClientForm) => api.put(`/commercial/clients/${id}`, data).then(r => r.data),
  deleteClient: (id: number) => api.delete(`/commercial/clients/${id}`).then(r => r.data),
};
```

---

## 🤖 Agent Startup Protocol

**Every session follows these steps in order. No skipping.**

### Step 1 — Read project state (READ ONLY — touch nothing)
- `status.md` — current phase and last completed step
- `phases.md` — what the next task is
- `resources/js/app.tsx` — defined routes
- `routes/api.php` — backend endpoints

### Step 2 — Produce a status report

```
## Session Start Report

**Current Phase:** [Phase N — Name from phases.md]
**Last Completed Step:** [from status.md]
**Build Status:** [run npm run build — report pass or list errors]
**Issues Detected:** [file:line references — or None]
**Recommended Next Step:** [exact task from phases.md]
**Files to Touch:** [list]
```

### Step 3 — WAIT
Do not write, edit, or create any file until the human reads the report and explicitly says to proceed.

### Step 4 — Execute (only after approval)
1. Back up any existing file that will be modified (Rule 15)
2. Apply surgical edits only — never rewrite a whole component
3. Run `npm run build` after every file touched
4. Produce the Task Report (format above)
5. Trigger Gate 1 — stop and wait for human confirmation

---

*Last updated: May 2026*
*Any agent modifying this file must update the "Last updated" date.*
