export type RoleLabel = 'admin' | 'directeur' | 'commercial' | 'logistique' | 'financier' | 'client';

export interface UserRole {
  id: number;
  label: RoleLabel;
  nom: string;
}

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  statut: string;
  must_change_password?: boolean;
  role: UserRole;
  client_profile?: any; // To type stricter later based on DB
  derniere_connexion?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  raison_sociale: string;
  nif: string;
  nis: string;
  rc: string;
  adresse_siege: string;
  ville: string;
  pays_id: number | string;
  type_client: 'ENTREPRISE' | 'PARTICULIER' | 'ADMINISTRATION';
  rep_nom: string;
  rep_prenom: string;
  rep_role: string;
  rep_tel: string;
  rep_email: string;
}
