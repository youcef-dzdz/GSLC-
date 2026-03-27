<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('depots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('port_id')->constrained('ports');
            $table->foreignId('terminal_id')->nullable()->constrained('terminaux');
            $table->string('code_depot')->unique();                // DZALG-D1, DZORAN-D2...
            $table->string('nom_depot');
            $table->string('adresse_precise');
            $table->string('telephone');
            $table->string('email');
            $table->string('type_stockage');                       // SEC, FRIGO, DANGEREUX
            $table->integer('capacite_totale');                    // nombre max de conteneurs
            $table->string('responsable')->nullable();             // nom du responsable
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('depots');
    }
};