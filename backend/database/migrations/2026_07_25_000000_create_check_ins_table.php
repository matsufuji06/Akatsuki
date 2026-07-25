<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('check_ins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('activity', 100);
            $table->unsignedSmallInteger('duration_minutes');
            $table->text('note')->nullable();
            $table->date('checked_in_on');
            $table->timestamp('checked_in_at');
            $table->timestamps();

            $table->unique(['user_id', 'checked_in_on']);
            $table->index(['user_id', 'checked_in_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('check_ins');
    }
};
