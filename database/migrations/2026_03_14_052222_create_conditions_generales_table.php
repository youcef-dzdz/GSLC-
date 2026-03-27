<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conditions_generales', function (Blueprint $table) {
            $table->id();
            $table->string('version')->unique();                    // v1.0, v2.0...
            $table->string('titre');                               // titre du document
            $table->longText('contenu');                           // texte complet HTML
            $table->boolean('actif')->default(false);              // une seule version active
            $table->foreignId('cree_par_user_id')
                  ->nullable()
                  ->constrained('users');
            $table->timestamp('date_application')->nullable();     // depuis quand applicable
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conditions_generales');
    }
};