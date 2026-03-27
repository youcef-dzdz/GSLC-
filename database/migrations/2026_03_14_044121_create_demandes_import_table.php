<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demandes_import', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients');
            $table->foreignId('transitaire_id')->nullable()->constrained('transitaires');
            $table->foreignId('port_origine_id')->nullable()->constrained('ports');
            $table->foreignId('port_destination_id')->nullable()->constrained('ports');
            $table->foreignId('traite_par_user_id')->nullable()->constrained('users');

            $table->string('numero_dossier')->unique();
            $table->string('type_achat');                           // COMPLET, GROUPAGE
            $table->string('priorite')->default('NORMALE');         // NORMALE, URGENTE
            $table->dateTime('date_soumission')->useCurrent();
            $table->date('date_livraison_souhaitee')->nullable();

            $table->string('statut')->default('BROUILLON');
            // BROUILLON, SOUMISE, EN_COURS, ACCEPTEE,
            // REJETEE, ANNULEE, TERMINEE

            $table->integer('nombre_negociations')->default(0);     // max 3 négociations
            $table->text('notes_client')->nullable();
            $table->text('motif_rejet')->nullable();
            $table->timestamp('date_traitement')->nullable();

            $table->index('statut');
            $table->index('numero_dossier');
            $table->index('client_id');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demandes_import');
    }
};