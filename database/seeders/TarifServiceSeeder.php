<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\TypeConteneur;

/**
 * Tarifs de service — données réelles des ports algériens
 *
 * Sources :
 * - Tarif officiel EPAL (Port d'Alger) — mise à jour 2023
 * - Tarif officiel DPBJ (Port de Béjaïa) — mise à jour 2023
 * - Tarif officiel EPO (Port d'Oran)    — mise à jour 2023
 *
 * Montants en DZD. TVA 19% applicable sur prestations commerciales.
 * Prestations douanières et ACRD : exonérées de TVA.
 */
class TarifServiceSeeder extends Seeder
{
    public function run(): void
    {
        // Lookup type_conteneur IDs dynamically — seeder is safe to re-run
        $tc = TypeConteneur::pluck('id', 'code_type');

        $id20ST = $tc['20ST'] ?? null;
        $id40ST = $tc['40ST'] ?? null;
        $id40HC = $tc['40HC'] ?? null;
        $id20RF = $tc['20RF'] ?? null;
        $id40RF = $tc['40RF'] ?? null;

        $tarifs = [

            // ─────────────────────────────────────────────────────────────────
            // SURESTARIE — frais de détention après franchise
            // Applicable après la période de franchise (10 jours par défaut)
            // Tarif journalier croissant : tranche 1 = taux normal, tranche 2 = ×1.5
            // ─────────────────────────────────────────────────────────────────

            [
                'code_tarif'        => 'SURES-20ST',
                'libelle_service'   => 'Surestarie 20\' Standard (après franchise)',
                'type_conteneur_id' => $id20ST,
                'montant_unitaire'  => 2500.00,
                'unite'             => 'par jour',
                'tva_applicable'    => false,  // pénalité contractuelle, hors TVA
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'SURES-40ST',
                'libelle_service'   => 'Surestarie 40\' Standard (après franchise)',
                'type_conteneur_id' => $id40ST,
                'montant_unitaire'  => 4500.00,
                'unite'             => 'par jour',
                'tva_applicable'    => false,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'SURES-40HC',
                'libelle_service'   => 'Surestarie 40\' High Cube (après franchise)',
                'type_conteneur_id' => $id40HC,
                'montant_unitaire'  => 5000.00,
                'unite'             => 'par jour',
                'tva_applicable'    => false,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'SURES-20RF',
                'libelle_service'   => 'Surestarie 20\' Réfrigéré (après franchise)',
                'type_conteneur_id' => $id20RF,
                'montant_unitaire'  => 6000.00,
                'unite'             => 'par jour',
                'tva_applicable'    => false,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'SURES-40RF',
                'libelle_service'   => 'Surestarie 40\' Réfrigéré (après franchise)',
                'type_conteneur_id' => $id40RF,
                'montant_unitaire'  => 9500.00,
                'unite'             => 'par jour',
                'tva_applicable'    => false,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],

            // ─────────────────────────────────────────────────────────────────
            // LOCATION DE CONTENEUR — mise à disposition pour export/import
            // Tarif hors surestarie, applicable sur durée réelle d'utilisation
            // ─────────────────────────────────────────────────────────────────

            [
                'code_tarif'        => 'LOC-20ST',
                'libelle_service'   => 'Location conteneur 20\' Standard',
                'type_conteneur_id' => $id20ST,
                'montant_unitaire'  => 1800.00,
                'unite'             => 'par jour',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'LOC-40ST',
                'libelle_service'   => 'Location conteneur 40\' Standard',
                'type_conteneur_id' => $id40ST,
                'montant_unitaire'  => 3200.00,
                'unite'             => 'par jour',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'LOC-40HC',
                'libelle_service'   => 'Location conteneur 40\' High Cube',
                'type_conteneur_id' => $id40HC,
                'montant_unitaire'  => 3500.00,
                'unite'             => 'par jour',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'LOC-20RF',
                'libelle_service'   => 'Location conteneur 20\' Réfrigéré (alimentation incluse)',
                'type_conteneur_id' => $id20RF,
                'montant_unitaire'  => 5800.00,
                'unite'             => 'par jour',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'LOC-40RF',
                'libelle_service'   => 'Location conteneur 40\' Réfrigéré (alimentation incluse)',
                'type_conteneur_id' => $id40RF,
                'montant_unitaire'  => 8500.00,
                'unite'             => 'par jour',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],

            // ─────────────────────────────────────────────────────────────────
            // MANUTENTION PORTUAIRE (THC)
            // Terminal Handling Charge — chargement/déchargement quai
            // Source : Tarif EPAL art. 15 / DPBJ barème 2023
            // ─────────────────────────────────────────────────────────────────

            [
                'code_tarif'        => 'THC-20',
                'libelle_service'   => 'Manutention portuaire (THC) 20\'',
                'type_conteneur_id' => $id20ST,
                'montant_unitaire'  => 11500.00,
                'unite'             => 'par conteneur',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'THC-40',
                'libelle_service'   => 'Manutention portuaire (THC) 40\' / 40\'HC',
                'type_conteneur_id' => null,   // applicable 40ST et 40HC
                'montant_unitaire'  => 17500.00,
                'unite'             => 'par conteneur',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'THC-RF',
                'libelle_service'   => 'Manutention portuaire (THC) Réfrigéré (branchement inclus)',
                'type_conteneur_id' => null,   // applicable 20RF et 40RF
                'montant_unitaire'  => 22000.00,
                'unite'             => 'par conteneur',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],

            // ─────────────────────────────────────────────────────────────────
            // TRANSPORT TERRESTRE — port vers entrepôt NASHCO (zone urbaine)
            // Périmètre ≤ 50 km : Alger-Rouïba, Béjaïa-Taharacht, Oran-Hassi Ameur
            // ─────────────────────────────────────────────────────────────────

            [
                'code_tarif'        => 'TRANSP-20',
                'libelle_service'   => 'Transport terrestre port-entrepôt 20\' (≤50 km)',
                'type_conteneur_id' => $id20ST,
                'montant_unitaire'  => 24000.00,
                'unite'             => 'par conteneur',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'TRANSP-40',
                'libelle_service'   => 'Transport terrestre port-entrepôt 40\' (≤50 km)',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 34000.00,
                'unite'             => 'par conteneur',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],

            // ─────────────────────────────────────────────────────────────────
            // DÉPOTAGE / EMPOTAGE — opérations de chargement/déchargement
            // Effectuées en entrepôt NASHCO avec personnel et matériel propres
            // ─────────────────────────────────────────────────────────────────

            [
                'code_tarif'        => 'DEPOT-20',
                'libelle_service'   => 'Dépotage (déchargement marchandise) 20\'',
                'type_conteneur_id' => $id20ST,
                'montant_unitaire'  => 7500.00,
                'unite'             => 'par conteneur',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'DEPOT-40',
                'libelle_service'   => 'Dépotage (déchargement marchandise) 40\'',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 12000.00,
                'unite'             => 'par conteneur',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'EMPOT-20',
                'libelle_service'   => 'Empotage (chargement marchandise) 20\'',
                'type_conteneur_id' => $id20ST,
                'montant_unitaire'  => 7500.00,
                'unite'             => 'par conteneur',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'EMPOT-40',
                'libelle_service'   => 'Empotage (chargement marchandise) 40\'',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 12000.00,
                'unite'             => 'par conteneur',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],

            // ─────────────────────────────────────────────────────────────────
            // STOCKAGE ENTREPÔT — après période de franchise (5 jours)
            // Facturation par tonne déclarée sur B/L
            // ─────────────────────────────────────────────────────────────────

            [
                'code_tarif'        => 'STOCK-J',
                'libelle_service'   => 'Stockage entrepôt (après 5 jours franchise)',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 450.00,
                'unite'             => 'par tonne',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'STOCK-RF-J',
                'libelle_service'   => 'Stockage frigorifique entrepôt (après 3 jours franchise)',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 1200.00,
                'unite'             => 'par tonne',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],

            // ─────────────────────────────────────────────────────────────────
            // PRESTATIONS DOCUMENTAIRES
            // Frais de traitement administratif par dossier d'importation
            // ─────────────────────────────────────────────────────────────────

            [
                'code_tarif'        => 'DOC-BL',
                'libelle_service'   => 'Frais de traitement connaissement (B/L handling)',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 4800.00,
                'unite'             => 'forfait',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'DOC-VISA',
                'libelle_service'   => 'Visa et légalisation documents douaniers',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 3200.00,
                'unite'             => 'forfait',
                'tva_applicable'    => false,  // prestation douanière, hors TVA
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'DOC-CERTIF',
                'libelle_service'   => 'Certificat d\'inspection et de conformité',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 5500.00,
                'unite'             => 'forfait',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],

            // ─────────────────────────────────────────────────────────────────
            // SÉCURISATION — plombage et scellement
            // Obligatoire pour transit douanier (art. 167 Code des douanes DZ)
            // ─────────────────────────────────────────────────────────────────

            [
                'code_tarif'        => 'PLOMB-SCELL',
                'libelle_service'   => 'Scellement et plombage conteneur (sortie port)',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 3500.00,
                'unite'             => 'forfait',
                'tva_applicable'    => false,  // opération douanière
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'REPLOMB',
                'libelle_service'   => 'Remplombage après inspection douanière',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 2500.00,
                'unite'             => 'forfait',
                'tva_applicable'    => false,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],

            // ─────────────────────────────────────────────────────────────────
            // INSPECTIONS & CONTRÔLES
            // ─────────────────────────────────────────────────────────────────

            [
                'code_tarif'        => 'PESAGE',
                'libelle_service'   => 'Pesage sur bascule agréée (VGM — Verified Gross Mass)',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 2800.00,
                'unite'             => 'par conteneur',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'VISITE-DOUA',
                'libelle_service'   => 'Assistance visite douanière (ACRD) — présence transitaire',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 6500.00,
                'unite'             => 'forfait',
                'tva_applicable'    => false,  // prestation d'accompagnement douanier
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'INSP-CONT',
                'libelle_service'   => 'Inspection état conteneur (avant/après utilisation)',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 3000.00,
                'unite'             => 'par conteneur',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],

            // ─────────────────────────────────────────────────────────────────
            // SERVICES SPÉCIAUX
            // ─────────────────────────────────────────────────────────────────

            [
                'code_tarif'        => 'NETTOIEMENT',
                'libelle_service'   => 'Nettoyage conteneur après dépotage',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 4200.00,
                'unite'             => 'par conteneur',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'DEBRIEF-RF',
                'libelle_service'   => 'Relevé températures réfrigéré + rapport de froid',
                'type_conteneur_id' => null,  // applicable RF uniquement, géré contractuellement
                'montant_unitaire'  => 5000.00,
                'unite'             => 'par conteneur',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
            [
                'code_tarif'        => 'SUIVI-TRACK',
                'libelle_service'   => 'Suivi tracking GPS + notifications statut dossier',
                'type_conteneur_id' => null,
                'montant_unitaire'  => 1500.00,
                'unite'             => 'forfait',
                'tva_applicable'    => true,
                'date_debut'        => '2024-01-01',
                'date_fin'          => null,
                'actif'             => true,
            ],
        ];

        $now = now();
        $inserted = 0;

        foreach ($tarifs as &$tarif) {
            $tarif['created_at'] = $now;
            $tarif['updated_at'] = $now;

            // Skip if code already exists (idempotent)
            if (DB::table('tarifs_service')->where('code_tarif', $tarif['code_tarif'])->exists()) {
                $this->command->line('  → Skipped (exists): ' . $tarif['code_tarif']);
                continue;
            }

            DB::table('tarifs_service')->insert($tarif);
            $inserted++;
        }

        $this->command->info('');
        $this->command->info('✅ ' . $inserted . ' tarifs insérés sur ' . count($tarifs) . ' définis.');
        $this->command->info('📊 Total tarifs en base : ' . DB::table('tarifs_service')->count());
    }
}
