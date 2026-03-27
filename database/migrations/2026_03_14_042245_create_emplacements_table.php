<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('emplacements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('depot_id')->constrained('depots');
            $table->string('code_emplacement')->unique();        // ex: SEC-A1-L10-H3
            $table->string('zone');
            $table->string('allee')->nullable();
            $table->string('rangee')->nullable();
            $table->integer('hauteur_niveau')->default(1);
            $table->boolean('occupe')->default(false);           // renommé est_occupe → occupe
            $table->foreignId('conteneur_id')->nullable()->constrained('conteneurs');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emplacements');
    }
};