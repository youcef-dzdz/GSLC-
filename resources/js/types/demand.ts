export interface Port {
  id: number;
  nom_port: string;
  code_port: string;
  pays_id: number;
}

export interface Pays {
  id: number;
  nom_pays: string;
  code_iso: string;
}

export interface Marchandise {
  id: number;
  nom: string;
  code_sh: string;
}

export interface TypeConteneur {
  id: number;
  code_type: string;
  libelle: string;
  tarif_journalier_defaut?: string;
}

export interface DemandeLignePayload {
  type_conteneur_id: number;
  marchandise_id?: number | null;
  pays_origine_id: number;
  quantite: number;
  poids_total?: number | null;
  volume?: number | null;
  description?: string;
}

export interface CreateDemandePayload {
  port_origine_id: number;
  port_destination_id: number;
  type_achat: 'FOB' | 'CIF' | 'EXW' | 'DAP';
  priorite: 'NORMALE' | 'HAUTE' | 'URGENTE';
  date_livraison_souhaitee: string;
  notes_client?: string;
  transitaire_nom?: string;
  transitaire_id?: number | null;
  lignes: DemandeLignePayload[];
}

export interface LigneDemande {
  id: number;
  demande_id: number;
  type_conteneur_id: number;
  marchandise_id?: number;
  pays_origine_id: number;
  quantite: number;
  poids_total?: string;
  volume?: string;
  description?: string;
  type_conteneur?: TypeConteneur;
  marchandise?: Marchandise;
}

export interface DemandeImport {
  id: number;
  client_id: number;
  transitaire_id?: number;
  port_origine_id: number;
  port_destination_id: number;
  numero_dossier: string;
  type_achat: string;
  priorite: string;
  date_soumission: string;
  date_livraison_souhaitee: string;
  statut: 'EN_ATTENTE' | 'EN_ETUDE' | 'APPROUVEE' | 'REJETEE' | 'MODIFICATION_REQUISE';
  notes_client?: string;
  created_at: string;
  updated_at: string;
  port_origine?: Port;
  port_destination?: Port;
  lignes?: LigneDemande[];
}
