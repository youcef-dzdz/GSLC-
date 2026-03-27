<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transitaires', function (Blueprint $table) {
            $table->id();

            // Infos Société
            $table->string('nom_societe');
            $table->string('numero_rc')->unique();
            $table->string('numero_agrement')->unique();
            $table->date('date_expiration_agrement')->nullable();
            $table->foreignId('pays_id')->nullable()->constrained('pays');
            $table->string('adresse_societe');
            $table->string('tel_societe');
            $table->string('email_societe');
            $table->string('site_web')->nullable();

            // Infos Représentant
            $table->string('rep_nom');
            $table->string('rep_prenom');
            $table->string('rep_role_societe');
            $table->string('rep_tel_perso');
            $table->string('rep_email_perso');

            // Validation NASHCO
            $table->string('statut')->default('EN_ATTENTE_VALIDATION');
            // EN_ATTENTE_VALIDATION, APPROUVE, REJETE, SUSPENDU
            $table->foreignId('valide_par_user_id')
                  ->nullable()
                  ->constrained('users');
            $table->timestamp('date_validation')->nullable();
            $table->text('motif_rejet')->nullable();

            $table->boolean('actif')->default(true);

            $table->index('statut');
            $table->index('numero_agrement');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transitaires');
    }
};