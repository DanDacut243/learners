<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // Learning Outcomes table
        Schema::create('learning_outcomes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->enum('bloom_level', ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'])->default('understand');
            $table->integer('order')->default(0);
            $table->timestamps();
            $table->index('course_id');
        });

        // Module to Learning Outcomes junction
        Schema::create('module_outcomes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained()->cascadeOnDelete();
            $table->foreignId('learning_outcome_id')->constrained('learning_outcomes')->cascadeOnDelete();
            $table->integer('weight')->default(50);
            $table->timestamps();
            $table->unique(['module_id', 'learning_outcome_id']);
        });

        // Student Competency tracking
        Schema::create('student_competencies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('learning_outcome_id')->constrained('learning_outcomes')->cascadeOnDelete();
            $table->integer('mastery_level')->default(0);
            $table->integer('attempts')->default(0);
            $table->timestamp('last_assessed_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'course_id', 'learning_outcome_id'], 'uc_competency');
            $table->index(['user_id', 'course_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('student_competencies');
        Schema::dropIfExists('module_outcomes');
        Schema::dropIfExists('learning_outcomes');
    }
};
