<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WorkflowSeeder extends Seeder
{
    /**
     * Seeds the 3 core business workflows and their steps.
     *
     * DEMANDE_IMPORT  → client submits → commercial reviews → devis created
     * DEVIS           → created → sent to client → accepted/rejected
     * CONTRAT_IMPORT  → drafted → director approves → client signs → activated
     */
    public function run(): void
    {
        DB::table('etapes_workflow')->truncate();
        DB::table('workflows')->truncate();

        $now = now();

        // ── 1. DEMANDE_IMPORT ─────────────────────────────────────────────────
        $wDemande = DB::table('workflows')->insertGetId([
            'code'           => 'DEMANDE_IMPORT',
            'nom_processus'  => 'Traitement des Demandes d\'Import',
            'type_workflow'  => 'DEMANDE',
            'description'    => 'De la soumission client jusqu\'à la création du devis commercial.',
            'actif'          => true,
            'created_at'     => $now,
            'updated_at'     => $now,
        ]);

        $this->insertEtapes($wDemande, [
            [1, 'Soumission de la demande',   'client',     'Client soumet la demande d\'import.',                   2],
            [2, 'Examen commercial',          'commercial', 'Commercial examine la demande et la valide ou rejette.', 24],
            [3, 'Création du devis',          'commercial', 'Commercial crée un devis basé sur la demande.',          48],
            [4, 'Envoi du devis au client',   'commercial', 'Devis envoyé au client pour validation.',                4],
        ], $now);

        // ── 2. DEVIS ──────────────────────────────────────────────────────────
        $wDevis = DB::table('workflows')->insertGetId([
            'code'           => 'DEVIS',
            'nom_processus'  => 'Validation du Devis',
            'type_workflow'  => 'DEVIS',
            'description'    => 'Du devis proposé jusqu\'à l\'acceptation ou rejet par le client.',
            'actif'          => true,
            'created_at'     => $now,
            'updated_at'     => $now,
        ]);

        $this->insertEtapes($wDevis, [
            [1, 'Devis en attente de réponse', 'client',     'Le client examine le devis.',              72],
            [2, 'Négociation (si applicable)', 'commercial', 'Échanges et ajustements si nécessaire.',   24, true],
            [3, 'Acceptation finale',          'client',     'Le client accepte ou rejette le devis.',   24],
        ], $now);

        // ── 3. CONTRAT_IMPORT ─────────────────────────────────────────────────
        $wContrat = DB::table('workflows')->insertGetId([
            'code'           => 'CONTRAT_IMPORT',
            'nom_processus'  => 'Signature et Activation du Contrat',
            'type_workflow'  => 'CONTRAT',
            'description'    => 'Du contrat rédigé jusqu\'à son activation après signature et dépôt de caution.',
            'actif'          => true,
            'created_at'     => $now,
            'updated_at'     => $now,
        ]);

        $this->insertEtapes($wContrat, [
            [1, 'Rédaction du contrat',          'commercial', 'Commercial rédige le contrat à partir du devis accepté.', 24],
            [2, 'Approbation Directeur',          'directeur',  'Le directeur examine et approuve ou retourne le contrat.',48],
            [3, 'Envoi au client pour signature', 'commercial', 'Contrat envoyé au client avec le token de signature.',    4],
            [4, 'Signature électronique client',  'client',     'Le client signe le contrat en ligne.',                   48],
            [5, 'Dépôt de caution',               'financier',  'Le client dépose le chèque de caution.',                 72],
            [6, 'Vérification de la caution',     'financier',  'Le service financier vérifie et valide le chèque.',       24],
            [7, 'Activation du contrat',          'commercial', 'Contrat activé — les opérations peuvent commencer.',      2],
        ], $now);

        $this->command->info('✅ 3 workflows créés : DEMANDE_IMPORT (4 étapes), DEVIS (3 étapes), CONTRAT_IMPORT (7 étapes).');
    }

    /**
     * @param array<int, array{0:int, 1:string, 2:string, 3:string, 4:int, 5?:bool}> $etapes
     */
    private function insertEtapes(int $workflowId, array $etapes, \Illuminate\Support\Carbon $now): void
    {
        $rows = [];
        foreach ($etapes as $e) {
            $rows[] = [
                'workflow_id'     => $workflowId,
                'nom_etape'       => $e[1],
                'ordre'           => $e[0],
                'role_responsable'=> $e[2],
                'description'     => $e[3],
                'delai_heures'    => $e[4],
                'est_optionnelle' => $e[5] ?? false,
                'created_at'      => $now,
                'updated_at'      => $now,
            ];
        }
        DB::table('etapes_workflow')->insert($rows);
    }
}
