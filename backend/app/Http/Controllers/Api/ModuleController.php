<?php

namespace App\Http\Controllers\Api;

use App\Models\Module;
use App\Models\Course;
use Illuminate\Http\Request;

class ModuleController
{
    public function index($courseId)
    {
        $course = Course::find($courseId);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        $modules = $course->modules()->orderBy('order')->get();

        return response()->json($modules);
    }

    public function show($id)
    {
        $module = Module::with(['completions', 'discussions', 'quizResults'])->find($id);

        if (!$module) {
            return response()->json(['message' => 'Module not found'], 404);
        }

        return response()->json($module);
    }

    public function store(Request $request, $courseId)
    {
        $course = Course::find($courseId);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        // Verify instructor owns the course or is admin
        if ($course->instructor_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:video,quiz,assignment',
            'description' => 'nullable|string',
            'duration' => 'nullable|integer|min:1',
            'order' => 'nullable|integer',
            'content' => 'nullable|array',
        ]);

        $validated['course_id'] = $courseId;
        $validated['order'] = $validated['order'] ?? ($course->modules()->max('order') ?? 0) + 1;

        $module = Module::create($validated);

        return response()->json($module, 201);
    }

    public function update(Request $request, $id)
    {
        $module = Module::find($id);

        if (!$module) {
            return response()->json(['message' => 'Module not found'], 404);
        }

        // Verify instructor owns the course or is admin
        $course = $module->course;
        if ($course->instructor_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:video,quiz,assignment',
            'description' => 'nullable|string',
            'duration' => 'nullable|integer|min:1',
            'order' => 'sometimes|integer',
            'content' => 'nullable|array',
        ]);

        $module->update($validated);

        return response()->json($module);
    }

    public function destroy(Request $request, $id)
    {
        $module = Module::find($id);

        if (!$module) {
            return response()->json(['message' => 'Module not found'], 404);
        }

        // Verify instructor owns the course or is admin
        $course = $module->course;
        if ($course->instructor_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $module->delete();

        return response()->json(['message' => 'Module deleted']);
    }
}
