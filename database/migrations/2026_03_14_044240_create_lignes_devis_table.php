<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lignes_devis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('devis_id')->constrained('devis')->cascadeOnDelete();
            $table->foreignId('tarif_service_id')->nullable()->constrained('tarifs_service')->nullOnDelete();

            $table->string('type_ligne')->default('LOCATION');
            // LOCATION, TRANSPORT, STOCKAGE, PENALITE, AUTRE

            $table->string('service');                              // nom du service
            $table->text('description')->nullable();                // détails
            $table->integer('quantite')->default(1);
            $table->decimal('prix_unitaire', 10, 2);
            $table->boolean('tva_applicable')->default(true);       // TVA 19% ou pas
            $table->decimal('total_ht', 12, 2);

            // Négociation par ligne
            $table->text('modification_proposee')->nullable();      // ce que le client demande
            $table->decimal('nouveau_prix_propose', 10, 2)->nullable(); // prix proposé par client

            $table->index('devis_id');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lignes_devis');
    }
};