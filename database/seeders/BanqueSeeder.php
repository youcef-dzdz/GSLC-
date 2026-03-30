<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BanqueSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('banques')->truncate();

        $banques = [
            [
                'nom'         => 'Banque Nationale d\'Algérie',
                'code_banque' => 'BNA',
                'swift'       => 'BNAADZDZ',
                'adresse'     => 'Boulevard Che Guevara, Alger',
                'telephone'   => '+213 21 71 10 00',
                'actif'       => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'nom'         => 'Banque Extérieure d\'Algérie',
                'code_banque' => 'BEA',
                'swift'       => 'BEAADZDZXXX',
                'adresse'     => '11 Boulevard Colonel Amirouche, Alger',
                'telephone'   => '+213 21 92 00 00',
                'actif'       => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'nom'         => 'Crédit Populaire d\'Algérie',
                'code_banque' => 'CPA',
                'swift'       => 'CPAADZDZXXX',
                'adresse'     => '2 Boulevard Colonel Amirouche, Alger',
                'telephone'   => '+213 21 74 00 00',
                'actif'       => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'nom'         => 'Banque de l\'Agriculture et du Développement Rural',
                'code_banque' => 'BADR',
                'swift'       => 'BADRDZDZ',
                'adresse'     => '17 Boulevard Colonel Amirouche, Alger',
                'telephone'   => '+213 21 23 00 00',
                'actif'       => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'nom'         => 'Caisse Nationale d\'Épargne et de Prévoyance',
                'code_banque' => 'CNEP',
                'swift'       => 'CNEPDZDZXXX',
                'adresse'     => '42 Rue Khélifa Boukhalfa, Alger',
                'telephone'   => '+213 21 23 45 00',
                'actif'       => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'nom'         => 'Banque de Développement Local',
                'code_banque' => 'BDL',
                'swift'       => 'BDLADZDZXXX',
                'adresse'     => '5 Rue Gaci Amar, Alger',
                'telephone'   => '+213 21 71 60 00',
                'actif'       => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'nom'         => 'Société Générale Algérie',
                'code_banque' => 'SGA',
                'swift'       => 'SOGEDZIDZXX',
                'adresse'     => 'Lot Boudrahem, El Biar, Alger',
                'telephone'   => '+213 21 69 60 00',
                'actif'       => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'nom'         => 'BNP Paribas El Djazaïr',
                'code_banque' => 'BNPP',
                'swift'       => 'BNPADZIDZXX',
                'adresse'     => '23 Rue Lieutenant Colonel Lotfi, Alger',
                'telephone'   => '+213 21 23 10 00',
                'actif'       => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ];

        DB::table('banques')->insert($banques);

        $this->command->info('✅ ' . count($banques) . ' banques créées avec succès.');
    }
}
