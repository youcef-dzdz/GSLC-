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

  // ─── System Config ──────────────────────────────────────────────────────────

  getConfig: () =>
    apiClient.get('/api/admin/config'),

  updateConfig: (cle: string, valeur: string) =>
    apiClient.post('/api/admin/config', { cle, valeur }),

  // ─── Dashboard ──────────────────────────────────────────────────────────────

  getDashboard: () =>
    apiClient.get('/api/admin/dashboard'),
};
