<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('roles')->where('label', 'commercial')->update(['nom_role' => 'Service Commercial']);
        DB::table('roles')->where('label', 'logistique')->update(['nom_role' => 'Service Logistique']);
        DB::table('roles')->where('label', 'financier')->update(['nom_role'  => 'Service Financier']);
        DB::table('roles')->where('label', 'directeur')->update(['nom_role'  => 'Direction Générale']);
    }

    public function down(): void
    {
        DB::table('roles')->where('label', 'commercial')->update(['nom_role' => 'Responsable Commercial']);
        DB::table('roles')->where('label', 'logistique')->update(['nom_role' => 'Responsable Logistique']);
        DB::table('roles')->where('label', 'financier')->update(['nom_role'  => 'Responsable Financier']);
        DB::table('roles')->where('label', 'directeur')->update(['nom_role'  => 'Directeur']);
    }
};
