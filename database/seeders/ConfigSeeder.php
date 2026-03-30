<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ConfigSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('configuration_systeme')->truncate();

        $configs = [
            [
                'cle'         => 'contract_approval_threshold',
                'valeur'      => '5000000',
                'type_valeur' => 'integer',
                'description' => 'Montant en DZD au-dessus duquel un contrat nécessite l\'approbation du Directeur',
                'modifiable'  => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'cle'         => 'tva_rate',
                'valeur'      => '0.19',
                'type_valeur' => 'float',
                'description' => 'Taux de TVA applicable sur les factures (19% en Algérie)',
                'modifiable'  => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'cle'         => 'default_franchise_days',
                'valeur'      => '7',
                'type_valeur' => 'integer',
                'description' => 'Nombre de jours de franchise par défaut si non spécifié dans le contrat',
                'modifiable'  => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'cle'         => 'otp_expiry_minutes',
                'valeur'      => '10',
                'type_valeur' => 'integer',
                'description' => 'Durée de validité du code OTP de signature (en minutes)',
                'modifiable'  => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'cle'         => 'max_negotiation_rounds',
                'valeur'      => '3',
                'type_valeur' => 'integer',
                'description' => 'Nombre maximum de rounds de négociation pour un devis',
                'modifiable'  => false,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'cle'         => 'surestarie_taux_defaut',
                'valeur'      => '5000',
                'type_valeur' => 'float',
                'description' => 'Taux journalier par défaut pour le calcul des surestaries (DZD/jour)',
                'modifiable'  => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'cle'         => 'cheque_depot_deadline_days',
                'valeur'      => '5',
                'type_valeur' => 'integer',
                'description' => 'Délai en jours pour déposer le chèque caution après signature du contrat',
                'modifiable'  => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'cle'         => 'invoice_overdue_legal_days',
                'valeur'      => '30',
                'type_valeur' => 'integer',
                'description' => 'Nombre de jours après échéance avant déclenchement de la mise en demeure',
                'modifiable'  => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'cle'         => 'app_name',
                'valeur'      => 'GSLC — Gestion et Suivi de Location de Conteneurs',
                'type_valeur' => 'string',
                'description' => 'Nom complet de l\'application affiché dans les emails et PDF',
                'modifiable'  => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'cle'         => 'company_name',
                'valeur'      => 'EPE NASHCO Spa',
                'type_valeur' => 'string',
                'description' => 'Raison sociale de l\'entreprise — utilisée sur les factures et contrats PDF',
                'modifiable'  => false,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'cle'         => 'company_address',
                'valeur'      => 'Port de Mostaganem, Mostaganem 27000, Algérie',
                'type_valeur' => 'string',
                'description' => 'Adresse postale officielle — utilisée sur les documents légaux',
                'modifiable'  => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ];

        DB::table('configuration_systeme')->insert($configs);

        $this->command->info('✅ ' . count($configs) . ' paramètres de configuration créés.');
    }
}
