<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // Assignments table
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->text('instructions')->nullable();
            $table->dateTime('due_date')->nullable();
            $table->integer('points')->default(100);
            $table->json('rubric')->nullable();
            $table->boolean('allow_submissions')->default(true);
            $table->timestamps();
            $table->index(['module_id', 'course_id']);
        });

        // Submissions table
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('enrollment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->longText('content')->nullable();
            $table->json('files')->nullable();
            $table->dateTime('submitted_at')->nullable();
            $table->enum('status', ['draft', 'submitted', 'graded', 'returned'])->default('draft');
            $table->integer('grade')->nullable();
            $table->text('feedback')->nullable();
            $table->dateTime('graded_at')->nullable();
            $table->foreignId('graded_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->unique(['assignment_id', 'user_id']);
            $table->index(['user_id', 'assignment_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('submissions');
        Schema::dropIfExists('assignments');
    }
};
