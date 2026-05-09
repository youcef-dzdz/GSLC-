# GSLC — Project Phases
Last updated: 2026-05-08
Project direction: Startup SaaS B2B — marché algérien de location de conteneurs maritimes

---

## Phase Summary

| Phase | Module | Status | Startup Value |
|-------|--------|--------|---------------|
| 1 | Auth | ✅ Done | — |
| 2 | Admin Core | ✅ Done | — |
| 3 | Commercial | 🔄 In Progress | Point d'entrée client — ce qu'un directeur commercial voit en démo |
| 4 | Client Portal | ⚠️ Gate 2 QA pending | Ce que le client utilise chaque jour — réduit les appels de support |
| 5 | Admin Refactor | ✅ Done | — |
| 6 | Logistique | ❌ Not started | Transforme GSLC d'un système administratif en outil opérationnel réel |
| 7 | Finance + Surestaries | ❌ Not started | Le moteur qui vend GSLC à tout directeur financier en 5 minutes |
| 8 | Directeur + Reporting | ❌ Not started | Répond à "comment le dirigeant prend ses décisions avec GSLC?" |
| 9 | Prédictif | ❌ Not started — LAST | Ce qui justifie le titre officiel du projet et différencie GSLC d'un CRUD |
| 10 | SaaS Multi-Tenant | ⛔ Post-graduation roadmap | Architecture évolutive — après la soutenance |
| 11 | Corbeille completion | ⚠️ Partial | — |
| 12 | Security & Deploy | ❌ Not started | — |

---

## Deadline
July 31, 2026 — soutenance startup

---

## Current Phase — Commercial Module (Phase 3)

**Startup value:** Le module commercial est le point d'entrée du client dans GSLC — devis, négociation, contrat. C'est ce qu'un directeur commercial verra en premier lors d'une démo. Il doit être irréprochable.

### Remaining Tasks
- [ ] Phase 3: Commercial Vessels frontend implementation
- [ ] Fix Bug 2: CommercialQuotes.tsx:282 — QuoteForm sends `montant_ht` instead of `lignes[]`
- [ ] Fix Bug 3: DevisController.php:40-53 — missing fields in transform (`commentaire_nashco`, `commentaire_client`, `numero_dossier`)
- [ ] Fix Bug 1: DevisController.php:210 — statut validator missing `BROUILLON`
- [ ] Fix Bug 4: Navbar.tsx:136-142 — replace setInterval/useEffect with TanStack refetchInterval (Rule #2)
- [ ] Gate 2 QA all 6 commercial pages
- [ ] Gate 2 sign-off → generate `defense/commercial.md`

### Completed in Commercial Module
- [x] Phase 1: Commercial Quotes (List, Detail, Create) ✅
- [x] Phase 2: Commercial Contracts (List, Detail, Create) ✅

### Workflow enforced in this module
- Negotiation cap: max 5 rounds → round 6 = auto-rejection logged to JournalAudit
- OFFRE → ACCEPTÉE: enforced in quote acceptance handler
- ACCEPTÉE → CONTRAT: enforced in contract creation — requires signature recorded

---

## Phase 4b — Client Portal Completion

**Startup value:** Le portail client réduit les litiges sur les surestaries. Le client voit en temps réel combien il doit payer s'il ne rend pas la boîte aujourd'hui. Moins de disputes = moins de coûts de support pour NASHCO.

### Tasks
- [ ] Build ClientContainers page (route defined, backend exists, no frontend)
- [ ] Apply uidesign.md to all 5 Client pages
- [ ] Gate 2 QA all 5 pages
- [ ] Gate 2 sign-off → generate `defense/client_portal.md`

### Pages (5 total)
| Page | Status |
|---|---|
| ClientDashboard | ✅ Built — needs smart card upgrade in Phase 9 |
| ClientContrats | ✅ Built |
| ClientFactures | ✅ Built |
| ClientConteneurs | ❌ Missing — confirmed by audit 2026-05-08, dead sidebar link at /client/containers |
| ClientProfil | ✅ Built |

---

## Phase 6 — Logistique

**Startup value:** Ce module transforme GSLC d'un système administratif en un outil opérationnel réel que le chef de parc utilise tous les jours. Sans lui, la plateforme ne gère pas les actifs physiques.

> ⚠️ `/logistics/customs` is in Sidebar but has no backend endpoint — remove that sidebar link before building this module.

**Backend status:** ✅ Full — frontend = 0 pages (5 dead sidebar links confirmed 2026-05-08)

### Pages (5)

| Page | What it does |
|---|---|
| LogDashboard | KPIs: conteneurs hors dépôt, taux d'occupation, durée moyenne cycle, conteneurs en maintenance |
| LogConteneurs | Inventaire complet — cycle de vie 7 états, etat_technique, rentabilité par conteneur, sجل صيانة |
| LogMouvements | Entrée/sortie terrain — déclenche calcul surestaries automatiquement au retour |
| LogInspections | Formulaire post-retour — décision: DISPONIBLE / EN_MAINTENANCE / HORS_SERVICE |
| LogAffectations | Affecte conteneur au contrat — bloque si conteneur non DISPONIBLE |

### Workflow enforced in this module
- EN_COURS → RETOURNÉ: enforced in LogMouvements return handler (date_retour_reelle required)
- RETOURNÉ → INSPECTÉ: enforced in LogInspections submit handler (rapport complet required)
- Container assignment blocked if status ≠ DISPONIBLE (LogAffectations)
- Surestaries calculation triggered on return event (LogMouvements)

### Gate 2 sign-off → generate `defense/logistique.md`

---

## Phase 7 — Finance + Surestaries Engine

**Startup value:** Le moteur de surestaries est LA fonctionnalité qui vend GSLC à n'importe quel directeur financier en 5 minutes. C'est l'argument commercial numéro 1. Sans lui, GSLC est juste un autre logiciel de gestion.

**Backend status:** ✅ Full — frontend = 0 pages

### Pages (5)

| Page | What it does |
|---|---|
| FinDashboard | KPIs: revenus du mois, surestaries en cours, impayés, taux de recouvrement |
| FinFactures | Facture loyer + facture surestaries séparées — téléchargement PDF, historique complet |
| FinSurestaries | Moteur de calcul automatique — tableau des jours, alertes J-3/J-1, règles par contrat |
| FinTresorerie | Enregistrement chèque de garantie — activation contrat, séparation des rôles |
| FinEcheancier | Clients en retard — priorité de recouvrement, montants dus, jours de dépassement |

### Workflow enforced in this module
- CONTRAT → ACTIF: blocked until cheque_enregistré = true (FinTresorerie)
- INSPECTÉ → CLÔTURÉ: blocked until facture_finale émise (FinFactures)

### Gate 2 sign-off → generate `defense/finance.md`

---

## Phase 8 — Directeur + Reporting

**Startup value:** Ce module répond directement à la question du jury: "Comment le dirigeant prend ses décisions avec GSLC?" Un tableau de bord exécutif complet — financier, logistique, commercial — en une seule vue.

**Backend status:** ✅ Full — frontend = 0 pages

### Pages (4)

| Page | What it does |
|---|---|
| DirDashboard | Tableau de bord exécutif: KPIs financiers + logistiques + commerciaux + alertes prioritaires |
| DirRapportContrats | Contrats ouverts/fermés, rentabilité par contrat, durée moyenne cycle |
| DirRapportConteneurs | Conteneurs hors dépôt, taux d'occupation, coûts maintenance, actifs rentables vs déficitaires |
| DirAlerts | Alertes: contrats expirant cette semaine, franchises proches, conteneurs endommagés, clients risque élevé |

### Gate 2 sign-off → generate `defense/directeur.md`

---

## Phase 9 — Prédictif (LAST — after Phases 3–8 all Gate 2 complete)

> ⚠️ DO NOT start this phase until every module (3, 4, 6, 7, 8) has passed Gate 2 QA.
> Technical approach discussion held at phase start between founder and Claude before any code is written.

**Startup value:** C'est le "S" dans le titre officiel du projet — analyse prédictive. C'est ce qui différencie GSLC d'un simple CRUD et justifie la dénomination "système intelligent."

**Prerequisite:** Phases 3–8 all Gate 2 complete. Historical data exists in all modules.

### Components (no new pages — upgrades to existing dashboards)

| Component | Where it lives | What it adds |
|---|---|---|
| PredictionService.php | `app/Services/` | Rule-based scoring: FAIBLE / MOYEN / ÉLEVÉ per client |
| Smart card | ClientDashboard upgrade | "Il vous reste X jours — coût estimé Y DZD aujourd'hui" |
| Risk widget | FinDashboard upgrade | Liste clients score ÉLEVÉ cette semaine + montant potentiel |
| Risk report | DirDashboard upgrade | Contrats à risque + surestaries potentielles si aucune action |
| Automated alerts | Scheduled job | Notifications J-3 et J-1 avant fin franchise — email + in-app |

### Scoring logic (Phase 1 — rule-based, no ML)
```
score_risque = ÉLEVÉ  si retards dans > 50% des contrats passés
             = MOYEN  si retards dans 25–50% des contrats passés
             = FAIBLE si retards dans < 25% des contrats passés
```

### Gate 2 sign-off → generate `defense/predictif.md`

---

## Phase 10 — SaaS Multi-Tenant (POST-GRADUATION ROADMAP)

> ⛔ DO NOT implement before the defense.
> This phase is intentionally deferred. Current commercial model = clé en main deployment per client.

**Why deferred:** The current model sells each company a dedicated instance on their own infrastructure. This satisfies Algerian data sovereignty requirements and eliminates multi-tenant complexity before the defense.

**What this phase will contain (post-graduation):**
- `tenant_id` added to all main tables
- Global Eloquent scopes for automatic tenant filtering
- Per-tenant settings: logo, company name, default currency, language
- Super Admin dashboard to manage all tenants
- Automated tenant onboarding flow
- Subscription billing: Starter / Professional / Enterprise plans

**For the defense — how to present this:**
> *"GSLC est actuellement commercialisé en mode déploiement dédié — chaque entreprise dispose de sa propre instance avec ses données sur sa propre infrastructure. L'évolution vers une architecture multi-tenant partagée est planifiée comme étape post-lancement, une fois la base clients établie."*

---

## Phase 11 — Corbeille Completion

**Remaining task:** Apply `HasCorbeille` to all 50+ models (currently only 4/50 done).
No new pages needed — the Corbeille frontend already exists.

---

## Phase 12 — Security & Deploy

### Tasks (fix before going live)
- [ ] Fix CSP: remove unsafe-inline / unsafe-eval for production
- [ ] Strip role/permission info from 403 responses
- [ ] Wire OwnsResource trait to all controllers
- [ ] Call sanitize() from purify.ts on all HTML fields
- [ ] Set APP_DEBUG=false, APP_ENV=production
- [ ] Deploy to live server — jury must be able to access online

---

## Blocked Until Phase 12
- CSP production fix
- 403 response hardening
- OwnsResource wiring
- HTML sanitization activation
- Production environment config

---

*Last updated: May 2026*
*Direction updated: PFE → Startup SaaS B2B*
