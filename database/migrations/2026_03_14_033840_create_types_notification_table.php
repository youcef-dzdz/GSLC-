<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('types_notification', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();                      // NOUVELLE_DEMANDE, DEVIS_ENVOYE...
            $table->string('libelle');                             // ex: Nouvelle demande reçue
            $table->string('priorite')->default('MOYENNE');        // BASSE, MOYENNE, HAUTE
            $table->string('canal_defaut')->default('INTERNE');    // EMAIL, SMS, INTERNE
            $table->text('template_message')->nullable();          // modèle du message
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('types_notification');
    }
};