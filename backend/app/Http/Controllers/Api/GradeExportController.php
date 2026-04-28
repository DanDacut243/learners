<?php

namespace App\Http\Controllers\Api;

use App\Models\Grade;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GradeExportController
{
    public function exportCourseGrades(Request $request, $courseId)
    {
        $course = Course::find($courseId);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        // Verify instructor owns course or is admin
        if ($course->instructor_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $grades = Grade::where('course_id', $courseId)
            ->with(['user', 'course'])
            ->get()
            ->map(function ($grade) {
                return [
                    'student_name' => $grade->user->name,
                    'student_email' => $grade->user->email,
                    'grade' => $grade->grade,
                    'created_at' => $grade->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json([
            'course_name' => $course->name,
            'grades' => $grades,
            'total_students' => $grades->count(),
            'average_grade' => $grades->isNotEmpty() ? (int)$grades->avg('grade') : 0,
        ]);
    }

    public function bulkUpdateGrades(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'grades' => 'required|array',
            'grades.*.student_id' => 'required|exists:users,id',
            'grades.*.grade' => 'required|integer|min:0|max:100',
        ]);

        $course = Course::find($validated['course_id']);

        // Verify instructor owns course or is admin
        if ($course->instructor_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $updated = 0;

        DB::transaction(function () use ($validated, $request, &$updated) {
            foreach ($validated['grades'] as $gradeData) {
                Grade::updateOrCreate(
                    [
                        'user_id' => $gradeData['student_id'],
                        'course_id' => $validated['course_id'],
                    ],
                    ['grade' => $gradeData['grade']]
                );
                $updated++;
            }
        });

        return response()->json([
            'message' => 'Grades updated successfully',
            'updated' => $updated,
        ]);
    }

    public function getGradeStatistics(Request $request, $courseId)
    {
        $course = Course::find($courseId);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        // Verify access
        if ($course->instructor_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $grades = Grade::where('course_id', $courseId)->pluck('grade');

        if ($grades->isEmpty()) {
            return response()->json([
                'total_students' => 0,
                'average_grade' => 0,
                'highest_grade' => 0,
                'lowest_grade' => 0,
                'median_grade' => 0,
                'distribution' => [],
            ]);
        }

        $sorted = $grades->sort();
        $count = $sorted->count();
        $median = $count % 2 === 0
            ? ($sorted[$count / 2 - 1] + $sorted[$count / 2]) / 2
            : $sorted[intdiv($count, 2)];

        // Grade distribution (A: 90+, B: 80+, C: 70+, D: 60+, F: <60)
        $distribution = [
            'A' => $grades->filter(fn($g) => $g >= 90)->count(),
            'B' => $grades->filter(fn($g) => $g >= 80 && $g < 90)->count(),
            'C' => $grades->filter(fn($g) => $g >= 70 && $g < 80)->count(),
            'D' => $grades->filter(fn($g) => $g >= 60 && $g < 70)->count(),
            'F' => $grades->filter(fn($g) => $g < 60)->count(),
        ];

        return response()->json([
            'total_students' => $count,
            'average_grade' => (int)$grades->avg(),
            'highest_grade' => (int)$grades->max(),
            'lowest_grade' => (int)$grades->min(),
            'median_grade' => (int)$median,
            'distribution' => $distribution,
        ]);
    }
}
