<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('configuration_systeme', function (Blueprint $table) {
            $table->id();
            $table->string('cle')->unique();                        // tva_taux, duree_session...
            $table->string('valeur');                               // la valeur du paramètre
            $table->string('type_valeur')->default('STRING');       // STRING, INTEGER, DECIMAL, BOOLEAN
            $table->text('description')->nullable();                // explication du paramètre
            $table->boolean('modifiable')->default(true);           // peut être modifié par l'admin
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('configuration_systeme');
    }
};