<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ÉTAPE 1 — Dropper les anciennes tables (ordre FK)
        Schema::dropIfExists('user_permissions');
        Schema::dropIfExists('permission_role');   // table pivot Spatie héritée
        Schema::dropIfExists('permissions');

        // ÉTAPE 2 — Ajouter is_system à roles
        if (!Schema::hasColumn('roles', 'is_system')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->boolean('is_system')->default(false)->after('niveau');
            });
        }

        // ÉTAPE 3 — Recréer permissions
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('label', 150);
            $table->string('module', 50);
            $table->text('description')->nullable();
            $table->boolean('is_system')->default(false);
            $table->timestamps();
        });

        // ÉTAPE 4 — Créer role_permissions
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')
                  ->constrained('roles')->onDelete('cascade');
            $table->foreignId('permission_id')
                  ->constrained('permissions')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['role_id', 'permission_id']);
        });

        // ÉTAPE 5 — Recréer user_permissions
        Schema::create('user_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained('users')->onDelete('cascade');
            $table->foreignId('permission_id')
                  ->constrained('permissions')->onDelete('cascade');
            $table->boolean('granted')->default(true);
            $table->timestamps();
            $table->unique(['user_id', 'permission_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_permissions');
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn('is_system');
        });
    }
};
