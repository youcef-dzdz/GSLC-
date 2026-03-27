<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mouvement_conteneurs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conteneur_id')->constrained('conteneurs')->cascadeOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('clients');
            $table->foreignId('port_id')->nullable()->constrained('ports');
            $table->foreignId('depot_id')->nullable()->constrained('depots');
            $table->foreignId('emplacement_id')->nullable()->constrained('emplacements');
            $table->foreignId('responsable_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('type_mouvement');
            // ARRIVEE_PORT, SORTIE_PORT, ENTREE_DEPOT, SORTIE_DEPOT,
            // LIVRAISON_CLIENT, RETOUR_CLIENT, TRANSFERT,
            // MISE_EN_MAINTENANCE, SORTIE_MAINTENANCE

            $table->timestamp('date_mouvement')->useCurrent();
            $table->text('notes')->nullable();

            $table->index('conteneur_id');
            $table->index('date_mouvement');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mouvement_conteneurs');
    }
};