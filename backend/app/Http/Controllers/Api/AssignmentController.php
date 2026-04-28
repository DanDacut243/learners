<?php

namespace App\Http\Controllers\Api;

use App\Models\{Assignment, Submission, Enrollment, User};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AssignmentController
{
    public function index($courseId)
    {
        return response()->json(
            Assignment::where('course_id', $courseId)
                ->with('submissions')
                ->get()
        );
    }

    public function store(Request $request, $courseId)
    {
        $validated = $request->validate([
            'module_id' => 'required|exists:modules,id',
            'title' => 'required|string',
            'description' => 'string',
            'instructions' => 'string',
            'due_date' => 'nullable|date',
            'points' => 'integer|min:1',
        ]);

        $assignment = Assignment::create([
            ...$validated,
            'course_id' => $courseId,
        ]);

        return response()->json($assignment, 201);
    }

    public function show($id)
    {
        return response()->json(
            Assignment::with('submissions.user')->findOrFail($id)
        );
    }

    public function update(Request $request, $id)
    {
        $assignment = Assignment::findOrFail($id);
        $assignment->update($request->validate([
            'title' => 'string',
            'description' => 'string',
            'instructions' => 'string',
            'due_date' => 'nullable|date',
            'points' => 'integer|min:1',
        ]));

        return response()->json($assignment);
    }

    public function destroy($id)
    {
        Assignment::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
