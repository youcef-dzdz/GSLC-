<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calcul_penalites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conteneur_id')->constrained('conteneurs')->cascadeOnDelete();
            $table->foreignId('contrat_id')->constrained('contrats_import')->cascadeOnDelete();
            $table->foreignId('penalite_id')->nullable()->constrained('penalites');
            $table->foreignId('franchise_id')->nullable()->constrained('franchises');
            $table->foreignId('cree_par_user_id')->nullable()->constrained('users');

            $table->string('type_penalite')->default('DEMURRAGE');
            // DEMURRAGE, DETENTION

            $table->date('date_debut');                            // début des pénalités
            $table->date('date_fin');                              // fin des pénalités
            $table->integer('jours_franchise_appliques')->default(0); // jours gratuits déduits
            $table->integer('jours_retard');                       // jours facturables
            $table->decimal('tarif_applique', 10, 2);             // tarif/jour appliqué
            $table->decimal('montant_ht', 12, 2);
            $table->decimal('tva', 12, 2);
            $table->decimal('montant_ttc', 12, 2);
            $table->string('statut')->default('CALCULE');
            // CALCULE, FACTURE, PAYE, ANNULE

            $table->index('conteneur_id');
            $table->index('contrat_id');
            $table->index('statut');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calcul_penalites');
    }
};
