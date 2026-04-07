<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nom_complet', 100);
            $table->string('entreprise', 100)->nullable();
            $table->string('email', 150);
            $table->enum('objet', [
                'demande_location', 'demande_devis', 'suivi_expedition',
                'information_services', 'reclamation', 'autre'
            ]);
            $table->text('message');
            $table->enum('statut', ['non_lu', 'lu', 'traite'])->default('non_lu');
            $table->unsignedBigInteger('lu_par')->nullable();
            $table->timestamp('lu_le')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamps();

            $table->foreign('lu_par')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_messages');
    }
};
