<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('terminaux', function (Blueprint $table) {
            $table->id();
            $table->foreignId('port_id')->constrained('ports');
            $table->string('code_terminal')->unique();              // DZALG-T1, DZORAN-T1...
            $table->string('nom_terminal');
            $table->string('adresse');
            $table->string('telephone');
            $table->string('email');
            $table->integer('capacite_max_teu');                   // capacité max en TEU
            $table->string('responsable')->nullable();              // nom du responsable
            $table->decimal('taux_occupation', 5, 2)->default(0);  // % occupation actuel
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('terminaux');
    }
};