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
  getPorts:       ()                          => api.get('/admin/ports').then(r => r.data as Port[]),
  createPort:     (data: PortForm)            => api.post('/admin/ports', data).then(r => r.data),
  updatePort:     (id: number, data: PortForm) => api.put(`/admin/ports/${id}`, data).then(r => r.data),
  deletePort:     (id: number)               => api.delete(`/admin/ports/${id}`).then(r => r.data),

  getTerminaux:   ()                               => api.get('/admin/terminaux').then(r => r.data as Terminal[]),
  createTerminal: (data: TerminalForm)             => api.post('/admin/terminaux', data).then(r => r.data),
  updateTerminal: (id: number, data: TerminalForm) => api.put(`/admin/terminaux/${id}`, data).then(r => r.data),
  deleteTerminal: (id: number)                    => api.delete(`/admin/terminaux/${id}`).then(r => r.data),

  getDepots:      ()                           => api.get('/admin/depots').then(r => r.data as Depot[]),
  createDepot:    (data: DepotForm)            => api.post('/admin/depots', data).then(r => r.data),
  updateDepot:    (id: number, data: DepotForm) => api.put(`/admin/depots/${id}`, data).then(r => r.data),
  deleteDepot:    (id: number)                => api.delete(`/admin/depots/${id}`).then(r => r.data),
};
