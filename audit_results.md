# Admin Module — Rule #2 & Rule #9 Compliance Audit

## Rule Definitions
* **Rule #2**: `useEffect` that calls apiClient/axios/fetch directly inside the component
* **Rule #9**: apiClient/axios/fetch called directly inside a page component instead of going through a service file in `resources/js/services/`

---

### 1. `DepartmentsPage.tsx`
* **Violations**: Rule #9
* **Lines**: 105, 106, 340, 347, 353
* **Code Snippets**:
  ```tsx
  // L105-106
          ? apiClient.put(`/api/admin/departments/${editing.id}`, payload)
          : apiClient.post('/api/admin/departments', payload),
  
  // L340
      queryFn: async () => (await apiClient.get('/api/admin/departments')).data,
  
  // L347
      queryFn: async () => (await apiClient.get('/api/admin/users')).data,
  
  // L353
      mutationFn: (id: number) => apiClient.delete(`/api/admin/departments/${id}`),
  ```
* **Replacement**: Move all `apiClient` calls to a dedicated service file (e.g., `adminService` or `departmentService`).

---

### 2. `ConfigPage.tsx`
* **Violations**: Rule #2, Rule #9
* **Lines**: 279, 294-299, 318, 352
* **Code Snippets**:
  ```tsx
  // L279 (Rule #9)
        await apiClient.post('/api/admin/system-config/test-email', { email: emailTo });

  // L294-299 (Rule #2 & Rule #9)
    useEffect(() => {
      apiClient
        .get('/api/admin/system-config')
        .then((r) => { setConfig(r.data); setLoading(false); })
        .catch(() => { setLoadErr(true); setLoading(false); });
    }, []);

  // L318 (Rule #9)
        await apiClient.post(`/api/admin/system-config/${section}`, payload);

  // L352 (Rule #9)
            onClick={() => { setLoadErr(false); setLoading(true); apiClient.get('/api/admin/system-config').then((r) => { setConfig(r.data); setLoading(false); }).catch(() => { setLoadErr(true); setLoading(false); }); }}
  ```
* **Replacement**: Move all API calls to a service. Replace the `useEffect` block and the manual loading states with TanStack Query (`useQuery`), and use `useMutation` for the updates/tests.

---

### 3. `AuditPage.tsx`
* **Violations**: Rule #9
* **Lines**: 103, 144
* **Code Snippets**:
  ```tsx
  // L103
        const res = await apiClient.get('/api/admin/audit-logs/export', {

  // L144
        const res = await apiClient.get('/api/admin/audit-logs', { params });
  ```
* **Replacement**: Move `exportAuditLogs` and `getAuditLogs` to `adminService`.

---

### 4. `AdminUsers.tsx`
* **Violations**: Rule #9
* **Lines**: 241
* **Code Snippets**:
  ```tsx
  // L241
        apiClient.post(`/api/admin/users/${id}/reset-password`, { password, lang: reqLang }),
  ```
* **Replacement**: Move `resetUserPassword` to `adminService`.

---

### 5. `AdminRegistrations.tsx`
* **Violations**: Rule #9
* **Lines**: 200, 228
* **Code Snippets**:
  ```tsx
  // L200
      mutationFn: (id: number) => apiClient.post(`/api/admin/registrations/${id}/approve`, { lang }),

  // L228
      mutationFn: (id: number) => apiClient.delete(`/api/admin/registrations/${id}`),
  ```
* **Replacement**: Move `approveRegistration` and `deleteRegistration` to `adminService`.

---

### 6. `AdminPositions.tsx`
* **Violations**: Rule #9
* **Lines**: 119-120, 337, 342, 367
* **Code Snippets**:
  ```tsx
  // L119-120
          ? apiClient.put(`/api/admin/positions/${editing.id}`, payload)
          : apiClient.post('/api/admin/positions', payload),

  // L337
      queryFn: () => apiClient.get('/api/admin/positions').then(r => r.data),

  // L342
      queryFn: () => apiClient.get('/api/admin/departments').then(r => r.data),

  // L367
        await apiClient.delete(`/api/admin/positions/${deleteTarget.id}`);
  ```
* **Replacement**: Move API calls to `adminService` (or `positionService`).

---

### 7. `AdminDashboard.tsx`
* **Violations**: Rule #2, Rule #9
* **Lines**: 305-310
* **Code Snippets**:
  ```tsx
  // L305-310
    useEffect(() => {
      apiClient.get('/api/admin/stats/monthly-registrations')
        .then(r => setMonthlyData(Array.isArray(r.data) ? r.data : []))
        .catch(() => setMonthlyData([]))
        .finally(() => setMonthlyLoading(false));
    }, []);
  ```
* **Replacement**: Move API call to `adminService.getMonthlyRegistrations()` and replace `useEffect` with `useQuery`.
