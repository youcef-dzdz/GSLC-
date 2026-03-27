<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflows', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();          // IMPORT_STANDARD, IMPORT_URGENT...
            $table->string('nom_processus');
            $table->string('type_workflow')            // ORDINAIRE, URGENT, REFRIGERE
                  ->default('ORDINAIRE');
            $table->text('description')->nullable();
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflows');
    }
};