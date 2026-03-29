<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Avenants = amendments to existing contracts (contrats_import).
     * An avenant modifies specific terms of an active contract without
     * replacing it entirely. Each avenant must be signed by the client
     * via the same OTP mechanism as the original contract.
     */
    public function up(): void
    {
        Schema::create('avenants', function (Blueprint $table) {
            $table->id();

            // Parent contract
            $table->foreignId('contrat_id')
                  ->constrained('contrats_import')
                  ->cascadeOnDelete();

            // Sequential number within the contract (e.g. Avenant N°1, N°2...)
            $table->unsignedSmallInteger('numero_avenant')->default(1);

            // What is being modified
            $table->enum('type_modification', [
                'PROLONGATION_DUREE',     // Extend the rental duration
                'AJOUT_CONTENEURS',       // Add more containers
                'RETRAIT_CONTENEURS',     // Remove containers
                'MODIFICATION_TARIF',     // Price adjustment (commercial decision)
                'MODIFICATION_CONDITIONS',// General T&C change
                'AUTRE',
            ]);

            $table->text('description');  // Detailed explanation of what changes

            // What the avenant replaces / overrides in the original contract
            $table->json('modifications')->nullable();
            // e.g. { "date_fin": "2025-06-30", "nombre_conteneurs": 5 }

            // Workflow state
            $table->enum('statut', [
                'BROUILLON',              // Being drafted by NASHCO
                'EN_ATTENTE_SIGNATURE',   // Sent to client for OTP signature
                'SIGNE',                  // Client signed — avenant is active
                'REFUSE',                 // Client refused
                'ANNULE',                 // Cancelled by NASHCO
            ])->default('BROUILLON');

            // Who at NASHCO created this avenant
            $table->foreignId('cree_par_user_id')
                  ->constrained('users');

            // Client OTP signature fields (same mechanism as contrats_import)
            $table->string('signature_ip', 45)->nullable();
            $table->string('signature_user_agent')->nullable();
            $table->string('signature_otp_token', 6)->nullable();
            $table->timestamp('signe_le')->nullable();

            // If client refused
            $table->text('motif_refus')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // A contract can have multiple avenants, each with a unique number
            $table->unique(['contrat_id', 'numero_avenant']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avenants');
    }
};
