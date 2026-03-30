<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaysSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('pays')->truncate();

        $pays = [
            // Maghreb & Middle East
            ['code_iso' => 'DZ', 'nom_pays' => 'Algérie',          'devise_defaut' => 'DZD', 'indicatif_tel' => '+213', 'actif' => true],
            ['code_iso' => 'MA', 'nom_pays' => 'Maroc',             'devise_defaut' => 'MAD', 'indicatif_tel' => '+212', 'actif' => true],
            ['code_iso' => 'TN', 'nom_pays' => 'Tunisie',           'devise_defaut' => 'TND', 'indicatif_tel' => '+216', 'actif' => true],
            ['code_iso' => 'LY', 'nom_pays' => 'Libye',             'devise_defaut' => 'LYD', 'indicatif_tel' => '+218', 'actif' => true],
            ['code_iso' => 'EG', 'nom_pays' => 'Égypte',            'devise_defaut' => 'EGP', 'indicatif_tel' => '+20',  'actif' => true],
            ['code_iso' => 'TR', 'nom_pays' => 'Turquie',           'devise_defaut' => 'TRY', 'indicatif_tel' => '+90',  'actif' => true],

            // Europe
            ['code_iso' => 'FR', 'nom_pays' => 'France',            'devise_defaut' => 'EUR', 'indicatif_tel' => '+33',  'actif' => true],
            ['code_iso' => 'ES', 'nom_pays' => 'Espagne',           'devise_defaut' => 'EUR', 'indicatif_tel' => '+34',  'actif' => true],
            ['code_iso' => 'IT', 'nom_pays' => 'Italie',            'devise_defaut' => 'EUR', 'indicatif_tel' => '+39',  'actif' => true],
            ['code_iso' => 'DE', 'nom_pays' => 'Allemagne',         'devise_defaut' => 'EUR', 'indicatif_tel' => '+49',  'actif' => true],
            ['code_iso' => 'NL', 'nom_pays' => 'Pays-Bas',          'devise_defaut' => 'EUR', 'indicatif_tel' => '+31',  'actif' => true],
            ['code_iso' => 'BE', 'nom_pays' => 'Belgique',          'devise_defaut' => 'EUR', 'indicatif_tel' => '+32',  'actif' => true],
            ['code_iso' => 'PT', 'nom_pays' => 'Portugal',          'devise_defaut' => 'EUR', 'indicatif_tel' => '+351', 'actif' => true],
            ['code_iso' => 'GB', 'nom_pays' => 'Royaume-Uni',       'devise_defaut' => 'GBP', 'indicatif_tel' => '+44',  'actif' => true],

            // Asia
            ['code_iso' => 'CN', 'nom_pays' => 'Chine',             'devise_defaut' => 'CNY', 'indicatif_tel' => '+86',  'actif' => true],
            ['code_iso' => 'JP', 'nom_pays' => 'Japon',             'devise_defaut' => 'JPY', 'indicatif_tel' => '+81',  'actif' => true],
            ['code_iso' => 'KR', 'nom_pays' => 'Corée du Sud',      'devise_defaut' => 'KRW', 'indicatif_tel' => '+82',  'actif' => true],
            ['code_iso' => 'IN', 'nom_pays' => 'Inde',              'devise_defaut' => 'INR', 'indicatif_tel' => '+91',  'actif' => true],

            // Americas
            ['code_iso' => 'US', 'nom_pays' => 'États-Unis',        'devise_defaut' => 'USD', 'indicatif_tel' => '+1',   'actif' => true],
            ['code_iso' => 'CA', 'nom_pays' => 'Canada',            'devise_defaut' => 'CAD', 'indicatif_tel' => '+1',   'actif' => true],
            ['code_iso' => 'BR', 'nom_pays' => 'Brésil',            'devise_defaut' => 'BRL', 'indicatif_tel' => '+55',  'actif' => true],
            ['code_iso' => 'AR', 'nom_pays' => 'Argentine',         'devise_defaut' => 'ARS', 'indicatif_tel' => '+54',  'actif' => true],
        ];

        // Add timestamps to every row
        $pays = array_map(fn($p) => array_merge($p, [
            'created_at' => now(),
            'updated_at' => now(),
        ]), $pays);

        DB::table('pays')->insert($pays);

        $this->command->info('✅ ' . count($pays) . ' pays créés avec succès.');
    }
}
