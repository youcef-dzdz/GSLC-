<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $tables = [
            'banques',
            'franchises',
            'tarifs_service',
            'types_conteneur',
            'depots',
            'terminaux',
            'ports',
            'positions',
        ];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->softDeletes();
            });
        }
    }

    public function down(): void
    {
        $tables = [
            'banques',
            'franchises',
            'tarifs_service',
            'types_conteneur',
            'depots',
            'terminaux',
            'ports',
            'positions',
        ];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->dropSoftDeletes();
            });
        }
    }
};
