<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rapports_inspection', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conteneur_id')->constrained('conteneurs')->cascadeOnDelete();
            $table->foreignId('inspecteur_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('contrat_id')->nullable()->constrained('contrats_import');

            $table->dateTime('date_inspection');
            $table->string('etat_conteneur')->default('BON');
            // BON, USAGE, ENDOMMAGE, TRES_ENDOMMAGE

            $table->string('action_requise')->default('AUCUNE');
            // AUCUNE, NETTOYAGE, REPARATION, MISE_AU_REBUT

            $table->decimal('cout_reparation_estime', 15, 2)->nullable();
            $table->text('observations')->nullable();
            $table->json('photos')->nullable();

            $table->index('conteneur_id');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rapports_inspection');
    }
};