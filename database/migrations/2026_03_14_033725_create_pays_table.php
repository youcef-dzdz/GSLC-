<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pays', function (Blueprint $table) {
            $table->id();
            $table->string('nom_pays')->unique();
            $table->string('code_iso', 3)->unique();         // DZ, FR, US (ISO 3166-1 alpha-2 = max 2, alpha-3 = max 3)
            $table->string('indicatif_tel', 10)->nullable(); // +213, +33
            $table->string('devise_defaut', 10)->nullable(); // DZD, EUR, USD
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pays');
    }
};