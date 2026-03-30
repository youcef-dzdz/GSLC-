<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PortSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('ports')->truncate();

        // Get Algeria's ID for domestic ports
        $algerie = DB::table('pays')->where('code_iso', 'DZ')->first();
        $france  = DB::table('pays')->where('code_iso', 'FR')->first();
        $espagne = DB::table('pays')->where('code_iso', 'ES')->first();
        $italie  = DB::table('pays')->where('code_iso', 'IT')->first();
        $chine   = DB::table('pays')->where('code_iso', 'CN')->first();
        $pays_bas = DB::table('pays')->where('code_iso', 'NL')->first();

        $ports = [
            // ── Algerian ports (destinations) ──────────────────────────────
            [
                'nom_port'               => 'Port de Mostaganem',
                'code_port'              => 'DZMGM',
                'pays_id'               => $algerie->id,
                'ville'                  => 'Mostaganem',
                'type_port'              => 'COMMERCIAL',
                'adresse'                => 'Zone Portuaire, Mostaganem 27000',
                'telephone'              => '+213 45 21 60 00',
                'jours_allowance_defaut' => 7,
                'actif'                  => true,
                'created_at'             => now(),
                'updated_at'             => now(),
            ],
            [
                'nom_port'               => 'Port d\'Oran',
                'code_port'              => 'DZORN',
                'pays_id'               => $algerie->id,
                'ville'                  => 'Oran',
                'type_port'              => 'COMMERCIAL',
                'adresse'                => 'Zone Portuaire, Oran 31000',
                'telephone'              => '+213 41 33 20 00',
                'jours_allowance_defaut' => 7,
                'actif'                  => true,
                'created_at'             => now(),
                'updated_at'             => now(),
            ],
            [
                'nom_port'               => 'Port d\'Alger',
                'code_port'              => 'DZALG',
                'pays_id'               => $algerie->id,
                'ville'                  => 'Alger',
                'type_port'              => 'COMMERCIAL',
                'adresse'                => 'Place des Martyrs, Alger 16000',
                'telephone'              => '+213 21 43 00 00',
                'jours_allowance_defaut' => 7,
                'actif'                  => true,
                'created_at'             => now(),
                'updated_at'             => now(),
            ],
            [
                'nom_port'               => 'Port d\'Annaba',
                'code_port'              => 'DZAAE',
                'pays_id'               => $algerie->id,
                'ville'                  => 'Annaba',
                'type_port'              => 'COMMERCIAL',
                'adresse'                => 'Zone Portuaire, Annaba 23000',
                'telephone'              => '+213 38 86 10 00',
                'jours_allowance_defaut' => 7,
                'actif'                  => true,
                'created_at'             => now(),
                'updated_at'             => now(),
            ],

            // ── International origin ports ──────────────────────────────────
            [
                'nom_port'               => 'Port de Marseille',
                'code_port'              => 'FRMRS',
                'pays_id'               => $france->id,
                'ville'                  => 'Marseille',
                'type_port'              => 'COMMERCIAL',
                'adresse'                => 'Port Autonome de Marseille, France',
                'telephone'              => '+33 4 91 39 40 00',
                'jours_allowance_defaut' => 0,
                'actif'                  => true,
                'created_at'             => now(),
                'updated_at'             => now(),
            ],
            [
                'nom_port'               => 'Port de Barcelone',
                'code_port'              => 'ESBCN',
                'pays_id'               => $espagne->id,
                'ville'                  => 'Barcelone',
                'type_port'              => 'COMMERCIAL',
                'adresse'                => 'Port de Barcelona, Espagne',
                'telephone'              => '+34 93 306 88 00',
                'jours_allowance_defaut' => 0,
                'actif'                  => true,
                'created_at'             => now(),
                'updated_at'             => now(),
            ],
            [
                'nom_port'               => 'Port de Gênes',
                'code_port'              => 'ITGOA',
                'pays_id'               => $italie->id,
                'ville'                  => 'Gênes',
                'type_port'              => 'COMMERCIAL',
                'adresse'                => 'Porto di Genova, Italie',
                'telephone'              => '+39 010 24 91',
                'jours_allowance_defaut' => 0,
                'actif'                  => true,
                'created_at'             => now(),
                'updated_at'             => now(),
            ],
            [
                'nom_port'               => 'Port de Shanghai',
                'code_port'              => 'CNSHA',
                'pays_id'               => $chine->id,
                'ville'                  => 'Shanghai',
                'type_port'              => 'COMMERCIAL',
                'adresse'                => 'Shanghai International Port, Chine',
                'telephone'              => '+86 21 6160 0000',
                'jours_allowance_defaut' => 0,
                'actif'                  => true,
                'created_at'             => now(),
                'updated_at'             => now(),
            ],
            [
                'nom_port'               => 'Port de Rotterdam',
                'code_port'              => 'NLRTM',
                'pays_id'               => $pays_bas->id,
                'ville'                  => 'Rotterdam',
                'type_port'              => 'COMMERCIAL',
                'adresse'                => 'Port of Rotterdam, Pays-Bas',
                'telephone'              => '+31 10 252 10 10',
                'jours_allowance_defaut' => 0,
                'actif'                  => true,
                'created_at'             => now(),
                'updated_at'             => now(),
            ],
        ];

        DB::table('ports')->insert($ports);

        $this->command->info('✅ ' . count($ports) . ' ports créés avec succès.');
    }
}
