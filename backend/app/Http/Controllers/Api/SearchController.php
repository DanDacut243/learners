<?php

namespace App\Http\Controllers\Api;

use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;

class SearchController
{
    public function searchCourses(Request $request)
    {
        $query = $request->query('q', '');
        $status = $request->query('status');

        $courses = Course::query();

        if ($query) {
            $courses->where('name', 'like', "%{$query}%")
                ->orWhere('description', 'like', "%{$query}%");
        }

        if ($status) {
            $courses->where('status', $status);
        }

        $courses = $courses->with(['instructor', 'enrollments'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($courses);
    }

    public function searchStudents(Request $request)
    {
        $query = $request->query('q', '');
        $courseId = $request->query('course_id');

        if ($request->user()->role !== 'admin' && $request->user()->role !== 'instructor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $students = User::query()->where('role', 'student');

        if ($query) {
            $students->where('name', 'like', "%{$query}%")
                ->orWhere('email', 'like', "%{$query}%");
        }

        if ($courseId) {
            // Filter by course enrollment
            $students->whereHas('enrollments', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            });
        }

        $students = $students->orderBy('name')
            ->paginate(15);

        return response()->json($students);
    }

    public function globalSearch(Request $request)
    {
        $query = $request->query('q', '');

        if (strlen($query) < 2) {
            return response()->json([
                'courses' => [],
                'students' => [],
                'total' => 0,
            ]);
        }

        $courses = Course::where('name', 'like', "%{$query}%")
            ->with('instructor')
            ->limit(5)
            ->get();

        $students = [];
        if ($request->user()->role === 'admin' || $request->user()->role === 'instructor') {
            $students = User::where('role', 'student')
                ->where('name', 'like', "%{$query}%")
                ->limit(5)
                ->get();
        }

        return response()->json([
            'courses' => $courses,
            'students' => $students,
            'total' => $courses->count() + $students->count(),
        ]);
    }
}
