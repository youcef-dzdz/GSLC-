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
};
