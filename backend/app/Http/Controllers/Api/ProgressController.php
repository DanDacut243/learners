<?php

namespace App\Http\Controllers\Api;

use App\Models\Enrollment;
use App\Models\ModuleCompletion;
use App\Models\QuizResult;
use Illuminate\Http\Request;

class ProgressController
{
    public function getStudentProgress(Request $request, $enrollmentId)
    {
        $enrollment = Enrollment::with(['course', 'user'])->find($enrollmentId);

        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        // Verify user is viewing their own progress or is admin/instructor
        if ($enrollment->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            // If instructor, check if they teach the course
            if ($request->user()->role === 'instructor' && $enrollment->course->instructor_id !== $request->user()->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $course = $enrollment->course;
        $totalModules = $course->modules()->count();

        $completedModules = ModuleCompletion::where('enrollment_id', $enrollmentId)->count();
        $progressPercentage = $totalModules > 0 ? (int)(($completedModules / $totalModules) * 100) : 0;

        // Get quiz performance
        $quizResults = QuizResult::where('enrollment_id', $enrollmentId)
            ->with('module')
            ->get();

        $avgQuizScore = $quizResults->isNotEmpty()
            ? (int)$quizResults->avg('score')
            : 0;

        // Get module details with completion status
        $modules = $course->modules()->get()->map(function ($module) use ($enrollmentId) {
            $completion = ModuleCompletion::where('enrollment_id', $enrollmentId)
                ->where('module_id', $module->id)
                ->first();

            $quizResult = QuizResult::where('enrollment_id', $enrollmentId)
                ->where('module_id', $module->id)
                ->first();

            return [
                'id' => $module->id,
                'title' => $module->title,
                'type' => $module->type,
                'completed' => $completion ? true : false,
                'completed_at' => $completion?->completed_at,
                'quiz_score' => $quizResult?->score,
                'quiz_attempts' => $completion?->attempts ?? 0,
            ];
        });

        return response()->json([
            'enrollment_id' => $enrollmentId,
            'student_name' => $enrollment->user->name,
            'course_name' => $course->name,
            'progress_percentage' => $progressPercentage,
            'modules_completed' => $completedModules,
            'total_modules' => $totalModules,
            'avg_quiz_score' => $avgQuizScore,
            'quiz_count' => $quizResults->count(),
            'enrollment_status' => $enrollment->status,
            'enrolled_at' => $enrollment->enrolled_at,
            'completed_at' => $enrollment->completed_at,
            'modules' => $modules,
            'recent_quizzes' => $quizResults->take(5)->map(fn($q) => [
                'module_title' => $q->module->title,
                'score' => $q->score,
                'submitted_at' => $q->created_at,
            ])->toArray(),
        ]);
    }

    public function getCourseStudentProgress(Request $request, $courseId)
    {
        $course = \App\Models\Course::find($courseId);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        // Verify user is instructor of this course or admin
        if ($course->instructor_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $enrollments = Enrollment::where('course_id', $courseId)
            ->with('user')
            ->get()
            ->map(function ($enrollment) {
                $completedModules = ModuleCompletion::where('enrollment_id', $enrollment->id)->count();
                $totalModules = $enrollment->course->modules()->count();
                $progressPercentage = $totalModules > 0 ? (int)(($completedModules / $totalModules) * 100) : 0;

                $quizResults = QuizResult::where('enrollment_id', $enrollment->id)->get();
                $avgScore = $quizResults->isNotEmpty() ? (int)$quizResults->avg('score') : 0;

                return [
                    'enrollment_id' => $enrollment->id,
                    'student_name' => $enrollment->user->name,
                    'student_email' => $enrollment->user->email,
                    'progress' => $progressPercentage,
                    'modules_completed' => $completedModules,
                    'avg_quiz_score' => $avgScore,
                    'status' => $enrollment->status,
                    'enrolled_at' => $enrollment->enrolled_at,
                    'completed_at' => $enrollment->completed_at,
                ];
            });

        return response()->json([
            'course_name' => $course->name,
            'total_students' => $enrollments->count(),
            'avg_progress' => (int)$enrollments->avg('progress'),
            'students' => $enrollments->sortByDesc('progress')->values()->toArray(),
        ]);
    }
}
