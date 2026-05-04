
---
## Fix Session — 2026-05-04T11-35-23

## Fix Report

### Summary
The Ports page crashed at runtime with "ports.map is not a function" because the three read getters in portsService.ts cast `r.data` directly as an array without verifying its shape.
Each getter was updated to apply a defensive shape guard: `Array.isArray(r.data) ? r.data : (r.data.data ?? [])`, which handles both a direct JSON array and a paginated `{ data: [...] }` envelope.
Build is clean at zero errors; manual testing on the /admin/ports page is recommended to confirm the tabs load data correctly.

---

### Details

**Problem:** `ports.map is not a function` — `portsService.getPorts()` resolves to a non-array, causing all downstream `.map()` calls in AdminPorts.tsx to throw at runtime.
**Root Cause:** `r.data as Port[]` is a TypeScript lie — the cast suppresses the type error but cannot guarantee the runtime value is an array; if the response shape is `{ data: [...] }` the guard is absent.
**Scope:** 1 file modified, ~3 lines changed

---

#### Fix 1: getPorts — add shape guard

File:      resources/js/services/portsService.ts
Location:  Line 44 | getPorts | portsService

**Before:**
```typescript
  getPorts:       ()                          => api.get('/admin/ports').then(r => r.data as Port[]),
```

**After:**
```typescript
  getPorts:       ()                          => api.get('/admin/ports').then(r => (Array.isArray(r.data) ? r.data : (r.data.data ?? [])) as Port[]),
```

**Why:** Guards against both direct array and paginated envelope shapes without requiring a backend change.

---

#### Fix 2: getTerminaux — add shape guard

File:      resources/js/services/portsService.ts
Location:  Line 49 | getTerminaux | portsService

**Before:**
```typescript
  getTerminaux:   ()                               => api.get('/admin/terminaux').then(r => r.data as Terminal[]),
```

**After:**
```typescript
  getTerminaux:   ()                               => api.get('/admin/terminaux').then(r => (Array.isArray(r.data) ? r.data : (r.data.data ?? [])) as Terminal[]),
```

**Why:** Same defensive pattern — all three index endpoints share identical return-shape risk.

---

#### Fix 3: getDepots — add shape guard

File:      resources/js/services/portsService.ts
Location:  Line 54 | getDepots | portsService

**Before:**
```typescript
  getDepots:      ()                           => api.get('/admin/depots').then(r => r.data as Depot[]),
```

**After:**
```typescript
  getDepots:      ()                           => api.get('/admin/depots').then(r => (Array.isArray(r.data) ? r.data : (r.data.data ?? [])) as Depot[]),
```

**Why:** Same defensive pattern as Fixes 1 and 2.

---

### Unintended Changes

None

**Restore status:**
- ✅ All unintended changes reverted and verified

---

### Fix Loop

No secondary errors found. Loop exited after 1 pass.

---

### Confidence

| Rating | Criteria |
|---|---|
| ✅ High   | Fix tested end-to-end; behavior verified; no unresolved edge cases |
| ⚠️ Medium | Fix applied and logically sound; manual testing recommended for [scenario] |
| ❌ Low    | Fix is uncertain or partial; review before merging — [explain concern] |

**This fix:** ⚠️ Medium — fix is logically sound and build passes; manual test on /admin/ports recommended to confirm all 3 tabs load data correctly from the live API.

---

### Backup

.fix-backups/2026-05-04T11-35-23/
