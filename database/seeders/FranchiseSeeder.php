<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FranchiseSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('franchises')->truncate();

        // type_conteneur_id is NOT NULL — every franchise must link to a container type
        // port_id and client_id are nullable — null means "applies to all ports/clients"
        $types = DB::table('types_conteneur')->pluck('id', 'code_type');

        $franchises = [
            // 20' Standard — 7 days DEMURRAGE + 7 days DETENTION
            [
                'type_conteneur_id'   => $types['20ST'],
                'port_id'             => null,
                'client_id'           => null,
                'type_franchise'      => 'DEMURRAGE',
                'jours_franchise'     => 7,
                'description'         => 'Franchise démurrage standard — 20\' Standard',
                'date_debut_validite' => now()->toDateString(),
                'date_fin_validite'   => null,
                'actif'               => true,
                'created_at'          => now(),
                'updated_at'          => now(),
            ],
            [
                'type_conteneur_id'   => $types['20ST'],
                'port_id'             => null,
                'client_id'           => null,
                'type_franchise'      => 'DETENTION',
                'jours_franchise'     => 7,
                'description'         => 'Franchise détention standard — 20\' Standard',
                'date_debut_validite' => now()->toDateString(),
                'date_fin_validite'   => null,
                'actif'               => true,
                'created_at'          => now(),
                'updated_at'          => now(),
            ],

            // 40' Standard
            [
                'type_conteneur_id'   => $types['40ST'],
                'port_id'             => null,
                'client_id'           => null,
                'type_franchise'      => 'DEMURRAGE',
                'jours_franchise'     => 7,
                'description'         => 'Franchise démurrage standard — 40\' Standard',
                'date_debut_validite' => now()->toDateString(),
                'date_fin_validite'   => null,
                'actif'               => true,
                'created_at'          => now(),
                'updated_at'          => now(),
            ],
            [
                'type_conteneur_id'   => $types['40ST'],
                'port_id'             => null,
                'client_id'           => null,
                'type_franchise'      => 'DETENTION',
                'jours_franchise'     => 7,
                'description'         => 'Franchise détention standard — 40\' Standard',
                'date_debut_validite' => now()->toDateString(),
                'date_fin_validite'   => null,
                'actif'               => true,
                'created_at'          => now(),
                'updated_at'          => now(),
            ],

            // 40' High Cube
            [
                'type_conteneur_id'   => $types['40HC'],
                'port_id'             => null,
                'client_id'           => null,
                'type_franchise'      => 'DEMURRAGE',
                'jours_franchise'     => 7,
                'description'         => 'Franchise démurrage standard — 40\' High Cube',
                'date_debut_validite' => now()->toDateString(),
                'date_fin_validite'   => null,
                'actif'               => true,
                'created_at'          => now(),
                'updated_at'          => now(),
            ],
            [
                'type_conteneur_id'   => $types['40HC'],
                'port_id'             => null,
                'client_id'           => null,
                'type_franchise'      => 'DETENTION',
                'jours_franchise'     => 7,
                'description'         => 'Franchise détention standard — 40\' High Cube',
                'date_debut_validite' => now()->toDateString(),
                'date_fin_validite'   => null,
                'actif'               => true,
                'created_at'          => now(),
                'updated_at'          => now(),
            ],

            // 20' Réfrigéré — shorter franchise (3 days) because high rotation
            [
                'type_conteneur_id'   => $types['20RF'],
                'port_id'             => null,
                'client_id'           => null,
                'type_franchise'      => 'DEMURRAGE',
                'jours_franchise'     => 3,
                'description'         => 'Franchise démurrage réduite — 20\' Réfrigéré (haute rotation)',
                'date_debut_validite' => now()->toDateString(),
                'date_fin_validite'   => null,
                'actif'               => true,
                'created_at'          => now(),
                'updated_at'          => now(),
            ],
            [
                'type_conteneur_id'   => $types['20RF'],
                'port_id'             => null,
                'client_id'           => null,
                'type_franchise'      => 'DETENTION',
                'jours_franchise'     => 3,
                'description'         => 'Franchise détention réduite — 20\' Réfrigéré (haute rotation)',
                'date_debut_validite' => now()->toDateString(),
                'date_fin_validite'   => null,
                'actif'               => true,
                'created_at'          => now(),
                'updated_at'          => now(),
            ],

            // 40' Réfrigéré — shorter franchise (3 days)
            [
                'type_conteneur_id'   => $types['40RF'],
                'port_id'             => null,
                'client_id'           => null,
                'type_franchise'      => 'DEMURRAGE',
                'jours_franchise'     => 3,
                'description'         => 'Franchise démurrage réduite — 40\' Réfrigéré (haute rotation)',
                'date_debut_validite' => now()->toDateString(),
                'date_fin_validite'   => null,
                'actif'               => true,
                'created_at'          => now(),
                'updated_at'          => now(),
            ],
            [
                'type_conteneur_id'   => $types['40RF'],
                'port_id'             => null,
                'client_id'           => null,
                'type_franchise'      => 'DETENTION',
                'jours_franchise'     => 3,
                'description'         => 'Franchise détention réduite — 40\' Réfrigéré (haute rotation)',
                'date_debut_validite' => now()->toDateString(),
                'date_fin_validite'   => null,
                'actif'               => true,
                'created_at'          => now(),
                'updated_at'          => now(),
            ],
        ];

        DB::table('franchises')->insert($franchises);

        $this->command->info('✅ ' . count($franchises) . ' franchises créées (DEMURRAGE + DETENTION par type de conteneur).');
    }
}
