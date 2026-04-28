<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->string('title');
            $table->enum('type', ['video', 'quiz', 'assignment']);
            $table->text('description')->nullable();
            $table->integer('duration')->nullable(); // duration in minutes
            $table->integer('order')->default(0);
            $table->json('content')->nullable(); // quiz questions, assignment details, video metadata
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
