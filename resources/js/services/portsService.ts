import api from './api';

export interface Port {
  id: number;
  nom_port: string;
  code_port: string;
  ville: string;
  type_port: 'MARITIME' | 'AERIEN' | 'TERRESTRE';
  jours_allowance_defaut: number;
  actif: boolean;
  terminaux_count?: number;
  depots_count?: number;
}

export interface Terminal {
  id: number;
  port_id: number;
  port?: { id: number; nom_port: string };
  code_terminal: string;
  nom_terminal: string;
  capacite_max_teu: number;
  taux_occupation: number;
  actif: boolean;
}

export interface Depot {
  id: number;
  port_id: number;
  terminal_id: number | null;
  port?: { id: number; nom_port: string };
  terminal?: { id: number; nom_terminal: string } | null;
  code_depot: string;
  nom_depot: string;
  type_stockage: 'SEC' | 'FRIGO' | 'DANGEREUX';
  capacite_totale: number;
  actif: boolean;
}

export type PortForm = Omit<Port, 'id' | 'terminaux_count' | 'depots_count'>;
export type TerminalForm = Omit<Terminal, 'id' | 'port'>;
export type DepotForm = Omit<Depot, 'id' | 'port' | 'terminal'>;

export const portsService = {
  getPorts:       ()                          => api.get('/api/admin/ports').then(r => (Array.isArray(r.data) ? r.data : (r.data.data ?? [])) as Port[]),
  createPort:     (data: PortForm)            => api.post('/api/admin/ports', data).then(r => r.data),
  updatePort:     (id: number, data: PortForm) => api.put(`/api/admin/ports/${id}`, data).then(r => r.data),
  deletePort:     (id: number)               => api.delete(`/api/admin/ports/${id}`).then(r => r.data),

  getTerminaux:   ()                               => api.get('/api/admin/terminaux').then(r => (Array.isArray(r.data) ? r.data : (r.data.data ?? [])) as Terminal[]),
  createTerminal: (data: TerminalForm)             => api.post('/api/admin/terminaux', data).then(r => r.data),
  updateTerminal: (id: number, data: TerminalForm) => api.put(`/api/admin/terminaux/${id}`, data).then(r => r.data),
  deleteTerminal: (id: number)                    => api.delete(`/api/admin/terminaux/${id}`).then(r => r.data),

  getDepots:      ()                           => api.get('/api/admin/depots').then(r => (Array.isArray(r.data) ? r.data : (r.data.data ?? [])) as Depot[]),
  createDepot:    (data: DepotForm)            => api.post('/api/admin/depots', data).then(r => r.data),
  updateDepot:    (id: number, data: DepotForm) => api.put(`/api/admin/depots/${id}`, data).then(r => r.data),
  deleteDepot:    (id: number)                => api.delete(`/api/admin/depots/${id}`).then(r => r.data),
};
