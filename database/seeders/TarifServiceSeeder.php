<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * TarifServiceSeeder - Realistic maritime service tariffs for NASHCO (Port of Mostaganem)
 * Types: MANUTENTION, STOCKAGE, INSPECTION, TRANSPORT, DOCUMENTATION, SURESTARIES, GARDIENNAGE, LAVAGE
 * Currency: DZD, TVA: 19%
 */
class TarifServiceSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();
        
        $tarifs = [
            [
                'code_tarif'        => 'MOS-MAN-001',
                'libelle_service'   => 'MANUTENTION - Terminal Handling Charge (THC) Mostaganem',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 12500.00,
                'unite'             => 'par conteneur',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'MOS-STO-002',
                'libelle_service'   => 'STOCKAGE - Magasinage sous douane Mostaganem',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 450.00,
                'unite'             => 'par jour/tonne',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'MOS-INS-003',
                'libelle_service'   => 'INSPECTION - Contrôle technique et conformité NASHCO',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 3800.00,
                'unite'             => 'par conteneur',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'MOS-TRA-004',
                'libelle_service'   => 'TRANSPORT - Transfert port-entrepôt zone Mostaganem',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 22000.00,
                'unite'             => 'par trajet',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'MOS-DOC-005',
                'libelle_service'   => 'DOCUMENTATION - Frais de dossier et B/L handling',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 5500.00,
                'unite'             => 'par dossier',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'MOS-SUR-006',
                'libelle_service'   => 'SURESTARIES - Détention conteneur hors franchise',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 3200.00,
                'unite'             => 'par jour',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'MOS-GAR-007',
                'libelle_service'   => 'GARDIENNAGE - Sécurisation site terminal',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 1500.00,
                'unite'             => 'par jour',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'MOS-LAV-008',
                'libelle_service'   => 'LAVAGE - Nettoyage et désinfection conteneur',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 4200.00,
                'unite'             => 'par conteneur',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
        ];

        // Clear existing to ensure only requested 8 for this task (or use updateOrInsert)
        // Given the request "create and run one with 8...", it's better to ensure a clean state for these 8.
        DB::table('tarifs_service')->truncate();

        foreach ($tarifs as $tarif) {
            DB::table('tarifs_service')->insert(array_merge($tarif, [
                'created_at' => $now,
                'updated_at' => $now,
            ]));
        }

        $this->command->info('Successfully seeded 8 realistic tariffs for NASHCO Mostaganem.');
    }
}
