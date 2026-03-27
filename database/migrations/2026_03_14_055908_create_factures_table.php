<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('factures', function (Blueprint $table) {
            $table->id();
            $table->string('numero_facture')->unique();             // FAC-2026-0001
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignId('contrat_id')->constrained('contrats_import')->cascadeOnDelete();
            $table->foreignId('devise_id')->constrained('devises')->cascadeOnDelete();
            $table->foreignId('cree_par_user_id')->nullable()->constrained('users');

            $table->string('type_facture')->default('STANDARD');
            // STANDARD → facture normale
            // PENALITE  → facture pénalités
            // AVOIR     → avoir sur facture

            $table->date('date_emission');
            $table->date('date_echeance');
            $table->decimal('montant_ht', 12, 2);
            $table->decimal('tva', 12, 2);
            $table->decimal('montant_ttc', 12, 2);
            $table->decimal('montant_paye', 12, 2)->default(0);    // montant déjà payé
            $table->decimal('montant_restant', 12, 2)->default(0); // reste à payer

            $table->string('statut')->default('EMISE');
            // EMISE, ENVOYEE, PARTIELLEMENT_PAYEE,
            // PAYEE, LITIGE, ANNULEE

            $table->text('conditions_paiement')->nullable();
            $table->text('notes')->nullable();

            $table->index('client_id');
            $table->index('statut');
            $table->index('numero_facture');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('factures');
    }
};
