<?php

namespace App\Http\Controllers\Api;

use App\Models\Course;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class CourseController
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $query = Course::with(['instructor', 'enrollments', 'schedules']);

        // Support filtering by instructor_id=me for instructor dashboards
        if ($request->query('instructor_id') === 'me') {
            $query->where('instructor_id', $user->id);
        } else if ($user->role === 'student') {
            // Students see available courses (not enrolled in)
            $enrolledCourseIds = $user->enrollments()->pluck('course_id');
            $query->whereNotIn('id', $enrolledCourseIds)
                  ->where('status', 'active'); // Only show active courses
        } else if ($user->role === 'instructor') {
            // Instructors see only their own courses
            $query->where('instructor_id', $user->id);
        }
        // Admins see all courses (default behavior)

        return response()->json($query->paginate(50));
    }

    public function show($id)
    {
        $course = Course::with(['instructor', 'enrollments.user', 'schedules', 'grades', 'modules'])->find($id);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        return response()->json($course);
    }

    public function store(Request $request)
    {
        // Only instructors and admins can create courses
        if ($request->user()->role !== 'instructor' && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Only instructors can create courses'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'capacity' => 'required|integer|min:1',
            'start_date' => 'required|date_format:Y-m-d H:i:s',
            'end_date' => 'required|date_format:Y-m-d H:i:s|after:start_date',
            'status' => 'required|in:draft,active,archived',
        ]);

        $validated['instructor_id'] = $request->user()->id;

        $course = Course::create($validated);

        // Log action
        AuditLog::log('create', 'Course', $course->id, $validated);

        return response()->json($course, 201);
    }

    public function update(Request $request, $id)
    {
        $course = Course::find($id);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        if ($course->instructor_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'capacity' => 'sometimes|integer|min:1',
            'start_date' => 'sometimes|date_format:Y-m-d H:i:s',
            'end_date' => 'sometimes|date_format:Y-m-d H:i:s',
            'status' => 'sometimes|in:draft,active,archived',
        ]);

        $course->update($validated);

        // Log action
        AuditLog::log('update', 'Course', $course->id, $validated);

        return response()->json($course);
    }

    public function destroy(Request $request, $id)
    {
        $course = Course::find($id);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        if ($course->instructor_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $course->delete();

        // Log action
        AuditLog::log('delete', 'Course', $course->id, ['name' => $course->name]);

        return response()->json(['message' => 'Course deleted']);
    }

    public function getMyEnrolledCourses(Request $request)
    {
        $enrollments = $request->user()->enrollments()
            ->with(['course', 'course.instructor'])
            ->get();

        $courses = $enrollments->map(fn($e) => array_merge($e->course->toArray(), ['enrollment_id' => $e->id]));

        return response()->json($courses);
    }

    public function getMyCourses(Request $request)
    {
        if ($request->user()->role !== 'instructor' && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Only instructors can access this endpoint'], 403);
        }

        $courses = Course::where('instructor_id', $request->user()->id)
            ->with(['enrollments', 'schedules', 'modules'])
            ->get();

        return response()->json($courses);
    }
}
