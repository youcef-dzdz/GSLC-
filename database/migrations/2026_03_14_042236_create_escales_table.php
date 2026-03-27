<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('escales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('navire_id')->constrained('navires');
            $table->foreignId('port_id')->constrained('ports');
            $table->foreignId('terminal_id')->nullable()->constrained('terminaux');
            $table->foreignId('responsable_id')->nullable()->constrained('users');
            $table->string('numero_escale')->unique();               // ex: ESC-2026-0045
            $table->dateTime('date_arrivee_prevue');
            $table->dateTime('date_depart_prevue');
            $table->dateTime('date_arrivee_reelle')->nullable();     // rempli à l'arrivée
            $table->dateTime('date_depart_reelle')->nullable();      // rempli au départ
            $table->string('quai')->nullable();                      // numéro du quai
            $table->integer('nombre_conteneurs_prevus')->default(0); // conteneurs attendus
            $table->string('statut_escale')->default('PREVUE');
            // PREVUE, EN_COURS, TERMINEE, ANNULEE
            $table->text('observations')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('escales');
    }
};