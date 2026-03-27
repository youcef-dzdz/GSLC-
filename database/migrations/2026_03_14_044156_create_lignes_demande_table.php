<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lignes_demande', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demande_id')->constrained('demandes_import')->onDelete('cascade');
            $table->foreignId('marchandise_id')->constrained('marchandises');
            $table->foreignId('type_conteneur_id')->nullable()->constrained('types_conteneur');
            $table->foreignId('pays_origine_id')->nullable()->constrained('pays');

            $table->integer('quantite');                            // nombre d'unités
            $table->decimal('poids_total', 10, 2);                 // en tonnes
            $table->decimal('volume', 10, 2)->nullable();           // en m³
            $table->string('unite')->default('UNITE');              // UNITE, KG, TONNE, M3
            $table->text('description')->nullable();                // description douanière

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lignes_demande');
    }
};