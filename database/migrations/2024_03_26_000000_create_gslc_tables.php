<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Dossiers Table
        Schema::create('dossiers', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->unsignedBigInteger('client_id');
            $table->string('status')->default('Commercial'); // Phase 1
            $table->unsignedBigInteger('user_id')->nullable(); // For Audit
            $table->ipAddress('ip_address')->nullable(); // For Audit
            $table->json('payload_json')->nullable(); // For Audit
            $table->timestamps();
        });

        // 2. Containers Table with Surestary fields and Audit Trail
        Schema::create('containers', function (Blueprint $table) {
            $table->id();
            $table->string('container_number')->unique();
            $table->foreignId('dossier_id')->constrained('dossiers')->onDelete('cascade');
            $table->string('status_phase')->default('Admin'); // Phase 2
            
            // Surestary/Demurrage Calculation Needs
            $table->date('arrival_date')->nullable();
            $table->integer('free_days')->default(0);
            $table->date('return_date')->nullable();
            
            // Audit Trail Fields
            $table->unsignedBigInteger('user_id')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->json('payload_json')->nullable();
            
            $table->timestamps();
        });

        // 3. Invoices Table
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('container_id')->constrained('containers')->onDelete('cascade');
            $table->foreignId('dossier_id')->constrained('dossiers')->onDelete('cascade');
            $table->decimal('amount_surestary', 10, 2)->default(0.00);
            
            // Audit Trail Fields
            $table->unsignedBigInteger('user_id')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->json('payload_json')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('containers');
        Schema::dropIfExists('dossiers');
    }
};
