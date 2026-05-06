import { apiClient } from './api';
import type { CreateUserPayload, UpdateUserPayload } from '../types/admin';

export const adminService = {

  // ─── Users ──────────────────────────────────────────────────────────────────

  getUsers: (params?: Record<string, string | number>) =>
    apiClient.get('/api/admin/users', { params }),

  createUser: (data: CreateUserPayload) =>
    apiClient.post('/api/admin/users', data),

  updateUser: (id: number, data: UpdateUserPayload) =>
    apiClient.put(`/api/admin/users/${id}`, data),

  deleteUser: (id: number) =>
    apiClient.delete(`/api/admin/users/${id}`),

  blockUser: (id: number) =>
    apiClient.post(`/api/admin/users/${id}/block`),

  resetPassword: (id: number, password?: string) =>
    apiClient.post(`/api/admin/users/${id}/reset-password`, password ? { password } : {}),

  // ─── Roles ──────────────────────────────────────────────────────────────────

  getRoles: () =>
    apiClient.get('/api/admin/roles'),

  createRole: (data: { nom_role: string; label: string; niveau: number }) =>
    apiClient.post('/api/admin/roles', data),

  // ─── Roles — permissions ─────────────────────────────────────────────────

  getRoleDetail: (id: number) =>
    apiClient.get(`/api/admin/roles/${id}`),

  updateRole: (id: number, data: {
    nom_role?: string;
    label?: string;
    niveau?: number;
    description?: string;
  }) =>
    apiClient.put(`/api/admin/roles/${id}`, data)
      .then(r => r.data),

  deleteRole: (id: number) =>
    apiClient.delete(`/api/admin/roles/${id}`),

  syncRolePermissions: (roleId: number, permissionIds: number[]) =>
    apiClient.put(`/api/admin/roles/${roleId}/permissions`,
      { permission_ids: permissionIds })
      .then(r => r.data),

  // ─── Permissions ─────────────────────────────────────────────────────────

  getPermissions: () =>
    apiClient.get('/api/admin/permissions'),

  getPermissionsGrouped: () =>
    apiClient.get('/api/admin/permissions/grouped'),

  createPermission: (data: {
    name: string;
    label: string;
    module: string;
    description?: string;
  }) =>
    apiClient.post('/api/admin/permissions', data)
      .then(r => r.data),

  updatePermission: (id: number, data: {
    label?: string;
    module?: string;
    description?: string;
  }) =>
    apiClient.put(`/api/admin/permissions/${id}`, data)
      .then(r => r.data),

  deletePermission: (id: number) =>
    apiClient.delete(`/api/admin/permissions/${id}`)
      .then(r => r.data),

  getUserPermissions: (userId: number) =>
    apiClient.get(`/api/admin/user-permissions/${userId}`)
      .then(r => r.data),

  setUserPermission: (userId: number, data: {
    permission_id: number;
    granted: boolean;
  }) =>
    apiClient.post(`/api/admin/user-permissions/${userId}`, data)
      .then(r => r.data),

  removeUserPermission: (userId: number, permissionId: number) =>
    apiClient.delete(
      `/api/admin/user-permissions/${userId}/${permissionId}`)
      .then(r => r.data),

  getDepartments: () =>
    apiClient.get('/api/admin/departments'),

  getPositions: (departmentId?: number) =>
    apiClient.get('/api/admin/positions', departmentId ? { params: { department_id: departmentId } } : undefined),

  // ─── Registrations ──────────────────────────────────────────────────────────

  getRegistrations: (statut = 'EN_ATTENTE_VALIDATION') =>
    apiClient.get('/api/admin/registrations', { params: { statut } }),

  approveRegistration: (id: number) =>
    apiClient.post(`/api/admin/registrations/${id}/approve`),

  rejectRegistration: (id: number, motif: string) =>
    apiClient.post(`/api/admin/registrations/${id}/reject`, { motif }),

  // ─── Audit Log ──────────────────────────────────────────────────────────────

  getAuditLog: (params?: Record<string, string>) =>
    apiClient.get('/api/admin/audit', { params }),

  // ─── System Config (configuration_systeme — legacy) ─────────────────────────

  getConfig: () =>
    apiClient.get('/api/admin/config'),

  updateConfig: (cle: string, valeur: string) =>
    apiClient.post('/api/admin/config', { cle, valeur }),

  // ─── System Config (system_config — new) ────────────────────────────────────

  getSystemConfig: () =>
    apiClient.get('/api/admin/system-config'),

  updateSystemConfigSection: (section: string, data: Record<string, string>) =>
    apiClient.post(`/api/admin/system-config/${section}`, data),

  // ─── Dashboard ──────────────────────────────────────────────────────────────

  getDashboard: () =>
    apiClient.get('/api/admin/dashboard'),

  // ─── Currencies ─────────────────────────────────────────────────────────────

  getCurrencies: () =>
    apiClient.get('/api/admin/currencies'),

  syncCurrencies: () =>
    apiClient.post('/api/admin/currencies/sync'),

  updateCurrencyRate: (code: string, taux: number) =>
    apiClient.post(`/api/admin/currencies/${code}/update`, { taux }),

  // ─── Franchises ──────────────────────────────────────────────────────────────

  getFranchises: () =>
    apiClient.get('/api/admin/franchises').then(r => r.data),

  createFranchise: (data: Record<string, any>) =>
    apiClient.post('/api/admin/franchises', data).then(r => r.data),

  updateFranchise: (id: number, data: Record<string, any>) =>
    apiClient.put(`/api/admin/franchises/${id}`, data).then(r => r.data),

  deleteFranchise: (id: number) =>
    apiClient.delete(`/api/admin/franchises/${id}`).then(r => r.data),

  getPortsList: () =>
    apiClient.get('/api/admin/ports').then(r => r.data),

  getClientsList: () =>
    apiClient.get('/api/clients').then(r => r.data),

  // ─── Conditions Générales ────────────────────────────────────────────────────

  getConditions: () =>
    apiClient.get('/api/admin/conditions').then(r => r.data),

  createCondition: (data: Record<string, any>) =>
    apiClient.post('/api/admin/conditions', data).then(r => r.data),

  updateCondition: (id: number, data: Record<string, any>) =>
    apiClient.put(`/api/admin/conditions/${id}`, data).then(r => r.data),

  activateCondition: (id: number) =>
    apiClient.post(`/api/admin/conditions/${id}/activate`).then(r => r.data),

  deleteCondition: (id: number) =>
    apiClient.delete(`/api/admin/conditions/${id}`).then(r => r.data),

  // ─── Banques ─────────────────────────────────────────────────────────────────

  getBanques: () =>
    apiClient.get('/api/admin/banques').then(r => r.data),

  createBanque: (data: Record<string, any>) =>
    apiClient.post('/api/admin/banques', data).then(r => r.data),

  updateBanque: (id: number, data: Record<string, any>) =>
    apiClient.put(`/api/admin/banques/${id}`, data).then(r => r.data),

  deleteBanque: (id: number) =>
    apiClient.delete(`/api/admin/banques/${id}`).then(r => r.data),

  // ─── TarifService ────────────────────────────────────────────────────────────

  getTarifs: () =>
    apiClient.get('/api/admin/tarifs').then(r => r.data),

  getTypeConteneurs: () =>
    apiClient.get('/api/admin/type-conteneurs').then(r => r.data),

  createTypeConteneur: (data: Record<string, any>) =>
    apiClient.post('/api/admin/type-conteneurs', data).then(r => r.data),

  updateTypeConteneur: (id: number, data: Record<string, any>) =>
    apiClient.put(`/api/admin/type-conteneurs/${id}`, data).then(r => r.data),

  deleteTypeConteneur: (id: number) =>
    apiClient.delete(`/api/admin/type-conteneurs/${id}`).then(r => r.data),

  createTarif: (data: Record<string, any>) =>
    apiClient.post('/api/admin/tarifs', data).then(r => r.data),

  updateTarif: (id: number, data: Record<string, any>) =>
    apiClient.put(`/api/admin/tarifs/${id}`, data).then(r => r.data),

  deleteTarif: (id: number) =>
    apiClient.delete(`/api/admin/tarifs/${id}`).then(r => r.data),

  // ─── Admin Notifications ─────────────────────────────────────────────────────

  getAdminNotificationsAll: () =>
    apiClient.get('/api/admin/notifications/all').then(r => r.data),

  markAdminNotificationRead: (id: number) =>
    apiClient.post(`/api/admin/notifications/${id}/read`),

  markAllAdminNotificationsRead: () =>
    apiClient.post('/api/admin/notifications/read-all'),

  deleteAdminNotification: (id: number) =>
    apiClient.delete(`/api/admin/notifications/${id}`),

  deleteAllReadAdminNotifications: () =>
    apiClient.delete('/api/admin/notifications/read'),
};
