# FIX.md — Precision Fix Protocol
> **This file is ONLY activated when the user explicitly reports a bug or regression.**
> Do NOT apply this protocol during normal feature building — use `CLAUDE.md` rules instead.
> For feature building: follow `CLAUDE.md`. For broken things: follow this file.

---

## Core Principles

**Surgical over sweeping.**
Fix only the broken thing. Do not refactor, rename, reformat, or improve adjacent code unless the bug is directly caused by those things.

**Root cause, not symptom.**
Treat the underlying defect, not its visible effect. If you cannot identify the root cause, say so explicitly — do not guess silently.

**Transparency over assumption.**
Every judgment call must be stated. If a tradeoff exists, name it. If multiple approaches are valid, pick the least invasive and explain why.

**Reversibility.**
All changes must be undoable. The backup must exist before the first file is written to.

---

## Workflow

Phase 0, Phase 1, and Phase 2 run automatically in sequence — you produce the intent summary, full analysis, and dry-run preview without pausing for permission. The single gate is at the end of Phase 2: the user decides whether to apply. Nothing is written to disk until that one confirmation arrives.

---

### Phase 0 — Intent Confirmation (automatic)

Before reading a single file, state in plain English:
- What you understood the problem to be (one sentence)
- Which files you expect to need to read
- What the fix will likely involve at a high level (preliminary, not a commitment)

Then proceed immediately to Phase 1.

---

### Phase 1 — Analysis (automatic — read-only, touch nothing)

Read every relevant file. Identify the root cause. Scope what the fix will require. Produce the Analysis Report, then proceed immediately to Phase 2.

**Analysis Report format:**
```
## Analysis Report

**Problem:** [What is broken and how it manifests — one sentence]
**Root Cause:** [The underlying defect, not the symptom — one sentence]
**Files Affected:**

| File | Lines Estimated | Risk |
|---|---|---|
| path/to/file.ext | ~N lines | 🟢 Low / 🟡 Medium / 🔴 High |

**Risk Key:**
🟢 Low    — isolated, no downstream consumers, easy to verify
🟡 Medium — shared code, multiple call sites, or non-trivial logic
🔴 High   — critical path, auth/security/data layer, or broad surface area
```

If the fix will touch more than 3 files or more than 50 lines total, insert this block immediately after the table:
```
⚠️ High-complexity fix detected
Files: N  |  Estimated lines: ~N
Recommend review after applying. Proceed with extra caution.
```

---

### Phase 2 — Dry Run (automatic — single permission gate)

Without modifying any file, show the exact changes you propose to make.

```
## Dry Run — Proposed Changes

### Change 1: [Descriptive title]
File:     path/to/file.ext
Location: Line N  |  function: name()  |  class: ClassName

Before:
[exact original code]

After:
[proposed corrected code]

Why: [one sentence — the reasoning behind this specific change]
```

Repeat for every change. If the complexity warning fired in Phase 1, restate it here.

Then ask: **"Apply these changes?"**

Do not write to any file until the user confirms.

---

### Phase 3 — Apply

Once confirmed, execute in this order — no deviations:

1. **Verify scope** before touching anything. Check that every file you need to modify was listed in the Phase 1 Analysis Report. If the fix requires touching any file not in that list — stop immediately. State which file is needed, what role it plays, and why it could not be avoided. Wait for explicit user permission before continuing.

2. **Back up every file** that will be modified:
   ```
   .fix-backups/<ISO-8601-timestamp>/<original-filename>
   ```
   The backup must be written before any file is opened for editing.

3. **Apply the changes** exactly as shown in the dry run. Do not deviate from what was previewed.

4. **Audit** — diff each modified file against its backup. Classify every changed line:
   - **Intended** — directly required by the fix
   - **Incidental** — unavoidable side effect (e.g., editor-forced whitespace)
   - **Accidental** — unintended drift — revert immediately before proceeding

5. Revert all Accidental changes. If an Incidental change cannot be avoided, document it. If anything during apply diverged from the dry run preview, note the divergence explicitly.

---

### Phase 4 — Fix Loop (autonomous — no permission needed)

After applying, re-scan all modified files and their direct dependents for errors introduced by the current fix (compilation errors, broken imports, test failures, type errors).

- **If new errors found:** apply the minimal fix, audit, re-scan. Repeat until clean. Each iteration reported in the final report.
- **If no new errors:** proceed to Phase 5.

The loop is autonomous because the user already authorized the fix in Phase 2. However, every iteration must appear in the Fix Loop section of the report.

**If the loop exceeds 5 iterations without converging — stop.** Report the situation rather than continuing blindly.

**Scope constraint:** The loop only fixes errors introduced by this fix session. Pre-existing unrelated bugs are reported, not fixed silently.

**Unrelated-file gate:** The same rule from Phase 3 applies. If resolving a loop error requires touching a file not in the Phase 1 Analysis Report — stop the loop. State which file, why it is needed. Wait for explicit permission. The loop's autonomy covers in-scope files only.

---

### Phase 5 — Report

Produce the Final Fix Report. The plain English summary always appears first.

After presenting the report, **append the full report to `report.md`** in the project root:
- If `report.md` does not exist, create it
- Separate each entry with a timestamp header:
  ```
  ---
  ## Fix Session — [ISO-8601 timestamp]
  ```
- Write the complete report content under the header — do not summarize or truncate
- This file accumulates every fix and build session as a permanent audit trail
- Append even when the fix had low confidence or did not complete — the log must be honest, not curated

**Report Format:**
```
## Fix Report

### Summary
[Line 1: What was broken — plain English, no jargon]
[Line 2: What was changed — what specifically was done]
[Line 3: Current state — clean, or manual testing recommended?]

---

### Details

**Problem:** [One sentence — what is broken and how it manifests]
**Root Cause:** [One sentence — the underlying defect]
**Scope:** [N file(s) modified, ~N lines changed]

---

#### Fix 1: [Descriptive title]

File:      path/to/file.ext
Location:  Line N  |  function: name()  |  class: ClassName

**Before:**
[original code — exact, unmodified]

**After:**
[corrected code]

**Why:** [Explain the reasoning — why this change, why not an alternative]

---

#### Fix 2 (if applicable)
[Repeat Fix 1 block]

---

### Unintended Changes

- [Every line touched that was not required — file + line number + what changed]
- — OR — None

**Restore status:**
- ✅ All unintended changes reverted and verified
- ⚠️ Manual action needed — [explain]

---

### Fix Loop

[For each loop iteration:]
**Iteration N:** [Brief title]
- Error found: [description]
- Fix applied: [what changed, file, line]
- Re-scan result: ✅ Clean / ⚠️ Further errors (see Iteration N+1)

— OR — No secondary errors found. Loop exited after 1 pass.

---

### Confidence

| Rating | Criteria |
|---|---|
| ✅ High   | Fix tested end-to-end; behavior verified; no unresolved edge cases |
| ⚠️ Medium | Fix applied and logically sound; manual testing recommended |
| ❌ Low    | Fix is uncertain or partial; review before merging |

**This fix:** [Rating] — [One sentence explanation]

---

### Backup

.fix-backups/[timestamp]/
```

---

## Hard Rules

These are constraints, not preferences. Violating any one invalidates the fix.

1. **Never write to a file before Phase 2 is confirmed.** Phases 0, 1, and 2 are fully automatic — read all you need, but do not touch any file until the user says "Apply."
2. **Never deviate from the dry run** without noting the divergence explicitly.
3. **Never change more than required.** Bugs outside fix scope are reported, not silently fixed — except within the Phase 4 loop.
4. **Never reformat.** Do not adjust indentation, whitespace, or code style unless the bug is directly caused by formatting.
5. **Never rename.** Identifiers, files, and modules are not renamed. Renaming is a refactor.
6. **Never add features.** No new logic or abstractions beyond what is strictly required to correct the defect.
7. **Back up before editing.** The backup must exist before the first file is written.
8. **Audit after applying.** Diff against the backup; classify every changed line; revert all Accidental changes before reporting.
9. **Complete the report.** Every section is required. Write "None" or "N/A" — do not omit headings.
10. **Never touch an out-of-scope file without explicit permission.** The file list from Phase 1 is a contract. New dependencies discovered mid-fix do not grant automatic permission to expand scope.
11. **Always append to `report.md`.** Every completed Phase 5 report must be written to `report.md` before the session ends. Not optional.

---

## Language-Agnostic Notes

This workflow applies to all programming languages, configuration formats, and markup. The five phases — confirm, analyze, preview, apply, loop — are invariant across stacks. Use the appropriate fenced code block identifier in Before/After blocks (e.g., `tsx`, `php`, `yaml`, `sql`).

---

*Last updated: May 2026*
