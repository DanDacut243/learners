<?php

namespace App\Http\Controllers\Api;

use App\Models\{LearningOutcome, StudentCompetency, Course};
use Illuminate\Http\Request;

class LearningOutcomeController
{
    public function index($courseId)
    {
        return response()->json(
            LearningOutcome::where('course_id', $courseId)
                ->orderBy('order')
                ->get()
        );
    }

    public function store(Request $request, $courseId)
    {
        $course = Course::findOrFail($courseId);
        
        if ($course->instructor_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'bloom_level' => 'required|in:remember,understand,apply,analyze,evaluate,create',
        ]);

        $outcome = $course->learningOutcomes()->create($validated);
        return response()->json($outcome, 201);
    }

    public function show($id)
    {
        return response()->json(LearningOutcome::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $outcome = LearningOutcome::findOrFail($id);
        $course = $outcome->course;

        if ($course->instructor_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $outcome->update($request->validate([
            'title' => 'string|max:255',
            'description' => 'string',
            'bloom_level' => 'in:remember,understand,apply,analyze,evaluate,create',
        ]));

        return response()->json($outcome);
    }

    public function destroy($id)
    {
        $outcome = LearningOutcome::findOrFail($id);
        $outcome->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function getStudentCompetencies($courseId)
    {
        $competencies = StudentCompetency::where('course_id', $courseId)
            ->where('user_id', auth()->id())
            ->with('learningOutcome')
            ->get();

        return response()->json([
            'competencies' => $competencies,
            'overall_mastery' => $competencies->avg('mastery_level') ?? 0,
        ]);
    }

    public function updateCompetency(Request $request, $outcomeId)
    {
        $outcome = LearningOutcome::findOrFail($outcomeId);
        
        $competency = StudentCompetency::firstOrCreate(
            [
                'user_id' => auth()->id(),
                'learning_outcome_id' => $outcomeId,
                'course_id' => $outcome->course_id,
            ],
            ['mastery_level' => 0]
        );

        $newScore = $request->input('score', 0);
        $oldScore = $competency->mastery_level;

        $competency->mastery_level = round(0.7 * $newScore + 0.3 * $oldScore);
        $competency->attempts++;
        $competency->last_assessed_at = now();
        $competency->save();

        return response()->json($competency);
    }
}
