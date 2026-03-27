<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Infos Entreprise
            $table->string('raison_sociale');
            $table->string('nif')->unique();
            $table->string('nis')->unique();
            $table->string('rc')->unique();
            $table->string('adresse_siege');
            $table->string('ville');
            $table->foreignId('pays_id')->constrained('pays');
            $table->string('type_client')->default('ORDINAIRE'); // ORDINAIRE, EN_PNUE, EXPORTATEUR

            // Infos Représentant
            $table->string('rep_nom');
            $table->string('rep_prenom');
            $table->string('rep_role');
            $table->string('rep_tel');
            $table->string('rep_email');
            $table->string('rep_adresse_perso')->nullable();

            // Validation NASHCO
            $table->string('statut')->default('EN_ATTENTE_VALIDATION');
            // EN_ATTENTE_VALIDATION, APPROUVE, REJETE, SUSPENDU
            $table->foreignId('valide_par_user_id')->nullable()->constrained('users');
            $table->timestamp('date_validation')->nullable();
            $table->text('motif_rejet')->nullable();

            $table->index('statut');
            $table->index('nif');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
