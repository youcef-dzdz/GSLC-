# GSLC — Project Status
Last updated: 2026-05-06

## Current Focus
Commercial module (Quotes, Contracts, Vessels) + Full QA

## Module Status
| Module        | Frontend | Backend | Status                          |
|---------------|----------|---------|----------------------------------|
| Admin         | ✅ 18 files (17 pages + 1 ports container) | ✅ Full | ✅ COMPLETE (all pages built, routed, sidebar linked, FR/EN/AR translations, collapsible sidebar) |
| Commercial    | ✅ 6 pages  | ✅ Full | 🔄 In Progress — Phase 3 (Vessels + QA) |
| Client Portal | ✅ 5 pages  | ✅ Full | ⚠️ Gate 2 QA pending — ClientContainers missing |
| Logistique    | ❌ 0 pages  | ✅ Full | Not started                     |
| Finance       | ❌ 0 pages  | ✅ Full | Not started                     |
| Directeur     | ❌ 0 pages  | ✅ Full | Not started                     |
| Corbeille     | ✅ Built    | ✅ Full | ⚠️ HasCorbeille on 4/50+ models |
| Innovations   | ❌ 0 pages  | Partial | Phase 11 — not started          |

## Missing Pages (Priority)
- 🔴 ClientContainers (client portal) — route defined, backend exists, no frontend page

## Known Bugs
- 🔴 Bug 2: CommercialQuotes QuoteForm sends `montant_ht` instead of `lignes[]` — every quote creation fails (422)
- 🔴 Bug 3: DevisController@index missing `commentaire_nashco` / `commentaire_client` / `numero_dossier` in transform
- 🟡 Bug 1: DevisController statut validator missing `BROUILLON` from `in:` rule

## Design Violations
- 🔴 AdminDashboard.tsx — old dark palette (#1A2332, #CFA030 forbidden) + 838 lines + useEffect API call (Rule #2)
- 🔴 All 6 Commercial pages — unapproved Tailwind semantic colors (#3B82F6, #F59E0B etc.)
- 🟡 AdminRoles.tsx — #C9A84C forbidden gold on create button
- 🟡 AdminPermissions.tsx — #4366BB unapproved color
- 🟡 Navbar.tsx — useEffect polling instead of TanStack Query refetchInterval (Rule #2)

## Security Issues (fix before Phase 12)
- MEDIUM: CSP unsafe-inline/unsafe-eval hardcoded for dev
- LOW: CheckRole 403 leaks role info
- LOW: CheckPermission 403 leaks permission names
- LOW: OwnsResource trait never wired to controllers
- INFO: purify.ts dead code (sanitize never called)
- INFO: reset-password route commented out

## Deadline
June 2, 2026 — 27 days remaining

## Build Status
✅ 0 errors as of last audit (2026-05-06)
