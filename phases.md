# GSLC — Project Phases
Last updated: 2026-05-06

## Phase Summary
| Phase | Module              | Status               |
|-------|---------------------|----------------------|
| 1     | Auth                | ✅ Done              |
| 2     | Admin Core          | ✅ Done              |
| 3     | Commercial          | 🔄 Gate 2 QA pending |
| 4     | Client Portal       | ⚠️ Gate 2 QA pending |
| 4b    | Client Completion   | ❌ Not started       |
| 5     | Admin Refactor      | 🔄 In Progress       |
| 6     | Logistique          | ❌ Not started       |
| 7     | Finance             | ❌ Not started       |
| 8     | Directeur           | ❌ Not started       |
| 9     | Corbeille           | ⚠️ Partial           |
| 10    | Testing             | ❌ Not started       |
| 11    | Innovations         | ❌ Not started       |
| 12    | Deployment Prep     | ❌ Not started       |

## Current Phase — Phase 5: Admin Refactor
### Remaining Tasks
- [ ] Apply uidesign.md design system to remaining old admin pages (AdminDashboard, AdminRoles, AdminPermissions)
- [ ] Fix AdminDashboard useEffect API call → useQuery with refetchInterval (Rule #2)
- [ ] Build PénalitesSurestarie frontend page
- [ ] Fix i18n violations in 5 new admin pages (inline TEXTS[] → fr/en/ar.json keys)
- [ ] Gate 1 — code review
- [ ] Gate 2 — browser QA all admin pages

### Completed in Phase 5
- [x] AdminTarifs.tsx built ✅
- [x] AdminTypeConteneurs.tsx built ✅
- [x] AdminBanques.tsx built ✅
- [x] AdminFranchises.tsx built ✅
- [x] AdminConditionsGenerales.tsx built ✅

## Next Phase — Phase 3 Gate 2 (Commercial QA)
- [ ] Fix Bug 2: QuoteForm lignes[] — BLOCKER, fix before any QA (CommercialQuotes.tsx line 282)
- [ ] Fix Bug 3: DevisController@index — add commentaire_nashco / commentaire_client / numero_dossier to transform
- [ ] Fix Bug 1: DevisController statut validator — add BROUILLON to `in:` rule
- [ ] Apply uidesign.md to all 6 Commercial pages
- [ ] Build CommercialPorts read-only view
- [ ] Gate 2 QA all 6 pages
- [ ] Gate 2 sign-off

## Phase 4b — Client Portal Completion
- [ ] Build ClientContainers page
- [ ] Apply uidesign.md to all 5 Client pages
- [ ] Gate 2 QA all 5 pages

## Blocked Until Phase 12 (Deployment)
- Fix CSP for production (remove unsafe-inline/unsafe-eval)
- Strip role/permission info from 403 responses
- Wire OwnsResource trait to controllers
- Call sanitize() from purify.ts on HTML fields
- Set APP_DEBUG=false, APP_ENV=production

## Deadline
June 2, 2026 — 27 days remaining
