<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // ── ÉTAPE A — Insérer les 44 permissions ─────────────────────────────────

        $permissions = [
            // Module admin (21)
            ['name' => 'users.view',               'label' => 'Voir les utilisateurs',              'module' => 'admin'],
            ['name' => 'users.create',             'label' => 'Créer un utilisateur',               'module' => 'admin'],
            ['name' => 'users.edit',               'label' => 'Modifier un utilisateur',            'module' => 'admin'],
            ['name' => 'users.delete',             'label' => 'Supprimer un utilisateur',           'module' => 'admin'],
            ['name' => 'users.block',              'label' => 'Bloquer/débloquer un utilisateur',   'module' => 'admin'],
            ['name' => 'users.reset_password',     'label' => 'Réinitialiser un mot de passe',      'module' => 'admin'],
            ['name' => 'departments.view',         'label' => 'Voir les départements',              'module' => 'admin'],
            ['name' => 'departments.manage',       'label' => 'Gérer les départements',             'module' => 'admin'],
            ['name' => 'positions.view',           'label' => 'Voir les postes',                    'module' => 'admin'],
            ['name' => 'positions.manage',         'label' => 'Gérer les postes',                   'module' => 'admin'],
            ['name' => 'roles.view',               'label' => 'Voir les rôles',                     'module' => 'admin'],
            ['name' => 'roles.manage',             'label' => 'Gérer les rôles',                    'module' => 'admin'],
            ['name' => 'permissions.view',         'label' => 'Voir les permissions',               'module' => 'admin'],
            ['name' => 'permissions.manage',       'label' => 'Gérer les permissions',              'module' => 'admin'],
            ['name' => 'config.view',              'label' => 'Voir la configuration',              'module' => 'admin'],
            ['name' => 'config.manage',            'label' => 'Gérer la configuration',             'module' => 'admin'],
            ['name' => 'audit.view',               'label' => 'Voir le journal d\'audit',           'module' => 'admin'],
            ['name' => 'audit.export',             'label' => 'Exporter le journal d\'audit',       'module' => 'admin'],
            ['name' => 'registrations.view',       'label' => 'Voir les demandes d\'inscription',   'module' => 'admin'],
            ['name' => 'registrations.approve',    'label' => 'Approuver/rejeter une inscription',  'module' => 'admin'],
            ['name' => 'notifications.view',       'label' => 'Voir les notifications',             'module' => 'admin'],

            // Module commercial (8)
            ['name' => 'clients.view',             'label' => 'Voir les clients',                   'module' => 'commercial'],
            ['name' => 'clients.manage',           'label' => 'Gérer les clients',                  'module' => 'commercial'],
            ['name' => 'quotes.view',              'label' => 'Voir les devis',                     'module' => 'commercial'],
            ['name' => 'quotes.create',            'label' => 'Créer un devis',                     'module' => 'commercial'],
            ['name' => 'quotes.approve',           'label' => 'Approuver un devis',                 'module' => 'commercial'],
            ['name' => 'contracts.view',           'label' => 'Voir les contrats',                  'module' => 'commercial'],
            ['name' => 'contracts.manage',         'label' => 'Gérer les contrats',                 'module' => 'commercial'],
            ['name' => 'contracts.approve',        'label' => 'Approuver un contrat',               'module' => 'commercial'],

            // Module logistique (6)
            ['name' => 'containers.view',          'label' => 'Voir les conteneurs',                'module' => 'logistique'],
            ['name' => 'containers.manage',        'label' => 'Gérer les conteneurs',               'module' => 'logistique'],
            ['name' => 'movements.view',           'label' => 'Voir les mouvements',                'module' => 'logistique'],
            ['name' => 'movements.create',         'label' => 'Enregistrer un mouvement',           'module' => 'logistique'],
            ['name' => 'surestaries.view',         'label' => 'Voir les surestaries',               'module' => 'logistique'],
            ['name' => 'surestaries.calculate',    'label' => 'Calculer les surestaries',           'module' => 'logistique'],

            // Module finance (6)
            ['name' => 'invoices.view',            'label' => 'Voir les factures',                  'module' => 'finance'],
            ['name' => 'invoices.manage',          'label' => 'Gérer les factures',                 'module' => 'finance'],
            ['name' => 'payments.view',            'label' => 'Voir les paiements',                 'module' => 'finance'],
            ['name' => 'payments.manage',          'label' => 'Gérer les paiements',                'module' => 'finance'],
            ['name' => 'rates.view',               'label' => 'Voir les taux de change',            'module' => 'finance'],
            ['name' => 'rates.manage',             'label' => 'Gérer les taux de change',           'module' => 'finance'],

            // Module direction (3)
            ['name' => 'reports.view',             'label' => 'Voir les rapports',                  'module' => 'direction'],
            ['name' => 'analytics.view',           'label' => 'Voir les analyses',                  'module' => 'direction'],
            ['name' => 'dashboard.global',         'label' => 'Accéder au tableau de bord global',  'module' => 'direction'],
        ];

        foreach ($permissions as $perm) {
            DB::table('permissions')->updateOrInsert(
                ['name' => $perm['name']],
                [
                    'name'        => $perm['name'],
                    'label'       => $perm['label'],
                    'module'      => $perm['module'],
                    'description' => null,
                    'is_system'   => false,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]
            );
        }

        // ── ÉTAPE B — Marquer les rôles système ──────────────────────────────────
        DB::table('roles')->whereIn('id', [1, 6])->update(['is_system' => true]);

        // ── ÉTAPE C — Assigner les permissions par rôle ───────────────────────────

        // Helper : retourne les IDs de permissions pour une liste de noms
        $ids = function (array $names): array {
            return DB::table('permissions')
                ->whereIn('name', $names)
                ->pluck('id')
                ->toArray();
        };

        // Toutes les 44 permissions
        $allPermissions = DB::table('permissions')->pluck('id')->toArray();

        $assignments = [
            // admin (id=1) → toutes
            1  => $allPermissions,

            // it_agent (id=12)
            12 => $ids([
                'users.view', 'users.create', 'users.edit', 'users.block',
                'users.reset_password', 'departments.view', 'positions.view',
                'roles.view', 'audit.view', 'registrations.view', 'notifications.view',
            ]),

            // directeur (id=2)
            2  => $ids([
                'users.view', 'departments.view', 'positions.view',
                'clients.view', 'quotes.view', 'contracts.view',
                'containers.view', 'movements.view', 'surestaries.view',
                'invoices.view', 'payments.view', 'rates.view',
                'reports.view', 'analytics.view', 'dashboard.global',
                'audit.view', 'registrations.view', 'notifications.view',
            ]),

            // commercial (id=3)
            3  => $ids([
                'clients.view', 'clients.manage',
                'quotes.view', 'quotes.create', 'quotes.approve',
                'contracts.view', 'contracts.manage', 'contracts.approve',
                'notifications.view',
            ]),

            // logistique (id=4)
            4  => $ids([
                'containers.view', 'containers.manage',
                'movements.view', 'movements.create',
                'surestaries.view', 'surestaries.calculate',
                'notifications.view',
            ]),

            // financier (id=5)
            5  => $ids([
                'invoices.view', 'invoices.manage',
                'payments.view', 'payments.manage',
                'rates.view', 'rates.manage',
                'notifications.view',
            ]),

            // client (id=6) → aucune
            // agent (id=7)  → aucune
        ];

        foreach ($assignments as $roleId => $permissionIds) {
            foreach ($permissionIds as $permissionId) {
                DB::table('role_permissions')->updateOrInsert(
                    ['role_id' => $roleId, 'permission_id' => $permissionId],
                    [
                        'role_id'       => $roleId,
                        'permission_id' => $permissionId,
                        'created_at'    => now(),
                        'updated_at'    => now(),
                    ]
                );
            }
        }
    }
}
