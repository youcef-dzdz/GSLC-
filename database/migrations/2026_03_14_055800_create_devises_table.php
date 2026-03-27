<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('devises', function (Blueprint $table) {
            $table->id();
            $table->string('code', 3)->unique();                    // DZD, EUR, USD
            $table->string('nom');                                  // Dinar Algérien, Euro...
            $table->string('symbole', 5);                          // DA, €, $
            $table->decimal('taux_actuel', 10, 4);                 // taux par rapport au DZD
            $table->decimal('taux_base', 10, 4)->default(1.0000);  // DZD = 1 toujours
            $table->date('date_derniere_maj')->nullable();          // dernière mise à jour
            $table->string('source')->default('MANUEL');           // MANUEL, API
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('devises');
    }
};