<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TypeConteneurSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('types_conteneur')->truncate();

        $types = [
            [
                'code_type'               => '20ST',
                'libelle'                 => '20\' Standard',
                'longueur_pieds'          => 20,
                'volume'                  => 33.2,
                'poids_tare'              => 2200,   // kg (weight of empty container)
                'charge_utile'            => 28000,
                'tarif_journalier_defaut' => 1200.00,
                'est_frigo'               => false,
                'actif'                   => true,
                'created_at'              => now(),
                'updated_at'              => now(),
            ],
            [
                'code_type'               => '40ST',
                'libelle'                 => '40\' Standard',
                'longueur_pieds'          => 40,
                'volume'                  => 67.6,
                'poids_tare'              => 3800,
                'charge_utile'            => 28000,
                'tarif_journalier_defaut' => 2000.00,
                'est_frigo'               => false,
                'actif'                   => true,
                'created_at'              => now(),
                'updated_at'              => now(),
            ],
            [
                'code_type'               => '40HC',
                'libelle'                 => '40\' High Cube',
                'longueur_pieds'          => 40,
                'volume'                  => 76.4,
                'poids_tare'              => 3900,
                'charge_utile'            => 28000,
                'tarif_journalier_defaut' => 2200.00,
                'est_frigo'               => false,
                'actif'                   => true,
                'created_at'              => now(),
                'updated_at'              => now(),
            ],
            [
                'code_type'               => '20RF',
                'libelle'                 => '20\' Réfrigéré',
                'longueur_pieds'          => 20,
                'volume'                  => 28.3,
                'poids_tare'              => 3080,
                'charge_utile'            => 27000,
                'tarif_journalier_defaut' => 2500.00,
                'est_frigo'               => true,
                'actif'                   => true,
                'created_at'              => now(),
                'updated_at'              => now(),
            ],
            [
                'code_type'               => '40RF',
                'libelle'                 => '40\' Réfrigéré',
                'longueur_pieds'          => 40,
                'volume'                  => 59.6,
                'poids_tare'              => 4800,
                'charge_utile'            => 26500,
                'tarif_journalier_defaut' => 4000.00,
                'est_frigo'               => true,
                'actif'                   => true,
                'created_at'              => now(),
                'updated_at'              => now(),
            ],
        ];

        DB::table('types_conteneur')->insert($types);

        $this->command->info('✅ ' . count($types) . ' types de conteneur créés avec succès.');
    }
}
