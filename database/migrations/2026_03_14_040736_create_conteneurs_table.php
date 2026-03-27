<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conteneurs', function (Blueprint $table) {
            $table->id();
            $table->string('numero_conteneur')->unique();        // ex: MSKU1234567
            $table->foreignId('type_id')->constrained('types_conteneur');
            $table->string('proprietaire');                      // NASHCO ou compagnie maritime

            // Dimensions et poids (infos fixes)
            $table->decimal('hauteur', 5, 2)->nullable();        // en mètres
            $table->decimal('largeur', 5, 2)->nullable();        // en mètres
            $table->decimal('poids_max', 8, 2)->nullable();      // en tonnes

            // État physique et statut actuel
            $table->string('etat_actuel')->default('BON_ETAT'); // BON_ETAT, ENDOMMAGE, EN_REPARATION
            $table->string('statut')->default('DISPONIBLE');
            // DISPONIBLE, RESERVE, AU_PORT, AU_DEPOT,
            // LIVRAISON_CLIENT, EN_MAINTENANCE, RETOURNE_VIDE

            // Pour conteneurs frigo
            $table->decimal('temperature', 5, 2)->nullable();

            // Date acquisition
            $table->date('date_achat')->nullable();

            $table->index('statut');
            $table->index('numero_conteneur');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conteneurs');
    }
};