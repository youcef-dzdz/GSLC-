# Phase 2: Dry Run

I've analyzed the codebase and found the root causes:
1. **Bug 1 (Button hidden):** The API response for the `user` object returns `role.label` and `role.permissions`, but no longer includes `role.niveau`. Thus, `(user?.role?.niveau ?? 99) <= 3` always evaluates to `99 <= 3` (false). We will map the `label` to the legacy `niveau` to respect your "niveau <= 3" rule.
2. **Bug 2 (Filters overlapping):** The flex container lacks RTL direction awareness, and the "Nouveau" button uses a hardcoded `ml-auto` which pushes elements incorrectly in RTL. The dropdowns overlap because they share a padding class (`C.fi`) that has hardcoded left padding for the search icon.
3. **Bug 3 (Search icon outside):** The `Search` icon has hardcoded `left-3` and the input uses `pl-9` for space. In RTL, this needs to be flipped (`right-3` and `pr-9`).

### Proposed Changes:

**1. `resources/js/pages/admin/AdminPorts.tsx`**
*Map the role label to the required `niveau` explicitly.*
```diff
-  const canEdit = (user?.role?.niveau ?? 99) <= 3;
+  const niveau = { admin: 1, it_agent: 1, directeur: 2, commercial: 3, logistique: 3, financier: 3, client: 4 }[user?.role?.label as string] ?? 99;
+  const canEdit = niveau <= 3;
```

**2. `resources/js/pages/admin/ports/PortShared.tsx`**
*Remove hardcoded `pl-9` from shared inputs and make `th` RTL-aware.*
```diff
-  th: 'px-4 py-3 text-left text-[11px] font-bold text-[#0D2A5E] uppercase tracking-wider border-b border-[#C5D8F5]',
+  th: 'px-4 py-3 text-start text-[11px] font-bold text-[#0D2A5E] uppercase tracking-wider border-b border-[#C5D8F5]',
-  fi: 'pl-9 pr-4 py-2 text-sm border border-[#C5D8F5] rounded-xl focus:ring-2 focus:ring-[#C8960A] focus:border-transparent outline-none transition-all w-full sm:w-64 bg-white text-[#0D2A5E]',
+  fi: 'px-4 py-2 text-sm border border-[#C5D8F5] rounded-xl focus:ring-2 focus:ring-[#C8960A] focus:border-transparent outline-none transition-all w-full sm:w-64 bg-white text-[#0D2A5E]',
```

**3. `resources/js/pages/admin/ports/PortsTab.tsx` (and identical changes for TerminauxTab & DepotsTab)**
*Inject RTL context, apply RTL direction to root, and flip search icon/button margins dynamically.*
```diff
-export const PortsTab = ({ canEdit }: { canEdit: boolean }) => {
-  const { t } = useTranslation();
+export const PortsTab = ({ canEdit }: { canEdit: boolean }) => {
+  const { i18n, t } = useTranslation();
+  const isRTL = i18n.language?.startsWith('ar');

-    <div className="bg-white rounded-2xl border border-[#C5D8F5] overflow-hidden shadow-sm">
+    <div className="bg-white rounded-2xl border border-[#C5D8F5] overflow-hidden shadow-sm" dir={isRTL ? 'rtl' : 'ltr'}>

-            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3A5A8A]" size={16} />
-            <input type="text" className={C.fi} placeholder={t('admin.ports.search_placeholder')} value={search} onChange={e => setSearch(e.target.value)} />
+            <Search className={`absolute top-1/2 -translate-y-1/2 text-[#3A5A8A] ${isRTL ? 'right-3' : 'left-3'}`} size={16} />
+            <input type="text" className={`${C.fi} ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'}`} placeholder={t('admin.ports.search_placeholder')} value={search} onChange={e => setSearch(e.target.value)} />

-          {canEdit && <button onClick={openNew} className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#C8960A] text-white rounded-xl hover:bg-[#A87A08] transition-all"><Plus size={14} />{t('admin.ports.new')}</button>}
+          {canEdit && <button onClick={openNew} className={`${isRTL ? 'mr-auto' : 'ml-auto'} flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#C8960A] text-white rounded-xl hover:bg-[#A87A08] transition-all`}><Plus size={14} />{t('admin.ports.new')}</button>}
```

Apply these changes?
