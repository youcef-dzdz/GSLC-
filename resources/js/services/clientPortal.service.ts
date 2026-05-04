import { apiClient } from './api';

export const clientPortalService = {
  getDashboard: () =>
    apiClient.get('/api/client/dashboard'),

  getDemands: (params?: Record<string, string | number>) =>
    apiClient.get('/api/client/demands', { params }),

  getDemand: (id: number) =>
    apiClient.get(`/api/client/demands/${id}`),

  createDemand: (data: Record<string, unknown>) =>
    apiClient.post('/api/client/demands', data),

  getQuote: (id: number) =>
    apiClient.get(`/api/client/quotes/${id}`),

  acceptQuote: (id: number) =>
    apiClient.post(`/api/client/quotes/${id}/accept`),

  rejectQuote: (id: number, raison: string) =>
    apiClient.post(`/api/client/quotes/${id}/reject`, { raison }),

  requestModification: (id: number, commentaire: string) =>
    apiClient.post(`/api/client/quotes/${id}/modify`, { commentaire }),

  getContracts: () =>
    apiClient.get('/api/client/contracts'),

  getContractSignature: (id: number) =>
    apiClient.get(`/api/client/contracts/${id}/sign`),

  submitSignature: (id: number, otp: string) =>
    apiClient.post(`/api/client/contracts/${id}/sign`, {
      otp,
      conditions_acceptees: true,
    }),

  getInvoices: () =>
    apiClient.get('/api/client/invoices'),

  downloadInvoice: (id: number) =>
    apiClient.get(`/api/client/invoices/${id}/pdf`),

  getContainers: () =>
    apiClient.get('/api/client/containers'),
};
