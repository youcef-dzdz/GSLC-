<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CleanupSeeder extends Seeder
{
    public function run(): void
    {
        // ── STEP 1: Remap positions to correct department IDs ─────────────────

        $s1a = DB::table('positions')->where('department_id', 6)->update(['department_id' => 2]);
        $this->command->info("Step 1a — positions dept 6 → 2: {$s1a} row(s)");

        $s1b = DB::table('positions')->where('department_id', 7)->update(['department_id' => 1]);
        $this->command->info("Step 1b — positions dept 7 → 1: {$s1b} row(s)");

        $s1c = DB::table('positions')->where('department_id', 8)->update(['department_id' => 5]);
        $this->command->info("Step 1c — positions dept 8 → 5: {$s1c} row(s)");

        $s1d = DB::table('positions')->where('department_id', 9)->update(['department_id' => 4]);
        $this->command->info("Step 1d — positions dept 9 → 4: {$s1d} row(s)");

        $s1e = DB::table('positions')->where('department_id', 10)->update(['department_id' => 3]);
        $this->command->info("Step 1e — positions dept 10 → 3: {$s1e} row(s)");

        $s1f = DB::table('positions')
            ->whereIn('department_id', [11, 12, 13, 14, 15])
            ->update(['department_id' => null]);
        $this->command->info("Step 1f — positions dept 11-15 → null: {$s1f} row(s)");

        // ── STEP 2: Delete duplicate departments ──────────────────────────────

        $s2 = DB::table('departments')->whereIn('id', [6, 7, 8, 9, 10, 11, 12, 13, 14, 15])->delete();
        $this->command->info("Step 2  — departments deleted (ids 6-15): {$s2} row(s)");

        // ── STEP 3: Merge agent roles into one clean "Agent" role ─────────────

        DB::table('roles')->insertOrIgnore([
            'id'          => 7,
            'nom_role'    => 'Agent',
            'label'       => 'agent',
            'description' => 'Accès limité au module de son département',
            'niveau'      => 4,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);
        $this->command->info('Step 3a — role id=7 "Agent" inserted or already existed');

        $s3b = DB::table('users')->whereIn('role_id', [8, 9, 10, 11])->update(['role_id' => 7]);
        $this->command->info("Step 3b — users remapped to role 7: {$s3b} row(s)");

        $s3c = DB::table('roles')->whereIn('id', [8, 9, 10, 11])->delete();
        $this->command->info("Step 3c — old agent roles deleted: {$s3c} row(s)");

        // ── STEP 4: Clean up role names ───────────────────────────────────────

        $s4a = DB::table('roles')->where('id', 3)->update(['nom_role' => 'Responsable Commercial']);
        $this->command->info("Step 4a — role 3 renamed to Responsable Commercial: {$s4a} row(s)");

        $s4b = DB::table('roles')->where('id', 4)->update(['nom_role' => 'Responsable Logistique']);
        $this->command->info("Step 4b — role 4 renamed to Responsable Logistique: {$s4b} row(s)");

        $s4c = DB::table('roles')->where('id', 5)->update(['nom_role' => 'Responsable Financier']);
        $this->command->info("Step 4c — role 5 renamed to Responsable Financier: {$s4c} row(s)");

        $this->command->info('');
        $this->command->info('✅ CleanupSeeder terminé.');
    }
}
