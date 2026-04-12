// ─── Roles ────────────────────────────────────────────────────────────────────

export interface Role {
  id: number;
  nom_role: string;
  label: string;
  niveau: number;
}

// ─── Positions ────────────────────────────────────────────────────────────────

export interface Position {
  id: number;
  title: string;
  description: string | null;
  department_id: number | null;
  department: { id: number; name: string; code: string } | null;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export type UserStatut = 'ACTIF' | 'INACTIF' | 'SUSPENDU' | 'VERROUILLE' | 'EN_ATTENTE_VALIDATION' | 'REJETE';

export interface AdminUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  /** Resolved position title — comes through the Laravel accessor (normalized or legacy string) */
  position: string | null;
  position_id: number | null;
  position_obj: { id: number; title: string; department_id: number | null } | null;
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
  department_id?: number;
  position?: string;
}

export interface UpdateUserPayload {
  nom?: string;
  prenom?: string;
  email?: string;
  role_id?: number;
  department_id?: number;
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
