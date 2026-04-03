import { apiClient } from './api';
import { CreateDemandePayload, DemandeImport, Port, Pays, TypeConteneur, Marchandise } from '../types/demand';

export const demandService = {
  // Fetch existing demands for the dashboard
  async getDemands(page = 1): Promise<{ data: DemandeImport[], current_page: number, last_page: number, total: number }> {
    const response = await apiClient.get(`/api/client/demands?page=${page}`);
    return response.data;
  },

  // Fetch a specific demand by its ID
  async getDemandStats(id: number): Promise<DemandeImport> {
    const response = await apiClient.get(`/api/client/demands/${id}`);
    return response.data;
  },

  // Get creation resources (ports, countries, container types...)
  async getFormData(): Promise<{ ports: Port[], pays: Pays[], types_conteneur: TypeConteneur[], marchandises: Marchandise[] }> {
    // Wait, the backend route for this is usually GET /api/client/demands/create
    const response = await apiClient.get('/api/client/demands/create');
    return response.data;
  },

  // Submit a new demand
  async createDemand(payload: CreateDemandePayload): Promise<{ message: string; demande: DemandeImport }> {
    const response = await apiClient.post('/api/client/demands', payload);
    return response.data;
  }
};
