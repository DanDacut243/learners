<?php

namespace App\Http\Controllers\Api;

use App\Models\QuizResult;
use App\Models\Enrollment;
use App\Models\Module;
use Illuminate\Http\Request;

class QuizResultController
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'enrollment_id' => 'required|exists:enrollments,id',
            'module_id' => 'required|exists:modules,id',
            'score' => 'required|integer|min:0|max:100',
            'total_questions' => 'required|integer|min:1',
            'correct_answers' => 'required|integer|min:0',
            'answers' => 'nullable|array',
        ]);

        // Verify user owns the enrollment
        $enrollment = Enrollment::find($validated['enrollment_id']);
        if ($enrollment->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $quizResult = QuizResult::create($validated);

        // Also mark module as completed with quiz score
        $module = Module::find($validated['module_id']);
        if ($module->type === 'quiz') {
            $completion = $enrollment->moduleCompletions()
                ->where('module_id', $validated['module_id'])
                ->first();

            if ($completion) {
                $completion->update([
                    'quiz_score' => $validated['score'],
                    'attempts' => ($completion->attempts ?? 0) + 1,
                ]);
            }
        }

        return response()->json($quizResult, 201);
    }

    public function getByEnrollment($enrollmentId)
    {
        $enrollment = Enrollment::find($enrollmentId);

        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        // Only user or admin can view their own results
        if ($enrollment->user_id !== auth()->user()->id && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $results = QuizResult::where('enrollment_id', $enrollmentId)
            ->with('module')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($results);
    }

    public function show($id)
    {
        $result = QuizResult::with('module', 'enrollment')->find($id);

        if (!$result) {
            return response()->json(['message' => 'Quiz result not found'], 404);
        }

        // Only user or admin can view
        if ($result->enrollment->user_id !== auth()->user()->id && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($result);
    }
}
