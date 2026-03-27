<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tarifs_service', function (Blueprint $table) {
            $table->id();
            $table->string('code_tarif')->unique();
            $table->string('libelle_service');
            $table->foreignId('type_conteneur_id')->nullable()->constrained('types_conteneur');
            $table->decimal('montant_unitaire', 15, 2);
            $table->string('unite');                              // par jour, par conteneur, par tonne
            $table->boolean('tva_applicable')->default(true);     // TVA 19% en Algérie
            $table->date('date_debut')->nullable();               // date de validité début
            $table->date('date_fin')->nullable();                 // date de validité fin
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tarifs_service');
    }
};