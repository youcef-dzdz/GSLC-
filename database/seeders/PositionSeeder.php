<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PositionSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Ensure required departments exist (append only, never delete) ──────

        $deptNames = [
            'Direction',
            'Administration',
            'Logistique',
            'Finance',
            'Commercial',
            'Operations',
            'Maintenance & Repair',
            'Safety & Compliance',
            'Sales',
            'Customer Support',
        ];

        foreach ($deptNames as $name) {
            $code = strtoupper(preg_replace('/[^A-Z0-9]/i', '_', $name));
            DB::table('departments')->insertOrIgnore([
                'name'       => $name,
                'code'       => $code,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Build dept name → id map
        $depts = DB::table('departments')->pluck('id', 'name');

        // ── 2. Seed positions ─────────────────────────────────────────────────────

        $positions = [
            // Direction / Management
            ['title' => 'Directeur Général',         'department' => 'Direction'],
            ['title' => 'Directeur des Opérations',  'department' => 'Operations'],
            ['title' => 'Directeur Commercial',      'department' => 'Commercial'],
            ['title' => 'Directeur Financier',       'department' => 'Finance'],
            ['title' => 'Directeur Logistique',      'department' => 'Logistique'],
            ['title' => 'Directeur Technique',       'department' => 'Maintenance & Repair'],

            // Administration & Systems
            ['title' => 'Administrateur Systèmes',  'department' => 'Administration'],
            ['title' => 'Responsable RH',            'department' => 'Administration'],
            ['title' => 'Assistant de Direction',    'department' => 'Administration'],

            // Responsables (Managers)
            ['title' => 'Responsable Logistique',       'department' => 'Logistique'],
            ['title' => 'Responsable Finance',          'department' => 'Finance'],
            ['title' => 'Responsable Commercial',       'department' => 'Commercial'],
            ['title' => 'Responsable Maintenance',      'department' => 'Maintenance & Repair'],
            ['title' => 'Responsable Sécurité',        'department' => 'Safety & Compliance'],
            ['title' => 'Responsable Parc Conteneurs', 'department' => 'Operations'],
            ['title' => 'Responsable Clientèle',       'department' => 'Customer Support'],

            // Agents / Exécutants
            ['title' => 'Agent Commercial',          'department' => 'Commercial'],
            ['title' => 'Agent Logistique',          'department' => 'Logistique'],
            ['title' => 'Agent Finance',             'department' => 'Finance'],
            ['title' => 'Agent Maintenance',         'department' => 'Maintenance & Repair'],
            ['title' => 'Agent SAV',                 'department' => 'Customer Support'],
            ['title' => 'Agent Contrôle Qualité',   'department' => 'Safety & Compliance'],
            ['title' => 'Agent Planification',       'department' => 'Operations'],
            ['title' => 'Agent Location',            'department' => 'Sales'],

            // Other titles
            ['title' => 'Coordinateur Transport',   'department' => 'Logistique'],
            ['title' => 'Analyste Financier',        'department' => 'Finance'],
            ['title' => 'Chargé de Clientèle',      'department' => 'Commercial'],
            ['title' => 'Inspecteur Conteneurs',     'department' => 'Maintenance & Repair'],
        ];

        foreach ($positions as $row) {
            $deptId = $depts[$row['department']] ?? null;
            DB::table('positions')->updateOrInsert(
                ['title' => $row['title']],
                [
                    'department_id' => $deptId,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]
            );
        }

        $this->command->info('✅ ' . count($positions) . ' postes insérés/mis à jour.');

        // ── 3. Link existing users: migrate free-text position → position_id ─────

        $allPositions = DB::table('positions')->pluck('id', 'title');
        $users        = DB::table('users')
            ->whereNotNull('position')
            ->whereNull('position_id')
            ->get(['id', 'position']);

        $linked = 0;
        foreach ($users as $user) {
            $title = trim($user->position);
            if ($title === '') {
                continue;
            }

            // Exact match first
            if (isset($allPositions[$title])) {
                DB::table('users')->where('id', $user->id)->update(['position_id' => $allPositions[$title]]);
                $linked++;
                continue;
            }

            // Case-insensitive match
            $match = $allPositions->first(fn($id, $t) => strtolower($t) === strtolower($title));
            if ($match) {
                DB::table('users')->where('id', $user->id)->update(['position_id' => $match]);
                $linked++;
                continue;
            }

            // No match — create a new position with no department
            $newId = DB::table('positions')->insertGetId([
                'title'      => $title,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            DB::table('users')->where('id', $user->id)->update(['position_id' => $newId]);
            $linked++;
        }

        $this->command->info("✅ {$linked} utilisateur(s) liés à un poste normalisé.");
    }
}
