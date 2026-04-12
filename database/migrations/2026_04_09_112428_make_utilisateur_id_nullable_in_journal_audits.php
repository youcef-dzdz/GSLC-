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
        Schema::table('journal_audits', function (Blueprint $table) {
            $table->dropForeign(['utilisateur_id']);
            $table->unsignedBigInteger('utilisateur_id')->nullable()->change();
            $table->foreign('utilisateur_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('journal_audits', function (Blueprint $table) {
            $table->dropForeign(['utilisateur_id']);
            $table->unsignedBigInteger('utilisateur_id')->nullable(false)->change();
            $table->foreign('utilisateur_id')->references('id')->on('users');
        });
    }
};
