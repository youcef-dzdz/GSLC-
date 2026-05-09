# GSLC — Project Status
Last updated: 2026-05-08

---

## Startup Identity

| Item | Value |
|---|---|
| **Name** | GSLC |
| **Full title** | Système d'automatisation et d'optimisation du suivi des conteneurs maritimes — analyse prédictive et intégration multi-sources |
| **Type** | Container Rental Management Platform |
| **Commercial model** | Déploiement clé en main — chaque client reçoit son instance dédiée, données sur sa propre infrastructure |
| **Market** | Entreprises algériennes de location de conteneurs maritimes |
| **Reference client** | NASHCO — port de Mostaganem (étude terrain + déploiement de référence) |
| **Founder** | Solo |
| **Multi-tenant SaaS** | ⛔ Post-graduation roadmap uniquement — ne pas implémenter avant la soutenance |

---

## Current Focus
Commercial module (Quotes, Contracts, Vessels) + Full QA

**Project direction:** Startup — déploiement clé en main par client. NASHCO = déploiement de référence. Chaque module livré est une fonctionnalité vendable à une vraie entreprise algérienne de location de conteneurs.

---

## Module Status

| Module | Frontend | Backend | Status |
|--------|----------|---------|--------|
| Auth | ✅ Complete | ✅ Full | ✅ DONE |
| Admin | ✅ 18 files (17 pages + 1 ports container) | ✅ Full | ✅ DONE (all pages built, routed, sidebar linked, FR/EN/AR, collapsible sidebar) |
| Commercial | ✅ 6 pages | ✅ Full | 🔄 In Progress — Phase 3 (Vessels + QA) |
| Client Portal | ✅ 5 pages | ✅ Full | ⚠️ Gate 2 QA pending — ClientConteneurs missing |
| Logistique | ❌ 0 pages | ✅ Full | ❌ Not started — Phase 6 |
| Finance | ❌ 0 pages | ✅ Full | ❌ Not started — Phase 7 |
| Directeur | ❌ 0 pages | ✅ Full | ❌ Not started — Phase 8 |
| Prédictif | ❌ 0 pages | ❌ Not built | ❌ Not started — Phase 9 (LAST) |
| SaaS Layer (Multi-tenant) | ⛔ Not built | ⛔ Not built | ⛔ Post-graduation roadmap — do NOT build before defense |
| Corbeille | ✅ Built | ✅ Full | ⚠️ HasCorbeille on 4/50+ models only — Phase 11 |

---

## Missing Pages (Priority)

- 🔴 ClientConteneurs (client portal) — route defined, backend exists, no frontend page

---

## Known Bugs

- 🔴 Bug 2: CommercialQuotes.tsx:282 — QuoteForm sends `montant_ht` instead of `lignes[]` — every quote creation fails (422)
- 🔴 Bug 3: DevisController.php:40-53 — missing `commentaire_nashco` / `commentaire_client` / `numero_dossier` in transform
- 🟡 Bug 1: DevisController.php:210 — statut validator missing `BROUILLON` from `in:` rule

---

## Design Violations

- 🔴 AdminDashboard.tsx — old dark palette (#1A2332, #CFA030 forbidden) + 916 lines + useEffect API call line 305 (Rule #2)
- 🔴 All 6 Commercial pages — unapproved Tailwind semantic colors (#3B82F6, #F59E0B etc.)
- 🟡 AdminRoles.tsx — #C9A84C forbidden gold on create button
- 🟡 AdminPermissions.tsx — #4366BB unapproved color
- 🟡 Navbar.tsx:136-142 — setInterval inside useEffect instead of TanStack refetchInterval (Rule #2)
- ⚠️ 26 files over 300 lines (Rule #3) — worst: AdminUsers 967 lines, AdminDashboard 916 lines

---

## Dead Sidebar Links (expose 404s — hide or build)
- /client/containers → ClientConteneurs.tsx missing
- /logistics/* → 5 links, no pages (customs has no backend endpoint)
- /finance/* → 2 links, no pages
- /director/* → 3 links, no pages

---

## Security Issues (fix before Phase 12)

- MEDIUM: CSP unsafe-inline/unsafe-eval hardcoded for dev
- LOW: CheckRole 403 leaks role info
- LOW: CheckPermission 403 leaks permission names
- LOW: OwnsResource trait never wired to controllers
- INFO: purify.ts dead code (sanitize never called)
- INFO: reset-password route commented out

---

## Deadline
July 31, 2026 — soutenance startup

## Build Status
✅ 0 errors — 6.46s — 2026-05-08
