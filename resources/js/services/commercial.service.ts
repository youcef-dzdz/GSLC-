import { apiClient } from './api';

export const commercialService = {

  // ─── Dashboard ───────────────────────────────────────────────────────────────
  getDashboard: () =>
    apiClient.get('/api/commercial/dashboard'),

  // ─── Clients ─────────────────────────────────────────────────────────────────
  getClients: (params?: Record<string, string | number>) =>
    apiClient.get('/api/commercial/clients', { params }),

  getClient: (id: number) =>
    apiClient.get(`/api/commercial/clients/${id}`),

  createClient: (data: Record<string, unknown>) =>
    apiClient.post('/api/commercial/clients', data),

  updateClient: (id: number, data: Record<string, unknown>) =>
    apiClient.put(`/api/commercial/clients/${id}`, data),

  // ─── Demands ─────────────────────────────────────────────────────────────────
  getDemands: (params?: Record<string, string | number>) =>
    apiClient.get('/api/commercial/demands', { params }),

  getDemand: (id: number) =>
    apiClient.get(`/api/commercial/demands/${id}`),

  createDemand: (data: Record<string, unknown>) =>
    apiClient.post('/api/commercial/demands', data),

  updateDemandStatus: (id: number, data: { statut: string; motif_rejet?: string }) =>
    apiClient.put(`/api/commercial/demands/${id}`, data),

  // ─── Quotes ──────────────────────────────────────────────────────────────────
  getQuotes: (params?: Record<string, string | number>) =>
    apiClient.get('/api/commercial/quotes', { params }),

  getQuote: (id: number) =>
    apiClient.get(`/api/commercial/quotes/${id}`),

  createQuote: (data: Record<string, unknown>) =>
    apiClient.post('/api/commercial/quotes', data),

  updateQuote: (id: number, data: Record<string, unknown>) =>
    apiClient.put(`/api/commercial/quotes/${id}`, data),

  // ─── Contracts ───────────────────────────────────────────────────────────────
  getContracts: (params?: Record<string, string | number>) =>
    apiClient.get('/api/commercial/contracts', { params }),

  getContract: (id: number) =>
    apiClient.get(`/api/commercial/contracts/${id}`),

  createContract: (data: Record<string, unknown>) =>
    apiClient.post('/api/commercial/contracts', data),

  activateContract: (id: number) =>
    apiClient.post(`/api/commercial/contracts/${id}/activate`),

  // ─── Vessels ─────────────────────────────────────────────────────────────────
  getVessels: () =>
    apiClient.get('/api/commercial/vessels'),

  // ─── Reference data ──────────────────────────────────────────────────────────
  getPays: () =>
    apiClient.get('/api/pays'),
};
