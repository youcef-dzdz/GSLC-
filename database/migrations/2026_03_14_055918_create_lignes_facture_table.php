<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lignes_facture', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facture_id')->constrained('factures')->cascadeOnDelete();
            $table->foreignId('tarif_service_id')->nullable()->constrained('tarifs_service');
            $table->foreignId('calcul_penalite_id')->nullable()->constrained('calcul_penalites')->nullOnDelete();

            $table->string('type_ligne')->default('SERVICE');
            // SERVICE, PENALITE, TRANSPORT, STOCKAGE, AUTRE

            $table->text('description');
            $table->integer('quantite')->default(1);
            $table->decimal('prix_unitaire', 10, 2);
            $table->boolean('tva_applicable')->default(true);
            $table->decimal('total_ht', 12, 2);

            $table->index('facture_id');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lignes_facture');
    }
};
