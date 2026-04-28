<?php

namespace App\Http\Controllers\Api;

use App\Models\Grade;
use Illuminate\Http\Request;

class GradeController
{
    public function index(Request $request)
    {
        if ($request->user()->role === 'student') {
            $grades = Grade::where('user_id', $request->user()->id)
                ->with('course')
                ->get();
        } else {
            $grades = Grade::with(['user', 'course'])->get();
        }

        return response()->json($grades);
    }

    public function getByCourse($courseId)
    {
        return response()->json(
            Grade::where('course_id', $courseId)
                ->with('user')
                ->get()
        );
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'instructor' && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Only instructors and admins can create grades'], 403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
            'grade' => 'required|numeric|min:0|max:100',
            'comments' => 'nullable|string',
        ]);

        $grade = Grade::updateOrCreate(
            ['user_id' => $validated['user_id'], 'course_id' => $validated['course_id']],
            ['grade' => $validated['grade'], 'comments' => $validated['comments'] ?? null]
        );

        return response()->json($grade, 201);
    }

    public function update(Request $request, $id)
    {
        $grade = Grade::find($id);

        if (!$grade) {
            return response()->json(['message' => 'Grade not found'], 404);
        }

        if ($request->user()->role !== 'instructor' && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'grade' => 'required|numeric|min:0|max:100',
            'comments' => 'nullable|string',
        ]);

        $grade->update($validated);

        return response()->json($grade);
    }
}
