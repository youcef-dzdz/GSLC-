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
        Schema::create('corbeille', function (Blueprint $table) {
            $table->id();

            // What was deleted
            $table->string('model_type');           // e.g. "App\Models\Client"
            $table->unsignedBigInteger('model_id'); // original record ID
            $table->json('snapshot');               // full record as JSON

            // WHO deleted it — full audit identity
            $table->unsignedBigInteger('deleted_by');        // user ID
            $table->string('deleted_by_name');               // full name at time of deletion
            $table->string('deleted_by_email');              // email at time of deletion
            $table->string('deleted_by_role')->nullable();   // niveau or role label
            $table->string('deleted_by_ip')->nullable();     // IP address
            $table->timestamp('deleted_at_audit');           // exact datetime of deletion

            // Expiry
            $table->timestamp('expires_at');                 // deleted_at_audit + 30 days

            // Restoration audit
            $table->timestamp('restored_at')->nullable();
            $table->unsignedBigInteger('restored_by')->nullable();
            $table->string('restored_by_name')->nullable();  // full name at time of restore
            $table->string('restored_by_email')->nullable();
            $table->string('restored_by_ip')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('corbeille');
    }
};
