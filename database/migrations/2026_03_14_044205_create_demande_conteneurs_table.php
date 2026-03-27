<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demande_conteneurs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demande_id')->constrained('demandes_import')->onDelete('cascade');
            $table->foreignId('type_conteneur_id')->constrained('types_conteneur');
            $table->foreignId('conteneur_id')->nullable()->constrained('conteneurs');
            // null au début, rempli quand NASHCO affecte un conteneur réel
            $table->integer('nombre_unites');
            $table->string('statut')->default('DEMANDE');
            // DEMANDE → AFFECTE → LIVRE → RETOURNE
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demande_conteneurs');
    }
};