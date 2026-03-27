<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lignes_contrat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrat_id')->constrained('contrats_import')->cascadeOnDelete();
            $table->foreignId('tarif_service_id')->nullable()->constrained('tarifs_service');
            $table->foreignId('type_conteneur_id')->nullable()->constrained('types_conteneur');

            $table->string('type_ligne')->default('LOCATION');
            // LOCATION, TRANSPORT, STOCKAGE, PENALITE, AUTRE

            $table->string('service');                              // nom du service
            $table->text('description')->nullable();
            $table->integer('quantite')->default(1);               // nombre d'unités
            $table->integer('nombre_conteneurs')->default(1);      // nombre de conteneurs
            $table->decimal('prix_unitaire', 10, 2);               // prix par unité
            $table->boolean('tva_applicable')->default(true);      // TVA 19% ?
            $table->decimal('total_ht', 12, 2);                    // total HT

            // Franchise négociée pour cette ligne
            $table->integer('franchise_jours')->default(0);        // jours gratuits
            $table->date('date_debut')->nullable();                 // début validité ligne
            $table->date('date_fin')->nullable();                   // fin validité ligne

            $table->index('contrat_id');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lignes_contrat');
    }
};