<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // truncate first so re-running doesn't create duplicates
        DB::table('roles')->truncate();

        $roles = [
            [
                'nom_role'    => 'Administrateur Système',
                'label'       => 'admin',
                'description' => 'Gestion des utilisateurs, configuration système, journal d\'audit',
                'niveau'      => 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'nom_role'    => 'Directeur',
                'label'       => 'directeur',
                'description' => 'Tableau de bord stratégique, approbation des contrats > 5M DZD',
                'niveau'      => 2,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'nom_role'    => 'Responsable Commercial',
                'label'       => 'commercial',
                'description' => 'Demandes, devis, contrats, gestion clients',
                'niveau'      => 3,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'nom_role'    => 'Responsable Logistique',
                'label'       => 'logistique',
                'description' => 'Conteneurs, entrepôt, mouvements, escales',
                'niveau'      => 3,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'nom_role'    => 'Responsable Financier',
                'label'       => 'financier',
                'description' => 'Factures, paiements, surestaries, rapports financiers',
                'niveau'      => 3,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'nom_role'    => 'Client',
                'label'       => 'client',
                'description' => 'Portail externe — accès limité à ses propres données',
                'niveau'      => 4,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ];

        DB::table('roles')->insert($roles);

        $this->command->info('✅ 6 rôles créés avec succès.');
        $this->command->info('   Colonnes: nom_role, label, description, niveau');
    }
}
