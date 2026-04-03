import { apiClient } from '@/services/api'

export interface Pays {
  id: number
  nom_pays: string
  code_iso: string
}

export interface Client {
  id: number
  user_id: number
  raison_sociale: string
  nif: string
  nis: string
  rc: string
  adresse_siege: string
  ville: string
  pays_id: number
  type_client: 'ENTREPRISE' | 'PARTICULIER' | 'ADMINISTRATION'
  rep_nom: string
  rep_prenom: string
  rep_role: string
  rep_tel: string
  rep_email: string
  rep_adresse_perso: string | null
  statut: 'EN_ATTENTE_VALIDATION' | 'APPROUVE' | 'REJETE' | 'SUSPENDU'
  valide_par_user_id: number | null
  date_validation: string | null
  motif_rejet: string | null
  created_at: string
  updated_at: string
  pays?: Pays
  user?: { id: number; nom: string; prenom: string; email: string }
  valide_par?: { id: number; nom: string; prenom: string }
}

export interface ClientFilters {
  page?: number
  search?: string
  statut?: string
  type_client?: string
  date_from?: string
  date_to?: string
}

export interface PaginatedClients {
  data: Client[]
  current_page: number
  last_page: number
  total: number
  per_page: number
}

export const clientService = {
  getAll: (params: ClientFilters): Promise<PaginatedClients> =>
    apiClient.get('/api/clients', { params }).then(r => r.data),

  getOne: (id: number): Promise<{ client: Client; derniers_dossiers: unknown[]; stats: Record<string, number> }> =>
    apiClient.get(`/api/clients/${id}`).then(r => r.data),

  create: (data: Partial<Client>): Promise<Client> =>
    apiClient.post('/api/clients', data).then(r => r.data),

  update: (id: number, data: Partial<Client>): Promise<Client> =>
    apiClient.put(`/api/clients/${id}`, data).then(r => r.data),

  remove: (id: number): Promise<{ message: string }> =>
    apiClient.delete(`/api/clients/${id}`).then(r => r.data),
}

export const paysService = {
  getAll: (): Promise<Pays[]> =>
    apiClient.get('/api/pays').then(r => r.data),
}
