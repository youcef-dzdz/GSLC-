<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DeviseSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('devises')->truncate();

        $devises = [
            [
                'code'              => 'DZD',
                'nom'               => 'Dinar Algérien',
                'symbole'           => 'DA',
                'taux_actuel'       => 1.000000,
                'taux_base'         => 1.000000,
                'date_derniere_maj' => now(),
                'source'            => 'CACHE',
                'actif'             => true,
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'code'              => 'EUR',
                'nom'               => 'Euro',
                'symbole'           => '€',
                'taux_actuel'       => 147.50,
                'taux_base'         => 147.50,
                'date_derniere_maj' => now(),
                'source'            => 'CACHE',
                'actif'             => true,
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'code'              => 'USD',
                'nom'               => 'Dollar Américain',
                'symbole'           => '$',
                'taux_actuel'       => 134.20,
                'taux_base'         => 134.20,
                'date_derniere_maj' => now(),
                'source'            => 'CACHE',
                'actif'             => true,
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'code'              => 'GBP',
                'nom'               => 'Livre Sterling',
                'symbole'           => '£',
                'taux_actuel'       => 171.30,
                'taux_base'         => 171.30,
                'date_derniere_maj' => now(),
                'source'            => 'CACHE',
                'actif'             => true,
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'code'              => 'CNY',
                'nom'               => 'Yuan Chinois',
                'symbole'           => '¥',
                'taux_actuel'       => 18.55,
                'taux_base'         => 18.55,
                'date_derniere_maj' => now(),
                'source'            => 'CACHE',
                'actif'             => true,
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
        ];

        DB::table('devises')->insert($devises);

        $this->command->info('✅ ' . count($devises) . ' devises créées avec succès.');
    }
}
