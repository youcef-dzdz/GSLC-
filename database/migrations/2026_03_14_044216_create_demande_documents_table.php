<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demande_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demande_id')->constrained('demandes_import')->onDelete('cascade');
            $table->foreignId('document_id')->constrained('documents');
            $table->foreignId('verifie_par_user_id')->nullable()->constrained('users');

            $table->boolean('est_verifie')->default(false);
            $table->timestamp('date_verification')->nullable();
            $table->text('commentaire')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demande_documents');
    }
};