<?php

namespace App\Http\Controllers\Api;

use App\Models\ModuleCompletion;
use App\Models\Enrollment;
use App\Models\Module;
use Illuminate\Http\Request;

class ModuleCompletionController
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'enrollment_id' => 'required|exists:enrollments,id',
            'module_id' => 'required|exists:modules,id',
            'quiz_score' => 'nullable|integer|min:0|max:100',
            'attempts' => 'nullable|integer|min:1',
        ]);

        // Verify user owns the enrollment
        $enrollment = Enrollment::find($validated['enrollment_id']);
        if ($enrollment->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if module already completed
        $existing = ModuleCompletion::where('enrollment_id', $validated['enrollment_id'])
            ->where('module_id', $validated['module_id'])
            ->first();

        if ($existing && !isset($validated['quiz_score'])) {
            // Already completed this module
            return response()->json($existing);
        }

        $validated['completed_at'] = now();

        $completion = ModuleCompletion::updateOrCreate(
            [
                'enrollment_id' => $validated['enrollment_id'],
                'module_id' => $validated['module_id'],
            ],
            $validated
        );

        // Update enrollment progress
        $this->updateEnrollmentProgress($enrollment);

        return response()->json($completion);
    }

    public function getByEnrollment($enrollmentId)
    {
        $enrollment = Enrollment::find($enrollmentId);

        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        $completions = ModuleCompletion::where('enrollment_id', $enrollmentId)
            ->with('module')
            ->get();

        return response()->json($completions);
    }

    private function updateEnrollmentProgress(Enrollment $enrollment)
    {
        $course = $enrollment->course;
        $totalModules = $course->modules()->count();

        if ($totalModules === 0) {
            $enrollment->progress_percentage = 0;
        } else {
            $completedModules = ModuleCompletion::where('enrollment_id', $enrollment->id)->count();
            $enrollment->progress_percentage = (int) (($completedModules / $totalModules) * 100);

            // Mark as completed if all modules done
            if ($completedModules === $totalModules) {
                $enrollment->completed_at = now();
            }
        }

        $enrollment->save();
    }
}
