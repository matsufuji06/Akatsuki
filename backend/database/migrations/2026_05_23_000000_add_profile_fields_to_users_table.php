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
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar_url')->nullable()->after('password');
            $table->unsignedInteger('current_streak')->default(0)->after('avatar_url');
            $table->unsignedInteger('best_streak')->default(0)->after('current_streak');
            $table->unsignedInteger('total_check_ins')->default(0)->after('best_streak');
            $table->unsignedInteger('level')->default(1)->after('total_check_ins');
            $table->timestamp('joined_at')->nullable()->after('level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'avatar_url',
                'current_streak',
                'best_streak',
                'total_check_ins',
                'level',
                'joined_at',
            ]);
        });
    }
};