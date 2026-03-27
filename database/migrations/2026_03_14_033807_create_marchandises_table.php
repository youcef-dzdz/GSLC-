<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marchandises', function (Blueprint $table) {
            $table->id();
            $table->string('code_hs')->unique();                    // Code Système Harmonisé douane
            $table->string('libelle');                              // ex: Fruits frais
            $table->string('classe_dangereuse')->nullable();        // ex: Classe 3 (liquides inflammables)
            $table->boolean('necessite_frigo')->default(false);     // nécessite conteneur REEFER
            $table->decimal('temperature_min', 5, 2)->nullable();   // ex: -20.00 °C
            $table->decimal('temperature_max', 5, 2)->nullable();   // ex: +8.00 °C
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marchandises');
    }
};