<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contrats_import', function (Blueprint $table) {
            $table->id();
            $table->string('numero_contrat')->unique();              // CTR-2026-0001
            $table->foreignId('devis_id')->constrained('devis')->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignId('demande_id')->constrained('demandes_import');
            $table->foreignId('cree_par_user_id')->nullable()->constrained('users');
            $table->foreignId('conditions_generales_id')->nullable()->constrained('conditions_generales');

            // Dates
            $table->date('date_debut');
            $table->date('date_fin');

            // Statuts complets
            $table->string('statut')->default('EN_ATTENTE_SIGNATURE');
            // EN_ATTENTE_SIGNATURE
            // SIGNE_EN_ATTENTE_CAUTION
            // CAUTION_RECUE_EN_VERIFICATION
            // ACTIF
            // TERMINE
            // ANNULE
            // RESILIE

            // Clauses
            $table->text('clauses_renouvellement')->nullable();
            $table->text('clauses_resiliation')->nullable();
            $table->text('clauses_speciales')->nullable();           // clauses additionnelles

            // Signature électronique OTP
            $table->string('type_signature')->default('EN_LIGNE');  // EN_LIGNE, PHYSIQUE
            $table->timestamp('date_signature')->nullable();
            $table->string('ip_signature')->nullable();
            $table->string('user_agent_signature')->nullable();
            $table->string('token_signature')->nullable()->unique();
            $table->boolean('conditions_acceptees')->default(false);
            $table->timestamp('date_acceptation_conditions')->nullable();
            $table->string('ip_acceptation_conditions')->nullable();

            // Caution bancaire — chèque certifié
            $table->decimal('montant_caution', 15, 2)->nullable();
            $table->string('statut_caution')->default('EN_ATTENTE');
            // EN_ATTENTE, RECU, VERIFIE, RESTITUE, ENCAISSE

            $table->string('numero_cheque')->nullable();
            $table->foreignId('banque_id')->nullable()->constrained('banques');
            $table->decimal('montant_cheque', 15, 2)->nullable();
            $table->date('date_cheque')->nullable();
            $table->boolean('est_certifie')->default(false);
            $table->date('date_depot_cheque')->nullable();
            $table->date('date_limite_depot')->nullable();           // J+7 après signature
            $table->foreignId('recu_par_user_id')->nullable()->constrained('users');
            $table->timestamp('date_verification_caution')->nullable();
            $table->foreignId('verifie_caution_par_user_id')->nullable()->constrained('users');

            // Fin contrat
            $table->date('date_restitution_cheque')->nullable();
            $table->date('date_encaissement_cheque')->nullable();
            $table->text('motif_encaissement')->nullable();

            $table->index('client_id');
            $table->index('statut');
            $table->index('numero_contrat');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contrats_import');
    }
};
