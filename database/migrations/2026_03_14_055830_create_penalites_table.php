<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('penalites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('type_conteneur_id')->constrained('types_conteneur')->cascadeOnDelete();
            $table->foreignId('devise_id')->constrained('devises')->cascadeOnDelete();

            $table->string('type')->default('DEMURRAGE');
            // DEMURRAGE → au port
            // DETENTION  → chez client

            $table->decimal('tarif_journalier', 10, 2);            // tarif par jour
            $table->integer('tranche_debut')->default(1);          // jour de début tranche
            $table->integer('tranche_fin')->nullable();            // jour de fin tranche
            // ex: tranche 1-10j = 5000 DZD/j
            //     tranche 11-20j = 8000 DZD/j
            //     tranche 21+j  = 12000 DZD/j

            $table->date('date_debut_validite');
            $table->date('date_fin_validite')->nullable();
            $table->boolean('actif')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('penalites');
    }
};
