<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('etapes_workflow', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('workflows')->onDelete('cascade');
            $table->string('nom_etape');
            $table->integer('ordre');
            $table->string('role_responsable');                    // RESPONSABLE_COMMERCIAL, LOGISTIQUE...
            $table->text('description')->nullable();               // instructions pour l'agent
            $table->integer('delai_heures')->default(72);          // délai max en heures
            $table->boolean('est_optionnelle')->default(false);    // étape obligatoire ou non
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('etapes_workflow');
    }
};