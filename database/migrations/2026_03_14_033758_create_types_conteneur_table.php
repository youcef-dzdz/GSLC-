<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('types_conteneur', function (Blueprint $table) {
            $table->id();
            $table->string('code_type')->unique();              // 20GP, 40HC, 40RF...
            $table->string('libelle');                          // ex: 40 pieds High Cube
            $table->integer('longueur_pieds');                  // 20, 40, 45
            $table->boolean('est_frigo')->default(false);       // REEFER ou pas
            $table->decimal('poids_tare', 8, 2);               // poids vide en tonnes
            $table->decimal('charge_utile', 8, 2)->nullable();  // poids max marchandise en tonnes
            $table->decimal('volume', 8, 2)->nullable();        // volume en m³
            $table->decimal('tarif_journalier_defaut', 10, 2)->default(0); // prix/jour en DZD
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('types_conteneur');
    }
};