<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('');
        $this->command->info('🚀 Démarrage du seeding GSLC...');
        $this->command->info('');

        // ── LAYER 1 — Foundation (production-safe) ────────────────────────────
        $this->command->info('── Layer 1 : Données de référence ──');

        $this->call(RoleSeeder::class);       // 1. roles (no dependencies)
        $this->call(PermissionSeeder::class); // 1b. permissions + role_permissions
        $this->call(PaysSeeder::class);       // 2. pays (no dependencies)
        $this->call(BanqueSeeder::class);     // 3. banques (no dependencies)
        $this->call(DeviseSeeder::class);     // 4. devises (no dependencies)
        $this->call(ConfigSeeder::class);     // 5. configuration_systeme (no dependencies)
        $this->call(TypeConteneurSeeder::class); // 6. types_conteneur (no dependencies)
        $this->call(PortSeeder::class);       // 7. ports (needs pays)
        $this->call(FranchiseSeeder::class);  // 8. franchises (no dependencies)
        $this->call(PenaliteSeeder::class);   // 9. penalites (needs types_conteneur, devises)
        $this->call(WorkflowSeeder::class);   // 10. workflows + etapes (no dependencies)

        $this->command->info('');

        // ── LAYER 2 — Dev/Test data ───────────────────────────────────────────
        $this->command->info('── Layer 2 : Données de test ──');

        $this->call(UserSeeder::class);       // 9. users + clients (needs roles, pays)
        $this->call(PositionSeeder::class);  // 10. positions table + link existing users

        $this->command->info('');
        $this->command->info('✅ Seeding terminé avec succès !');
        $this->command->info('');
        $this->command->info('Comptes de test disponibles (mot de passe: password):');
        $this->command->table(
            ['Email', 'Rôle', 'Accès'],
            [
                ['admin@nashco.dz',      'Administrateur',  '/admin/dashboard'],
                ['directeur@nashco.dz',  'Directeur',       '/director/dashboard'],
                ['commercial@nashco.dz', 'Commercial',      '/commercial/dashboard'],
                ['logistique@nashco.dz', 'Logistique',      '/logistics/dashboard'],
                ['financier@nashco.dz',  'Financier',       '/finance/dashboard'],
                ['client@nashco.dz',     'Client',          '/client/dashboard'],
            ]
        );
    }
}
