<?php

namespace App\Http\Controllers\Api;

use App\Models\{Submission, Assignment, Enrollment, Notification};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SubmissionController
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->role === 'student') {
            $submissions = Submission::where('user_id', $user->id)
                ->with(['assignment', 'user'])
                ->latest()
                ->paginate(20);
        } else {
            $submissions = Submission::with(['assignment', 'user', 'enrollment'])
                ->latest()
                ->paginate(20);
        }

        return response()->json($submissions);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'assignment_id' => 'required|exists:assignments,id',
            'enrollment_id' => 'required|exists:enrollments,id',
            'content' => 'nullable|string',
        ]);

        $enrollment = Enrollment::findOrFail($validated['enrollment_id']);
        
        if ($enrollment->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $submission = Submission::updateOrCreate(
            ['assignment_id' => $validated['assignment_id'], 'user_id' => $request->user()->id],
            [
                ...$validated,
                'enrollment_id' => $validated['enrollment_id'],
                'status' => 'submitted',
                'submitted_at' => now(),
            ]
        );

        // Notify instructors
        $course = $submission->assignment->course;
        Notification::create([
            'user_id' => $course->instructor_id,
            'title' => 'New Assignment Submission',
            'message' => $request->user()->name . ' submitted "' . $submission->assignment->title . '"',
            'type' => 'submission',
        ]);

        return response()->json($submission, 201);
    }

    public function show($id)
    {
        return response()->json(
            Submission::with(['assignment', 'user', 'gradedBy'])->findOrFail($id)
        );
    }

    public function grade(Request $request, $id)
    {
        $submission = Submission::findOrFail($id);
        $course = $submission->assignment->course;

        if ($course->instructor_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'grade' => 'required|integer|min:0|max:' . $submission->assignment->points,
            'feedback' => 'nullable|string',
        ]);

        $submission->update([
            ...$validated,
            'status' => 'graded',
            'graded_at' => now(),
            'graded_by' => $request->user()->id,
        ]);

        // Notify student
        Notification::create([
            'user_id' => $submission->user_id,
            'title' => 'Assignment Graded',
            'message' => '"' . $submission->assignment->title . '" was graded: ' . $validated['grade'] . '/' . $submission->assignment->points,
            'type' => 'grade',
        ]);

        return response()->json($submission);
    }

    public function getByAssignment($assignmentId)
    {
        return response()->json(
            Submission::where('assignment_id', $assignmentId)
                ->with(['user', 'gradedBy'])
                ->get()
        );
    }

    public function getByEnrollment($enrollmentId)
    {
        return response()->json(
            Submission::where('enrollment_id', $enrollmentId)
                ->with(['assignment'])
                ->get()
        );
    }
}
