<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Client;
use App\Models\DemandeImport;
use App\Models\LigneDemande;
use App\Models\Devis;
use App\Models\LigneDevis;
use App\Models\ContratImport;
use App\Models\LigneContrat;
use App\Models\Navire;
use App\Models\Port;
use App\Models\Pays;
use App\Models\TypeConteneur;
use App\Models\Marchandise;
use App\Models\Role;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('── Demo Data : Workflow Commercial complet ──');

        $pays       = Pays::first();
        $port1      = Port::first();
        $port2      = Port::skip(1)->first() ?? $port1;
        $typeConten = TypeConteneur::first();
        $marchandise= Marchandise::firstOrCreate(['code_hs' => '0000.00.00'], [
            'libelle' => 'Marchandises générales',
            'actif'   => true,
        ]);
        $roleClient = Role::where('label', 'client')->first();
        $commercial = User::where('email', 'commercial@nashco.dz')->first();

        if (!$pays || !$port1 || !$typeConten || !$roleClient) {
            $this->command->error('Données de référence manquantes. Lance le seeder principal d\'abord.');
            return;
        }

        // 3 Clients
        $clientsData = [
            ['raison_sociale' => 'SARL Import Maghreb',  'nif' => '099812345600011', 'email' => 'client1@demo.dz', 'ville' => 'Oran'],
            ['raison_sociale' => 'SPA TransAlgérie',     'nif' => '099812345600012', 'email' => 'client2@demo.dz', 'ville' => 'Alger'],
            ['raison_sociale' => 'EURL MéditerExport',   'nif' => '099812345600013', 'email' => 'client3@demo.dz', 'ville' => 'Annaba'],
        ];

        $clients = [];
        foreach ($clientsData as $cd) {
            $user = User::firstOrCreate(['email' => $cd['email']], [
                'nom'                  => $cd['raison_sociale'],
                'prenom'               => 'Client',
                'password'             => Hash::make('password'),
                'role_id'              => $roleClient->id,
                'must_change_password' => false,
            ]);
            $client = Client::firstOrCreate(['nif' => $cd['nif']], [
                'user_id'           => $user->id,
                'raison_sociale'    => $cd['raison_sociale'],
                'nif'               => $cd['nif'],
                'nis'               => 'NIS' . $cd['nif'],
                'rc'                => 'RC' . $cd['nif'],
                'adresse_siege'     => '123 Rue de ' . $cd['ville'],
                'type_client'       => 'ORDINAIRE',
                'statut'            => 'APPROUVE',
                'ville'             => $cd['ville'],
                'pays_id'           => $pays->id,
                'rep_nom'           => 'Nom',
                'rep_prenom'        => 'Prenom',
                'rep_role'          => 'Gérant',
                'rep_tel'           => '0555000000',
                'rep_email'         => $cd['email'],
            ]);
            $clients[] = $client;
        }
        $this->command->info('  ✓ 3 clients créés');

        // 6 Demandes
        $demandesData = [
            ['client' => 0, 'statut' => 'EN_ETUDE',       'priorite' => 'URGENTE', 'dossier' => 'GSLC-2026-D001'],
            ['client' => 0, 'statut' => 'DEVIS_ENVOYE',   'priorite' => 'HAUTE',   'dossier' => 'GSLC-2026-D002'],
            ['client' => 1, 'statut' => 'EN_NEGOCIATION', 'priorite' => 'NORMALE', 'dossier' => 'GSLC-2026-D003'],
            ['client' => 1, 'statut' => 'ACCEPTE',        'priorite' => 'HAUTE',   'dossier' => 'GSLC-2026-D004'],
            ['client' => 2, 'statut' => 'EN_ETUDE',       'priorite' => 'NORMALE', 'dossier' => 'GSLC-2026-D005'],
            ['client' => 2, 'statut' => 'REFUSE',         'priorite' => 'URGENTE', 'dossier' => 'GSLC-2026-D006'],
        ];

        $demandes = [];
        foreach ($demandesData as $dd) {
            $demande = DemandeImport::firstOrCreate(['numero_dossier' => $dd['dossier']], [
                'client_id'                => $clients[$dd['client']]->id,
                'port_origine_id'          => $port1->id,
                'port_destination_id'      => $port2->id,
                'numero_dossier'           => $dd['dossier'],
                'type_achat'               => 'FOB',
                'priorite'                 => $dd['priorite'],
                'statut'                   => $dd['statut'],
                'date_soumission'          => now()->subDays(rand(5, 30)),
                'date_livraison_souhaitee' => now()->addDays(rand(30, 90)),
                'traite_par_user_id'       => $commercial?->id,
                'nombre_negociations'      => 0,
            ]);
            LigneDemande::firstOrCreate(
                ['demande_id' => $demande->id, 'type_conteneur_id' => $typeConten->id],
                [
                    'demande_id'        => $demande->id,
                    'marchandise_id'    => $marchandise->id,
                    'type_conteneur_id' => $typeConten->id,
                    'pays_origine_id'   => $pays->id,
                    'quantite'          => rand(1, 5),
                    'poids_total'       => rand(5000, 20000),
                    'description'       => 'Marchandises générales',
                ]
            );
            $demandes[] = $demande;
        }
        $this->command->info('  ✓ 6 demandes créées');

        // 4 Devis
        $devisData = [
            ['demande' => 1, 'statut' => 'ENVOYE',         'montant' => 450000, 'numero' => 'DV-2026-0001'],
            ['demande' => 2, 'statut' => 'EN_NEGOCIATION', 'montant' => 820000, 'numero' => 'DV-2026-0002'],
            ['demande' => 3, 'statut' => 'ACCEPTE',        'montant' => 615000, 'numero' => 'DV-2026-0003'],
            ['demande' => 3, 'statut' => 'REFUSE',         'montant' => 700000, 'numero' => 'DV-2026-0004'],
        ];

        $devisList = [];
        foreach ($devisData as $dv) {
            $montantHt = $dv['montant'];
            $tva       = 19;
            $ttc       = round($montantHt * (1 + $tva / 100), 2);
            $devis = Devis::firstOrCreate(['numero_devis' => $dv['numero']], [
                'demande_id'         => $demandes[$dv['demande']]->id,
                'cree_par_user_id'   => $commercial?->id,
                'numero_devis'       => $dv['numero'],
                'version'            => 1,
                'montant_ht'         => $montantHt,
                'tva'                => $tva,
                'total_ttc'          => $ttc,
                'statut'             => $dv['statut'],
                'commentaire_nashco' => 'Devis établi selon tarifs portuaires en vigueur.',
                'date_envoi'         => now()->subDays(rand(1, 10)),
                'date_expiration'    => now()->addDays(30),
            ]);
            LigneDevis::firstOrCreate(['devis_id' => $devis->id], [
                'devis_id'       => $devis->id,
                'type_ligne'     => 'SERVICE',
                'service'        => 'Manutention portuaire',
                'description'    => 'Chargement / déchargement conteneurs',
                'quantite'       => 1,
                'prix_unitaire'  => $montantHt,
                'tva_applicable' => true,
                'total_ht'       => $montantHt,
            ]);
            $devisList[] = $devis;
        }
        $this->command->info('  ✓ 4 devis créés');

        // 2 Contrats
        $contratsData = [
            ['devis' => 2, 'numero' => 'CTR-2026-0001', 'statut' => 'EN_ATTENTE_SIGNATURE', 'caution' => 500000],
            ['devis' => 2, 'numero' => 'CTR-2026-0002', 'statut' => 'ACTIF',                'caution' => 300000],
        ];

        foreach ($contratsData as $ct) {
            $devis   = $devisList[$ct['devis']];
            $contrat = ContratImport::firstOrCreate(['numero_contrat' => $ct['numero']], [
                'numero_contrat'       => $ct['numero'],
                'devis_id'             => $devis->id,
                'client_id'            => $demandes[3]->client_id,
                'demande_id'           => $demandes[3]->id,
                'cree_par_user_id'     => $commercial?->id,
                'statut'               => $ct['statut'],
                'date_debut'           => now(),
                'date_fin'             => now()->addYear(),
                'montant_caution'      => $ct['caution'],
                'statut_caution'       => 'EN_ATTENTE',
                'token_signature'      => (string) rand(100000, 999999),
                'conditions_acceptees' => false,
            ]);
            LigneContrat::firstOrCreate(['contrat_id' => $contrat->id], [
                'contrat_id'      => $contrat->id,
                'type_ligne'      => 'SERVICE',
                'service'         => 'Manutention portuaire',
                'description'     => 'Chargement / déchargement conteneurs',
                'quantite'        => 1,
                'prix_unitaire'   => $devis->montant_ht,
                'tva_applicable'  => true,
                'total_ht'        => $devis->montant_ht,
                'franchise_jours' => 7,
                'date_debut'      => now(),
                'date_fin'        => now()->addYear(),
            ]);
        }
        $this->command->info('  ✓ 2 contrats créés');

        // 3 Navires
        $naviresData = [
            ['nom' => 'MV Djurdjura',   'imo' => 'IMO9876541', 'compagnie' => 'CNAN Nord',      'teu' => 1200],
            ['nom' => 'MV Hoggar',      'imo' => 'IMO9876542', 'compagnie' => 'MSC Algeria',     'teu' => 2400],
            ['nom' => 'MV Tamanrasset', 'imo' => 'IMO9876543', 'compagnie' => 'CMA CGM Algérie', 'teu' => 800],
        ];

        foreach ($naviresData as $nv) {
            Navire::firstOrCreate(['numero_imo' => $nv['imo']], [
                'nom_navire'         => $nv['nom'],
                'numero_imo'         => $nv['imo'],
                'pays_id'            => $pays->id,
                'compagnie_maritime' => $nv['compagnie'],
                'capacite_teu'       => $nv['teu'],
                'annee_construction' => rand(2005, 2020),
                'actif'              => true,
            ]);
        }
        $this->command->info('  ✓ 3 navires créés');

        $this->command->info('');
        $this->command->info('✅ Demo data prête ! Mot de passe de tous les comptes: password');
        $this->command->table(
            ['Entité', 'Quantité', 'Détail'],
            [
                ['Clients',  '3', 'client1@demo.dz, client2@demo.dz, client3@demo.dz'],
                ['Demandes', '6', 'EN_ETUDE×2, DEVIS_ENVOYE, EN_NEGOCIATION, ACCEPTE, REFUSE'],
                ['Devis',    '4', 'ENVOYE, EN_NEGOCIATION, ACCEPTE, REFUSE'],
                ['Contrats', '2', 'EN_ATTENTE_SIGNATURE, ACTIF'],
                ['Navires',  '3', 'MV Djurdjura, MV Hoggar, MV Tamanrasset'],
            ]
        );
    }
}
