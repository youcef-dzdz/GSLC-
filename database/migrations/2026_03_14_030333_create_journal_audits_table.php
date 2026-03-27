<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void {
        Schema::create('journal_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('utilisateur_id')->constrained('users');
            $table->string('action');                          // CREATE, UPDATE, DELETE, LOGIN, LOGOUT
            $table->string('table_cible');                     // ex: conteneurs
            $table->string('enregistrement_id')->nullable();   // ex: id=42 du conteneur modifié
            $table->json('anciennes_valeurs')->nullable();
            $table->json('nouvelles_valeurs')->nullable();
            $table->ipAddress('adresse_ip');
            $table->string('user_agent')->nullable();          // navigateur/appareil utilisé
            $table->string('resultat')->default('SUCCES');     // SUCCES, ECHEC, ALERTE
            $table->timestamp('date_action')->useCurrent();

            // Index pour les recherches fréquentes
            $table->index('action');
            $table->index('table_cible');
            $table->index('date_action');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_audits');
    }
};