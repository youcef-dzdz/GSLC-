<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('banques', function (Blueprint $table) {
            $table->id();
            $table->string('nom')->unique();                        // BNA, CPA, BEA...
            $table->string('code_banque')->unique();                // code officiel banque
            $table->string('adresse')->nullable();
            $table->string('telephone')->nullable();
            $table->string('swift')->nullable();                    // code SWIFT international
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banques');
    }
};