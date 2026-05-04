--
-- PostgreSQL database dump
--

\restrict 0tZlw0VxKJ0QBwNfN8fW5UvUhL2xtJXl5aNvez64JbUuNTyPbfSAGCVHlTXcAsO

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: Schema 01; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA "Schema 01";


ALTER SCHEMA "Schema 01" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: actualites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.actualites (
    id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.actualites OWNER TO postgres;

--
-- Name: actualites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.actualites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.actualites_id_seq OWNER TO postgres;

--
-- Name: actualites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.actualites_id_seq OWNED BY public.actualites.id;


--
-- Name: alertes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alertes (
    id bigint NOT NULL,
    type_alerte character varying(255) NOT NULL,
    niveau character varying(255) DEFAULT 'ATTENTION'::character varying NOT NULL,
    entite_type character varying(60),
    entite_id bigint,
    message text NOT NULL,
    meta json,
    destinataire_user_id bigint,
    est_lue boolean DEFAULT false NOT NULL,
    lue_le timestamp(0) without time zone,
    est_traitee boolean DEFAULT false NOT NULL,
    traitee_par_user_id bigint,
    date_traitement timestamp(0) without time zone,
    note_traitement text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT alertes_niveau_check CHECK (((niveau)::text = ANY ((ARRAY['INFO'::character varying, 'ATTENTION'::character varying, 'CRITIQUE'::character varying])::text[]))),
    CONSTRAINT alertes_type_alerte_check CHECK (((type_alerte)::text = ANY ((ARRAY['SURESTARIE_J3'::character varying, 'SURESTARIE_J1'::character varying, 'SURESTARIE_DEPASSEE'::character varying, 'DOCUMENT_EXPIRATION'::character varying, 'CONTRAT_EXPIRATION'::character varying, 'CAUTION_NON_CONFIRMEE'::character varying, 'SCORE_RISQUE_ELEVE'::character varying, 'SCORE_RISQUE_CRITIQUE'::character varying, 'DEVIS_EXPIRE'::character varying, 'PAIEMENT_EN_RETARD'::character varying, 'AUTRE'::character varying])::text[])))
);


ALTER TABLE public.alertes OWNER TO postgres;

--
-- Name: alertes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.alertes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alertes_id_seq OWNER TO postgres;

--
-- Name: alertes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.alertes_id_seq OWNED BY public.alertes.id;


--
-- Name: avenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.avenants (
    id bigint NOT NULL,
    contrat_id bigint NOT NULL,
    numero_avenant smallint DEFAULT '1'::smallint NOT NULL,
    type_modification character varying(255) NOT NULL,
    description text NOT NULL,
    modifications json,
    statut character varying(255) DEFAULT 'BROUILLON'::character varying NOT NULL,
    cree_par_user_id bigint NOT NULL,
    signature_ip character varying(45),
    signature_user_agent character varying(255),
    signature_otp_token character varying(6),
    signe_le timestamp(0) without time zone,
    motif_refus text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT avenants_statut_check CHECK (((statut)::text = ANY ((ARRAY['BROUILLON'::character varying, 'EN_ATTENTE_SIGNATURE'::character varying, 'SIGNE'::character varying, 'REFUSE'::character varying, 'ANNULE'::character varying])::text[]))),
    CONSTRAINT avenants_type_modification_check CHECK (((type_modification)::text = ANY ((ARRAY['PROLONGATION_DUREE'::character varying, 'AJOUT_CONTENEURS'::character varying, 'RETRAIT_CONTENEURS'::character varying, 'MODIFICATION_TARIF'::character varying, 'MODIFICATION_CONDITIONS'::character varying, 'AUTRE'::character varying])::text[])))
);


ALTER TABLE public.avenants OWNER TO postgres;

--
-- Name: avenants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.avenants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.avenants_id_seq OWNER TO postgres;

--
-- Name: avenants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.avenants_id_seq OWNED BY public.avenants.id;


--
-- Name: banques; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banques (
    id bigint NOT NULL,
    nom character varying(255) NOT NULL,
    code_banque character varying(255) NOT NULL,
    adresse character varying(255),
    telephone character varying(255),
    swift character varying(255),
    actif boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.banques OWNER TO postgres;

--
-- Name: banques_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.banques_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.banques_id_seq OWNER TO postgres;

--
-- Name: banques_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.banques_id_seq OWNED BY public.banques.id;


--
-- Name: cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO postgres;

--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO postgres;

--
-- Name: calcul_penalites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calcul_penalites (
    id bigint NOT NULL,
    conteneur_id bigint NOT NULL,
    contrat_id bigint NOT NULL,
    penalite_id bigint,
    franchise_id bigint,
    cree_par_user_id bigint,
    type_penalite character varying(255) DEFAULT 'DEMURRAGE'::character varying NOT NULL,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    jours_franchise_appliques integer DEFAULT 0 NOT NULL,
    jours_retard integer NOT NULL,
    tarif_applique numeric(10,2) NOT NULL,
    montant_ht numeric(12,2) NOT NULL,
    tva numeric(12,2) NOT NULL,
    montant_ttc numeric(12,2) NOT NULL,
    statut character varying(255) DEFAULT 'CALCULE'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.calcul_penalites OWNER TO postgres;

--
-- Name: calcul_penalites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.calcul_penalites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.calcul_penalites_id_seq OWNER TO postgres;

--
-- Name: calcul_penalites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.calcul_penalites_id_seq OWNED BY public.calcul_penalites.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    raison_sociale character varying(255) NOT NULL,
    nif character varying(255) NOT NULL,
    nis character varying(255) NOT NULL,
    rc character varying(255) NOT NULL,
    adresse_siege character varying(255) NOT NULL,
    ville character varying(255) NOT NULL,
    pays_id bigint NOT NULL,
    type_client character varying(255) DEFAULT 'ORDINAIRE'::character varying NOT NULL,
    rep_nom character varying(255) NOT NULL,
    rep_prenom character varying(255) NOT NULL,
    rep_role character varying(255) NOT NULL,
    rep_tel character varying(255) NOT NULL,
    rep_email character varying(255) NOT NULL,
    rep_adresse_perso character varying(255),
    statut character varying(255) DEFAULT 'EN_ATTENTE_VALIDATION'::character varying NOT NULL,
    valide_par_user_id bigint,
    date_validation timestamp(0) without time zone,
    motif_rejet text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clients_id_seq OWNER TO postgres;

--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: conditions_generales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conditions_generales (
    id bigint NOT NULL,
    version character varying(255) NOT NULL,
    titre character varying(255) NOT NULL,
    contenu text NOT NULL,
    actif boolean DEFAULT false NOT NULL,
    cree_par_user_id bigint,
    date_application timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.conditions_generales OWNER TO postgres;

--
-- Name: conditions_generales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conditions_generales_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conditions_generales_id_seq OWNER TO postgres;

--
-- Name: conditions_generales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conditions_generales_id_seq OWNED BY public.conditions_generales.id;


--
-- Name: configuration_systeme; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuration_systeme (
    id bigint NOT NULL,
    cle character varying(255) NOT NULL,
    valeur character varying(255) NOT NULL,
    type_valeur character varying(255) DEFAULT 'STRING'::character varying NOT NULL,
    description text,
    modifiable boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.configuration_systeme OWNER TO postgres;

--
-- Name: configuration_systeme_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.configuration_systeme_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.configuration_systeme_id_seq OWNER TO postgres;

--
-- Name: configuration_systeme_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.configuration_systeme_id_seq OWNED BY public.configuration_systeme.id;


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_messages (
    id uuid NOT NULL,
    nom_complet character varying(100) NOT NULL,
    entreprise character varying(100),
    email character varying(150) NOT NULL,
    objet character varying(255) NOT NULL,
    message text NOT NULL,
    statut character varying(255) DEFAULT 'non_lu'::character varying NOT NULL,
    lu_par bigint,
    lu_le timestamp(0) without time zone,
    ip_address character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT contact_messages_objet_check CHECK (((objet)::text = ANY ((ARRAY['demande_location'::character varying, 'demande_devis'::character varying, 'suivi_expedition'::character varying, 'information_services'::character varying, 'reclamation'::character varying, 'autre'::character varying])::text[]))),
    CONSTRAINT contact_messages_statut_check CHECK (((statut)::text = ANY ((ARRAY['non_lu'::character varying, 'lu'::character varying, 'traite'::character varying])::text[])))
);


ALTER TABLE public.contact_messages OWNER TO postgres;

--
-- Name: containers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.containers (
    id bigint NOT NULL,
    container_number character varying(255) NOT NULL,
    dossier_id bigint NOT NULL,
    status_phase character varying(255) DEFAULT 'Admin'::character varying NOT NULL,
    arrival_date date,
    free_days integer DEFAULT 0 NOT NULL,
    return_date date,
    user_id bigint,
    ip_address inet,
    payload_json json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.containers OWNER TO postgres;

--
-- Name: containers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.containers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.containers_id_seq OWNER TO postgres;

--
-- Name: containers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.containers_id_seq OWNED BY public.containers.id;


--
-- Name: conteneurs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conteneurs (
    id bigint NOT NULL,
    numero_conteneur character varying(255) NOT NULL,
    type_id bigint NOT NULL,
    proprietaire character varying(255) NOT NULL,
    hauteur numeric(5,2),
    largeur numeric(5,2),
    poids_max numeric(8,2),
    etat_actuel character varying(255) DEFAULT 'BON_ETAT'::character varying NOT NULL,
    statut character varying(255) DEFAULT 'DISPONIBLE'::character varying NOT NULL,
    temperature numeric(5,2),
    date_achat date,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.conteneurs OWNER TO postgres;

--
-- Name: conteneurs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conteneurs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conteneurs_id_seq OWNER TO postgres;

--
-- Name: conteneurs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conteneurs_id_seq OWNED BY public.conteneurs.id;


--
-- Name: contrats_import; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contrats_import (
    id bigint NOT NULL,
    numero_contrat character varying(255) NOT NULL,
    devis_id bigint NOT NULL,
    client_id bigint NOT NULL,
    demande_id bigint NOT NULL,
    cree_par_user_id bigint,
    conditions_generales_id bigint,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    statut character varying(255) DEFAULT 'EN_ATTENTE_SIGNATURE'::character varying NOT NULL,
    clauses_renouvellement text,
    clauses_resiliation text,
    clauses_speciales text,
    type_signature character varying(255) DEFAULT 'EN_LIGNE'::character varying NOT NULL,
    date_signature timestamp(0) without time zone,
    ip_signature character varying(255),
    user_agent_signature character varying(255),
    token_signature character varying(255),
    conditions_acceptees boolean DEFAULT false NOT NULL,
    date_acceptation_conditions timestamp(0) without time zone,
    ip_acceptation_conditions character varying(255),
    montant_caution numeric(15,2),
    statut_caution character varying(255) DEFAULT 'EN_ATTENTE'::character varying NOT NULL,
    numero_cheque character varying(255),
    banque_id bigint,
    montant_cheque numeric(15,2),
    date_cheque date,
    est_certifie boolean DEFAULT false NOT NULL,
    date_depot_cheque date,
    date_limite_depot date,
    recu_par_user_id bigint,
    date_verification_caution timestamp(0) without time zone,
    verifie_caution_par_user_id bigint,
    date_restitution_cheque date,
    date_encaissement_cheque date,
    motif_encaissement text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.contrats_import OWNER TO postgres;

--
-- Name: contrats_import_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contrats_import_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contrats_import_id_seq OWNER TO postgres;

--
-- Name: contrats_import_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contrats_import_id_seq OWNED BY public.contrats_import.id;


--
-- Name: corbeille; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.corbeille (
    id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL,
    snapshot json NOT NULL,
    deleted_by bigint NOT NULL,
    deleted_by_name character varying(255) NOT NULL,
    deleted_by_email character varying(255) NOT NULL,
    deleted_by_role character varying(255),
    deleted_by_ip character varying(255),
    deleted_at_audit timestamp(0) without time zone NOT NULL,
    expires_at timestamp(0) without time zone NOT NULL,
    restored_at timestamp(0) without time zone,
    restored_by bigint,
    restored_by_name character varying(255),
    restored_by_email character varying(255),
    restored_by_ip character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.corbeille OWNER TO postgres;

--
-- Name: corbeille_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.corbeille_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.corbeille_id_seq OWNER TO postgres;

--
-- Name: corbeille_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.corbeille_id_seq OWNED BY public.corbeille.id;


--
-- Name: demande_conteneurs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.demande_conteneurs (
    id bigint NOT NULL,
    demande_id bigint NOT NULL,
    type_conteneur_id bigint NOT NULL,
    conteneur_id bigint,
    nombre_unites integer NOT NULL,
    statut character varying(255) DEFAULT 'DEMANDE'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.demande_conteneurs OWNER TO postgres;

--
-- Name: demande_conteneurs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.demande_conteneurs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.demande_conteneurs_id_seq OWNER TO postgres;

--
-- Name: demande_conteneurs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.demande_conteneurs_id_seq OWNED BY public.demande_conteneurs.id;


--
-- Name: demande_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.demande_documents (
    id bigint NOT NULL,
    demande_id bigint NOT NULL,
    document_id bigint NOT NULL,
    verifie_par_user_id bigint,
    est_verifie boolean DEFAULT false NOT NULL,
    date_verification timestamp(0) without time zone,
    commentaire text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.demande_documents OWNER TO postgres;

--
-- Name: demande_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.demande_documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.demande_documents_id_seq OWNER TO postgres;

--
-- Name: demande_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.demande_documents_id_seq OWNED BY public.demande_documents.id;


--
-- Name: demandes_import; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.demandes_import (
    id bigint NOT NULL,
    client_id bigint NOT NULL,
    transitaire_id bigint,
    port_origine_id bigint,
    port_destination_id bigint,
    traite_par_user_id bigint,
    numero_dossier character varying(255) NOT NULL,
    type_achat character varying(255) NOT NULL,
    priorite character varying(255) DEFAULT 'NORMALE'::character varying NOT NULL,
    date_soumission timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    date_livraison_souhaitee date,
    statut character varying(255) DEFAULT 'BROUILLON'::character varying NOT NULL,
    nombre_negociations integer DEFAULT 0 NOT NULL,
    notes_client text,
    motif_rejet text,
    date_traitement timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.demandes_import OWNER TO postgres;

--
-- Name: demandes_import_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.demandes_import_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.demandes_import_id_seq OWNER TO postgres;

--
-- Name: demandes_import_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.demandes_import_id_seq OWNED BY public.demandes_import.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    description text,
    responsable_id bigint
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_id_seq OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: depots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.depots (
    id bigint NOT NULL,
    port_id bigint NOT NULL,
    terminal_id bigint,
    code_depot character varying(255) NOT NULL,
    nom_depot character varying(255) NOT NULL,
    adresse_precise character varying(255) NOT NULL,
    telephone character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    type_stockage character varying(255) NOT NULL,
    capacite_totale integer NOT NULL,
    responsable character varying(255),
    actif boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.depots OWNER TO postgres;

--
-- Name: depots_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.depots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.depots_id_seq OWNER TO postgres;

--
-- Name: depots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.depots_id_seq OWNED BY public.depots.id;


--
-- Name: devis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.devis (
    id bigint NOT NULL,
    demande_id bigint NOT NULL,
    cree_par_user_id bigint,
    devis_precedent_id bigint,
    numero_devis character varying(255) NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    montant_ht numeric(15,2) NOT NULL,
    tva numeric(15,2) NOT NULL,
    total_ttc numeric(15,2) NOT NULL,
    statut character varying(255) DEFAULT 'BROUILLON'::character varying NOT NULL,
    commentaire_client text,
    commentaire_nashco text,
    date_envoi timestamp(0) without time zone,
    date_expiration date,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.devis OWNER TO postgres;

--
-- Name: devis_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.devis_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.devis_id_seq OWNER TO postgres;

--
-- Name: devis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.devis_id_seq OWNED BY public.devis.id;


--
-- Name: devises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.devises (
    id bigint NOT NULL,
    code character varying(3) NOT NULL,
    nom character varying(255) NOT NULL,
    symbole character varying(5) NOT NULL,
    taux_actuel numeric(10,4) NOT NULL,
    taux_base numeric(10,4) DEFAULT '1'::numeric NOT NULL,
    date_derniere_maj date,
    source character varying(255) DEFAULT 'MANUEL'::character varying NOT NULL,
    actif boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.devises OWNER TO postgres;

--
-- Name: devises_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.devises_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.devises_id_seq OWNER TO postgres;

--
-- Name: devises_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.devises_id_seq OWNED BY public.devises.id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id bigint NOT NULL,
    client_id bigint NOT NULL,
    demande_id bigint,
    nom_original character varying(255) NOT NULL,
    nom_stockage character varying(255) NOT NULL,
    type_document character varying(255) NOT NULL,
    extension character varying(255) NOT NULL,
    chemin_stockage character varying(255) NOT NULL,
    taille bigint,
    statut character varying(255) DEFAULT 'EN_ATTENTE_VALIDATION'::character varying NOT NULL,
    valide_par_user_id bigint,
    date_validation timestamp(0) without time zone,
    motif_rejet text,
    date_expiration date,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documents_id_seq OWNER TO postgres;

--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;


--
-- Name: dossiers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dossiers (
    id bigint NOT NULL,
    reference character varying(255) NOT NULL,
    client_id bigint NOT NULL,
    status character varying(255) DEFAULT 'Commercial'::character varying NOT NULL,
    user_id bigint,
    ip_address inet,
    payload_json json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.dossiers OWNER TO postgres;

--
-- Name: dossiers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dossiers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dossiers_id_seq OWNER TO postgres;

--
-- Name: dossiers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dossiers_id_seq OWNED BY public.dossiers.id;


--
-- Name: emplacements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.emplacements (
    id bigint NOT NULL,
    depot_id bigint NOT NULL,
    code_emplacement character varying(255) NOT NULL,
    zone character varying(255) NOT NULL,
    allee character varying(255),
    rangee character varying(255),
    hauteur_niveau integer DEFAULT 1 NOT NULL,
    occupe boolean DEFAULT false NOT NULL,
    conteneur_id bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.emplacements OWNER TO postgres;

--
-- Name: emplacements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.emplacements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.emplacements_id_seq OWNER TO postgres;

--
-- Name: emplacements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.emplacements_id_seq OWNED BY public.emplacements.id;


--
-- Name: escales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.escales (
    id bigint NOT NULL,
    navire_id bigint NOT NULL,
    port_id bigint NOT NULL,
    terminal_id bigint,
    responsable_id bigint,
    numero_escale character varying(255) NOT NULL,
    date_arrivee_prevue timestamp(0) without time zone NOT NULL,
    date_depart_prevue timestamp(0) without time zone NOT NULL,
    date_arrivee_reelle timestamp(0) without time zone,
    date_depart_reelle timestamp(0) without time zone,
    quai character varying(255),
    nombre_conteneurs_prevus integer DEFAULT 0 NOT NULL,
    statut_escale character varying(255) DEFAULT 'PREVUE'::character varying NOT NULL,
    observations text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.escales OWNER TO postgres;

--
-- Name: escales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.escales_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.escales_id_seq OWNER TO postgres;

--
-- Name: escales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.escales_id_seq OWNED BY public.escales.id;


--
-- Name: etapes_workflow; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.etapes_workflow (
    id bigint NOT NULL,
    workflow_id bigint NOT NULL,
    nom_etape character varying(255) NOT NULL,
    ordre integer NOT NULL,
    role_responsable character varying(255) NOT NULL,
    description text,
    delai_heures integer DEFAULT 72 NOT NULL,
    est_optionnelle boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.etapes_workflow OWNER TO postgres;

--
-- Name: etapes_workflow_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.etapes_workflow_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.etapes_workflow_id_seq OWNER TO postgres;

--
-- Name: etapes_workflow_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.etapes_workflow_id_seq OWNED BY public.etapes_workflow.id;


--
-- Name: factures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.factures (
    id bigint NOT NULL,
    numero_facture character varying(255) NOT NULL,
    client_id bigint NOT NULL,
    contrat_id bigint NOT NULL,
    devise_id bigint NOT NULL,
    cree_par_user_id bigint,
    type_facture character varying(255) DEFAULT 'STANDARD'::character varying NOT NULL,
    date_emission date NOT NULL,
    date_echeance date NOT NULL,
    montant_ht numeric(12,2) NOT NULL,
    tva numeric(12,2) NOT NULL,
    montant_ttc numeric(12,2) NOT NULL,
    montant_paye numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    montant_restant numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    statut character varying(255) DEFAULT 'EMISE'::character varying NOT NULL,
    conditions_paiement text,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.factures OWNER TO postgres;

--
-- Name: factures_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.factures_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.factures_id_seq OWNER TO postgres;

--
-- Name: factures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.factures_id_seq OWNED BY public.factures.id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO postgres;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failed_jobs_id_seq OWNER TO postgres;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: franchises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.franchises (
    id bigint NOT NULL,
    type_conteneur_id bigint NOT NULL,
    port_id bigint,
    client_id bigint,
    type_franchise character varying(255) DEFAULT 'DEMURRAGE'::character varying NOT NULL,
    jours_franchise integer NOT NULL,
    description text,
    date_debut_validite date NOT NULL,
    date_fin_validite date,
    actif boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.franchises OWNER TO postgres;

--
-- Name: franchises_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.franchises_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.franchises_id_seq OWNER TO postgres;

--
-- Name: franchises_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.franchises_id_seq OWNED BY public.franchises.id;


--
-- Name: instance_workflows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instance_workflows (
    id bigint NOT NULL,
    workflow_id bigint NOT NULL,
    conteneur_id bigint NOT NULL,
    demande_id bigint,
    bloque_par_user_id bigint,
    etape_actuelle integer DEFAULT 1 NOT NULL,
    date_debut date NOT NULL,
    date_fin_prevue date NOT NULL,
    date_fin_reelle date,
    progression numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    statut character varying(255) DEFAULT 'EN_COURS'::character varying NOT NULL,
    motif_blocage text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.instance_workflows OWNER TO postgres;

--
-- Name: instance_workflows_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.instance_workflows_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.instance_workflows_id_seq OWNER TO postgres;

--
-- Name: instance_workflows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.instance_workflows_id_seq OWNED BY public.instance_workflows.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id bigint NOT NULL,
    container_id bigint NOT NULL,
    dossier_id bigint NOT NULL,
    amount_surestary numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    user_id bigint,
    ip_address inet,
    payload_json json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoices_id_seq OWNER TO postgres;

--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO postgres;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: journal_audits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journal_audits (
    id bigint NOT NULL,
    utilisateur_id bigint,
    action character varying(255) NOT NULL,
    table_cible character varying(255) NOT NULL,
    enregistrement_id character varying(255),
    anciennes_valeurs json,
    nouvelles_valeurs json,
    adresse_ip inet NOT NULL,
    user_agent character varying(255),
    resultat character varying(255) DEFAULT 'SUCCES'::character varying NOT NULL,
    date_action timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.journal_audits OWNER TO postgres;

--
-- Name: journal_audits_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.journal_audits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.journal_audits_id_seq OWNER TO postgres;

--
-- Name: journal_audits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.journal_audits_id_seq OWNED BY public.journal_audits.id;


--
-- Name: lignes_contrat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lignes_contrat (
    id bigint NOT NULL,
    contrat_id bigint NOT NULL,
    tarif_service_id bigint,
    type_conteneur_id bigint,
    type_ligne character varying(255) DEFAULT 'LOCATION'::character varying NOT NULL,
    service character varying(255) NOT NULL,
    description text,
    quantite integer DEFAULT 1 NOT NULL,
    nombre_conteneurs integer DEFAULT 1 NOT NULL,
    prix_unitaire numeric(10,2) NOT NULL,
    tva_applicable boolean DEFAULT true NOT NULL,
    total_ht numeric(12,2) NOT NULL,
    franchise_jours integer DEFAULT 0 NOT NULL,
    date_debut date,
    date_fin date,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.lignes_contrat OWNER TO postgres;

--
-- Name: lignes_contrat_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lignes_contrat_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lignes_contrat_id_seq OWNER TO postgres;

--
-- Name: lignes_contrat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lignes_contrat_id_seq OWNED BY public.lignes_contrat.id;


--
-- Name: lignes_demande; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lignes_demande (
    id bigint NOT NULL,
    demande_id bigint NOT NULL,
    marchandise_id bigint NOT NULL,
    type_conteneur_id bigint,
    pays_origine_id bigint,
    quantite integer NOT NULL,
    poids_total numeric(10,2) NOT NULL,
    volume numeric(10,2),
    unite character varying(255) DEFAULT 'UNITE'::character varying NOT NULL,
    description text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.lignes_demande OWNER TO postgres;

--
-- Name: lignes_demande_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lignes_demande_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lignes_demande_id_seq OWNER TO postgres;

--
-- Name: lignes_demande_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lignes_demande_id_seq OWNED BY public.lignes_demande.id;


--
-- Name: lignes_devis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lignes_devis (
    id bigint NOT NULL,
    devis_id bigint NOT NULL,
    tarif_service_id bigint,
    type_ligne character varying(255) DEFAULT 'LOCATION'::character varying NOT NULL,
    service character varying(255) NOT NULL,
    description text,
    quantite integer DEFAULT 1 NOT NULL,
    prix_unitaire numeric(10,2) NOT NULL,
    tva_applicable boolean DEFAULT true NOT NULL,
    total_ht numeric(12,2) NOT NULL,
    modification_proposee text,
    nouveau_prix_propose numeric(10,2),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.lignes_devis OWNER TO postgres;

--
-- Name: lignes_devis_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lignes_devis_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lignes_devis_id_seq OWNER TO postgres;

--
-- Name: lignes_devis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lignes_devis_id_seq OWNED BY public.lignes_devis.id;


--
-- Name: lignes_facture; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lignes_facture (
    id bigint NOT NULL,
    facture_id bigint NOT NULL,
    tarif_service_id bigint,
    calcul_penalite_id bigint,
    type_ligne character varying(255) DEFAULT 'SERVICE'::character varying NOT NULL,
    description text NOT NULL,
    quantite integer DEFAULT 1 NOT NULL,
    prix_unitaire numeric(10,2) NOT NULL,
    tva_applicable boolean DEFAULT true NOT NULL,
    total_ht numeric(12,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.lignes_facture OWNER TO postgres;

--
-- Name: lignes_facture_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lignes_facture_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lignes_facture_id_seq OWNER TO postgres;

--
-- Name: lignes_facture_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lignes_facture_id_seq OWNED BY public.lignes_facture.id;


--
-- Name: marchandises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marchandises (
    id bigint NOT NULL,
    code_hs character varying(255) NOT NULL,
    libelle character varying(255) NOT NULL,
    classe_dangereuse character varying(255),
    necessite_frigo boolean DEFAULT false NOT NULL,
    temperature_min numeric(5,2),
    temperature_max numeric(5,2),
    actif boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.marchandises OWNER TO postgres;

--
-- Name: marchandises_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.marchandises_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.marchandises_id_seq OWNER TO postgres;

--
-- Name: marchandises_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.marchandises_id_seq OWNED BY public.marchandises.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: mouvement_conteneurs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mouvement_conteneurs (
    id bigint NOT NULL,
    conteneur_id bigint NOT NULL,
    client_id bigint,
    port_id bigint,
    depot_id bigint,
    emplacement_id bigint,
    responsable_id bigint,
    type_mouvement character varying(255) NOT NULL,
    date_mouvement timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.mouvement_conteneurs OWNER TO postgres;

--
-- Name: mouvement_conteneurs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mouvement_conteneurs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mouvement_conteneurs_id_seq OWNER TO postgres;

--
-- Name: mouvement_conteneurs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mouvement_conteneurs_id_seq OWNED BY public.mouvement_conteneurs.id;


--
-- Name: navires; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.navires (
    id bigint NOT NULL,
    nom_navire character varying(255) NOT NULL,
    numero_imo character varying(255) NOT NULL,
    pays_id bigint,
    compagnie_maritime character varying(255),
    capacite_teu integer NOT NULL,
    annee_construction integer,
    actif boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.navires OWNER TO postgres;

--
-- Name: navires_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.navires_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.navires_id_seq OWNER TO postgres;

--
-- Name: navires_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.navires_id_seq OWNED BY public.navires.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    type_notification_id bigint,
    destinataire_id bigint NOT NULL,
    conteneur_id bigint,
    facture_id bigint,
    demande_id bigint,
    titre character varying(255) NOT NULL,
    message text NOT NULL,
    canal character varying(255) DEFAULT 'INTERNE'::character varying NOT NULL,
    lien_action character varying(255),
    date_creation timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    date_envoi timestamp(0) without time zone,
    lu boolean DEFAULT false NOT NULL,
    lu_le timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: paiements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.paiements (
    id bigint NOT NULL,
    facture_id bigint NOT NULL,
    banque_id bigint,
    recu_par_user_id bigint,
    montant numeric(12,2) NOT NULL,
    date_paiement date NOT NULL,
    methode character varying(255) DEFAULT 'VIREMENT'::character varying NOT NULL,
    reference character varying(255),
    statut character varying(255) DEFAULT 'ENREGISTRE'::character varying NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.paiements OWNER TO postgres;

--
-- Name: paiements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.paiements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.paiements_id_seq OWNER TO postgres;

--
-- Name: paiements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.paiements_id_seq OWNED BY public.paiements.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: pays; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pays (
    id bigint NOT NULL,
    nom_pays character varying(255) NOT NULL,
    code_iso character varying(3) NOT NULL,
    indicatif_tel character varying(10),
    devise_defaut character varying(10),
    actif boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.pays OWNER TO postgres;

--
-- Name: pays_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pays_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pays_id_seq OWNER TO postgres;

--
-- Name: pays_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pays_id_seq OWNED BY public.pays.id;


--
-- Name: penalites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.penalites (
    id bigint NOT NULL,
    type_conteneur_id bigint NOT NULL,
    devise_id bigint NOT NULL,
    type character varying(255) DEFAULT 'DEMURRAGE'::character varying NOT NULL,
    tarif_journalier numeric(10,2) NOT NULL,
    tranche_debut integer DEFAULT 1 NOT NULL,
    tranche_fin integer,
    date_debut_validite date NOT NULL,
    date_fin_validite date,
    actif boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.penalites OWNER TO postgres;

--
-- Name: penalites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.penalites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.penalites_id_seq OWNER TO postgres;

--
-- Name: penalites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.penalites_id_seq OWNED BY public.penalites.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    label character varying(150) NOT NULL,
    module character varying(50) NOT NULL,
    description text,
    is_system boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.personal_access_tokens OWNER TO postgres;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_access_tokens_id_seq OWNER TO postgres;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: ports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ports (
    id bigint NOT NULL,
    pays_id bigint NOT NULL,
    nom_port character varying(255) NOT NULL,
    code_port character varying(255) NOT NULL,
    ville character varying(255) NOT NULL,
    type_port character varying(255) DEFAULT 'MARITIME'::character varying NOT NULL,
    adresse character varying(255),
    telephone character varying(255),
    jours_allowance_defaut integer DEFAULT 7 NOT NULL,
    actif boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.ports OWNER TO postgres;

--
-- Name: ports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ports_id_seq OWNER TO postgres;

--
-- Name: ports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ports_id_seq OWNED BY public.ports.id;


--
-- Name: positions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.positions (
    id bigint NOT NULL,
    title character varying(150) NOT NULL,
    description text,
    department_id bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.positions OWNER TO postgres;

--
-- Name: positions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.positions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.positions_id_seq OWNER TO postgres;

--
-- Name: positions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.positions_id_seq OWNED BY public.positions.id;


--
-- Name: rapports_inspection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rapports_inspection (
    id bigint NOT NULL,
    conteneur_id bigint NOT NULL,
    inspecteur_id bigint NOT NULL,
    contrat_id bigint,
    date_inspection timestamp(0) without time zone NOT NULL,
    etat_conteneur character varying(255) DEFAULT 'BON'::character varying NOT NULL,
    action_requise character varying(255) DEFAULT 'AUCUNE'::character varying NOT NULL,
    cout_reparation_estime numeric(15,2),
    observations text,
    photos json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.rapports_inspection OWNER TO postgres;

--
-- Name: rapports_inspection_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rapports_inspection_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rapports_inspection_id_seq OWNER TO postgres;

--
-- Name: rapports_inspection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rapports_inspection_id_seq OWNED BY public.rapports_inspection.id;


--
-- Name: restitutions_caution; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restitutions_caution (
    id bigint NOT NULL,
    contrat_id bigint NOT NULL,
    type_action character varying(255) NOT NULL,
    montant numeric(15,2) NOT NULL,
    devise character varying(3) DEFAULT 'DZD'::character varying NOT NULL,
    montant_restitue numeric(15,2),
    montant_retenu numeric(15,2),
    motif_retenu text,
    date_action date NOT NULL,
    numero_cheque character varying(60),
    banque_id bigint,
    numero_cheque_restitution character varying(60),
    motif text,
    traite_par_user_id bigint NOT NULL,
    document_id bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT restitutions_caution_type_action_check CHECK (((type_action)::text = ANY ((ARRAY['DEPOT'::character varying, 'VERIFICATION'::character varying, 'REJET'::character varying, 'ENCAISSEMENT'::character varying, 'RESTITUTION'::character varying, 'RESTITUTION_PARTIELLE'::character varying])::text[])))
);


ALTER TABLE public.restitutions_caution OWNER TO postgres;

--
-- Name: restitutions_caution_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.restitutions_caution_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.restitutions_caution_id_seq OWNER TO postgres;

--
-- Name: restitutions_caution_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.restitutions_caution_id_seq OWNED BY public.restitutions_caution.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    id bigint NOT NULL,
    role_id bigint NOT NULL,
    permission_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.role_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_permissions_id_seq OWNER TO postgres;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_permissions_id_seq OWNED BY public.role_permissions.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    nom_role character varying(255) NOT NULL,
    label character varying(255) NOT NULL,
    description text,
    niveau integer DEFAULT 1 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    is_system boolean DEFAULT false NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: statut_conteneurs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.statut_conteneurs (
    id bigint NOT NULL,
    conteneur_id bigint NOT NULL,
    ancien_statut character varying(255),
    nouveau_statut character varying(255) NOT NULL,
    responsable_id bigint,
    date_changement timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    commentaire text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.statut_conteneurs OWNER TO postgres;

--
-- Name: statut_conteneurs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.statut_conteneurs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.statut_conteneurs_id_seq OWNER TO postgres;

--
-- Name: statut_conteneurs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.statut_conteneurs_id_seq OWNED BY public.statut_conteneurs.id;


--
-- Name: system_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_config (
    id bigint NOT NULL,
    key character varying(255) NOT NULL,
    value text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.system_config OWNER TO postgres;

--
-- Name: system_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_config_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_config_id_seq OWNER TO postgres;

--
-- Name: system_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_config_id_seq OWNED BY public.system_config.id;


--
-- Name: tarifs_service; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tarifs_service (
    id bigint NOT NULL,
    code_tarif character varying(255) NOT NULL,
    libelle_service character varying(255) NOT NULL,
    type_conteneur_id bigint,
    montant_unitaire numeric(15,2) NOT NULL,
    unite character varying(255) NOT NULL,
    tva_applicable boolean DEFAULT true NOT NULL,
    date_debut date,
    date_fin date,
    actif boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.tarifs_service OWNER TO postgres;

--
-- Name: tarifs_service_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tarifs_service_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tarifs_service_id_seq OWNER TO postgres;

--
-- Name: tarifs_service_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tarifs_service_id_seq OWNED BY public.tarifs_service.id;


--
-- Name: terminaux; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.terminaux (
    id bigint NOT NULL,
    port_id bigint NOT NULL,
    code_terminal character varying(255) NOT NULL,
    nom_terminal character varying(255) NOT NULL,
    adresse character varying(255) NOT NULL,
    telephone character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    capacite_max_teu integer NOT NULL,
    responsable character varying(255),
    taux_occupation numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    actif boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.terminaux OWNER TO postgres;

--
-- Name: terminaux_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.terminaux_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.terminaux_id_seq OWNER TO postgres;

--
-- Name: terminaux_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.terminaux_id_seq OWNED BY public.terminaux.id;


--
-- Name: transitaires; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transitaires (
    id bigint NOT NULL,
    nom_societe character varying(255) NOT NULL,
    numero_rc character varying(255) NOT NULL,
    numero_agrement character varying(255) NOT NULL,
    date_expiration_agrement date,
    pays_id bigint,
    adresse_societe character varying(255) NOT NULL,
    tel_societe character varying(255) NOT NULL,
    email_societe character varying(255) NOT NULL,
    site_web character varying(255),
    rep_nom character varying(255) NOT NULL,
    rep_prenom character varying(255) NOT NULL,
    rep_role_societe character varying(255) NOT NULL,
    rep_tel_perso character varying(255) NOT NULL,
    rep_email_perso character varying(255) NOT NULL,
    statut character varying(255) DEFAULT 'EN_ATTENTE_VALIDATION'::character varying NOT NULL,
    valide_par_user_id bigint,
    date_validation timestamp(0) without time zone,
    motif_rejet text,
    actif boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.transitaires OWNER TO postgres;

--
-- Name: transitaires_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transitaires_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transitaires_id_seq OWNER TO postgres;

--
-- Name: transitaires_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transitaires_id_seq OWNED BY public.transitaires.id;


--
-- Name: types_conteneur; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.types_conteneur (
    id bigint NOT NULL,
    code_type character varying(255) NOT NULL,
    libelle character varying(255) NOT NULL,
    longueur_pieds integer NOT NULL,
    est_frigo boolean DEFAULT false NOT NULL,
    poids_tare numeric(8,2) NOT NULL,
    charge_utile numeric(8,2),
    volume numeric(8,2),
    tarif_journalier_defaut numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    actif boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.types_conteneur OWNER TO postgres;

--
-- Name: types_conteneur_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.types_conteneur_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.types_conteneur_id_seq OWNER TO postgres;

--
-- Name: types_conteneur_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.types_conteneur_id_seq OWNED BY public.types_conteneur.id;


--
-- Name: types_notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.types_notification (
    id bigint NOT NULL,
    code character varying(255) NOT NULL,
    libelle character varying(255) NOT NULL,
    priorite character varying(255) DEFAULT 'MOYENNE'::character varying NOT NULL,
    canal_defaut character varying(255) DEFAULT 'INTERNE'::character varying NOT NULL,
    template_message text,
    actif boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.types_notification OWNER TO postgres;

--
-- Name: types_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.types_notification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.types_notification_id_seq OWNER TO postgres;

--
-- Name: types_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.types_notification_id_seq OWNED BY public.types_notification.id;


--
-- Name: user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_permissions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    permission_id bigint NOT NULL,
    granted boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.user_permissions OWNER TO postgres;

--
-- Name: user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_permissions_id_seq OWNER TO postgres;

--
-- Name: user_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_permissions_id_seq OWNED BY public.user_permissions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    role_id bigint NOT NULL,
    nom character varying(255) NOT NULL,
    prenom character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    statut character varying(255) DEFAULT 'ACTIF'::character varying NOT NULL,
    tentatives_echouees integer DEFAULT 0 NOT NULL,
    derniere_connexion timestamp(0) without time zone,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    "position" character varying(255),
    department_id bigint,
    deleted_at timestamp(0) without time zone,
    position_id bigint,
    must_change_password boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: workflows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflows (
    id bigint NOT NULL,
    code character varying(255) NOT NULL,
    nom_processus character varying(255) NOT NULL,
    type_workflow character varying(255) DEFAULT 'ORDINAIRE'::character varying NOT NULL,
    description text,
    actif boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.workflows OWNER TO postgres;

--
-- Name: workflows_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.workflows_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workflows_id_seq OWNER TO postgres;

--
-- Name: workflows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.workflows_id_seq OWNED BY public.workflows.id;


--
-- Name: actualites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actualites ALTER COLUMN id SET DEFAULT nextval('public.actualites_id_seq'::regclass);


--
-- Name: alertes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alertes ALTER COLUMN id SET DEFAULT nextval('public.alertes_id_seq'::regclass);


--
-- Name: avenants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avenants ALTER COLUMN id SET DEFAULT nextval('public.avenants_id_seq'::regclass);


--
-- Name: banques id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banques ALTER COLUMN id SET DEFAULT nextval('public.banques_id_seq'::regclass);


--
-- Name: calcul_penalites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calcul_penalites ALTER COLUMN id SET DEFAULT nextval('public.calcul_penalites_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: conditions_generales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conditions_generales ALTER COLUMN id SET DEFAULT nextval('public.conditions_generales_id_seq'::regclass);


--
-- Name: configuration_systeme id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuration_systeme ALTER COLUMN id SET DEFAULT nextval('public.configuration_systeme_id_seq'::regclass);


--
-- Name: containers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.containers ALTER COLUMN id SET DEFAULT nextval('public.containers_id_seq'::regclass);


--
-- Name: conteneurs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conteneurs ALTER COLUMN id SET DEFAULT nextval('public.conteneurs_id_seq'::regclass);


--
-- Name: contrats_import id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrats_import ALTER COLUMN id SET DEFAULT nextval('public.contrats_import_id_seq'::regclass);


--
-- Name: corbeille id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corbeille ALTER COLUMN id SET DEFAULT nextval('public.corbeille_id_seq'::regclass);


--
-- Name: demande_conteneurs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demande_conteneurs ALTER COLUMN id SET DEFAULT nextval('public.demande_conteneurs_id_seq'::regclass);


--
-- Name: demande_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demande_documents ALTER COLUMN id SET DEFAULT nextval('public.demande_documents_id_seq'::regclass);


--
-- Name: demandes_import id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_import ALTER COLUMN id SET DEFAULT nextval('public.demandes_import_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: depots id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depots ALTER COLUMN id SET DEFAULT nextval('public.depots_id_seq'::regclass);


--
-- Name: devis id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devis ALTER COLUMN id SET DEFAULT nextval('public.devis_id_seq'::regclass);


--
-- Name: devises id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devises ALTER COLUMN id SET DEFAULT nextval('public.devises_id_seq'::regclass);


--
-- Name: documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);


--
-- Name: dossiers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dossiers ALTER COLUMN id SET DEFAULT nextval('public.dossiers_id_seq'::regclass);


--
-- Name: emplacements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emplacements ALTER COLUMN id SET DEFAULT nextval('public.emplacements_id_seq'::regclass);


--
-- Name: escales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.escales ALTER COLUMN id SET DEFAULT nextval('public.escales_id_seq'::regclass);


--
-- Name: etapes_workflow id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etapes_workflow ALTER COLUMN id SET DEFAULT nextval('public.etapes_workflow_id_seq'::regclass);


--
-- Name: factures id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factures ALTER COLUMN id SET DEFAULT nextval('public.factures_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: franchises id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.franchises ALTER COLUMN id SET DEFAULT nextval('public.franchises_id_seq'::regclass);


--
-- Name: instance_workflows id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_workflows ALTER COLUMN id SET DEFAULT nextval('public.instance_workflows_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: journal_audits id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_audits ALTER COLUMN id SET DEFAULT nextval('public.journal_audits_id_seq'::regclass);


--
-- Name: lignes_contrat id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lignes_contrat ALTER COLUMN id SET DEFAULT nextval('public.lignes_contrat_id_seq'::regclass);


--
-- Name: lignes_demande id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lignes_demande ALTER COLUMN id SET DEFAULT nextval('public.lignes_demande_id_seq'::regclass);


--
-- Name: lignes_devis id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lignes_devis ALTER COLUMN id SET DEFAULT nextval('public.lignes_devis_id_seq'::regclass);


--
-- Name: lignes_facture id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lignes_facture ALTER COLUMN id SET DEFAULT nextval('public.lignes_facture_id_seq'::regclass);


--
-- Name: marchandises id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marchandises ALTER COLUMN id SET DEFAULT nextval('public.marchandises_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: mouvement_conteneurs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mouvement_conteneurs ALTER COLUMN id SET DEFAULT nextval('public.mouvement_conteneurs_id_seq'::regclass);


--
-- Name: navires id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.navires ALTER COLUMN id SET DEFAULT nextval('public.navires_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: paiements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paiements ALTER COLUMN id SET DEFAULT nextval('public.paiements_id_seq'::regclass);


--
-- Name: pays id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pays ALTER COLUMN id SET DEFAULT nextval('public.pays_id_seq'::regclass);


--
-- Name: penalites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.penalites ALTER COLUMN id SET DEFAULT nextval('public.penalites_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: ports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ports ALTER COLUMN id SET DEFAULT nextval('public.ports_id_seq'::regclass);


--
-- Name: positions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions ALTER COLUMN id SET DEFAULT nextval('public.positions_id_seq'::regclass);


--
-- Name: rapports_inspection id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rapports_inspection ALTER COLUMN id SET DEFAULT nextval('public.rapports_inspection_id_seq'::regclass);


--
-- Name: restitutions_caution id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restitutions_caution ALTER COLUMN id SET DEFAULT nextval('public.restitutions_caution_id_seq'::regclass);


--
-- Name: role_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions ALTER COLUMN id SET DEFAULT nextval('public.role_permissions_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: statut_conteneurs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statut_conteneurs ALTER COLUMN id SET DEFAULT nextval('public.statut_conteneurs_id_seq'::regclass);


--
-- Name: system_config id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config ALTER COLUMN id SET DEFAULT nextval('public.system_config_id_seq'::regclass);


--
-- Name: tarifs_service id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarifs_service ALTER COLUMN id SET DEFAULT nextval('public.tarifs_service_id_seq'::regclass);


--
-- Name: terminaux id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.terminaux ALTER COLUMN id SET DEFAULT nextval('public.terminaux_id_seq'::regclass);


--
-- Name: transitaires id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transitaires ALTER COLUMN id SET DEFAULT nextval('public.transitaires_id_seq'::regclass);


--
-- Name: types_conteneur id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.types_conteneur ALTER COLUMN id SET DEFAULT nextval('public.types_conteneur_id_seq'::regclass);


--
-- Name: types_notification id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.types_notification ALTER COLUMN id SET DEFAULT nextval('public.types_notification_id_seq'::regclass);


--
-- Name: user_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions ALTER COLUMN id SET DEFAULT nextval('public.user_permissions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: workflows id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflows ALTER COLUMN id SET DEFAULT nextval('public.workflows_id_seq'::regclass);


--
-- Data for Name: actualites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.actualites (id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: alertes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alertes (id, type_alerte, niveau, entite_type, entite_id, message, meta, destinataire_user_id, est_lue, lue_le, est_traitee, traitee_par_user_id, date_traitement, note_traitement, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: avenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.avenants (id, contrat_id, numero_avenant, type_modification, description, modifications, statut, cree_par_user_id, signature_ip, signature_user_agent, signature_otp_token, signe_le, motif_refus, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: banques; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banques (id, nom, code_banque, adresse, telephone, swift, actif, created_at, updated_at) FROM stdin;
1	Banque Nationale d'Algérie	BNA	Boulevard Che Guevara, Alger	+213 21 71 10 00	BNAADZDZ	t	2026-04-01 23:11:24	2026-04-01 23:11:24
2	Banque Extérieure d'Algérie	BEA	11 Boulevard Colonel Amirouche, Alger	+213 21 92 00 00	BEAADZDZXXX	t	2026-04-01 23:11:24	2026-04-01 23:11:24
3	Crédit Populaire d'Algérie	CPA	2 Boulevard Colonel Amirouche, Alger	+213 21 74 00 00	CPAADZDZXXX	t	2026-04-01 23:11:24	2026-04-01 23:11:24
4	Banque de l'Agriculture et du Développement Rural	BADR	17 Boulevard Colonel Amirouche, Alger	+213 21 23 00 00	BADRDZDZ	t	2026-04-01 23:11:24	2026-04-01 23:11:24
5	Caisse Nationale d'Épargne et de Prévoyance	CNEP	42 Rue Khélifa Boukhalfa, Alger	+213 21 23 45 00	CNEPDZDZXXX	t	2026-04-01 23:11:24	2026-04-01 23:11:24
6	Banque de Développement Local	BDL	5 Rue Gaci Amar, Alger	+213 21 71 60 00	BDLADZDZXXX	t	2026-04-01 23:11:24	2026-04-01 23:11:24
7	Société Générale Algérie	SGA	Lot Boudrahem, El Biar, Alger	+213 21 69 60 00	SOGEDZIDZXX	t	2026-04-01 23:11:24	2026-04-01 23:11:24
8	BNP Paribas El Djazaïr	BNPP	23 Rue Lieutenant Colonel Lotfi, Alger	+213 21 23 10 00	BNPADZIDZXX	t	2026-04-01 23:11:24	2026-04-01 23:11:24
\.


--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache (key, value, expiration) FROM stdin;
laravel-cache-ac3478d69a3c81fa62e60f5c3696165a4e5e6ac4:timer	i:1777921568;	1777921568
laravel-cache-ac3478d69a3c81fa62e60f5c3696165a4e5e6ac4	i:1;	1777921568
laravel-cache-c1dfd96eea8cc2b62785275bca38ac261256e278:timer	i:1777773894;	1777773894
laravel-cache-c1dfd96eea8cc2b62785275bca38ac261256e278	i:1;	1777773894
\.


--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- Data for Name: calcul_penalites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calcul_penalites (id, conteneur_id, contrat_id, penalite_id, franchise_id, cree_par_user_id, type_penalite, date_debut, date_fin, jours_franchise_appliques, jours_retard, tarif_applique, montant_ht, tva, montant_ttc, statut, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (id, user_id, raison_sociale, nif, nis, rc, adresse_siege, ville, pays_id, type_client, rep_nom, rep_prenom, rep_role, rep_tel, rep_email, rep_adresse_perso, statut, valide_par_user_id, date_validation, motif_rejet, created_at, updated_at, deleted_at) FROM stdin;
1	1	SARL Import Maghreb	099812345600011	NIS099812345600011	RC099812345600011	123 Rue de Oran	Oran	1	ORDINAIRE	Nom	Prenom	Gérant	0555000000	client1@demo.dz	\N	APPROUVE	\N	\N	\N	2026-05-02 12:26:38	2026-05-02 12:26:38	\N
2	2	SPA TransAlgérie	099812345600012	NIS099812345600012	RC099812345600012	123 Rue de Alger	Alger	1	ORDINAIRE	Nom	Prenom	Gérant	0555000000	client2@demo.dz	\N	APPROUVE	\N	\N	\N	2026-05-02 12:26:38	2026-05-02 12:26:38	\N
3	3	EURL MéditerExport	099812345600013	NIS099812345600013	RC099812345600013	123 Rue de Annaba	Annaba	1	ORDINAIRE	Nom	Prenom	Gérant	0555000000	client3@demo.dz	\N	APPROUVE	\N	\N	\N	2026-05-02 12:26:39	2026-05-02 12:26:39	\N
\.


--
-- Data for Name: conditions_generales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conditions_generales (id, version, titre, contenu, actif, cree_par_user_id, date_application, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: configuration_systeme; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configuration_systeme (id, cle, valeur, type_valeur, description, modifiable, created_at, updated_at) FROM stdin;
1	contract_approval_threshold	5000000	integer	Montant en DZD au-dessus duquel un contrat nécessite l'approbation du Directeur	t	2026-04-01 23:11:24	2026-04-01 23:11:24
2	tva_rate	0.19	float	Taux de TVA applicable sur les factures (19% en Algérie)	t	2026-04-01 23:11:24	2026-04-01 23:11:24
3	default_franchise_days	7	integer	Nombre de jours de franchise par défaut si non spécifié dans le contrat	t	2026-04-01 23:11:24	2026-04-01 23:11:24
4	otp_expiry_minutes	10	integer	Durée de validité du code OTP de signature (en minutes)	t	2026-04-01 23:11:24	2026-04-01 23:11:24
5	max_negotiation_rounds	3	integer	Nombre maximum de rounds de négociation pour un devis	f	2026-04-01 23:11:24	2026-04-01 23:11:24
6	surestarie_taux_defaut	5000	float	Taux journalier par défaut pour le calcul des surestaries (DZD/jour)	t	2026-04-01 23:11:24	2026-04-01 23:11:24
7	cheque_depot_deadline_days	5	integer	Délai en jours pour déposer le chèque caution après signature du contrat	t	2026-04-01 23:11:24	2026-04-01 23:11:24
8	invoice_overdue_legal_days	30	integer	Nombre de jours après échéance avant déclenchement de la mise en demeure	t	2026-04-01 23:11:24	2026-04-01 23:11:24
9	app_name	GSLC — Gestion et Suivi de Location de Conteneurs	string	Nom complet de l'application affiché dans les emails et PDF	t	2026-04-01 23:11:24	2026-04-01 23:11:24
10	company_name	EPE NASHCO Spa	string	Raison sociale de l'entreprise — utilisée sur les factures et contrats PDF	f	2026-04-01 23:11:24	2026-04-01 23:11:24
11	company_address	Port de Mostaganem, Mostaganem 27000, Algérie	string	Adresse postale officielle — utilisée sur les documents légaux	t	2026-04-01 23:11:24	2026-04-01 23:11:24
\.


--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contact_messages (id, nom_complet, entreprise, email, objet, message, statut, lu_par, lu_le, ip_address, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: containers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.containers (id, container_number, dossier_id, status_phase, arrival_date, free_days, return_date, user_id, ip_address, payload_json, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: conteneurs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conteneurs (id, numero_conteneur, type_id, proprietaire, hauteur, largeur, poids_max, etat_actuel, statut, temperature, date_achat, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: contrats_import; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contrats_import (id, numero_contrat, devis_id, client_id, demande_id, cree_par_user_id, conditions_generales_id, date_debut, date_fin, statut, clauses_renouvellement, clauses_resiliation, clauses_speciales, type_signature, date_signature, ip_signature, user_agent_signature, token_signature, conditions_acceptees, date_acceptation_conditions, ip_acceptation_conditions, montant_caution, statut_caution, numero_cheque, banque_id, montant_cheque, date_cheque, est_certifie, date_depot_cheque, date_limite_depot, recu_par_user_id, date_verification_caution, verifie_caution_par_user_id, date_restitution_cheque, date_encaissement_cheque, motif_encaissement, created_at, updated_at) FROM stdin;
1	CTR-2026-0001	3	2	4	\N	\N	2026-05-02	2027-05-02	EN_ATTENTE_SIGNATURE	\N	\N	\N	EN_LIGNE	\N	\N	\N	123456	f	\N	\N	500000.00	EN_ATTENTE	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-02 12:27:32	2026-05-02 12:27:32
3	CTR-2026-0002	3	2	4	\N	\N	2026-05-02	2027-05-02	ACTIF	\N	\N	\N	EN_LIGNE	\N	\N	\N	762296	f	\N	\N	300000.00	EN_ATTENTE	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-02 12:28:11	2026-05-02 12:28:11
\.


--
-- Data for Name: corbeille; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.corbeille (id, model_type, model_id, snapshot, deleted_by, deleted_by_name, deleted_by_email, deleted_by_role, deleted_by_ip, deleted_at_audit, expires_at, restored_at, restored_by, restored_by_name, restored_by_email, restored_by_ip, created_at, updated_at) FROM stdin;
2	App\\Models\\User	43	{"id":43,"role_id":12,"nom":"Yuz","prenom":"YUs","email":"Xxxx@fff.com","statut":"ACTIF","tentatives_echouees":0,"derniere_connexion":null,"created_at":"2026-04-29T20:23:29.000000Z","updated_at":"2026-04-29T20:23:29.000000Z","position":"Agent IT","department_id":1,"deleted_at":null,"position_id":33,"must_change_password":false,"position_relation":{"id":33,"title":"Agent IT","description":"'Acc\\u00e8s administratif limit\\u00e9  gestion utilisateurs et d\\u00e9partements sans suppression ni configuration syst\\u00e8me'","department_id":1,"created_at":"2026-04-12T23:09:13.000000Z","updated_at":"2026-04-12T23:09:13.000000Z"},"client":null,"password":"$2y$12$Oq1GcAJ\\/sFLVjQTffM3Q0.72O1e8PifdadfrjQ7V8f7YXs8xBY4ui"}	1	Karim Brahimi	gslc.admin@gmail.com	admin	127.0.0.1	2026-04-29 20:23:37	2026-05-29 20:23:37	2026-04-29 20:29:46	1	Karim Brahimi	gslc.admin@gmail.com	127.0.0.1	2026-04-29 20:23:37	2026-04-29 20:29:46
3	App\\Models\\User	46	{"id":46,"role_id":12,"nom":"Yuz","prenom":"YUs","email":"Xxxx@fff.com","statut":"ACTIF","tentatives_echouees":0,"derniere_connexion":null,"created_at":"2026-04-29T20:29:46.000000Z","updated_at":"2026-04-29T20:29:46.000000Z","position":"Agent IT","department_id":1,"deleted_at":null,"position_id":33,"must_change_password":false,"position_relation":{"id":33,"title":"Agent IT","description":"'Acc\\u00e8s administratif limit\\u00e9  gestion utilisateurs et d\\u00e9partements sans suppression ni configuration syst\\u00e8me'","department_id":1,"created_at":"2026-04-12T23:09:13.000000Z","updated_at":"2026-04-12T23:09:13.000000Z"},"client":null,"password":"$2y$12$Oq1GcAJ\\/sFLVjQTffM3Q0.72O1e8PifdadfrjQ7V8f7YXs8xBY4ui"}	1	Karim Brahimi	gslc.admin@gmail.com	admin	127.0.0.1	2026-04-29 23:31:20	2026-05-29 23:31:20	2026-05-01 15:50:54	1	Karim Brahimi	gslc.admin@gmail.com	127.0.0.1	2026-04-29 23:31:20	2026-05-01 15:50:54
4	App\\Models\\User	48	{"id":48,"role_id":12,"nom":"Yuz","prenom":"YUs","email":"Xxxx@fff.com","statut":"ACTIF","tentatives_echouees":0,"derniere_connexion":null,"created_at":"2026-05-01T15:50:54.000000Z","updated_at":"2026-05-01T15:50:54.000000Z","position":"Agent IT","department_id":1,"deleted_at":null,"position_id":33,"must_change_password":false,"position_relation":{"id":33,"title":"Agent IT","description":"'Acc\\u00e8s administratif limit\\u00e9  gestion utilisateurs et d\\u00e9partements sans suppression ni configuration syst\\u00e8me'","department_id":1,"created_at":"2026-04-12T23:09:13.000000Z","updated_at":"2026-04-12T23:09:13.000000Z"},"client":null,"password":"$2y$12$Oq1GcAJ\\/sFLVjQTffM3Q0.72O1e8PifdadfrjQ7V8f7YXs8xBY4ui"}	1	Karim Brahimi	gslc.admin@gmail.com	admin	127.0.0.1	2026-05-01 15:51:49	2026-05-31 15:51:49	2026-05-01 16:04:52	1	Karim Brahimi	gslc.admin@gmail.com	127.0.0.1	2026-05-01 15:51:49	2026-05-01 16:04:52
5	App\\Models\\User	49	{"id":49,"role_id":12,"nom":"Yuz","prenom":"YUs","email":"Xxxx@fff.com","statut":"ACTIF","tentatives_echouees":0,"derniere_connexion":null,"created_at":"2026-05-01T16:04:52.000000Z","updated_at":"2026-05-01T16:04:52.000000Z","position":"Agent IT","department_id":1,"deleted_at":null,"position_id":33,"must_change_password":false,"position_relation":{"id":33,"title":"Agent IT","description":"'Acc\\u00e8s administratif limit\\u00e9  gestion utilisateurs et d\\u00e9partements sans suppression ni configuration syst\\u00e8me'","department_id":1,"created_at":"2026-04-12T23:09:13.000000Z","updated_at":"2026-04-12T23:09:13.000000Z"},"client":null,"password":"$2y$12$Oq1GcAJ\\/sFLVjQTffM3Q0.72O1e8PifdadfrjQ7V8f7YXs8xBY4ui"}	1	Karim Brahimi	gslc.admin@gmail.com	admin	127.0.0.1	2026-05-01 16:05:10	2026-05-31 16:05:10	\N	\N	\N	\N	\N	2026-05-01 16:05:10	2026-05-01 16:05:10
\.


--
-- Data for Name: demande_conteneurs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.demande_conteneurs (id, demande_id, type_conteneur_id, conteneur_id, nombre_unites, statut, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: demande_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.demande_documents (id, demande_id, document_id, verifie_par_user_id, est_verifie, date_verification, commentaire, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: demandes_import; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.demandes_import (id, client_id, transitaire_id, port_origine_id, port_destination_id, traite_par_user_id, numero_dossier, type_achat, priorite, date_soumission, date_livraison_souhaitee, statut, nombre_negociations, notes_client, motif_rejet, date_traitement, created_at, updated_at, deleted_at) FROM stdin;
1	1	\N	1	2	\N	GSLC-2026-D001	FOB	URGENTE	2026-04-17 12:26:39	2026-06-06	EN_ETUDE	0	\N	\N	\N	2026-05-02 12:26:39	2026-05-02 12:26:39	\N
2	1	\N	1	2	\N	GSLC-2026-D002	FOB	HAUTE	2026-04-15 12:26:39	2026-06-21	DEVIS_ENVOYE	0	\N	\N	\N	2026-05-02 12:26:39	2026-05-02 12:26:39	\N
3	2	\N	1	2	\N	GSLC-2026-D003	FOB	NORMALE	2026-04-08 12:26:39	2026-07-07	EN_NEGOCIATION	0	\N	\N	\N	2026-05-02 12:26:39	2026-05-02 12:26:39	\N
4	2	\N	1	2	\N	GSLC-2026-D004	FOB	HAUTE	2026-04-11 12:26:39	2026-07-09	ACCEPTE	0	\N	\N	\N	2026-05-02 12:26:39	2026-05-02 12:26:39	\N
5	3	\N	1	2	\N	GSLC-2026-D005	FOB	NORMALE	2026-04-06 12:26:39	2026-06-12	EN_ETUDE	0	\N	\N	\N	2026-05-02 12:26:39	2026-05-02 12:26:39	\N
6	3	\N	1	2	\N	GSLC-2026-D006	FOB	URGENTE	2026-04-07 12:26:39	2026-06-06	REFUSE	0	\N	\N	\N	2026-05-02 12:26:39	2026-05-02 12:26:39	\N
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, name, code, created_at, updated_at, description, responsable_id) FROM stdin;
\.


--
-- Data for Name: depots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.depots (id, port_id, terminal_id, code_depot, nom_depot, adresse_precise, telephone, email, type_stockage, capacite_totale, responsable, actif, created_at, updated_at) FROM stdin;
1	10	1	DSC-ALG	Dépôt Sec Alger Centre	Zone Portuaire	N/A	depot@port.dz	SEC	5000	\N	t	2026-05-04 12:16:24	2026-05-04 12:16:24
2	10	1	DFA-ALG	Dépôt Frigorifique Alger	Zone Portuaire	N/A	depot@port.dz	FRIGO	500	\N	t	2026-05-04 12:16:24	2026-05-04 12:16:24
3	10	2	DDA-ALG	Dépôt Matières Dangereuses Alger	Zone Portuaire	N/A	depot@port.dz	DANGEREUX	200	\N	t	2026-05-04 12:16:24	2026-05-04 12:16:24
4	11	5	DSO-ORN	Dépôt Sec Oran	Zone Portuaire	N/A	depot@port.dz	SEC	3000	\N	t	2026-05-04 12:16:24	2026-05-04 12:16:24
5	11	5	DFO-ORN	Dépôt Frigorifique Oran	Zone Portuaire	N/A	depot@port.dz	FRIGO	300	\N	t	2026-05-04 12:16:24	2026-05-04 12:16:24
6	13	8	DSB-BJA	Dépôt Sec Béjaïa	Zone Portuaire	N/A	depot@port.dz	SEC	2000	\N	t	2026-05-04 12:16:24	2026-05-04 12:16:24
7	13	9	DDB-BJA	Dépôt Dangereux Béjaïa	Zone Portuaire	N/A	depot@port.dz	DANGEREUX	150	\N	t	2026-05-04 12:16:24	2026-05-04 12:16:24
8	12	11	DSA-AAE	Dépôt Sec Annaba	Zone Portuaire	N/A	depot@port.dz	SEC	1500	\N	t	2026-05-04 12:16:24	2026-05-04 12:16:24
9	14	12	DDS-SKI	Dépôt Dangereux Skikda	Zone Portuaire	N/A	depot@port.dz	DANGEREUX	300	\N	t	2026-05-04 12:16:24	2026-05-04 12:16:24
10	14	13	DSS-SKI	Dépôt Sec Skikda	Zone Portuaire	N/A	depot@port.dz	SEC	1000	\N	t	2026-05-04 12:16:24	2026-05-04 12:16:24
11	15	14	DSM-MOS	Dépôt Sec Mostaganem	Zone Portuaire	N/A	depot@port.dz	SEC	800	\N	t	2026-05-04 12:16:24	2026-05-04 12:16:24
12	16	16	DSD-DJN	Dépôt Sec Djendjene	Zone Portuaire	N/A	depot@port.dz	SEC	2000	\N	t	2026-05-04 12:16:24	2026-05-04 12:16:24
\.


--
-- Data for Name: devis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.devis (id, demande_id, cree_par_user_id, devis_precedent_id, numero_devis, version, montant_ht, tva, total_ttc, statut, commentaire_client, commentaire_nashco, date_envoi, date_expiration, created_at, updated_at) FROM stdin;
2	3	\N	\N	DV-2026-0002	1	820000.00	19.00	975800.00	EN_NEGOCIATION	\N	Devis établi selon tarifs portuaires en vigueur.	2026-04-22 12:27:32	2026-06-01	2026-05-02 12:27:32	2026-05-02 12:27:32
3	4	\N	\N	DV-2026-0003	1	615000.00	19.00	731850.00	ACCEPTE	\N	Devis établi selon tarifs portuaires en vigueur.	2026-04-25 12:27:32	2026-06-01	2026-05-02 12:27:32	2026-05-02 12:27:32
4	4	\N	\N	DV-2026-0004	1	700000.00	19.00	833000.00	REFUSE	\N	Devis établi selon tarifs portuaires en vigueur.	2026-04-30 12:27:32	2026-06-01	2026-05-02 12:27:32	2026-05-02 12:27:32
1	2	\N	\N	DV-2026-0001	1	450000.00	19.00	535500.00	EN_NEGOCIATION	\N	Devis établi selon tarifs portuaires en vigueur.	2026-05-01 12:26:39	2026-06-01	2026-05-02 12:26:39	2026-05-02 23:39:28
\.


--
-- Data for Name: devises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.devises (id, code, nom, symbole, taux_actuel, taux_base, date_derniere_maj, source, actif, created_at, updated_at) FROM stdin;
1	DZD	Dinar Algérien	DA	1.0000	1.0000	2026-04-01	CACHE	t	2026-04-01 23:11:24	2026-04-01 23:11:24
4	GBP	Livre Sterling	£	180.2385	171.3000	2026-05-03	API_FRANKFURTER	t	2026-04-01 23:11:24	2026-05-03 23:32:24
5	CNY	Yuan Chinois	¥	19.4053	18.5500	2026-05-03	API_FRANKFURTER	t	2026-04-01 23:11:24	2026-05-03 23:32:24
2	EUR	Euro	€	155.3660	147.5000	2026-05-03	API_FRANKFURTER	t	2026-04-01 23:11:24	2026-05-03 23:32:25
3	USD	Dollar Américain	$	132.5039	134.2000	2026-05-03	API_FRANKFURTER	t	2026-04-01 23:11:24	2026-05-03 23:32:25
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, client_id, demande_id, nom_original, nom_stockage, type_document, extension, chemin_stockage, taille, statut, valide_par_user_id, date_validation, motif_rejet, date_expiration, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: dossiers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dossiers (id, reference, client_id, status, user_id, ip_address, payload_json, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: emplacements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.emplacements (id, depot_id, code_emplacement, zone, allee, rangee, hauteur_niveau, occupe, conteneur_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: escales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.escales (id, navire_id, port_id, terminal_id, responsable_id, numero_escale, date_arrivee_prevue, date_depart_prevue, date_arrivee_reelle, date_depart_reelle, quai, nombre_conteneurs_prevus, statut_escale, observations, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: etapes_workflow; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.etapes_workflow (id, workflow_id, nom_etape, ordre, role_responsable, description, delai_heures, est_optionnelle, created_at, updated_at) FROM stdin;
1	1	Soumission de la demande	1	client	Client soumet la demande d'import.	2	f	2026-04-09 11:03:40	2026-04-09 11:03:40
2	1	Examen commercial	2	commercial	Commercial examine la demande et la valide ou rejette.	24	f	2026-04-09 11:03:40	2026-04-09 11:03:40
3	1	Création du devis	3	commercial	Commercial crée un devis basé sur la demande.	48	f	2026-04-09 11:03:40	2026-04-09 11:03:40
4	1	Envoi du devis au client	4	commercial	Devis envoyé au client pour validation.	4	f	2026-04-09 11:03:40	2026-04-09 11:03:40
5	2	Devis en attente de réponse	1	client	Le client examine le devis.	72	f	2026-04-09 11:03:40	2026-04-09 11:03:40
6	2	Négociation (si applicable)	2	commercial	Échanges et ajustements si nécessaire.	24	t	2026-04-09 11:03:40	2026-04-09 11:03:40
7	2	Acceptation finale	3	client	Le client accepte ou rejette le devis.	24	f	2026-04-09 11:03:40	2026-04-09 11:03:40
8	3	Rédaction du contrat	1	commercial	Commercial rédige le contrat à partir du devis accepté.	24	f	2026-04-09 11:03:40	2026-04-09 11:03:40
9	3	Approbation Directeur	2	directeur	Le directeur examine et approuve ou retourne le contrat.	48	f	2026-04-09 11:03:40	2026-04-09 11:03:40
10	3	Envoi au client pour signature	3	commercial	Contrat envoyé au client avec le token de signature.	4	f	2026-04-09 11:03:40	2026-04-09 11:03:40
11	3	Signature électronique client	4	client	Le client signe le contrat en ligne.	48	f	2026-04-09 11:03:40	2026-04-09 11:03:40
12	3	Dépôt de caution	5	financier	Le client dépose le chèque de caution.	72	f	2026-04-09 11:03:40	2026-04-09 11:03:40
13	3	Vérification de la caution	6	financier	Le service financier vérifie et valide le chèque.	24	f	2026-04-09 11:03:40	2026-04-09 11:03:40
14	3	Activation du contrat	7	commercial	Contrat activé — les opérations peuvent commencer.	2	f	2026-04-09 11:03:40	2026-04-09 11:03:40
\.


--
-- Data for Name: factures; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.factures (id, numero_facture, client_id, contrat_id, devise_id, cree_par_user_id, type_facture, date_emission, date_echeance, montant_ht, tva, montant_ttc, montant_paye, montant_restant, statut, conditions_paiement, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
1	28da58bb-909d-4671-8c90-eb6c56663fec	database	default	{"uuid":"28da58bb-909d-4671-8c90-eb6c56663fec","displayName":"App\\\\Mail\\\\SuspiciousLoginAlert","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Mail\\\\SendQueuedMailable","command":"O:34:\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\":17:{s:8:\\"mailable\\";O:29:\\"App\\\\Mail\\\\SuspiciousLoginAlert\\":5:{s:2:\\"ip\\";s:9:\\"127.0.0.1\\";s:8:\\"attempts\\";i:10;s:14:\\"attemptedEmail\\";s:25:\\"gslc.commercial@gmail.com\\";s:2:\\"to\\";a:1:{i:0;a:2:{s:4:\\"name\\";N;s:7:\\"address\\";s:17:\\"hello@example.com\\";}}s:6:\\"mailer\\";s:3:\\"log\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:13:\\"maxExceptions\\";N;s:17:\\"shouldBeEncrypted\\";b:0;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:12:\\"messageGroup\\";N;s:12:\\"deduplicator\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;s:3:\\"job\\";N;}","batchId":null},"createdAt":1777725802,"delay":null}	InvalidArgumentException: Invalid view. in D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Mailer.php:403\nStack trace:\n#0 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Mailer.php(308): Illuminate\\Mail\\Mailer->parseView(NULL)\n#1 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Mailable.php(207): Illuminate\\Mail\\Mailer->send(NULL, Array, Object(Closure))\n#2 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Support\\Traits\\Localizable.php(19): Illuminate\\Mail\\Mailable->Illuminate\\Mail\\{closure}()\n#3 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\Mailable.php(200): Illuminate\\Mail\\Mailable->withLocale(NULL, Object(Closure))\n#4 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Mail\\SendQueuedMailable.php(82): Illuminate\\Mail\\Mailable->send(Object(Illuminate\\Mail\\MailManager))\n#5 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(36): Illuminate\\Mail\\SendQueuedMailable->handle(Object(Illuminate\\Mail\\MailManager))\n#6 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Util.php(43): Illuminate\\Container\\BoundMethod::Illuminate\\Container\\{closure}()\n#7 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(96): Illuminate\\Container\\Util::unwrapIfClosure(Object(Closure))\n#8 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(35): Illuminate\\Container\\BoundMethod::callBoundMethod(Object(Illuminate\\Foundation\\Application), Array, Object(Closure))\n#9 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Container.php(799): Illuminate\\Container\\BoundMethod::call(Object(Illuminate\\Foundation\\Application), Array, Array, NULL)\n#10 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Bus\\Dispatcher.php(129): Illuminate\\Container\\Container->call(Array)\n#11 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(180): Illuminate\\Bus\\Dispatcher->Illuminate\\Bus\\{closure}(Object(Illuminate\\Mail\\SendQueuedMailable))\n#12 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(137): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}(Object(Illuminate\\Mail\\SendQueuedMailable))\n#13 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Bus\\Dispatcher.php(133): Illuminate\\Pipeline\\Pipeline->then(Object(Closure))\n#14 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\CallQueuedHandler.php(136): Illuminate\\Bus\\Dispatcher->dispatchNow(Object(Illuminate\\Mail\\SendQueuedMailable), false)\n#15 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(180): Illuminate\\Queue\\CallQueuedHandler->Illuminate\\Queue\\{closure}(Object(Illuminate\\Mail\\SendQueuedMailable))\n#16 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Pipeline\\Pipeline.php(137): Illuminate\\Pipeline\\Pipeline->Illuminate\\Pipeline\\{closure}(Object(Illuminate\\Mail\\SendQueuedMailable))\n#17 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\CallQueuedHandler.php(129): Illuminate\\Pipeline\\Pipeline->then(Object(Closure))\n#18 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\CallQueuedHandler.php(70): Illuminate\\Queue\\CallQueuedHandler->dispatchThroughMiddleware(Object(Illuminate\\Queue\\Jobs\\DatabaseJob), Object(Illuminate\\Mail\\SendQueuedMailable))\n#19 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Jobs\\Job.php(102): Illuminate\\Queue\\CallQueuedHandler->call(Object(Illuminate\\Queue\\Jobs\\DatabaseJob), Array)\n#20 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Worker.php(485): Illuminate\\Queue\\Jobs\\Job->fire()\n#21 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Worker.php(435): Illuminate\\Queue\\Worker->process('database', Object(Illuminate\\Queue\\Jobs\\DatabaseJob), Object(Illuminate\\Queue\\WorkerOptions))\n#22 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Worker.php(358): Illuminate\\Queue\\Worker->runJob(Object(Illuminate\\Queue\\Jobs\\DatabaseJob), 'database', Object(Illuminate\\Queue\\WorkerOptions))\n#23 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Console\\WorkCommand.php(148): Illuminate\\Queue\\Worker->runNextJob('database', 'default', Object(Illuminate\\Queue\\WorkerOptions))\n#24 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Queue\\Console\\WorkCommand.php(131): Illuminate\\Queue\\Console\\WorkCommand->runWorker('database', 'default')\n#25 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(36): Illuminate\\Queue\\Console\\WorkCommand->handle()\n#26 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Util.php(43): Illuminate\\Container\\BoundMethod::Illuminate\\Container\\{closure}()\n#27 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(96): Illuminate\\Container\\Util::unwrapIfClosure(Object(Closure))\n#28 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\BoundMethod.php(35): Illuminate\\Container\\BoundMethod::callBoundMethod(Object(Illuminate\\Foundation\\Application), Array, Object(Closure))\n#29 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Container\\Container.php(799): Illuminate\\Container\\BoundMethod::call(Object(Illuminate\\Foundation\\Application), Array, Array, NULL)\n#30 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Console\\Command.php(211): Illuminate\\Container\\Container->call(Array)\n#31 D:\\htdocs\\GSLC\\vendor\\symfony\\console\\Command\\Command.php(341): Illuminate\\Console\\Command->execute(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Illuminate\\Console\\OutputStyle))\n#32 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Console\\Command.php(180): Symfony\\Component\\Console\\Command\\Command->run(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Illuminate\\Console\\OutputStyle))\n#33 D:\\htdocs\\GSLC\\vendor\\symfony\\console\\Application.php(1117): Illuminate\\Console\\Command->run(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#34 D:\\htdocs\\GSLC\\vendor\\symfony\\console\\Application.php(356): Symfony\\Component\\Console\\Application->doRunCommand(Object(Illuminate\\Queue\\Console\\WorkCommand), Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#35 D:\\htdocs\\GSLC\\vendor\\symfony\\console\\Application.php(195): Symfony\\Component\\Console\\Application->doRun(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#36 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Foundation\\Console\\Kernel.php(198): Symfony\\Component\\Console\\Application->run(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#37 D:\\htdocs\\GSLC\\vendor\\laravel\\framework\\src\\Illuminate\\Foundation\\Application.php(1235): Illuminate\\Foundation\\Console\\Kernel->handle(Object(Symfony\\Component\\Console\\Input\\ArgvInput), Object(Symfony\\Component\\Console\\Output\\ConsoleOutput))\n#38 D:\\htdocs\\GSLC\\artisan(16): Illuminate\\Foundation\\Application->handleCommand(Object(Symfony\\Component\\Console\\Input\\ArgvInput))\n#39 {main}	2026-05-02 18:08:47
\.


--
-- Data for Name: franchises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.franchises (id, type_conteneur_id, port_id, client_id, type_franchise, jours_franchise, description, date_debut_validite, date_fin_validite, actif, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: instance_workflows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instance_workflows (id, workflow_id, conteneur_id, demande_id, bloque_par_user_id, etape_actuelle, date_debut, date_fin_prevue, date_fin_reelle, progression, statut, motif_blocage, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, container_id, dossier_id, amount_surestary, user_id, ip_address, payload_json, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
6	default	{"uuid":"878712ca-1e9e-49c8-9c50-3c231132cc2a","displayName":"App\\\\Mail\\\\StaffPasswordResetAlert","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Mail\\\\SendQueuedMailable","command":"O:34:\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\":17:{s:8:\\"mailable\\";O:32:\\"App\\\\Mail\\\\StaffPasswordResetAlert\\":5:{s:9:\\"staffUser\\";O:45:\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\":5:{s:5:\\"class\\";s:15:\\"App\\\\Models\\\\User\\";s:2:\\"id\\";i:6;s:9:\\"relations\\";a:0:{}s:10:\\"connection\\";s:5:\\"pgsql\\";s:15:\\"collectionClass\\";N;}s:9:\\"ipAddress\\";s:9:\\"127.0.0.1\\";s:7:\\"resetAt\\";s:22:\\"02\\/05\\/2026 à 18:30:26\\";s:4:\\"lang\\";s:2:\\"fr\\";s:6:\\"mailer\\";s:4:\\"smtp\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:13:\\"maxExceptions\\";N;s:17:\\"shouldBeEncrypted\\";b:0;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:12:\\"messageGroup\\";N;s:12:\\"deduplicator\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;s:3:\\"job\\";N;}","batchId":null},"createdAt":1777746626,"delay":null}	0	\N	1777746626	1777746626
\.


--
-- Data for Name: journal_audits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journal_audits (id, utilisateur_id, action, table_cible, enregistrement_id, anciennes_valeurs, nouvelles_valeurs, adresse_ip, user_agent, resultat, date_action) FROM stdin;
1	6	LOGIN	users	6	\N	{"email":"gslc.commercial@gmail.com","role":"commercial"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0	SUCCES	2026-05-02 12:46:12
2	5	LOGIN	users	5	\N	{"email":"gslc.admin@gmail.com","role":"admin"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0	SUCCES	2026-05-02 13:13:02
3	5	UPDATE	system_config	\N	{"section":"email","values":{"smtp_host":"smtp.gmail.com","smtp_port":"585","smtp_username":"gslc.commercial@gmail.com","smtp_password":"Gslccommercial1990@##","smtp_from":"gslc.commercial@gmail.com","contact_email_admin":"","contact_email_commercial":""}}	{"section":"email","values":{"smtp_host":"smtp.gmail.com","smtp_port":"587","smtp_username":"gslc.commercial@gmail.com","smtp_password":"tsep tqia hbef uqvt","smtp_from":"gslc.commercial@gmail.com","contact_email_admin":"gslc.admin@gmail.com","contact_email_commercial":"gslc.commercial@gmail.com"}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0	SUCCES	2026-05-02 13:16:52
4	5	UPDATE	system_config	\N	{"section":"email","values":{"smtp_host":"smtp.gmail.com","smtp_username":"gslc.commercial@gmail.com","smtp_from":"gslc.commercial@gmail.com","smtp_port":"587","smtp_password":"tsep tqia hbef uqvt","contact_email_admin":"gslc.admin@gmail.com","contact_email_commercial":"gslc.commercial@gmail.com"}}	{"section":"email","values":{"smtp_host":"smtp.gmail.com","smtp_port":"587","smtp_username":"gslc.commercial@gmail.com","smtp_password":"tsep tqia hbef uqvt","smtp_from":"gslc.commercial@gmail.com","contact_email_admin":"gslc.admin@gmail.com","contact_email_commercial":"gslc.commercial@gmail.com"}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0	SUCCES	2026-05-02 13:21:55
5	5	UPDATE	system_config	\N	{"section":"email","values":{"smtp_host":"smtp.gmail.com","smtp_username":"gslc.commercial@gmail.com","smtp_from":"gslc.commercial@gmail.com","smtp_port":"587","smtp_password":"tsep tqia hbef uqvt","contact_email_admin":"gslc.admin@gmail.com","contact_email_commercial":"gslc.commercial@gmail.com"}}	{"section":"email","values":{"smtp_host":"smtp.gmail.com","smtp_port":"587","smtp_username":"gslc.commercial@gmail.com","smtp_password":"apxd krrg vdjl zjri","smtp_from":"gslc.commercial@gmail.com","contact_email_admin":"gslc.admin@gmail.com","contact_email_commercial":"gslc.commercial@gmail.com"}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0	SUCCES	2026-05-02 13:23:09
6	5	UPDATE	system_config	\N	{"section":"email","values":{"smtp_host":"smtp.gmail.com","smtp_username":"gslc.commercial@gmail.com","smtp_from":"gslc.commercial@gmail.com","smtp_port":"587","contact_email_admin":"gslc.admin@gmail.com","contact_email_commercial":"gslc.commercial@gmail.com","smtp_password":"apxd krrg vdjl zjri"}}	{"section":"email","values":{"smtp_host":"smtp.gmail.com","smtp_port":"587","smtp_username":"gslc.commercial@gmail.com","smtp_password":"apxdkrrgvdjlzjri","smtp_from":"gslc.commercial@gmail.com","contact_email_admin":"gslc.admin@gmail.com","contact_email_commercial":"gslc.commercial@gmail.com"}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0	SUCCES	2026-05-02 13:23:34
7	5	UPDATE	system_config	\N	{"section":"email","values":{"smtp_host":"smtp.gmail.com","smtp_username":"gslc.commercial@gmail.com","smtp_from":"gslc.commercial@gmail.com","smtp_port":"587","contact_email_admin":"gslc.admin@gmail.com","contact_email_commercial":"gslc.commercial@gmail.com","smtp_password":"apxdkrrgvdjlzjri"}}	{"section":"email","values":{"smtp_host":"smtp.gmail.com","smtp_port":"587","smtp_username":"gslc.commercial@gmail.com","smtp_password":"apxdkrrgvdjlzjri","smtp_from":"gslc.commercial@gmail.com","contact_email_admin":"gslc.admin@gmail.com","contact_email_commercial":"gslc.commercial@gmail.com"}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0	SUCCES	2026-05-02 13:24:08
8	5	UPDATE	system_config	\N	{"section":"email","values":{"smtp_host":"smtp.gmail.com","smtp_username":"gslc.commercial@gmail.com","smtp_from":"gslc.commercial@gmail.com","smtp_port":"587","contact_email_admin":"gslc.admin@gmail.com","contact_email_commercial":"gslc.commercial@gmail.com","smtp_password":"apxdkrrgvdjlzjri"}}	{"section":"email","values":{"smtp_host":"smtp.gmail.com","smtp_port":"587","smtp_username":"gslc.commercial@gmail.com","smtp_password":"apxd krrg vdjl zjri","smtp_from":"gslc.commercial@gmail.com","contact_email_admin":"gslc.admin@gmail.com","contact_email_commercial":"gslc.commercial@gmail.com"}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0	SUCCES	2026-05-02 13:25:31
9	5	UPDATE	system_config	\N	{"section":"email","values":{"smtp_host":"smtp.gmail.com","smtp_username":"gslc.commercial@gmail.com","smtp_from":"gslc.commercial@gmail.com","smtp_port":"587","contact_email_admin":"gslc.admin@gmail.com","contact_email_commercial":"gslc.commercial@gmail.com","smtp_password":"apxd krrg vdjl zjri"}}	{"section":"email","values":{"smtp_host":"smtp.gmail.com","smtp_port":"585","smtp_username":"gslc.commercial@gmail.com","smtp_password":"apxd krrg vdjl zjri","smtp_from":"gslc.commercial@gmail.com","contact_email_admin":"gslc.admin@gmail.com","contact_email_commercial":"gslc.commercial@gmail.com"}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0	SUCCES	2026-05-02 13:28:24
10	5	UPDATE	system_config	\N	{"section":"email","values":{"smtp_host":"smtp.gmail.com","smtp_username":"gslc.commercial@gmail.com","smtp_from":"gslc.commercial@gmail.com","contact_email_admin":"gslc.admin@gmail.com","contact_email_commercial":"gslc.commercial@gmail.com","smtp_password":"apxd krrg vdjl zjri","smtp_port":"585"}}	{"section":"email","values":{"smtp_host":"smtp.gmail.com","smtp_port":"587","smtp_username":"gslc.commercial@gmail.com","smtp_password":"apxd krrg vdjl zjri","smtp_from":"gslc.commercial@gmail.com","contact_email_admin":"gslc.admin@gmail.com","contact_email_commercial":"gslc.commercial@gmail.com"}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0	SUCCES	2026-05-02 13:29:41
11	5	UPDATE	system_config	\N	{"section":"email","values":{"smtp_host":"smtp.gmail.com","smtp_username":"gslc.commercial@gmail.com","smtp_from":"gslc.commercial@gmail.com","contact_email_admin":"gslc.admin@gmail.com","contact_email_commercial":"gslc.commercial@gmail.com","smtp_password":"apxd krrg vdjl zjri","smtp_port":"587"}}	{"section":"email","values":{"smtp_host":"smtp.gmail.com","smtp_port":"587","smtp_username":"gslc.commercial@gmail.com","smtp_password":"yzhj pmhj fplc fqee","smtp_from":"gslc.commercial@gmail.com","contact_email_admin":"gslc.admin@gmail.com","contact_email_commercial":"gslc.commercial@gmail.com"}}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0	SUCCES	2026-05-02 13:34:07
12	5	LOGOUT	users	5	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0	SUCCES	2026-05-02 13:34:46
13	\N	SYSTEM	users	6	\N	{"action":"reinitialisation_mot_de_passe_envoyee","email":"gslc.commercial@gmail.com"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0	SUCCES	2026-05-02 13:35:11
14	5	LOGIN	users	5	\N	{"email":"gslc.admin@gmail.com","role":"admin"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0	SUCCES	2026-05-02 17:16:01
15	\N	SYSTEM	users	6	\N	{"action":"reinitialisation_mot_de_passe_envoyee","email":"gslc.commercial@gmail.com"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	SUCCES	2026-05-02 17:56:13
16	6	LOGIN	users	6	\N	{"email":"gslc.commercial@gmail.com","role":"commercial"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	SUCCES	2026-05-02 18:10:51
17	\N	SYSTEM	users	6	\N	{"action":"reinitialisation_mot_de_passe_envoyee","email":"gslc.commercial@gmail.com"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	SUCCES	2026-05-02 18:28:55
18	6	LOGIN	users	6	\N	{"email":"gslc.commercial@gmail.com","role":"commercial"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	SUCCES	2026-05-02 18:30:13
19	6	LOGIN	users	6	\N	{"email":"gslc.commercial@gmail.com","role":"commercial"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	SUCCES	2026-05-02 18:30:52
20	6	LOGOUT	users	6	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	SUCCES	2026-05-02 22:45:09
21	6	LOGIN	users	6	\N	{"email":"gslc.commercial@gmail.com","role":"commercial"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	SUCCES	2026-05-02 22:45:17
22	6	LOGIN	users	6	\N	{"email":"gslc.commercial@gmail.com","role":"commercial"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	SUCCES	2026-05-02 22:45:48
23	6	UPDATE	devis	1	{"id":1,"demande_id":2,"cree_par_user_id":null,"devis_precedent_id":null,"numero_devis":"DV-2026-0001","version":1,"montant_ht":"450000.00","tva":"19.00","total_ttc":"535500.00","statut":"ENVOYE","commentaire_client":null,"commentaire_nashco":"Devis \\u00e9tabli selon tarifs portuaires en vigueur.","date_envoi":"2026-05-01T12:26:39.000000Z","date_expiration":"2026-06-01T00:00:00.000000Z","created_at":"2026-05-02T12:26:39.000000Z","updated_at":"2026-05-02T12:26:39.000000Z"}	{"id":1,"demande_id":2,"cree_par_user_id":null,"devis_precedent_id":null,"numero_devis":"DV-2026-0001","version":1,"montant_ht":"450000.00","tva":"19.00","total_ttc":"535500.00","statut":"EN_NEGOCIATION","commentaire_client":null,"commentaire_nashco":"Devis \\u00e9tabli selon tarifs portuaires en vigueur.","date_envoi":"2026-05-01T12:26:39.000000Z","date_expiration":"2026-06-01T00:00:00.000000Z","created_at":"2026-05-02T12:26:39.000000Z","updated_at":"2026-05-02T23:39:28.000000Z"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	SUCCES	2026-05-02 23:39:28
24	5	LOGIN	users	5	\N	{"email":"gslc.admin@gmail.com","role":"admin"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	SUCCES	2026-05-03 17:40:02
25	5	LOGOUT	users	5	\N	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	SUCCES	2026-05-03 18:06:05
26	5	LOGIN	users	5	\N	{"email":"gslc.admin@gmail.com","role":"admin"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	SUCCES	2026-05-03 18:07:29
27	5	LOGIN	users	5	\N	{"email":"gslc.admin@gmail.com","role":"admin"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	SUCCES	2026-05-03 23:31:53
28	5	UPDATE	devises	\N	\N	{"action":"sync","updated":4,"source":"API_FRANKFURTER"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	SUCCES	2026-05-03 23:32:25
29	5	LOGIN	users	5	\N	{"email":"gslc.admin@gmail.com","role":"admin"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	SUCCES	2026-05-04 11:38:42
30	5	LOGIN	users	5	\N	{"email":"gslc.admin@gmail.com","role":"admin"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	SUCCES	2026-05-04 12:11:05
31	5	LOGIN	users	5	\N	{"email":"gslc.admin@gmail.com","role":"admin"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	SUCCES	2026-05-04 12:39:54
32	5	LOGIN	users	5	\N	{"email":"gslc.admin@gmail.com","role":"admin"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	SUCCES	2026-05-04 13:08:12
33	5	UPDATE	ports	10	{"id":10,"pays_id":1,"nom_port":"Port d'Alger","code_port":"ALG","ville":"Alger","type_port":"MARITIME","adresse":null,"telephone":null,"jours_allowance_defaut":7,"actif":true,"created_at":"2026-05-04T12:16:24.000000Z","updated_at":"2026-05-04T12:16:24.000000Z"}	{"id":10,"pays_id":1,"nom_port":"Port d'Alger","code_port":"AL","ville":"Alger","type_port":"MARITIME","adresse":null,"telephone":null,"jours_allowance_defaut":7,"actif":true,"created_at":"2026-05-04T12:16:24.000000Z","updated_at":"2026-05-04T15:02:27.000000Z"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	SUCCES	2026-05-04 15:02:27
34	5	UPDATE	ports	10	{"id":10,"pays_id":1,"nom_port":"Port d'Alger","code_port":"AL","ville":"Alger","type_port":"MARITIME","adresse":null,"telephone":null,"jours_allowance_defaut":7,"actif":true,"created_at":"2026-05-04T12:16:24.000000Z","updated_at":"2026-05-04T15:02:27.000000Z"}	{"id":10,"pays_id":1,"nom_port":"Port d'Alger","code_port":"ALG","ville":"Alger","type_port":"MARITIME","adresse":null,"telephone":null,"jours_allowance_defaut":7,"actif":true,"created_at":"2026-05-04T12:16:24.000000Z","updated_at":"2026-05-04T15:02:43.000000Z"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	SUCCES	2026-05-04 15:02:43
\.


--
-- Data for Name: lignes_contrat; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lignes_contrat (id, contrat_id, tarif_service_id, type_conteneur_id, type_ligne, service, description, quantite, nombre_conteneurs, prix_unitaire, tva_applicable, total_ht, franchise_jours, date_debut, date_fin, created_at, updated_at) FROM stdin;
1	1	\N	\N	SERVICE	Manutention portuaire	Chargement / déchargement conteneurs	1	1	615000.00	t	615000.00	7	2026-05-02	2027-05-02	2026-05-02 12:27:32	2026-05-02 12:27:32
2	3	\N	\N	SERVICE	Manutention portuaire	Chargement / déchargement conteneurs	1	1	615000.00	t	615000.00	7	2026-05-02	2027-05-02	2026-05-02 12:28:11	2026-05-02 12:28:11
\.


--
-- Data for Name: lignes_demande; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lignes_demande (id, demande_id, marchandise_id, type_conteneur_id, pays_origine_id, quantite, poids_total, volume, unite, description, created_at, updated_at) FROM stdin;
1	1	1	1	1	5	9594.00	\N	UNITE	Marchandises générales	2026-05-02 12:26:39	2026-05-02 12:26:39
2	2	1	1	1	1	5705.00	\N	UNITE	Marchandises générales	2026-05-02 12:26:39	2026-05-02 12:26:39
3	3	1	1	1	3	6901.00	\N	UNITE	Marchandises générales	2026-05-02 12:26:39	2026-05-02 12:26:39
4	4	1	1	1	4	19682.00	\N	UNITE	Marchandises générales	2026-05-02 12:26:39	2026-05-02 12:26:39
5	5	1	1	1	3	7515.00	\N	UNITE	Marchandises générales	2026-05-02 12:26:39	2026-05-02 12:26:39
6	6	1	1	1	2	14487.00	\N	UNITE	Marchandises générales	2026-05-02 12:26:39	2026-05-02 12:26:39
\.


--
-- Data for Name: lignes_devis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lignes_devis (id, devis_id, tarif_service_id, type_ligne, service, description, quantite, prix_unitaire, tva_applicable, total_ht, modification_proposee, nouveau_prix_propose, created_at, updated_at) FROM stdin;
1	1	\N	SERVICE	Manutention portuaire	Chargement / déchargement conteneurs	1	450000.00	t	450000.00	\N	\N	2026-05-02 12:27:32	2026-05-02 12:27:32
2	2	\N	SERVICE	Manutention portuaire	Chargement / déchargement conteneurs	1	820000.00	t	820000.00	\N	\N	2026-05-02 12:27:32	2026-05-02 12:27:32
3	3	\N	SERVICE	Manutention portuaire	Chargement / déchargement conteneurs	1	615000.00	t	615000.00	\N	\N	2026-05-02 12:27:32	2026-05-02 12:27:32
4	4	\N	SERVICE	Manutention portuaire	Chargement / déchargement conteneurs	1	700000.00	t	700000.00	\N	\N	2026-05-02 12:27:32	2026-05-02 12:27:32
\.


--
-- Data for Name: lignes_facture; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lignes_facture (id, facture_id, tarif_service_id, calcul_penalite_id, type_ligne, description, quantite, prix_unitaire, tva_applicable, total_ht, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: marchandises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marchandises (id, code_hs, libelle, classe_dangereuse, necessite_frigo, temperature_min, temperature_max, actif, created_at, updated_at) FROM stdin;
1	0000.00.00	Marchandises générales	\N	f	\N	\N	t	2026-05-02 12:26:37	2026-05-02 12:26:37
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_roles_table	1
2	0001_01_01_000000_create_users_table	1
3	0001_01_01_000001_create_cache_table	1
4	0001_01_01_000002_create_jobs_table	1
5	2024_03_26_000000_create_gslc_tables	1
6	2026_03_14_025730_create_permissions_table	1
7	2026_03_14_025740_create_permission_role_table	1
8	2026_03_14_030333_create_journal_audits_table	1
9	2026_03_14_033725_create_pays_table	1
10	2026_03_14_033737_create_ports_table	1
11	2026_03_14_033749_create_navires_table	1
12	2026_03_14_033758_create_types_conteneur_table	1
13	2026_03_14_033807_create_marchandises_table	1
14	2026_03_14_033815_create_tarifs_service_table	1
15	2026_03_14_033825_create_workflows_table	1
16	2026_03_14_033833_create_etapes_workflow_table	1
17	2026_03_14_033840_create_types_notification_table	1
18	2026_03_14_033849_create_configuration_systeme_table	1
19	2026_03_14_040707_create_transitaires_table	1
20	2026_03_14_040715_create_terminaux_table	1
21	2026_03_14_040726_create_depots_table	1
22	2026_03_14_040736_create_conteneurs_table	1
23	2026_03_14_040747_create_statut_conteneurs_table	1
24	2026_03_14_042225_create_clients_table	1
25	2026_03_14_042236_create_escales_table	1
26	2026_03_14_042245_create_emplacements_table	1
27	2026_03_14_044121_create_demandes_import_table	1
28	2026_03_14_044122_create_documents_table	1
29	2026_03_14_044156_create_lignes_demande_table	1
30	2026_03_14_044205_create_demande_conteneurs_table	1
31	2026_03_14_044216_create_demande_documents_table	1
32	2026_03_14_044225_create_devis_table	1
33	2026_03_14_044240_create_lignes_devis_table	1
34	2026_03_14_052220_create_banques_table	1
35	2026_03_14_052222_create_conditions_generales_table	1
36	2026_03_14_052224_create_contrats_import_table	1
37	2026_03_14_052237_create_lignes_contrat_table	1
38	2026_03_14_052238_create_rapports_inspection_table	1
39	2026_03_14_055800_create_devises_table	1
40	2026_03_14_055819_create_franchises_table	1
41	2026_03_14_055830_create_penalites_table	1
42	2026_03_14_055851_create_calcul_penalites_table	1
43	2026_03_14_055908_create_factures_table	1
44	2026_03_14_055918_create_lignes_facture_table	1
45	2026_03_14_055928_create_paiements_table	1
46	2026_03_14_055942_create_mouvement_conteneurs_table	1
47	2026_03_14_060009_create_instance_workflows_table	1
48	2026_03_14_060017_create_notifications_table	1
49	2026_03_18_180207_create_personal_access_tokens_table	1
50	2026_03_29_134959_create_avenants_table	2
51	2026_03_29_135010_create_alertes_table	2
52	2026_03_29_135021_create_restitutions_caution_table	2
53	2026_03_31_233801_add_position_to_users_table	3
54	2026_04_01_094416_rename_role_nom_role_values	4
55	2026_04_02_000001_create_user_permissions_table	5
56	2026_04_05_141033_create_contact_messages_table	6
57	2026_04_06_203932_create_departments_table	7
58	2026_04_06_203935_add_department_id_to_users_table	7
59	2026_04_06_235744_add_deleted_at_to_users_table	8
60	2026_04_09_112428_make_utilisateur_id_nullable_in_journal_audits	9
61	2026_04_10_000001_add_fields_to_departments_table	10
62	2026_04_10_000002_create_positions_table	10
63	2026_04_10_000003_add_position_id_to_users_table	10
64	2026_04_11_000001_create_system_config_table	11
65	2026_04_12_111620_add_must_change_password_to_users_table	12
66	2026_04_13_160159_rebuild_rbac_tables	13
67	2025_06_01_000001_create_corbeille_table	14
68	2026_04_13_235548_create_actualites_table	15
69	2026_06_02_000001_add_soft_deletes_to_clients_table	15
70	2026_06_02_000002_add_soft_deletes_to_demandes_import_table	15
71	2026_06_02_000003_add_soft_deletes_to_documents_table	15
\.


--
-- Data for Name: mouvement_conteneurs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mouvement_conteneurs (id, conteneur_id, client_id, port_id, depot_id, emplacement_id, responsable_id, type_mouvement, date_mouvement, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: navires; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.navires (id, nom_navire, numero_imo, pays_id, compagnie_maritime, capacite_teu, annee_construction, actif, created_at, updated_at) FROM stdin;
1	MV Djurdjura	IMO9876541	1	CNAN Nord	1200	2018	t	2026-05-02 12:28:11	2026-05-02 12:28:11
2	MV Hoggar	IMO9876542	1	MSC Algeria	2400	2005	t	2026-05-02 12:28:11	2026-05-02 12:28:11
3	MV Tamanrasset	IMO9876543	1	CMA CGM Algérie	800	2017	t	2026-05-02 12:28:11	2026-05-02 12:28:11
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, type_notification_id, destinataire_id, conteneur_id, facture_id, demande_id, titre, message, canal, lien_action, date_creation, date_envoi, lu, lu_le, created_at, updated_at) FROM stdin;
2	\N	5	\N	\N	\N	Mot de passe modifié	GSLC Commercial a changé son mot de passe.	SYSTEME	/admin/users	2026-05-02 18:30:26	\N	t	2026-05-03 23:16:14	2026-05-02 18:30:26	2026-05-03 23:16:14
1	\N	5	\N	\N	\N	Mot de passe modifié	GSLC Commercial a changé son mot de passe.	SYSTEME	/admin/users	2026-05-02 18:13:41	\N	t	2026-05-03 23:16:25	2026-05-02 18:13:41	2026-05-03 23:16:25
\.


--
-- Data for Name: paiements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.paiements (id, facture_id, banque_id, recu_par_user_id, montant, date_paiement, methode, reference, statut, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
mokhtari.youcef@gmail.com	$2y$12$KS2IRFd17G2rLYEAOu0NN.Mf534Hyt3aUeZENtLuOravb2XqFcUDe	2026-04-06 20:16:20
gslc.logistique@gmail.com	$2y$12$/bACeViFp4C0pPxAsQ5vZOiYxq3DpiM73ZBB/IMpbsS5fzAjXheaK	2026-04-07 01:15:07
youcef.mokhtari@etu.univ-mosta.dz	$2y$12$TxNVv.0oMp53Kfw3Hq9uR.HlIsfjtoOhtAy9EFMmENTtaQZL6/Hu2	2026-04-09 21:10:20
gslc.commercial@gmail.com	$2y$12$Lc5M6V4ccDeqhz.QeyAf2.eeFT5gNxqTy50F.uXCkYiaN4LVb/NNu	2026-05-02 13:35:07
\.


--
-- Data for Name: pays; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pays (id, nom_pays, code_iso, indicatif_tel, devise_defaut, actif, created_at, updated_at) FROM stdin;
1	Algérie	DZ	+213	DZD	t	2026-04-01 23:11:23	2026-04-01 23:11:23
2	Maroc	MA	+212	MAD	t	2026-04-01 23:11:23	2026-04-01 23:11:23
3	Tunisie	TN	+216	TND	t	2026-04-01 23:11:23	2026-04-01 23:11:23
4	Libye	LY	+218	LYD	t	2026-04-01 23:11:23	2026-04-01 23:11:23
5	Égypte	EG	+20	EGP	t	2026-04-01 23:11:23	2026-04-01 23:11:23
6	Turquie	TR	+90	TRY	t	2026-04-01 23:11:23	2026-04-01 23:11:23
7	France	FR	+33	EUR	t	2026-04-01 23:11:23	2026-04-01 23:11:23
8	Espagne	ES	+34	EUR	t	2026-04-01 23:11:23	2026-04-01 23:11:23
9	Italie	IT	+39	EUR	t	2026-04-01 23:11:23	2026-04-01 23:11:23
10	Allemagne	DE	+49	EUR	t	2026-04-01 23:11:23	2026-04-01 23:11:23
11	Pays-Bas	NL	+31	EUR	t	2026-04-01 23:11:23	2026-04-01 23:11:23
12	Belgique	BE	+32	EUR	t	2026-04-01 23:11:23	2026-04-01 23:11:23
13	Portugal	PT	+351	EUR	t	2026-04-01 23:11:23	2026-04-01 23:11:23
14	Royaume-Uni	GB	+44	GBP	t	2026-04-01 23:11:23	2026-04-01 23:11:23
15	Chine	CN	+86	CNY	t	2026-04-01 23:11:23	2026-04-01 23:11:23
16	Japon	JP	+81	JPY	t	2026-04-01 23:11:23	2026-04-01 23:11:23
17	Corée du Sud	KR	+82	KRW	t	2026-04-01 23:11:23	2026-04-01 23:11:23
18	Inde	IN	+91	INR	t	2026-04-01 23:11:23	2026-04-01 23:11:23
19	États-Unis	US	+1	USD	t	2026-04-01 23:11:23	2026-04-01 23:11:23
20	Canada	CA	+1	CAD	t	2026-04-01 23:11:23	2026-04-01 23:11:23
21	Brésil	BR	+55	BRL	t	2026-04-01 23:11:23	2026-04-01 23:11:23
22	Argentine	AR	+54	ARS	t	2026-04-01 23:11:23	2026-04-01 23:11:23
\.


--
-- Data for Name: penalites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.penalites (id, type_conteneur_id, devise_id, type, tarif_journalier, tranche_debut, tranche_fin, date_debut_validite, date_fin_validite, actif, created_at, updated_at) FROM stdin;
1	1	1	DEMURRAGE	5000.00	1	7	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
2	1	1	DEMURRAGE	8000.00	8	14	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
3	1	1	DEMURRAGE	12000.00	15	\N	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
4	1	1	DETENTION	3000.00	1	7	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
5	1	1	DETENTION	4800.00	8	14	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
6	1	1	DETENTION	7200.00	15	\N	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
7	2	1	DEMURRAGE	7500.00	1	7	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
8	2	1	DEMURRAGE	12000.00	8	14	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
9	2	1	DEMURRAGE	18000.00	15	\N	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
10	2	1	DETENTION	4500.00	1	7	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
11	2	1	DETENTION	7200.00	8	14	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
12	2	1	DETENTION	10800.00	15	\N	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
13	3	1	DEMURRAGE	8500.00	1	7	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
14	3	1	DEMURRAGE	13600.00	8	14	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
15	3	1	DEMURRAGE	20400.00	15	\N	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
16	3	1	DETENTION	5000.00	1	7	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
17	3	1	DETENTION	8000.00	8	14	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
18	3	1	DETENTION	12000.00	15	\N	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
19	4	1	DEMURRAGE	12000.00	1	7	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
20	4	1	DEMURRAGE	19200.00	8	14	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
21	4	1	DEMURRAGE	28800.00	15	\N	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
22	4	1	DETENTION	8000.00	1	7	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
23	4	1	DETENTION	12800.00	8	14	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
24	4	1	DETENTION	19200.00	15	\N	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
25	5	1	DEMURRAGE	15000.00	1	7	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
26	5	1	DEMURRAGE	24000.00	8	14	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
27	5	1	DEMURRAGE	36000.00	15	\N	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
28	5	1	DETENTION	10000.00	1	7	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
29	5	1	DETENTION	16000.00	8	14	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
30	5	1	DETENTION	24000.00	15	\N	2026-04-09	\N	t	2026-04-09 11:03:03	2026-04-09 11:03:03
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, name, label, module, description, is_system, created_at, updated_at) FROM stdin;
1	users.view	Voir les utilisateurs	admin	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
2	users.create	Créer un utilisateur	admin	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
3	users.edit	Modifier un utilisateur	admin	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
4	users.delete	Supprimer un utilisateur	admin	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
5	users.block	Bloquer/débloquer un utilisateur	admin	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
6	users.reset_password	Réinitialiser un mot de passe	admin	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
7	departments.view	Voir les départements	admin	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
8	departments.manage	Gérer les départements	admin	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
9	positions.view	Voir les postes	admin	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
10	positions.manage	Gérer les postes	admin	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
11	roles.view	Voir les rôles	admin	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
12	roles.manage	Gérer les rôles	admin	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
13	permissions.view	Voir les permissions	admin	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
14	permissions.manage	Gérer les permissions	admin	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
15	config.view	Voir la configuration	admin	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
16	config.manage	Gérer la configuration	admin	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
17	audit.view	Voir le journal d'audit	admin	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
18	audit.export	Exporter le journal d'audit	admin	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
19	registrations.view	Voir les demandes d'inscription	admin	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
20	registrations.approve	Approuver/rejeter une inscription	admin	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
21	notifications.view	Voir les notifications	admin	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
22	clients.view	Voir les clients	commercial	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
23	clients.manage	Gérer les clients	commercial	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
24	quotes.view	Voir les devis	commercial	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
25	quotes.create	Créer un devis	commercial	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
26	quotes.approve	Approuver un devis	commercial	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
27	contracts.view	Voir les contrats	commercial	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
28	contracts.manage	Gérer les contrats	commercial	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
29	contracts.approve	Approuver un contrat	commercial	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
30	containers.view	Voir les conteneurs	logistique	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
31	containers.manage	Gérer les conteneurs	logistique	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
32	movements.view	Voir les mouvements	logistique	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
33	movements.create	Enregistrer un mouvement	logistique	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
34	surestaries.view	Voir les surestaries	logistique	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
35	surestaries.calculate	Calculer les surestaries	logistique	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
36	invoices.view	Voir les factures	finance	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
37	invoices.manage	Gérer les factures	finance	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
38	payments.view	Voir les paiements	finance	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
39	payments.manage	Gérer les paiements	finance	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
40	rates.view	Voir les taux de change	finance	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
41	rates.manage	Gérer les taux de change	finance	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
42	reports.view	Voir les rapports	direction	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
43	analytics.view	Voir les analyses	direction	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
44	dashboard.global	Accéder au tableau de bord global	direction	\N	f	2026-05-02 12:25:36	2026-05-02 12:25:36
\.


--
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
153	App\\Models\\User	1	api-token	c17c69c2268caa5a4dca0f70bcb86aa0a8955fe46a3d189e924288025bb674e3	["*"]	2026-05-01 19:13:10	\N	2026-05-01 18:37:38	2026-05-01 19:13:10
50	App\\Models\\User	33	api-token	3e68f5b1eddedf243b0b25d5f812ee1753c4baa688016fc766ff7b4b215ce5f3	["*"]	2026-04-13 20:19:41	\N	2026-04-13 20:17:26	2026-04-13 20:19:41
42	App\\Models\\User	30	api-token	4fcb6ec460c4024414b5b465251e3f6c83399be05d32571554f783f5ed086733	["*"]	2026-04-12 21:41:57	\N	2026-04-12 21:41:21	2026-04-12 21:41:57
9	App\\Models\\User	2	api-token	3d3bfde0f30150559458fac092c942fb52a2653065e6579f0b69bd7882e0140e	["*"]	\N	\N	2026-04-09 17:01:45	2026-04-09 17:01:45
37	App\\Models\\User	11	api-token	987a1ee4a06607b4832106a34339a4d4664a4b718b0af0fd27b05f1f98d99e71	["*"]	2026-04-12 17:19:21	\N	2026-04-12 17:14:02	2026-04-12 17:19:21
157	App\\Models\\User	3	api-token	c385d7b1316f211bd9075ee3f6f8aff710f3885c1e6648e60a8bb08ec3132d50	["*"]	2026-05-02 12:42:48	\N	2026-05-02 12:13:49	2026-05-02 12:42:48
167	App\\Models\\User	6	api-token	95339215b1b9f1223af9b5552f4a52e9ffe90761f8755c8a75143f4fc4871f99	["*"]	2026-05-03 02:03:54	\N	2026-05-02 22:45:48	2026-05-03 02:03:54
85	App\\Models\\User	37	api-token	935f4193cca3039a5835a7c9e565f26668baeb1ef705f7e0fc9ea7948e0ee3fc	["*"]	2026-04-15 22:55:49	\N	2026-04-14 04:11:45	2026-04-15 22:55:49
30	App\\Models\\User	24	api-token	d70dfc3f2b96380b3fff960c439e7882a1b0ef2136b683b308844144f9138c1e	["*"]	2026-04-12 16:03:45	\N	2026-04-12 13:17:28	2026-04-12 16:03:45
73	App\\Models\\User	38	api-token	4e9fd4a878901b9b8352eded135e3d4cbbddbcefc744545579fc7aedc2aa35f5	["*"]	2026-04-14 02:21:19	\N	2026-04-14 02:19:35	2026-04-14 02:21:19
152	App\\Models\\User	50	api-token	c4caa1f965ed0f5c4b3da960f43dc7845f88f692662ef4f24b86e481ce91500b	["*"]	2026-05-01 18:36:58	\N	2026-05-01 18:36:54	2026-05-01 18:36:58
52	App\\Models\\User	36	api-token	037601b1c9852fe39ef9a198548921aa3688e2bd3012a6f1a8662cdddc0195f7	["*"]	2026-04-13 22:02:13	\N	2026-04-13 22:02:02	2026-04-13 22:02:13
174	App\\Models\\User	5	api-token	c67a6fbb8c34502e2a92c6babed1da656f29fd92dea8a44f603d3b16527c059e	["*"]	2026-05-04 19:05:08	\N	2026-05-04 13:08:12	2026-05-04 19:05:08
\.


--
-- Data for Name: ports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ports (id, pays_id, nom_port, code_port, ville, type_port, adresse, telephone, jours_allowance_defaut, actif, created_at, updated_at) FROM stdin;
1	1	Port de Mostaganem	DZMGM	Mostaganem	COMMERCIAL	Zone Portuaire, Mostaganem 27000	+213 45 21 60 00	7	t	2026-04-01 23:11:25	2026-04-01 23:11:25
2	1	Port d'Oran	DZORN	Oran	COMMERCIAL	Zone Portuaire, Oran 31000	+213 41 33 20 00	7	t	2026-04-01 23:11:25	2026-04-01 23:11:25
3	1	Port d'Alger	DZALG	Alger	COMMERCIAL	Place des Martyrs, Alger 16000	+213 21 43 00 00	7	t	2026-04-01 23:11:25	2026-04-01 23:11:25
4	1	Port d'Annaba	DZAAE	Annaba	COMMERCIAL	Zone Portuaire, Annaba 23000	+213 38 86 10 00	7	t	2026-04-01 23:11:25	2026-04-01 23:11:25
5	7	Port de Marseille	FRMRS	Marseille	COMMERCIAL	Port Autonome de Marseille, France	+33 4 91 39 40 00	0	t	2026-04-01 23:11:25	2026-04-01 23:11:25
6	8	Port de Barcelone	ESBCN	Barcelone	COMMERCIAL	Port de Barcelona, Espagne	+34 93 306 88 00	0	t	2026-04-01 23:11:25	2026-04-01 23:11:25
7	9	Port de Gênes	ITGOA	Gênes	COMMERCIAL	Porto di Genova, Italie	+39 010 24 91	0	t	2026-04-01 23:11:25	2026-04-01 23:11:25
8	15	Port de Shanghai	CNSHA	Shanghai	COMMERCIAL	Shanghai International Port, Chine	+86 21 6160 0000	0	t	2026-04-01 23:11:25	2026-04-01 23:11:25
9	11	Port de Rotterdam	NLRTM	Rotterdam	COMMERCIAL	Port of Rotterdam, Pays-Bas	+31 10 252 10 10	0	t	2026-04-01 23:11:25	2026-04-01 23:11:25
11	1	Port d'Oran	ORN	Oran	MARITIME	\N	\N	7	t	2026-05-04 12:16:24	2026-05-04 12:16:24
12	1	Port d'Annaba	AAE	Annaba	MARITIME	\N	\N	7	t	2026-05-04 12:16:24	2026-05-04 12:16:24
13	1	Port de Béjaïa	BJA	Béjaïa	MARITIME	\N	\N	7	t	2026-05-04 12:16:24	2026-05-04 12:16:24
14	1	Port de Skikda	SKI	Skikda	MARITIME	\N	\N	7	t	2026-05-04 12:16:24	2026-05-04 12:16:24
15	1	Port de Mostaganem	MOS	Mostaganem	MARITIME	\N	\N	7	t	2026-05-04 12:16:24	2026-05-04 12:16:24
16	1	Port de Djendjene	DJN	Jijel	MARITIME	\N	\N	7	t	2026-05-04 12:16:24	2026-05-04 12:16:24
17	1	Port de Ghazaouet	GHZ	Ghazaouet	MARITIME	\N	\N	7	t	2026-05-04 12:16:24	2026-05-04 12:16:24
18	1	Port de Ténès	TEN	Ténès	MARITIME	\N	\N	7	t	2026-05-04 12:16:24	2026-05-04 12:16:24
19	1	Port de Dellys	DEL	Dellys	MARITIME	\N	\N	7	t	2026-05-04 12:16:24	2026-05-04 12:16:24
10	1	Port d'Alger	ALG	Alger	MARITIME	\N	\N	7	t	2026-05-04 12:16:24	2026-05-04 15:02:43
\.


--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.positions (id, title, description, department_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: rapports_inspection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rapports_inspection (id, conteneur_id, inspecteur_id, contrat_id, date_inspection, etat_conteneur, action_requise, cout_reparation_estime, observations, photos, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: restitutions_caution; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restitutions_caution (id, contrat_id, type_action, montant, devise, montant_restitue, montant_retenu, motif_retenu, date_action, numero_cheque, banque_id, numero_cheque_restitution, motif, traite_par_user_id, document_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (id, role_id, permission_id, created_at, updated_at) FROM stdin;
1	1	1	2026-05-02 12:25:36	2026-05-02 12:25:36
2	1	2	2026-05-02 12:25:36	2026-05-02 12:25:36
3	1	3	2026-05-02 12:25:36	2026-05-02 12:25:36
4	1	4	2026-05-02 12:25:36	2026-05-02 12:25:36
5	1	5	2026-05-02 12:25:36	2026-05-02 12:25:36
6	1	6	2026-05-02 12:25:36	2026-05-02 12:25:36
7	1	7	2026-05-02 12:25:36	2026-05-02 12:25:36
8	1	8	2026-05-02 12:25:36	2026-05-02 12:25:36
9	1	9	2026-05-02 12:25:36	2026-05-02 12:25:36
10	1	10	2026-05-02 12:25:36	2026-05-02 12:25:36
11	1	11	2026-05-02 12:25:36	2026-05-02 12:25:36
12	1	12	2026-05-02 12:25:36	2026-05-02 12:25:36
13	1	13	2026-05-02 12:25:36	2026-05-02 12:25:36
14	1	14	2026-05-02 12:25:36	2026-05-02 12:25:36
15	1	15	2026-05-02 12:25:36	2026-05-02 12:25:36
16	1	16	2026-05-02 12:25:36	2026-05-02 12:25:36
17	1	17	2026-05-02 12:25:36	2026-05-02 12:25:36
18	1	18	2026-05-02 12:25:36	2026-05-02 12:25:36
19	1	19	2026-05-02 12:25:36	2026-05-02 12:25:36
20	1	20	2026-05-02 12:25:36	2026-05-02 12:25:36
21	1	21	2026-05-02 12:25:36	2026-05-02 12:25:36
22	1	22	2026-05-02 12:25:36	2026-05-02 12:25:36
23	1	23	2026-05-02 12:25:36	2026-05-02 12:25:36
24	1	24	2026-05-02 12:25:36	2026-05-02 12:25:36
25	1	25	2026-05-02 12:25:36	2026-05-02 12:25:36
26	1	26	2026-05-02 12:25:36	2026-05-02 12:25:36
27	1	27	2026-05-02 12:25:36	2026-05-02 12:25:36
28	1	28	2026-05-02 12:25:36	2026-05-02 12:25:36
29	1	29	2026-05-02 12:25:36	2026-05-02 12:25:36
30	1	30	2026-05-02 12:25:36	2026-05-02 12:25:36
31	1	31	2026-05-02 12:25:36	2026-05-02 12:25:36
32	1	32	2026-05-02 12:25:36	2026-05-02 12:25:36
33	1	33	2026-05-02 12:25:36	2026-05-02 12:25:36
34	1	34	2026-05-02 12:25:36	2026-05-02 12:25:36
35	1	35	2026-05-02 12:25:36	2026-05-02 12:25:36
36	1	36	2026-05-02 12:25:36	2026-05-02 12:25:36
37	1	37	2026-05-02 12:25:36	2026-05-02 12:25:36
38	1	38	2026-05-02 12:25:36	2026-05-02 12:25:36
39	1	39	2026-05-02 12:25:36	2026-05-02 12:25:36
40	1	40	2026-05-02 12:25:36	2026-05-02 12:25:36
41	1	41	2026-05-02 12:25:36	2026-05-02 12:25:36
42	1	42	2026-05-02 12:25:36	2026-05-02 12:25:36
43	1	43	2026-05-02 12:25:36	2026-05-02 12:25:36
44	1	44	2026-05-02 12:25:36	2026-05-02 12:25:36
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, nom_role, label, description, niveau, created_at, updated_at, is_system) FROM stdin;
2	Directeur	directeur	Tableau de bord stratégique, approbation des contrats > 5M DZD	2	2026-05-02 12:25:36	2026-05-02 12:25:36	f
3	Responsable Commercial	commercial	Demandes, devis, contrats, gestion clients	3	2026-05-02 12:25:36	2026-05-02 12:25:36	f
4	Responsable Logistique	logistique	Conteneurs, entrepôt, mouvements, escales	3	2026-05-02 12:25:36	2026-05-02 12:25:36	f
5	Responsable Financier	financier	Factures, paiements, surestaries, rapports financiers	3	2026-05-02 12:25:36	2026-05-02 12:25:36	f
1	Administrateur Système	admin	Gestion des utilisateurs, configuration système, journal d'audit	1	2026-05-02 12:25:36	2026-05-02 12:25:36	t
6	Client	client	Portail externe — accès limité à ses propres données	4	2026-05-02 12:25:36	2026-05-02 12:25:36	t
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
h3OfhqixqqJYgA5rLRLtXesN7fAlOE2ikascJzEg	5	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoiN2UwR1JFR2ZSTWF1WnVmU3F5dUJ1endPUzBYN1BibTAzSFhLeHNvSyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzM6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hZG1pbi9wb3J0cyI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==	1777921508
\.


--
-- Data for Name: statut_conteneurs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.statut_conteneurs (id, conteneur_id, ancien_statut, nouveau_statut, responsable_id, date_changement, commentaire, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: system_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_config (id, key, value, created_at, updated_at) FROM stdin;
1	app_name	GSLC Nashco	2026-04-11 22:12:19	2026-04-11 22:12:19
2	app_url		2026-04-11 22:12:19	2026-04-11 22:12:19
3	timezone		2026-04-11 22:12:19	2026-04-11 22:12:19
5	notif_new_registration	0	2026-04-11 22:21:39	2026-04-11 22:21:39
6	notif_new_contract	0	2026-04-11 22:21:39	2026-04-11 22:21:47
7	notif_surestarie	0	2026-04-11 22:21:39	2026-04-11 22:21:47
4	default_lang	en	2026-04-12 17:02:41	2026-04-12 17:02:41
8	smtp_host	smtp.gmail.com	2026-04-12 22:36:53	2026-04-12 22:36:53
10	smtp_username	gslc.commercial@gmail.com	2026-04-12 22:36:53	2026-04-12 22:36:53
12	smtp_from	gslc.commercial@gmail.com	2026-04-12 22:36:53	2026-04-12 22:36:53
13	contact_email_admin	gslc.admin@gmail.com	\N	2026-05-02 13:16:52
14	contact_email_commercial	gslc.commercial@gmail.com	\N	2026-05-02 13:16:52
9	smtp_port	587	2026-04-12 22:36:53	2026-05-02 13:29:41
11	smtp_password	yzhj pmhj fplc fqee	2026-04-12 22:36:53	2026-05-02 13:34:07
\.


--
-- Data for Name: tarifs_service; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tarifs_service (id, code_tarif, libelle_service, type_conteneur_id, montant_unitaire, unite, tva_applicable, date_debut, date_fin, actif, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: terminaux; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.terminaux (id, port_id, code_terminal, nom_terminal, adresse, telephone, email, capacite_max_teu, responsable, taux_occupation, actif, created_at, updated_at) FROM stdin;
1	10	TCA-ALG	Terminal à Conteneurs d'Alger (TCA)	Zone Portuaire	N/A	terminal@port.dz	500000	\N	0.00	t	2026-05-04 12:16:24	2026-05-04 12:16:24
2	10	THC-ALG	Terminal des Hydrocarbures d'Alger	Zone Portuaire	N/A	terminal@port.dz	0	\N	0.00	t	2026-05-04 12:16:24	2026-05-04 12:16:24
3	10	TRO-ALG	Terminal Roulier d'Alger	Zone Portuaire	N/A	terminal@port.dz	50000	\N	0.00	t	2026-05-04 12:16:24	2026-05-04 12:16:24
4	10	TMD-ALG	Terminal à Marchandises Diverses d'Alger	Zone Portuaire	N/A	terminal@port.dz	100000	\N	0.00	t	2026-05-04 12:16:24	2026-05-04 12:16:24
5	11	TCO-ORN	Terminal à Conteneurs d'Oran	Zone Portuaire	N/A	terminal@port.dz	250000	\N	0.00	t	2026-05-04 12:16:24	2026-05-04 12:16:24
6	11	TCE-ORN	Terminal des Céréales d'Oran	Zone Portuaire	N/A	terminal@port.dz	0	\N	0.00	t	2026-05-04 12:16:24	2026-05-04 12:16:24
7	11	TRO-ORN	Terminal Roulier d'Oran	Zone Portuaire	N/A	terminal@port.dz	30000	\N	0.00	t	2026-05-04 12:16:24	2026-05-04 12:16:24
8	13	TCB-BJA	Terminal à Conteneurs de Béjaïa	Zone Portuaire	N/A	terminal@port.dz	300000	\N	0.00	t	2026-05-04 12:16:24	2026-05-04 12:16:24
9	13	THB-BJA	Terminal des Hydrocarbures de Béjaïa	Zone Portuaire	N/A	terminal@port.dz	0	\N	0.00	t	2026-05-04 12:16:24	2026-05-04 12:16:24
10	12	TMA-AAE	Terminal Minéralier d'Annaba	Zone Portuaire	N/A	terminal@port.dz	0	\N	0.00	t	2026-05-04 12:16:24	2026-05-04 12:16:24
11	12	TCA-AAE	Terminal à Conteneurs d'Annaba	Zone Portuaire	N/A	terminal@port.dz	150000	\N	0.00	t	2026-05-04 12:16:24	2026-05-04 12:16:24
12	14	TPS-SKI	Terminal Pétrochimique de Skikda	Zone Portuaire	N/A	terminal@port.dz	0	\N	0.00	t	2026-05-04 12:16:24	2026-05-04 12:16:24
13	14	TCS-SKI	Terminal à Conteneurs de Skikda	Zone Portuaire	N/A	terminal@port.dz	120000	\N	0.00	t	2026-05-04 12:16:24	2026-05-04 12:16:24
14	15	TCM-MOS	Terminal à Conteneurs de Mostaganem	Zone Portuaire	N/A	terminal@port.dz	100000	\N	0.00	t	2026-05-04 12:16:24	2026-05-04 12:16:24
15	15	TCE-MOS	Terminal des Céréales de Mostaganem	Zone Portuaire	N/A	terminal@port.dz	0	\N	0.00	t	2026-05-04 12:16:24	2026-05-04 12:16:24
16	16	TCD-DJN	Terminal à Conteneurs de Djendjene	Zone Portuaire	N/A	terminal@port.dz	400000	\N	0.00	t	2026-05-04 12:16:24	2026-05-04 12:16:24
\.


--
-- Data for Name: transitaires; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transitaires (id, nom_societe, numero_rc, numero_agrement, date_expiration_agrement, pays_id, adresse_societe, tel_societe, email_societe, site_web, rep_nom, rep_prenom, rep_role_societe, rep_tel_perso, rep_email_perso, statut, valide_par_user_id, date_validation, motif_rejet, actif, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: types_conteneur; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.types_conteneur (id, code_type, libelle, longueur_pieds, est_frigo, poids_tare, charge_utile, volume, tarif_journalier_defaut, actif, created_at, updated_at) FROM stdin;
1	20ST	20' Standard	20	f	2200.00	28000.00	33.20	1200.00	t	2026-04-01 23:11:24	2026-04-01 23:11:24
2	40ST	40' Standard	40	f	3800.00	28000.00	67.60	2000.00	t	2026-04-01 23:11:24	2026-04-01 23:11:24
3	40HC	40' High Cube	40	f	3900.00	28000.00	76.40	2200.00	t	2026-04-01 23:11:24	2026-04-01 23:11:24
4	20RF	20' Réfrigéré	20	t	3080.00	27000.00	28.30	2500.00	t	2026-04-01 23:11:24	2026-04-01 23:11:24
5	40RF	40' Réfrigéré	40	t	4800.00	26500.00	59.60	4000.00	t	2026-04-01 23:11:24	2026-04-01 23:11:24
\.


--
-- Data for Name: types_notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.types_notification (id, code, libelle, priorite, canal_defaut, template_message, actif, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_permissions (id, user_id, permission_id, granted, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, role_id, nom, prenom, email, password, statut, tentatives_echouees, derniere_connexion, remember_token, created_at, updated_at, "position", department_id, deleted_at, position_id, must_change_password) FROM stdin;
1	6	SARL Import Maghreb	Client	client1@demo.dz	$2y$12$zGuEWniJ92Dv6UA1/j2WoOGYAnhQlAeMDg0ee1pHHy1yegh6Jkwvi	ACTIF	0	\N	\N	2026-05-02 12:26:38	2026-05-02 12:26:38	\N	\N	\N	\N	f
2	6	SPA TransAlgérie	Client	client2@demo.dz	$2y$12$tFfmIhkm14V2jcOlqd3YYuq6ctH14XaQSRRatfVpQNP93kaDSm60u	ACTIF	0	\N	\N	2026-05-02 12:26:38	2026-05-02 12:26:38	\N	\N	\N	\N	f
3	6	EURL MéditerExport	Client	client3@demo.dz	$2y$12$Rnuyg5kUT0KzJfmYrYulPe2XFEz5bCO9R/3tWYPgOrUAdkCj1VXy6	ACTIF	0	\N	\N	2026-05-02 12:26:39	2026-05-02 12:26:39	\N	\N	\N	\N	f
4	3	Khelifi	Samir	commercial@nashco.dz	$2y$12$302aQG3MyH38erb0u0.J6OT0czvXAwZhmwdRXoY9Y/RaAo.SZaAQ.	ACTIF	0	\N	\N	2026-05-02 12:40:35	2026-05-02 12:40:35	\N	\N	\N	\N	f
7	5	Financier	GSLC	gslc.financier@gmail.com	$2y$12$/7ktwIJSZx7FHIb5a4Qyp.qDQMY8Oa92LFki8g1fUYIJHwvpjHRdK	ACTIF	0	\N	\N	2026-05-02 12:41:57	2026-05-02 12:45:38	\N	\N	\N	\N	f
8	2	Directeur	GSLC	gslc.directeur@gmail.com	$2y$12$jvLjjMvwCCqAxu2Z43fUnOLYmFcybqxXhgDuqoEhRNX45biWPAHju	ACTIF	0	\N	\N	2026-05-02 12:41:57	2026-05-02 12:45:38	\N	\N	\N	\N	f
9	4	Logistique	GSLC	gslc.logistique@gmail.com	$2y$12$84pBzFekxar7OKZDSpjEteJ1LULmvU/xVu9GwEix224OhKc9IkiQS	ACTIF	0	\N	\N	2026-05-02 12:41:57	2026-05-02 12:45:38	\N	\N	\N	\N	f
6	3	Commercial	GSLC	gslc.commercial@gmail.com	$2y$12$UTdOwODryJpPtPr8Xex9V.YsL5UgY33nnpVb1.GZ4yzbS0scm5lCu	ACTIF	0	2026-05-02 22:45:48	\N	2026-05-02 12:41:57	2026-05-02 22:45:48	\N	\N	\N	\N	f
5	1	Admin	GSLC	gslc.admin@gmail.com	$2y$12$DKMsRN2JrIkx9UoBgujhLOSTLclvIH13Rqv46l4/JwKr/qBc/Pl8.	ACTIF	0	2026-05-04 13:08:12	\N	2026-05-02 12:41:57	2026-05-04 13:08:12	\N	\N	\N	\N	f
\.


--
-- Data for Name: workflows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflows (id, code, nom_processus, type_workflow, description, actif, created_at, updated_at) FROM stdin;
1	DEMANDE_IMPORT	Traitement des Demandes d'Import	DEMANDE	De la soumission client jusqu'à la création du devis commercial.	t	2026-04-09 11:03:40	2026-04-09 11:03:40
2	DEVIS	Validation du Devis	DEVIS	Du devis proposé jusqu'à l'acceptation ou rejet par le client.	t	2026-04-09 11:03:40	2026-04-09 11:03:40
3	CONTRAT_IMPORT	Signature et Activation du Contrat	CONTRAT	Du contrat rédigé jusqu'à son activation après signature et dépôt de caution.	t	2026-04-09 11:03:40	2026-04-09 11:03:40
\.


--
-- Name: actualites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.actualites_id_seq', 1, false);


--
-- Name: alertes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.alertes_id_seq', 1, false);


--
-- Name: avenants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.avenants_id_seq', 1, false);


--
-- Name: banques_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.banques_id_seq', 8, true);


--
-- Name: calcul_penalites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.calcul_penalites_id_seq', 1, false);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clients_id_seq', 3, true);


--
-- Name: conditions_generales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conditions_generales_id_seq', 1, false);


--
-- Name: configuration_systeme_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.configuration_systeme_id_seq', 11, true);


--
-- Name: containers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.containers_id_seq', 1, false);


--
-- Name: conteneurs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conteneurs_id_seq', 1, false);


--
-- Name: contrats_import_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contrats_import_id_seq', 3, true);


--
-- Name: corbeille_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.corbeille_id_seq', 5, true);


--
-- Name: demande_conteneurs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.demande_conteneurs_id_seq', 1, false);


--
-- Name: demande_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.demande_documents_id_seq', 1, false);


--
-- Name: demandes_import_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.demandes_import_id_seq', 6, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_id_seq', 1, false);


--
-- Name: depots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.depots_id_seq', 12, true);


--
-- Name: devis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.devis_id_seq', 4, true);


--
-- Name: devises_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.devises_id_seq', 5, true);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.documents_id_seq', 1, false);


--
-- Name: dossiers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dossiers_id_seq', 1, false);


--
-- Name: emplacements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.emplacements_id_seq', 1, false);


--
-- Name: escales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.escales_id_seq', 1, false);


--
-- Name: etapes_workflow_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.etapes_workflow_id_seq', 14, true);


--
-- Name: factures_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.factures_id_seq', 1, false);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, true);


--
-- Name: franchises_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.franchises_id_seq', 1, false);


--
-- Name: instance_workflows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.instance_workflows_id_seq', 1, false);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoices_id_seq', 1, false);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 6, true);


--
-- Name: journal_audits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.journal_audits_id_seq', 34, true);


--
-- Name: lignes_contrat_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lignes_contrat_id_seq', 2, true);


--
-- Name: lignes_demande_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lignes_demande_id_seq', 6, true);


--
-- Name: lignes_devis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lignes_devis_id_seq', 4, true);


--
-- Name: lignes_facture_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lignes_facture_id_seq', 1, false);


--
-- Name: marchandises_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.marchandises_id_seq', 1, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 71, true);


--
-- Name: mouvement_conteneurs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mouvement_conteneurs_id_seq', 1, false);


--
-- Name: navires_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.navires_id_seq', 3, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 2, true);


--
-- Name: paiements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.paiements_id_seq', 1, false);


--
-- Name: pays_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pays_id_seq', 23, true);


--
-- Name: penalites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.penalites_id_seq', 30, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_id_seq', 44, true);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 174, true);


--
-- Name: ports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ports_id_seq', 19, true);


--
-- Name: positions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.positions_id_seq', 1, false);


--
-- Name: rapports_inspection_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rapports_inspection_id_seq', 1, false);


--
-- Name: restitutions_caution_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.restitutions_caution_id_seq', 1, false);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 45, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- Name: statut_conteneurs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.statut_conteneurs_id_seq', 1, false);


--
-- Name: system_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_config_id_seq', 14, true);


--
-- Name: tarifs_service_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tarifs_service_id_seq', 1, false);


--
-- Name: terminaux_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.terminaux_id_seq', 16, true);


--
-- Name: transitaires_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transitaires_id_seq', 1, false);


--
-- Name: types_conteneur_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.types_conteneur_id_seq', 5, true);


--
-- Name: types_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.types_notification_id_seq', 1, false);


--
-- Name: user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_permissions_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 9, true);


--
-- Name: workflows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.workflows_id_seq', 3, true);


--
-- Name: actualites actualites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actualites
    ADD CONSTRAINT actualites_pkey PRIMARY KEY (id);


--
-- Name: alertes alertes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alertes
    ADD CONSTRAINT alertes_pkey PRIMARY KEY (id);


--
-- Name: avenants avenants_contrat_id_numero_avenant_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avenants
    ADD CONSTRAINT avenants_contrat_id_numero_avenant_unique UNIQUE (contrat_id, numero_avenant);


--
-- Name: avenants avenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avenants
    ADD CONSTRAINT avenants_pkey PRIMARY KEY (id);


--
-- Name: banques banques_code_banque_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banques
    ADD CONSTRAINT banques_code_banque_unique UNIQUE (code_banque);


--
-- Name: banques banques_nom_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banques
    ADD CONSTRAINT banques_nom_unique UNIQUE (nom);


--
-- Name: banques banques_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banques
    ADD CONSTRAINT banques_pkey PRIMARY KEY (id);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: calcul_penalites calcul_penalites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calcul_penalites
    ADD CONSTRAINT calcul_penalites_pkey PRIMARY KEY (id);


--
-- Name: clients clients_nif_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_nif_unique UNIQUE (nif);


--
-- Name: clients clients_nis_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_nis_unique UNIQUE (nis);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: clients clients_rc_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_rc_unique UNIQUE (rc);


--
-- Name: conditions_generales conditions_generales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conditions_generales
    ADD CONSTRAINT conditions_generales_pkey PRIMARY KEY (id);


--
-- Name: conditions_generales conditions_generales_version_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conditions_generales
    ADD CONSTRAINT conditions_generales_version_unique UNIQUE (version);


--
-- Name: configuration_systeme configuration_systeme_cle_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuration_systeme
    ADD CONSTRAINT configuration_systeme_cle_unique UNIQUE (cle);


--
-- Name: configuration_systeme configuration_systeme_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuration_systeme
    ADD CONSTRAINT configuration_systeme_pkey PRIMARY KEY (id);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: containers containers_container_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.containers
    ADD CONSTRAINT containers_container_number_unique UNIQUE (container_number);


--
-- Name: containers containers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.containers
    ADD CONSTRAINT containers_pkey PRIMARY KEY (id);


--
-- Name: conteneurs conteneurs_numero_conteneur_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conteneurs
    ADD CONSTRAINT conteneurs_numero_conteneur_unique UNIQUE (numero_conteneur);


--
-- Name: conteneurs conteneurs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conteneurs
    ADD CONSTRAINT conteneurs_pkey PRIMARY KEY (id);


--
-- Name: contrats_import contrats_import_numero_contrat_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrats_import
    ADD CONSTRAINT contrats_import_numero_contrat_unique UNIQUE (numero_contrat);


--
-- Name: contrats_import contrats_import_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrats_import
    ADD CONSTRAINT contrats_import_pkey PRIMARY KEY (id);


--
-- Name: contrats_import contrats_import_token_signature_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrats_import
    ADD CONSTRAINT contrats_import_token_signature_unique UNIQUE (token_signature);


--
-- Name: corbeille corbeille_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corbeille
    ADD CONSTRAINT corbeille_pkey PRIMARY KEY (id);


--
-- Name: demande_conteneurs demande_conteneurs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demande_conteneurs
    ADD CONSTRAINT demande_conteneurs_pkey PRIMARY KEY (id);


--
-- Name: demande_documents demande_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demande_documents
    ADD CONSTRAINT demande_documents_pkey PRIMARY KEY (id);


--
-- Name: demandes_import demandes_import_numero_dossier_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_import
    ADD CONSTRAINT demandes_import_numero_dossier_unique UNIQUE (numero_dossier);


--
-- Name: demandes_import demandes_import_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_import
    ADD CONSTRAINT demandes_import_pkey PRIMARY KEY (id);


--
-- Name: departments departments_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_code_unique UNIQUE (code);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: depots depots_code_depot_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depots
    ADD CONSTRAINT depots_code_depot_unique UNIQUE (code_depot);


--
-- Name: depots depots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depots
    ADD CONSTRAINT depots_pkey PRIMARY KEY (id);


--
-- Name: devis devis_numero_devis_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devis
    ADD CONSTRAINT devis_numero_devis_unique UNIQUE (numero_devis);


--
-- Name: devis devis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devis
    ADD CONSTRAINT devis_pkey PRIMARY KEY (id);


--
-- Name: devises devises_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devises
    ADD CONSTRAINT devises_code_unique UNIQUE (code);


--
-- Name: devises devises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devises
    ADD CONSTRAINT devises_pkey PRIMARY KEY (id);


--
-- Name: documents documents_nom_stockage_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_nom_stockage_unique UNIQUE (nom_stockage);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: dossiers dossiers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dossiers
    ADD CONSTRAINT dossiers_pkey PRIMARY KEY (id);


--
-- Name: dossiers dossiers_reference_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dossiers
    ADD CONSTRAINT dossiers_reference_unique UNIQUE (reference);


--
-- Name: emplacements emplacements_code_emplacement_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emplacements
    ADD CONSTRAINT emplacements_code_emplacement_unique UNIQUE (code_emplacement);


--
-- Name: emplacements emplacements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emplacements
    ADD CONSTRAINT emplacements_pkey PRIMARY KEY (id);


--
-- Name: escales escales_numero_escale_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.escales
    ADD CONSTRAINT escales_numero_escale_unique UNIQUE (numero_escale);


--
-- Name: escales escales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.escales
    ADD CONSTRAINT escales_pkey PRIMARY KEY (id);


--
-- Name: etapes_workflow etapes_workflow_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etapes_workflow
    ADD CONSTRAINT etapes_workflow_pkey PRIMARY KEY (id);


--
-- Name: factures factures_numero_facture_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factures
    ADD CONSTRAINT factures_numero_facture_unique UNIQUE (numero_facture);


--
-- Name: factures factures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factures
    ADD CONSTRAINT factures_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: franchises franchises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.franchises
    ADD CONSTRAINT franchises_pkey PRIMARY KEY (id);


--
-- Name: instance_workflows instance_workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_workflows
    ADD CONSTRAINT instance_workflows_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: journal_audits journal_audits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_audits
    ADD CONSTRAINT journal_audits_pkey PRIMARY KEY (id);


--
-- Name: lignes_contrat lignes_contrat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lignes_contrat
    ADD CONSTRAINT lignes_contrat_pkey PRIMARY KEY (id);


--
-- Name: lignes_demande lignes_demande_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lignes_demande
    ADD CONSTRAINT lignes_demande_pkey PRIMARY KEY (id);


--
-- Name: lignes_devis lignes_devis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lignes_devis
    ADD CONSTRAINT lignes_devis_pkey PRIMARY KEY (id);


--
-- Name: lignes_facture lignes_facture_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lignes_facture
    ADD CONSTRAINT lignes_facture_pkey PRIMARY KEY (id);


--
-- Name: marchandises marchandises_code_hs_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marchandises
    ADD CONSTRAINT marchandises_code_hs_unique UNIQUE (code_hs);


--
-- Name: marchandises marchandises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marchandises
    ADD CONSTRAINT marchandises_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: mouvement_conteneurs mouvement_conteneurs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mouvement_conteneurs
    ADD CONSTRAINT mouvement_conteneurs_pkey PRIMARY KEY (id);


--
-- Name: navires navires_numero_imo_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.navires
    ADD CONSTRAINT navires_numero_imo_unique UNIQUE (numero_imo);


--
-- Name: navires navires_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.navires
    ADD CONSTRAINT navires_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: paiements paiements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paiements
    ADD CONSTRAINT paiements_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: pays pays_code_iso_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pays
    ADD CONSTRAINT pays_code_iso_unique UNIQUE (code_iso);


--
-- Name: pays pays_nom_pays_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pays
    ADD CONSTRAINT pays_nom_pays_unique UNIQUE (nom_pays);


--
-- Name: pays pays_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pays
    ADD CONSTRAINT pays_pkey PRIMARY KEY (id);


--
-- Name: penalites penalites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.penalites
    ADD CONSTRAINT penalites_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_unique UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: ports ports_code_port_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ports
    ADD CONSTRAINT ports_code_port_unique UNIQUE (code_port);


--
-- Name: ports ports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ports
    ADD CONSTRAINT ports_pkey PRIMARY KEY (id);


--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);


--
-- Name: positions positions_title_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_title_unique UNIQUE (title);


--
-- Name: rapports_inspection rapports_inspection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rapports_inspection
    ADD CONSTRAINT rapports_inspection_pkey PRIMARY KEY (id);


--
-- Name: restitutions_caution restitutions_caution_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restitutions_caution
    ADD CONSTRAINT restitutions_caution_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_role_id_permission_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_permission_id_unique UNIQUE (role_id, permission_id);


--
-- Name: roles roles_nom_role_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nom_role_unique UNIQUE (nom_role);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: statut_conteneurs statut_conteneurs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statut_conteneurs
    ADD CONSTRAINT statut_conteneurs_pkey PRIMARY KEY (id);


--
-- Name: system_config system_config_key_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_key_unique UNIQUE (key);


--
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (id);


--
-- Name: tarifs_service tarifs_service_code_tarif_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarifs_service
    ADD CONSTRAINT tarifs_service_code_tarif_unique UNIQUE (code_tarif);


--
-- Name: tarifs_service tarifs_service_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarifs_service
    ADD CONSTRAINT tarifs_service_pkey PRIMARY KEY (id);


--
-- Name: terminaux terminaux_code_terminal_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.terminaux
    ADD CONSTRAINT terminaux_code_terminal_unique UNIQUE (code_terminal);


--
-- Name: terminaux terminaux_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.terminaux
    ADD CONSTRAINT terminaux_pkey PRIMARY KEY (id);


--
-- Name: transitaires transitaires_numero_agrement_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transitaires
    ADD CONSTRAINT transitaires_numero_agrement_unique UNIQUE (numero_agrement);


--
-- Name: transitaires transitaires_numero_rc_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transitaires
    ADD CONSTRAINT transitaires_numero_rc_unique UNIQUE (numero_rc);


--
-- Name: transitaires transitaires_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transitaires
    ADD CONSTRAINT transitaires_pkey PRIMARY KEY (id);


--
-- Name: types_conteneur types_conteneur_code_type_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.types_conteneur
    ADD CONSTRAINT types_conteneur_code_type_unique UNIQUE (code_type);


--
-- Name: types_conteneur types_conteneur_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.types_conteneur
    ADD CONSTRAINT types_conteneur_pkey PRIMARY KEY (id);


--
-- Name: types_notification types_notification_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.types_notification
    ADD CONSTRAINT types_notification_code_unique UNIQUE (code);


--
-- Name: types_notification types_notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.types_notification
    ADD CONSTRAINT types_notification_pkey PRIMARY KEY (id);


--
-- Name: user_permissions user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_pkey PRIMARY KEY (id);


--
-- Name: user_permissions user_permissions_user_id_permission_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_user_id_permission_id_unique UNIQUE (user_id, permission_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workflows workflows_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_code_unique UNIQUE (code);


--
-- Name: workflows workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_pkey PRIMARY KEY (id);


--
-- Name: alertes_destinataire_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX alertes_destinataire_user_id_index ON public.alertes USING btree (destinataire_user_id);


--
-- Name: alertes_entite_type_entite_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX alertes_entite_type_entite_id_index ON public.alertes USING btree (entite_type, entite_id);


--
-- Name: alertes_est_lue_est_traitee_niveau_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX alertes_est_lue_est_traitee_niveau_index ON public.alertes USING btree (est_lue, est_traitee, niveau);


--
-- Name: cache_expiration_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cache_expiration_index ON public.cache USING btree (expiration);


--
-- Name: cache_locks_expiration_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cache_locks_expiration_index ON public.cache_locks USING btree (expiration);


--
-- Name: calcul_penalites_conteneur_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX calcul_penalites_conteneur_id_index ON public.calcul_penalites USING btree (conteneur_id);


--
-- Name: calcul_penalites_contrat_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX calcul_penalites_contrat_id_index ON public.calcul_penalites USING btree (contrat_id);


--
-- Name: calcul_penalites_statut_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX calcul_penalites_statut_index ON public.calcul_penalites USING btree (statut);


--
-- Name: clients_nif_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_nif_index ON public.clients USING btree (nif);


--
-- Name: clients_statut_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_statut_index ON public.clients USING btree (statut);


--
-- Name: conteneurs_numero_conteneur_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conteneurs_numero_conteneur_index ON public.conteneurs USING btree (numero_conteneur);


--
-- Name: conteneurs_statut_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conteneurs_statut_index ON public.conteneurs USING btree (statut);


--
-- Name: contrats_import_client_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contrats_import_client_id_index ON public.contrats_import USING btree (client_id);


--
-- Name: contrats_import_numero_contrat_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contrats_import_numero_contrat_index ON public.contrats_import USING btree (numero_contrat);


--
-- Name: contrats_import_statut_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contrats_import_statut_index ON public.contrats_import USING btree (statut);


--
-- Name: demandes_import_client_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX demandes_import_client_id_index ON public.demandes_import USING btree (client_id);


--
-- Name: demandes_import_numero_dossier_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX demandes_import_numero_dossier_index ON public.demandes_import USING btree (numero_dossier);


--
-- Name: demandes_import_statut_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX demandes_import_statut_index ON public.demandes_import USING btree (statut);


--
-- Name: devis_numero_devis_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX devis_numero_devis_index ON public.devis USING btree (numero_devis);


--
-- Name: devis_statut_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX devis_statut_index ON public.devis USING btree (statut);


--
-- Name: documents_statut_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX documents_statut_index ON public.documents USING btree (statut);


--
-- Name: documents_type_document_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX documents_type_document_index ON public.documents USING btree (type_document);


--
-- Name: factures_client_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX factures_client_id_index ON public.factures USING btree (client_id);


--
-- Name: factures_numero_facture_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX factures_numero_facture_index ON public.factures USING btree (numero_facture);


--
-- Name: factures_statut_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX factures_statut_index ON public.factures USING btree (statut);


--
-- Name: instance_workflows_conteneur_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX instance_workflows_conteneur_id_index ON public.instance_workflows USING btree (conteneur_id);


--
-- Name: instance_workflows_statut_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX instance_workflows_statut_index ON public.instance_workflows USING btree (statut);


--
-- Name: instance_workflows_workflow_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX instance_workflows_workflow_id_index ON public.instance_workflows USING btree (workflow_id);


--
-- Name: jobs_queue_reserved_at_available_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_queue_reserved_at_available_at_index ON public.jobs USING btree (queue, reserved_at, available_at);


--
-- Name: journal_audits_action_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX journal_audits_action_index ON public.journal_audits USING btree (action);


--
-- Name: journal_audits_date_action_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX journal_audits_date_action_index ON public.journal_audits USING btree (date_action);


--
-- Name: journal_audits_table_cible_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX journal_audits_table_cible_index ON public.journal_audits USING btree (table_cible);


--
-- Name: lignes_contrat_contrat_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX lignes_contrat_contrat_id_index ON public.lignes_contrat USING btree (contrat_id);


--
-- Name: lignes_devis_devis_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX lignes_devis_devis_id_index ON public.lignes_devis USING btree (devis_id);


--
-- Name: lignes_facture_facture_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX lignes_facture_facture_id_index ON public.lignes_facture USING btree (facture_id);


--
-- Name: mouvement_conteneurs_conteneur_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mouvement_conteneurs_conteneur_id_index ON public.mouvement_conteneurs USING btree (conteneur_id);


--
-- Name: mouvement_conteneurs_date_mouvement_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mouvement_conteneurs_date_mouvement_index ON public.mouvement_conteneurs USING btree (date_mouvement);


--
-- Name: notifications_date_creation_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_date_creation_index ON public.notifications USING btree (date_creation);


--
-- Name: notifications_destinataire_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_destinataire_id_index ON public.notifications USING btree (destinataire_id);


--
-- Name: notifications_lu_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_lu_index ON public.notifications USING btree (lu);


--
-- Name: paiements_facture_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX paiements_facture_id_index ON public.paiements USING btree (facture_id);


--
-- Name: paiements_statut_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX paiements_statut_index ON public.paiements USING btree (statut);


--
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: rapports_inspection_conteneur_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX rapports_inspection_conteneur_id_index ON public.rapports_inspection USING btree (conteneur_id);


--
-- Name: restitutions_caution_contrat_id_date_action_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX restitutions_caution_contrat_id_date_action_index ON public.restitutions_caution USING btree (contrat_id, date_action);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: statut_conteneurs_conteneur_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX statut_conteneurs_conteneur_id_index ON public.statut_conteneurs USING btree (conteneur_id);


--
-- Name: statut_conteneurs_date_changement_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX statut_conteneurs_date_changement_index ON public.statut_conteneurs USING btree (date_changement);


--
-- Name: transitaires_numero_agrement_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transitaires_numero_agrement_index ON public.transitaires USING btree (numero_agrement);


--
-- Name: transitaires_statut_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transitaires_statut_index ON public.transitaires USING btree (statut);


--
-- Name: alertes alertes_destinataire_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alertes
    ADD CONSTRAINT alertes_destinataire_user_id_foreign FOREIGN KEY (destinataire_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: alertes alertes_traitee_par_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alertes
    ADD CONSTRAINT alertes_traitee_par_user_id_foreign FOREIGN KEY (traitee_par_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: avenants avenants_contrat_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avenants
    ADD CONSTRAINT avenants_contrat_id_foreign FOREIGN KEY (contrat_id) REFERENCES public.contrats_import(id) ON DELETE CASCADE;


--
-- Name: avenants avenants_cree_par_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avenants
    ADD CONSTRAINT avenants_cree_par_user_id_foreign FOREIGN KEY (cree_par_user_id) REFERENCES public.users(id);


--
-- Name: calcul_penalites calcul_penalites_conteneur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calcul_penalites
    ADD CONSTRAINT calcul_penalites_conteneur_id_foreign FOREIGN KEY (conteneur_id) REFERENCES public.conteneurs(id) ON DELETE CASCADE;


--
-- Name: calcul_penalites calcul_penalites_contrat_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calcul_penalites
    ADD CONSTRAINT calcul_penalites_contrat_id_foreign FOREIGN KEY (contrat_id) REFERENCES public.contrats_import(id) ON DELETE CASCADE;


--
-- Name: calcul_penalites calcul_penalites_cree_par_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calcul_penalites
    ADD CONSTRAINT calcul_penalites_cree_par_user_id_foreign FOREIGN KEY (cree_par_user_id) REFERENCES public.users(id);


--
-- Name: calcul_penalites calcul_penalites_franchise_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calcul_penalites
    ADD CONSTRAINT calcul_penalites_franchise_id_foreign FOREIGN KEY (franchise_id) REFERENCES public.franchises(id);


--
-- Name: calcul_penalites calcul_penalites_penalite_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calcul_penalites
    ADD CONSTRAINT calcul_penalites_penalite_id_foreign FOREIGN KEY (penalite_id) REFERENCES public.penalites(id);


--
-- Name: clients clients_pays_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pays_id_foreign FOREIGN KEY (pays_id) REFERENCES public.pays(id);


--
-- Name: clients clients_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: clients clients_valide_par_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_valide_par_user_id_foreign FOREIGN KEY (valide_par_user_id) REFERENCES public.users(id);


--
-- Name: conditions_generales conditions_generales_cree_par_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conditions_generales
    ADD CONSTRAINT conditions_generales_cree_par_user_id_foreign FOREIGN KEY (cree_par_user_id) REFERENCES public.users(id);


--
-- Name: contact_messages contact_messages_lu_par_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_lu_par_foreign FOREIGN KEY (lu_par) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: containers containers_dossier_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.containers
    ADD CONSTRAINT containers_dossier_id_foreign FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON DELETE CASCADE;


--
-- Name: conteneurs conteneurs_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conteneurs
    ADD CONSTRAINT conteneurs_type_id_foreign FOREIGN KEY (type_id) REFERENCES public.types_conteneur(id);


--
-- Name: contrats_import contrats_import_banque_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrats_import
    ADD CONSTRAINT contrats_import_banque_id_foreign FOREIGN KEY (banque_id) REFERENCES public.banques(id);


--
-- Name: contrats_import contrats_import_client_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrats_import
    ADD CONSTRAINT contrats_import_client_id_foreign FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: contrats_import contrats_import_conditions_generales_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrats_import
    ADD CONSTRAINT contrats_import_conditions_generales_id_foreign FOREIGN KEY (conditions_generales_id) REFERENCES public.conditions_generales(id);


--
-- Name: contrats_import contrats_import_cree_par_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrats_import
    ADD CONSTRAINT contrats_import_cree_par_user_id_foreign FOREIGN KEY (cree_par_user_id) REFERENCES public.users(id);


--
-- Name: contrats_import contrats_import_demande_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrats_import
    ADD CONSTRAINT contrats_import_demande_id_foreign FOREIGN KEY (demande_id) REFERENCES public.demandes_import(id);


--
-- Name: contrats_import contrats_import_devis_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrats_import
    ADD CONSTRAINT contrats_import_devis_id_foreign FOREIGN KEY (devis_id) REFERENCES public.devis(id) ON DELETE CASCADE;


--
-- Name: contrats_import contrats_import_recu_par_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrats_import
    ADD CONSTRAINT contrats_import_recu_par_user_id_foreign FOREIGN KEY (recu_par_user_id) REFERENCES public.users(id);


--
-- Name: contrats_import contrats_import_verifie_caution_par_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contrats_import
    ADD CONSTRAINT contrats_import_verifie_caution_par_user_id_foreign FOREIGN KEY (verifie_caution_par_user_id) REFERENCES public.users(id);


--
-- Name: demande_conteneurs demande_conteneurs_conteneur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demande_conteneurs
    ADD CONSTRAINT demande_conteneurs_conteneur_id_foreign FOREIGN KEY (conteneur_id) REFERENCES public.conteneurs(id);


--
-- Name: demande_conteneurs demande_conteneurs_demande_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demande_conteneurs
    ADD CONSTRAINT demande_conteneurs_demande_id_foreign FOREIGN KEY (demande_id) REFERENCES public.demandes_import(id) ON DELETE CASCADE;


--
-- Name: demande_conteneurs demande_conteneurs_type_conteneur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demande_conteneurs
    ADD CONSTRAINT demande_conteneurs_type_conteneur_id_foreign FOREIGN KEY (type_conteneur_id) REFERENCES public.types_conteneur(id);


--
-- Name: demande_documents demande_documents_demande_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demande_documents
    ADD CONSTRAINT demande_documents_demande_id_foreign FOREIGN KEY (demande_id) REFERENCES public.demandes_import(id) ON DELETE CASCADE;


--
-- Name: demande_documents demande_documents_document_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demande_documents
    ADD CONSTRAINT demande_documents_document_id_foreign FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: demande_documents demande_documents_verifie_par_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demande_documents
    ADD CONSTRAINT demande_documents_verifie_par_user_id_foreign FOREIGN KEY (verifie_par_user_id) REFERENCES public.users(id);


--
-- Name: demandes_import demandes_import_client_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_import
    ADD CONSTRAINT demandes_import_client_id_foreign FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: demandes_import demandes_import_port_destination_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_import
    ADD CONSTRAINT demandes_import_port_destination_id_foreign FOREIGN KEY (port_destination_id) REFERENCES public.ports(id);


--
-- Name: demandes_import demandes_import_port_origine_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_import
    ADD CONSTRAINT demandes_import_port_origine_id_foreign FOREIGN KEY (port_origine_id) REFERENCES public.ports(id);


--
-- Name: demandes_import demandes_import_traite_par_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_import
    ADD CONSTRAINT demandes_import_traite_par_user_id_foreign FOREIGN KEY (traite_par_user_id) REFERENCES public.users(id);


--
-- Name: demandes_import demandes_import_transitaire_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_import
    ADD CONSTRAINT demandes_import_transitaire_id_foreign FOREIGN KEY (transitaire_id) REFERENCES public.transitaires(id);


--
-- Name: departments departments_responsable_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_responsable_id_foreign FOREIGN KEY (responsable_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: depots depots_port_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depots
    ADD CONSTRAINT depots_port_id_foreign FOREIGN KEY (port_id) REFERENCES public.ports(id);


--
-- Name: depots depots_terminal_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depots
    ADD CONSTRAINT depots_terminal_id_foreign FOREIGN KEY (terminal_id) REFERENCES public.terminaux(id);


--
-- Name: devis devis_cree_par_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devis
    ADD CONSTRAINT devis_cree_par_user_id_foreign FOREIGN KEY (cree_par_user_id) REFERENCES public.users(id);


--
-- Name: devis devis_demande_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devis
    ADD CONSTRAINT devis_demande_id_foreign FOREIGN KEY (demande_id) REFERENCES public.demandes_import(id) ON DELETE CASCADE;


--
-- Name: devis devis_devis_precedent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devis
    ADD CONSTRAINT devis_devis_precedent_id_foreign FOREIGN KEY (devis_precedent_id) REFERENCES public.devis(id);


--
-- Name: documents documents_client_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_client_id_foreign FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: documents documents_demande_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_demande_id_foreign FOREIGN KEY (demande_id) REFERENCES public.demandes_import(id) ON DELETE CASCADE;


--
-- Name: documents documents_valide_par_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_valide_par_user_id_foreign FOREIGN KEY (valide_par_user_id) REFERENCES public.users(id);


--
-- Name: emplacements emplacements_conteneur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emplacements
    ADD CONSTRAINT emplacements_conteneur_id_foreign FOREIGN KEY (conteneur_id) REFERENCES public.conteneurs(id);


--
-- Name: emplacements emplacements_depot_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emplacements
    ADD CONSTRAINT emplacements_depot_id_foreign FOREIGN KEY (depot_id) REFERENCES public.depots(id);


--
-- Name: escales escales_navire_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.escales
    ADD CONSTRAINT escales_navire_id_foreign FOREIGN KEY (navire_id) REFERENCES public.navires(id);


--
-- Name: escales escales_port_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.escales
    ADD CONSTRAINT escales_port_id_foreign FOREIGN KEY (port_id) REFERENCES public.ports(id);


--
-- Name: escales escales_responsable_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.escales
    ADD CONSTRAINT escales_responsable_id_foreign FOREIGN KEY (responsable_id) REFERENCES public.users(id);


--
-- Name: escales escales_terminal_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.escales
    ADD CONSTRAINT escales_terminal_id_foreign FOREIGN KEY (terminal_id) REFERENCES public.terminaux(id);


--
-- Name: etapes_workflow etapes_workflow_workflow_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etapes_workflow
    ADD CONSTRAINT etapes_workflow_workflow_id_foreign FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;


--
-- Name: factures factures_client_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factures
    ADD CONSTRAINT factures_client_id_foreign FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: factures factures_contrat_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factures
    ADD CONSTRAINT factures_contrat_id_foreign FOREIGN KEY (contrat_id) REFERENCES public.contrats_import(id) ON DELETE CASCADE;


--
-- Name: factures factures_cree_par_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factures
    ADD CONSTRAINT factures_cree_par_user_id_foreign FOREIGN KEY (cree_par_user_id) REFERENCES public.users(id);


--
-- Name: factures factures_devise_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factures
    ADD CONSTRAINT factures_devise_id_foreign FOREIGN KEY (devise_id) REFERENCES public.devises(id) ON DELETE CASCADE;


--
-- Name: franchises franchises_client_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.franchises
    ADD CONSTRAINT franchises_client_id_foreign FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: franchises franchises_port_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.franchises
    ADD CONSTRAINT franchises_port_id_foreign FOREIGN KEY (port_id) REFERENCES public.ports(id) ON DELETE CASCADE;


--
-- Name: franchises franchises_type_conteneur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.franchises
    ADD CONSTRAINT franchises_type_conteneur_id_foreign FOREIGN KEY (type_conteneur_id) REFERENCES public.types_conteneur(id) ON DELETE CASCADE;


--
-- Name: instance_workflows instance_workflows_bloque_par_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_workflows
    ADD CONSTRAINT instance_workflows_bloque_par_user_id_foreign FOREIGN KEY (bloque_par_user_id) REFERENCES public.users(id);


--
-- Name: instance_workflows instance_workflows_conteneur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_workflows
    ADD CONSTRAINT instance_workflows_conteneur_id_foreign FOREIGN KEY (conteneur_id) REFERENCES public.conteneurs(id) ON DELETE CASCADE;


--
-- Name: instance_workflows instance_workflows_demande_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_workflows
    ADD CONSTRAINT instance_workflows_demande_id_foreign FOREIGN KEY (demande_id) REFERENCES public.demandes_import(id);


--
-- Name: instance_workflows instance_workflows_workflow_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_workflows
    ADD CONSTRAINT instance_workflows_workflow_id_foreign FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_container_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_container_id_foreign FOREIGN KEY (container_id) REFERENCES public.containers(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_dossier_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_dossier_id_foreign FOREIGN KEY (dossier_id) REFERENCES public.dossiers(id) ON DELETE CASCADE;


--
-- Name: journal_audits journal_audits_utilisateur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_audits
    ADD CONSTRAINT journal_audits_utilisateur_id_foreign FOREIGN KEY (utilisateur_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: lignes_contrat lignes_contrat_contrat_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lignes_contrat
    ADD CONSTRAINT lignes_contrat_contrat_id_foreign FOREIGN KEY (contrat_id) REFERENCES public.contrats_import(id) ON DELETE CASCADE;


--
-- Name: lignes_contrat lignes_contrat_tarif_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lignes_contrat
    ADD CONSTRAINT lignes_contrat_tarif_service_id_foreign FOREIGN KEY (tarif_service_id) REFERENCES public.tarifs_service(id);


--
-- Name: lignes_contrat lignes_contrat_type_conteneur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lignes_contrat
    ADD CONSTRAINT lignes_contrat_type_conteneur_id_foreign FOREIGN KEY (type_conteneur_id) REFERENCES public.types_conteneur(id);


--
-- Name: lignes_demande lignes_demande_demande_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lignes_demande
    ADD CONSTRAINT lignes_demande_demande_id_foreign FOREIGN KEY (demande_id) REFERENCES public.demandes_import(id) ON DELETE CASCADE;


--
-- Name: lignes_demande lignes_demande_marchandise_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lignes_demande
    ADD CONSTRAINT lignes_demande_marchandise_id_foreign FOREIGN KEY (marchandise_id) REFERENCES public.marchandises(id);


--
-- Name: lignes_demande lignes_demande_pays_origine_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lignes_demande
    ADD CONSTRAINT lignes_demande_pays_origine_id_foreign FOREIGN KEY (pays_origine_id) REFERENCES public.pays(id);


--
-- Name: lignes_demande lignes_demande_type_conteneur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lignes_demande
    ADD CONSTRAINT lignes_demande_type_conteneur_id_foreign FOREIGN KEY (type_conteneur_id) REFERENCES public.types_conteneur(id);


--
-- Name: lignes_devis lignes_devis_devis_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lignes_devis
    ADD CONSTRAINT lignes_devis_devis_id_foreign FOREIGN KEY (devis_id) REFERENCES public.devis(id) ON DELETE CASCADE;


--
-- Name: lignes_devis lignes_devis_tarif_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lignes_devis
    ADD CONSTRAINT lignes_devis_tarif_service_id_foreign FOREIGN KEY (tarif_service_id) REFERENCES public.tarifs_service(id) ON DELETE SET NULL;


--
-- Name: lignes_facture lignes_facture_calcul_penalite_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lignes_facture
    ADD CONSTRAINT lignes_facture_calcul_penalite_id_foreign FOREIGN KEY (calcul_penalite_id) REFERENCES public.calcul_penalites(id) ON DELETE SET NULL;


--
-- Name: lignes_facture lignes_facture_facture_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lignes_facture
    ADD CONSTRAINT lignes_facture_facture_id_foreign FOREIGN KEY (facture_id) REFERENCES public.factures(id) ON DELETE CASCADE;


--
-- Name: lignes_facture lignes_facture_tarif_service_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lignes_facture
    ADD CONSTRAINT lignes_facture_tarif_service_id_foreign FOREIGN KEY (tarif_service_id) REFERENCES public.tarifs_service(id);


--
-- Name: mouvement_conteneurs mouvement_conteneurs_client_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mouvement_conteneurs
    ADD CONSTRAINT mouvement_conteneurs_client_id_foreign FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: mouvement_conteneurs mouvement_conteneurs_conteneur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mouvement_conteneurs
    ADD CONSTRAINT mouvement_conteneurs_conteneur_id_foreign FOREIGN KEY (conteneur_id) REFERENCES public.conteneurs(id) ON DELETE CASCADE;


--
-- Name: mouvement_conteneurs mouvement_conteneurs_depot_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mouvement_conteneurs
    ADD CONSTRAINT mouvement_conteneurs_depot_id_foreign FOREIGN KEY (depot_id) REFERENCES public.depots(id);


--
-- Name: mouvement_conteneurs mouvement_conteneurs_emplacement_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mouvement_conteneurs
    ADD CONSTRAINT mouvement_conteneurs_emplacement_id_foreign FOREIGN KEY (emplacement_id) REFERENCES public.emplacements(id);


--
-- Name: mouvement_conteneurs mouvement_conteneurs_port_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mouvement_conteneurs
    ADD CONSTRAINT mouvement_conteneurs_port_id_foreign FOREIGN KEY (port_id) REFERENCES public.ports(id);


--
-- Name: mouvement_conteneurs mouvement_conteneurs_responsable_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mouvement_conteneurs
    ADD CONSTRAINT mouvement_conteneurs_responsable_id_foreign FOREIGN KEY (responsable_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: navires navires_pays_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.navires
    ADD CONSTRAINT navires_pays_id_foreign FOREIGN KEY (pays_id) REFERENCES public.pays(id);


--
-- Name: notifications notifications_conteneur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_conteneur_id_foreign FOREIGN KEY (conteneur_id) REFERENCES public.conteneurs(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_demande_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_demande_id_foreign FOREIGN KEY (demande_id) REFERENCES public.demandes_import(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_destinataire_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_destinataire_id_foreign FOREIGN KEY (destinataire_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_facture_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_facture_id_foreign FOREIGN KEY (facture_id) REFERENCES public.factures(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_type_notification_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_type_notification_id_foreign FOREIGN KEY (type_notification_id) REFERENCES public.types_notification(id);


--
-- Name: paiements paiements_banque_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paiements
    ADD CONSTRAINT paiements_banque_id_foreign FOREIGN KEY (banque_id) REFERENCES public.banques(id);


--
-- Name: paiements paiements_facture_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paiements
    ADD CONSTRAINT paiements_facture_id_foreign FOREIGN KEY (facture_id) REFERENCES public.factures(id) ON DELETE CASCADE;


--
-- Name: paiements paiements_recu_par_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paiements
    ADD CONSTRAINT paiements_recu_par_user_id_foreign FOREIGN KEY (recu_par_user_id) REFERENCES public.users(id);


--
-- Name: penalites penalites_devise_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.penalites
    ADD CONSTRAINT penalites_devise_id_foreign FOREIGN KEY (devise_id) REFERENCES public.devises(id) ON DELETE CASCADE;


--
-- Name: penalites penalites_type_conteneur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.penalites
    ADD CONSTRAINT penalites_type_conteneur_id_foreign FOREIGN KEY (type_conteneur_id) REFERENCES public.types_conteneur(id) ON DELETE CASCADE;


--
-- Name: ports ports_pays_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ports
    ADD CONSTRAINT ports_pays_id_foreign FOREIGN KEY (pays_id) REFERENCES public.pays(id);


--
-- Name: positions positions_department_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_department_id_foreign FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: rapports_inspection rapports_inspection_conteneur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rapports_inspection
    ADD CONSTRAINT rapports_inspection_conteneur_id_foreign FOREIGN KEY (conteneur_id) REFERENCES public.conteneurs(id) ON DELETE CASCADE;


--
-- Name: rapports_inspection rapports_inspection_contrat_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rapports_inspection
    ADD CONSTRAINT rapports_inspection_contrat_id_foreign FOREIGN KEY (contrat_id) REFERENCES public.contrats_import(id);


--
-- Name: rapports_inspection rapports_inspection_inspecteur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rapports_inspection
    ADD CONSTRAINT rapports_inspection_inspecteur_id_foreign FOREIGN KEY (inspecteur_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: restitutions_caution restitutions_caution_banque_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restitutions_caution
    ADD CONSTRAINT restitutions_caution_banque_id_foreign FOREIGN KEY (banque_id) REFERENCES public.banques(id) ON DELETE SET NULL;


--
-- Name: restitutions_caution restitutions_caution_contrat_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restitutions_caution
    ADD CONSTRAINT restitutions_caution_contrat_id_foreign FOREIGN KEY (contrat_id) REFERENCES public.contrats_import(id) ON DELETE CASCADE;


--
-- Name: restitutions_caution restitutions_caution_document_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restitutions_caution
    ADD CONSTRAINT restitutions_caution_document_id_foreign FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE SET NULL;


--
-- Name: restitutions_caution restitutions_caution_traite_par_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restitutions_caution
    ADD CONSTRAINT restitutions_caution_traite_par_user_id_foreign FOREIGN KEY (traite_par_user_id) REFERENCES public.users(id);


--
-- Name: role_permissions role_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: statut_conteneurs statut_conteneurs_conteneur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statut_conteneurs
    ADD CONSTRAINT statut_conteneurs_conteneur_id_foreign FOREIGN KEY (conteneur_id) REFERENCES public.conteneurs(id) ON DELETE CASCADE;


--
-- Name: statut_conteneurs statut_conteneurs_responsable_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statut_conteneurs
    ADD CONSTRAINT statut_conteneurs_responsable_id_foreign FOREIGN KEY (responsable_id) REFERENCES public.users(id);


--
-- Name: tarifs_service tarifs_service_type_conteneur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarifs_service
    ADD CONSTRAINT tarifs_service_type_conteneur_id_foreign FOREIGN KEY (type_conteneur_id) REFERENCES public.types_conteneur(id);


--
-- Name: terminaux terminaux_port_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.terminaux
    ADD CONSTRAINT terminaux_port_id_foreign FOREIGN KEY (port_id) REFERENCES public.ports(id);


--
-- Name: transitaires transitaires_pays_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transitaires
    ADD CONSTRAINT transitaires_pays_id_foreign FOREIGN KEY (pays_id) REFERENCES public.pays(id);


--
-- Name: transitaires transitaires_valide_par_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transitaires
    ADD CONSTRAINT transitaires_valide_par_user_id_foreign FOREIGN KEY (valide_par_user_id) REFERENCES public.users(id);


--
-- Name: user_permissions user_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_department_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_foreign FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: users users_position_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_position_id_foreign FOREIGN KEY (position_id) REFERENCES public.positions(id) ON DELETE SET NULL;


--
-- Name: users users_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 0tZlw0VxKJ0QBwNfN8fW5UvUhL2xtJXl5aNvez64JbUuNTyPbfSAGCVHlTXcAsO

