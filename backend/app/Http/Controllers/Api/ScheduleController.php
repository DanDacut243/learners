<?php

namespace App\Http\Controllers\Api;

use App\Models\Schedule;
use App\Models\Course;
use Illuminate\Http\Request;

class ScheduleController
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // If student: get schedules for enrolled courses
        // If instructor: get schedules for taught courses
        if ($user->role === 'student') {
            // Get schedules for courses the student is enrolled in
            $schedules = Schedule::whereHas('course', function ($query) use ($user) {
                $query->whereHas('enrollments', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            })
            ->with('course')
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->paginate(50);
        } else if ($user->role === 'instructor') {
            // Get schedules for courses the instructor teaches
            $schedules = Schedule::whereHas('course', function ($query) use ($user) {
                $query->where('instructor_id', $user->id);
            })
            ->with('course')
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->paginate(50);
        } else if ($user->role === 'admin') {
            // Admin can see all schedules
            $schedules = Schedule::with('course')
                ->orderBy('day_of_week')
                ->orderBy('start_time')
                ->paginate(50);
        } else {
            return response()->json(['message' => 'Invalid role'], 403);
        }

        return response()->json($schedules);
    }

    public function show($id)
    {
        $schedule = Schedule::with('course')->find($id);

        if (!$schedule) {
            return response()->json(['message' => 'Schedule not found'], 404);
        }

        return response()->json($schedule);
    }

    public function getByCourse($courseId)
    {
        return response()->json(
            Schedule::where('course_id', $courseId)->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'day_of_week' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'location' => 'nullable|string',
        ]);

        // Verify instructor owns the course or is admin
        $course = Course::find($validated['course_id']);
        if ($course->instructor_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $schedule = Schedule::create($validated);

        return response()->json($schedule, 201);
    }

    public function update(Request $request, $id)
    {
        $schedule = Schedule::find($id);

        if (!$schedule) {
            return response()->json(['message' => 'Schedule not found'], 404);
        }

        // Verify instructor owns the course or is admin
        $course = $schedule->course;
        if ($course->instructor_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'day_of_week' => 'sometimes|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i',
            'location' => 'nullable|string',
        ]);

        $schedule->update($validated);

        return response()->json($schedule);
    }

    public function destroy(Request $request, $id)
    {
        $schedule = Schedule::find($id);

        if (!$schedule) {
            return response()->json(['message' => 'Schedule not found'], 404);
        }

        // Verify instructor owns the course or is admin
        $course = $schedule->course;
        if ($course->instructor_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $schedule->delete();

        return response()->json(['message' => 'Schedule deleted']);
    }
}
