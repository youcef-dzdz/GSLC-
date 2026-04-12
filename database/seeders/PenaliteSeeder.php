<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PenaliteSeeder extends Seeder
{
    /**
     * Tiered daily penalty rates per container type.
     *
     * DEMURRAGE = fees at the port (container waiting to be picked up)
     * DETENTION  = fees off-port (container kept by client beyond allowed period)
     *
     * Tranches (both DEMURRAGE and DETENTION):
     *   Days  1–7  : base rate
     *   Days  8–14 : 1.6× base rate
     *   Days 15+   : 2.4× base rate
     */
    public function run(): void
    {
        DB::table('penalites')->truncate();

        $types    = DB::table('types_conteneur')->pluck('id', 'code_type');
        $dzd      = DB::table('devises')->where('code', 'DZD')->value('id');
        $validite = now()->toDateString();

        // Base daily rates (DZD) per container type
        $baseRates = [
            '20ST' => ['DEMURRAGE' => 5000,  'DETENTION' => 3000],
            '40ST' => ['DEMURRAGE' => 7500,  'DETENTION' => 4500],
            '40HC' => ['DEMURRAGE' => 8500,  'DETENTION' => 5000],
            '20RF' => ['DEMURRAGE' => 12000, 'DETENTION' => 8000],
            '40RF' => ['DEMURRAGE' => 15000, 'DETENTION' => 10000],
        ];

        $penalites = [];

        foreach ($baseRates as $code => $rates) {
            if (! isset($types[$code])) continue;
            $typeId = $types[$code];

            foreach ($rates as $type => $base) {
                // Tranche 1 — Days 1–7
                $penalites[] = [
                    'type_conteneur_id'  => $typeId,
                    'devise_id'          => $dzd,
                    'type'               => $type,
                    'tarif_journalier'   => $base,
                    'tranche_debut'      => 1,
                    'tranche_fin'        => 7,
                    'date_debut_validite'=> $validite,
                    'date_fin_validite'  => null,
                    'actif'              => true,
                    'created_at'         => now(),
                    'updated_at'         => now(),
                ];

                // Tranche 2 — Days 8–14 (×1.6)
                $penalites[] = [
                    'type_conteneur_id'  => $typeId,
                    'devise_id'          => $dzd,
                    'type'               => $type,
                    'tarif_journalier'   => round($base * 1.6),
                    'tranche_debut'      => 8,
                    'tranche_fin'        => 14,
                    'date_debut_validite'=> $validite,
                    'date_fin_validite'  => null,
                    'actif'              => true,
                    'created_at'         => now(),
                    'updated_at'         => now(),
                ];

                // Tranche 3 — Days 15+ (×2.4, open-ended)
                $penalites[] = [
                    'type_conteneur_id'  => $typeId,
                    'devise_id'          => $dzd,
                    'type'               => $type,
                    'tarif_journalier'   => round($base * 2.4),
                    'tranche_debut'      => 15,
                    'tranche_fin'        => null,
                    'date_debut_validite'=> $validite,
                    'date_fin_validite'  => null,
                    'actif'              => true,
                    'created_at'         => now(),
                    'updated_at'         => now(),
                ];
            }
        }

        DB::table('penalites')->insert($penalites);

        $this->command->info('✅ ' . count($penalites) . ' barèmes de pénalités créés (3 tranches × 2 types × 5 conteneurs).');
    }
}
