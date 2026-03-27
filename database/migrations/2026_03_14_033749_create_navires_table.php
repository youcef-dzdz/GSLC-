<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('navires', function (Blueprint $table) {
            $table->id();
            $table->string('nom_navire');
            $table->string('numero_imo')->unique();                    // Format: IMO1234567
            $table->foreignId('pays_id')->nullable()->constrained('pays'); // pavillon (pays immatriculation)
            $table->string('compagnie_maritime')->nullable();           // CMA CGM, MSC, Maersk...
            $table->integer('capacite_teu');                           // capacité max en TEU
            $table->integer('annee_construction')->nullable();          // ex: 2015
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('navires');
    }
};