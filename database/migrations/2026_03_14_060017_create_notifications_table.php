<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('type_notification_id')->nullable()->constrained('types_notification');
            $table->foreignId('destinataire_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('conteneur_id')->nullable()->constrained('conteneurs')->nullOnDelete();
            $table->foreignId('facture_id')->nullable()->constrained('factures')->nullOnDelete();
            $table->foreignId('demande_id')->nullable()->constrained('demandes_import')->nullOnDelete();

            $table->string('titre');
            $table->text('message');
            $table->string('canal')->default('INTERNE');           // EMAIL, SMS, INTERNE
            $table->string('lien_action')->nullable();             // URL vers la page concernée

            $table->timestamp('date_creation')->useCurrent();
            $table->timestamp('date_envoi')->nullable();
            $table->boolean('lu')->default(false);
            $table->timestamp('lu_le')->nullable();

            $table->index('destinataire_id');
            $table->index('lu');
            $table->index('date_creation');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};