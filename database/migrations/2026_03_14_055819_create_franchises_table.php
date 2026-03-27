<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('franchises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('type_conteneur_id')->constrained('types_conteneur')->cascadeOnDelete();
            $table->foreignId('port_id')->nullable()->constrained('ports')->cascadeOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('clients')->cascadeOnDelete();

            $table->string('type_franchise')->default('DEMURRAGE');
            // DEMURRAGE → conteneur bloqué au port
            // DETENTION  → conteneur chez le client

            $table->integer('jours_franchise');                    // nombre de jours gratuits
            $table->text('description')->nullable();
            $table->date('date_debut_validite');
            $table->date('date_fin_validite')->nullable();
            $table->boolean('actif')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('franchises');
    }
};
