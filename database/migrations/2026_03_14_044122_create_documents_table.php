<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('demande_id')->nullable()->constrained('demandes_import')->onDelete('cascade');
            // null = document profil client
            // rempli = document lié à une demande

            $table->string('nom_original');
            $table->string('nom_stockage')->unique();
            $table->string('type_document');
            // RC, NIF, NIS, FACTURE_PROFORMA,
            // BILL_OF_LADING, CERTIFICAT_ORIGINE, LISTE_COLISAGE
            $table->string('extension');                            // pdf, jpg, png...
            $table->string('chemin_stockage');
            $table->unsignedBigInteger('taille')->nullable();       // taille en bytes

            $table->string('statut')->default('EN_ATTENTE_VALIDATION');
            // EN_ATTENTE_VALIDATION, VALIDE, REJETE, EXPIRE
            $table->foreignId('valide_par_user_id')->nullable()->constrained('users');
            $table->timestamp('date_validation')->nullable();
            $table->text('motif_rejet')->nullable();
            $table->date('date_expiration')->nullable();

            $table->index('type_document');
            $table->index('statut');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};