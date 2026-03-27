<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facture_id')->constrained('factures')->cascadeOnDelete();
            $table->foreignId('banque_id')->nullable()->constrained('banques');
            $table->foreignId('recu_par_user_id')->nullable()->constrained('users');

            $table->decimal('montant', 12, 2);
            $table->date('date_paiement');
            $table->string('methode')->default('VIREMENT');
            // ESPECES, VIREMENT, CHEQUE, CARTE

            $table->string('reference')->nullable();               // référence virement/chèque
            $table->string('statut')->default('ENREGISTRE');
            // ENREGISTRE, CONFIRME, REJETE

            $table->text('notes')->nullable();

            $table->index('facture_id');
            $table->index('statut');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};
