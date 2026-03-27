<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('statut_conteneurs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conteneur_id')->constrained('conteneurs')->onDelete('cascade');
            $table->string('ancien_statut')->nullable();         // statut avant changement
            $table->string('nouveau_statut');                    // nouveau statut
            $table->foreignId('responsable_id')->nullable()->constrained('users');
            $table->timestamp('date_changement')->useCurrent();
            $table->text('commentaire')->nullable();

            $table->index('conteneur_id');
            $table->index('date_changement');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('statut_conteneurs');
    }
};