<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('module_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('enrollments')->cascadeOnDelete();
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->timestamp('completed_at');
            $table->integer('quiz_score')->nullable(); // 0-100 for quiz modules
            $table->integer('attempts')->default(1); // number of attempts for quizzes
            $table->unique(['enrollment_id', 'module_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('module_completions');
    }
};
