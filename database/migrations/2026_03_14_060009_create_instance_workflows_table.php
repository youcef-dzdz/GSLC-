<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instance_workflows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('workflows')->cascadeOnDelete();
            $table->foreignId('conteneur_id')->constrained('conteneurs')->cascadeOnDelete();
            $table->foreignId('demande_id')->nullable()->constrained('demandes_import');
            $table->foreignId('bloque_par_user_id')->nullable()->constrained('users');

            $table->integer('etape_actuelle')->default(1);
            $table->date('date_debut');
            $table->date('date_fin_prevue');
            $table->date('date_fin_reelle')->nullable();
            $table->decimal('progression', 5, 2)->default(0);     // 0 à 100%

            $table->string('statut')->default('EN_COURS');
            // EN_COURS, TERMINE, BLOQUE, ANNULE

            $table->text('motif_blocage')->nullable();             // si BLOQUE

            $table->index('workflow_id');
            $table->index('conteneur_id');
            $table->index('statut');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instance_workflows');
    }
};
