<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pays_id')->constrained('pays');
            $table->string('nom_port');
            $table->string('code_port')->unique();                 // ex: DZALG
            $table->string('ville');
            $table->string('type_port')->default('MARITIME');      // MARITIME, AERIEN, TERRESTRE
            $table->string('adresse')->nullable();
            $table->string('telephone')->nullable();
            $table->integer('jours_allowance_defaut')->default(7); // jours gratuits avant surestaries
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ports');
    }
};