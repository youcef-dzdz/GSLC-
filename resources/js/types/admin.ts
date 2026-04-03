// ─── Roles ────────────────────────────────────────────────────────────────────

export interface Role {
  id: number;
  nom_role: string;
  label: string;
  niveau: number;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export type UserStatut = 'ACTIF' | 'INACTIF' | 'SUSPENDU' | 'VERROUILLE' | 'EN_ATTENTE_VALIDATION' | 'REJETE';

export interface AdminUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  position: string | null;
  statut: UserStatut;
  tentatives_echouees: number;
  derniere_connexion: string | null;
  created_at: string;
  role: Role | null;
}

export interface CreateUserPayload {
  nom: string;
  prenom: string;
  email: string;
  role_id: number;
  position?: string;
}

export interface UpdateUserPayload {
  nom?: string;
  prenom?: string;
  email?: string;
  role_id?: number;
  position?: string;
  statut?: UserStatut;
}

// ─── Paginated response (Laravel pagination format) ───────────────────────────

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: number;
  utilisateur: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT';
  table_cible: string;
  enregistrement_id: string | null;
  anciennes_valeurs: string | null;
  nouvelles_valeurs: string | null;
  adresse_ip: string | null;
  resultat: string;
  date_action: string;
}

// ─── System Config ────────────────────────────────────────────────────────────

export interface ConfigItem {
  id: number;
  cle: string;
  valeur: string;
  type: string;
  modifiable: boolean;
  description: string | null;
}
