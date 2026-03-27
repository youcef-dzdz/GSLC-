<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('devis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demande_id')->constrained('demandes_import')->onDelete('cascade');
            $table->foreignId('cree_par_user_id')->nullable()->constrained('users');
            $table->foreignId('devis_precedent_id')->nullable()->constrained('devis');

            $table->string('numero_devis')->unique();               // DEV-2026-0001
            $table->integer('version')->default(1);                 // v1, v2, v3...

            $table->decimal('montant_ht', 15, 2);
            $table->decimal('tva', 15, 2);
            $table->decimal('total_ttc', 15, 2);

            $table->string('statut')->default('BROUILLON');
            // BROUILLON, ENVOYE, EN_NEGOCIATION,
            // ACCEPTE, REFUSE, EXPIRE

            $table->text('commentaire_client')->nullable();         // demande du client
            $table->text('commentaire_nashco')->nullable();         // réponse NASHCO

            $table->timestamp('date_envoi')->nullable();            // quand envoyé au client
            $table->date('date_expiration')->nullable();            // validité du devis

            $table->index('statut');
            $table->index('numero_devis');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('devis');
    }
};