<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AlgerianPortsSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $algerie = DB::table('pays')->where('code_iso', 'DZ')->first();
            $paysId  = $algerie?->id;

            // ── PORTS ───────────────────────────────────────────────────────────
            $portsData = [
                ['nom_port' => "Port d'Alger",      'code_port' => 'ALG', 'ville' => 'Alger'],
                ['nom_port' => "Port d'Oran",        'code_port' => 'ORN', 'ville' => 'Oran'],
                ['nom_port' => "Port d'Annaba",      'code_port' => 'AAE', 'ville' => 'Annaba'],
                ['nom_port' => "Port de Béjaïa",     'code_port' => 'BJA', 'ville' => 'Béjaïa'],
                ['nom_port' => "Port de Skikda",     'code_port' => 'SKI', 'ville' => 'Skikda'],
                ['nom_port' => "Port de Mostaganem", 'code_port' => 'MOS', 'ville' => 'Mostaganem'],
                ['nom_port' => "Port de Djendjene",  'code_port' => 'DJN', 'ville' => 'Jijel'],
                ['nom_port' => "Port de Ghazaouet",  'code_port' => 'GHZ', 'ville' => 'Ghazaouet'],
                ['nom_port' => "Port de Ténès",      'code_port' => 'TEN', 'ville' => 'Ténès'],
                ['nom_port' => "Port de Dellys",     'code_port' => 'DEL', 'ville' => 'Dellys'],
            ];

            foreach ($portsData as $p) {
                DB::table('ports')->updateOrInsert(
                    ['code_port' => $p['code_port']],
                    [
                        'pays_id'                => $paysId,
                        'nom_port'               => $p['nom_port'],
                        'code_port'              => $p['code_port'],
                        'ville'                  => $p['ville'],
                        'type_port'              => 'MARITIME',
                        'adresse'                => null,
                        'telephone'              => null,
                        'jours_allowance_defaut' => 7,
                        'actif'                  => true,
                        'created_at'             => now(),
                        'updated_at'             => now(),
                    ]
                );
            }

            // Helper: resolve port_id by code_port
            $portId = fn(string $code): int =>
                DB::table('ports')->where('code_port', $code)->value('id');

            // ── TERMINALS ───────────────────────────────────────────────────────
            $terminauxData = [
                // Alger
                ['port' => 'ALG', 'code_terminal' => 'TCA-ALG', 'nom_terminal' => "Terminal à Conteneurs d'Alger (TCA)",       'capacite_max_teu' => 500000],
                ['port' => 'ALG', 'code_terminal' => 'THC-ALG', 'nom_terminal' => "Terminal des Hydrocarbures d'Alger",         'capacite_max_teu' => 0],
                ['port' => 'ALG', 'code_terminal' => 'TRO-ALG', 'nom_terminal' => "Terminal Roulier d'Alger",                   'capacite_max_teu' => 50000],
                ['port' => 'ALG', 'code_terminal' => 'TMD-ALG', 'nom_terminal' => "Terminal à Marchandises Diverses d'Alger",   'capacite_max_teu' => 100000],
                // Oran
                ['port' => 'ORN', 'code_terminal' => 'TCO-ORN', 'nom_terminal' => "Terminal à Conteneurs d'Oran",               'capacite_max_teu' => 250000],
                ['port' => 'ORN', 'code_terminal' => 'TCE-ORN', 'nom_terminal' => "Terminal des Céréales d'Oran",               'capacite_max_teu' => 0],
                ['port' => 'ORN', 'code_terminal' => 'TRO-ORN', 'nom_terminal' => "Terminal Roulier d'Oran",                    'capacite_max_teu' => 30000],
                // Béjaïa
                ['port' => 'BJA', 'code_terminal' => 'TCB-BJA', 'nom_terminal' => "Terminal à Conteneurs de Béjaïa",            'capacite_max_teu' => 300000],
                ['port' => 'BJA', 'code_terminal' => 'THB-BJA', 'nom_terminal' => "Terminal des Hydrocarbures de Béjaïa",       'capacite_max_teu' => 0],
                // Annaba
                ['port' => 'AAE', 'code_terminal' => 'TMA-AAE', 'nom_terminal' => "Terminal Minéralier d'Annaba",               'capacite_max_teu' => 0],
                ['port' => 'AAE', 'code_terminal' => 'TCA-AAE', 'nom_terminal' => "Terminal à Conteneurs d'Annaba",             'capacite_max_teu' => 150000],
                // Skikda
                ['port' => 'SKI', 'code_terminal' => 'TPS-SKI', 'nom_terminal' => "Terminal Pétrochimique de Skikda",           'capacite_max_teu' => 0],
                ['port' => 'SKI', 'code_terminal' => 'TCS-SKI', 'nom_terminal' => "Terminal à Conteneurs de Skikda",            'capacite_max_teu' => 120000],
                // Mostaganem
                ['port' => 'MOS', 'code_terminal' => 'TCM-MOS', 'nom_terminal' => "Terminal à Conteneurs de Mostaganem",        'capacite_max_teu' => 100000],
                ['port' => 'MOS', 'code_terminal' => 'TCE-MOS', 'nom_terminal' => "Terminal des Céréales de Mostaganem",        'capacite_max_teu' => 0],
                // Djendjene
                ['port' => 'DJN', 'code_terminal' => 'TCD-DJN', 'nom_terminal' => "Terminal à Conteneurs de Djendjene",         'capacite_max_teu' => 400000],
            ];

            foreach ($terminauxData as $t) {
                DB::table('terminaux')->updateOrInsert(
                    ['code_terminal' => $t['code_terminal']],
                    [
                        'port_id'          => $portId($t['port']),
                        'code_terminal'    => $t['code_terminal'],
                        'nom_terminal'     => $t['nom_terminal'],
                        'adresse'          => 'Zone Portuaire',
                        'telephone'        => 'N/A',
                        'email'            => 'terminal@port.dz',
                        'capacite_max_teu' => $t['capacite_max_teu'],
                        'responsable'      => null,
                        'taux_occupation'  => 0,
                        'actif'            => true,
                        'created_at'       => now(),
                        'updated_at'       => now(),
                    ]
                );
            }

            // Helper: resolve terminal_id by code_terminal
            $terminalId = fn(string $code): int =>
                DB::table('terminaux')->where('code_terminal', $code)->value('id');

            // ── DEPOTS ──────────────────────────────────────────────────────────
            $depotsData = [
                // Alger
                ['port' => 'ALG', 'terminal' => 'TCA-ALG', 'code_depot' => 'DSC-ALG', 'nom_depot' => "Dépôt Sec Alger Centre",          'type_stockage' => 'SEC',       'capacite_totale' => 5000],
                ['port' => 'ALG', 'terminal' => 'TCA-ALG', 'code_depot' => 'DFA-ALG', 'nom_depot' => "Dépôt Frigorifique Alger",         'type_stockage' => 'FRIGO',     'capacite_totale' => 500],
                ['port' => 'ALG', 'terminal' => 'THC-ALG', 'code_depot' => 'DDA-ALG', 'nom_depot' => "Dépôt Matières Dangereuses Alger", 'type_stockage' => 'DANGEREUX', 'capacite_totale' => 200],
                // Oran
                ['port' => 'ORN', 'terminal' => 'TCO-ORN', 'code_depot' => 'DSO-ORN', 'nom_depot' => "Dépôt Sec Oran",                   'type_stockage' => 'SEC',       'capacite_totale' => 3000],
                ['port' => 'ORN', 'terminal' => 'TCO-ORN', 'code_depot' => 'DFO-ORN', 'nom_depot' => "Dépôt Frigorifique Oran",           'type_stockage' => 'FRIGO',     'capacite_totale' => 300],
                // Béjaïa
                ['port' => 'BJA', 'terminal' => 'TCB-BJA', 'code_depot' => 'DSB-BJA', 'nom_depot' => "Dépôt Sec Béjaïa",                 'type_stockage' => 'SEC',       'capacite_totale' => 2000],
                ['port' => 'BJA', 'terminal' => 'THB-BJA', 'code_depot' => 'DDB-BJA', 'nom_depot' => "Dépôt Dangereux Béjaïa",           'type_stockage' => 'DANGEREUX', 'capacite_totale' => 150],
                // Annaba
                ['port' => 'AAE', 'terminal' => 'TCA-AAE', 'code_depot' => 'DSA-AAE', 'nom_depot' => "Dépôt Sec Annaba",                 'type_stockage' => 'SEC',       'capacite_totale' => 1500],
                // Skikda
                ['port' => 'SKI', 'terminal' => 'TPS-SKI', 'code_depot' => 'DDS-SKI', 'nom_depot' => "Dépôt Dangereux Skikda",           'type_stockage' => 'DANGEREUX', 'capacite_totale' => 300],
                ['port' => 'SKI', 'terminal' => 'TCS-SKI', 'code_depot' => 'DSS-SKI', 'nom_depot' => "Dépôt Sec Skikda",                 'type_stockage' => 'SEC',       'capacite_totale' => 1000],
                // Mostaganem
                ['port' => 'MOS', 'terminal' => 'TCM-MOS', 'code_depot' => 'DSM-MOS', 'nom_depot' => "Dépôt Sec Mostaganem",             'type_stockage' => 'SEC',       'capacite_totale' => 800],
                // Djendjene
                ['port' => 'DJN', 'terminal' => 'TCD-DJN', 'code_depot' => 'DSD-DJN', 'nom_depot' => "Dépôt Sec Djendjene",              'type_stockage' => 'SEC',       'capacite_totale' => 2000],
            ];

            foreach ($depotsData as $d) {
                DB::table('depots')->updateOrInsert(
                    ['code_depot' => $d['code_depot']],
                    [
                        'port_id'          => $portId($d['port']),
                        'terminal_id'      => $terminalId($d['terminal']),
                        'code_depot'       => $d['code_depot'],
                        'nom_depot'        => $d['nom_depot'],
                        'adresse_precise'  => 'Zone Portuaire',
                        'telephone'        => 'N/A',
                        'email'            => 'depot@port.dz',
                        'type_stockage'    => $d['type_stockage'],
                        'capacite_totale'  => $d['capacite_totale'],
                        'responsable'      => null,
                        'actif'            => true,
                        'created_at'       => now(),
                        'updated_at'       => now(),
                    ]
                );
            }
        });

        $ports    = DB::table('ports')->whereIn('code_port', ['ALG','ORN','AAE','BJA','SKI','MOS','DJN','GHZ','TEN','DEL'])->count();
        $terminaux = DB::table('terminaux')->whereIn('code_terminal', [
            'TCA-ALG','THC-ALG','TRO-ALG','TMD-ALG',
            'TCO-ORN','TCE-ORN','TRO-ORN',
            'TCB-BJA','THB-BJA',
            'TMA-AAE','TCA-AAE',
            'TPS-SKI','TCS-SKI',
            'TCM-MOS','TCE-MOS',
            'TCD-DJN',
        ])->count();
        $depots = DB::table('depots')->whereIn('code_depot', [
            'DSC-ALG','DFA-ALG','DDA-ALG',
            'DSO-ORN','DFO-ORN',
            'DSB-BJA','DDB-BJA',
            'DSA-AAE',
            'DDS-SKI','DSS-SKI',
            'DSM-MOS',
            'DSD-DJN',
        ])->count();

        $this->command->info("✅ AlgerianPortsSeeder — {$ports} ports | {$terminaux} terminaux | {$depots} dépôts");
    }
}
