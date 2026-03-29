<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Restitutions_caution = full lifecycle history of the security cheque deposit
     * tied to each contrat_import.
     *
     * Business flow:
     *   1. DEPOT          — Client physically brings certified cheque to NASHCO office
     *   2. VERIFICATION   — NASHCO agent verifies cheque (bank, amount, certification)
     *   3. ENCAISSEMENT   — If client defaults, NASHCO cashes the cheque
     *   4. RESTITUTION    — If contract closes cleanly, cheque is returned to client
     *   5. RESTITUTION_PARTIELLE — Partial return (e.g. some surestaries deducted)
     *
     * One contract can have at most one active cheque at a time, but the history
     * table records every action taken on that cheque.
     */
    public function up(): void
    {
        Schema::create('restitutions_caution', function (Blueprint $table) {
            $table->id();

            // The contract this cheque belongs to
            $table->foreignId('contrat_id')
                  ->constrained('contrats_import')
                  ->cascadeOnDelete();

            // The action being recorded
            $table->enum('type_action', [
                'DEPOT',                  // Client deposited the cheque at NASHCO
                'VERIFICATION',           // NASHCO agent verified and validated the cheque
                'REJET',                  // Cheque rejected (not certified, wrong amount, etc.)
                'ENCAISSEMENT',           // NASHCO cashed the cheque (client defaulted)
                'RESTITUTION',            // Full cheque returned to client
                'RESTITUTION_PARTIELLE',  // Partial return (surestaries or damages deducted)
            ]);

            // Cheque financial details at time of this action
            $table->decimal('montant', 15, 2);   // Amount on the cheque
            $table->string('devise', 3)->default('DZD');

            // If RESTITUTION_PARTIELLE — how much was returned vs deducted
            $table->decimal('montant_restitue', 15, 2)->nullable();
            $table->decimal('montant_retenu', 15, 2)->nullable();
            $table->text('motif_retenu')->nullable(); // Reason for deduction

            // Date this action occurred (may differ from created_at for manual entry)
            $table->date('date_action');

            // Cheque details (can change if cheque is replaced)
            $table->string('numero_cheque', 60)->nullable();
            $table->foreignId('banque_id')
                  ->nullable()
                  ->constrained('banques')
                  ->nullOnDelete();

            // For RESTITUTION: new cheque number issued to client
            $table->string('numero_cheque_restitution', 60)->nullable();

            // Free text note (required for REJET and ENCAISSEMENT)
            $table->text('motif')->nullable();

            // NASHCO agent who performed this action
            $table->foreignId('traite_par_user_id')
                  ->constrained('users');

            // Optional supporting document (e.g. signed receipt, bank confirmation)
            $table->foreignId('document_id')
                  ->nullable()
                  ->constrained('documents')
                  ->nullOnDelete();

            $table->timestamps();

            // Chronological lookup per contract
            $table->index(['contrat_id', 'date_action']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restitutions_caution');
    }
};
