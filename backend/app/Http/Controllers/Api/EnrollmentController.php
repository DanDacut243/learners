<?php

namespace App\Http\Controllers\Api;

use App\Models\Enrollment;
use App\Models\Course;
use Illuminate\Http\Request;

class EnrollmentController
{
    public function index(Request $request)
    {
        if ($request->user()->role === 'student') {
            $enrollments = Enrollment::where('user_id', $request->user()->id)
                ->with(['course', 'course.instructor'])
                ->paginate(15);
        } else {
            $enrollments = Enrollment::with(['user', 'course'])
                ->paginate(15);
        }

        return response()->json($enrollments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
        ]);

        // Check course capacity
        $course = Course::findOrFail($validated['course_id']);
        $currentEnrollments = Enrollment::where('course_id', $course->id)->count();
        if ($currentEnrollments >= $course->capacity) {
            return response()->json(['message' => 'Course is at capacity'], 409);
        }

        $enrollment = Enrollment::firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'course_id' => $validated['course_id'],
            ],
            ['status' => 'active']
        );

        if ($enrollment->wasRecentlyCreated) {
            return response()->json($enrollment, 201);
        }

        return response()->json($enrollment);
    }

    public function destroy(Request $request, $id)
    {
        $enrollment = Enrollment::find($id);

        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        if ($enrollment->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $enrollment->delete();

        return response()->json(['message' => 'Enrollment deleted']);
    }

    public function getByCourse($courseId)
    {
        $enrollments = Enrollment::where('course_id', $courseId)
            ->with('user')
            ->get();

        return response()->json($enrollments);
    }
}
