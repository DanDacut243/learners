<?php

namespace App\Http\Controllers\Api;

use App\Models\Course;
use App\Models\StudentCompetency;
use App\Services\AIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AITutorController
{
    protected AIService $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * POST /api/ai/tutor/ask
     * Student asks a question about course material
     */
    public function ask(Request $request): JsonResponse
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'topic' => 'required|string|max:255',
            'question' => 'required|string|max:2000',
        ]);

        $course = Course::findOrFail($request->course_id);
        $response = $this->aiService->generateTutoringResponse(
            $request->topic,
            $request->question,
            $course->name
        );

        return response()->json([
            'success' => true,
            'topic' => $request->topic,
            'question' => $request->question,
            'answer' => $response,
            'suggested_resources' => $this->getSuggestedResources($course, $request->topic),
            'generated_at' => now(),
        ]);
    }

    /**
     * POST /api/ai/tutor/explain
     * Request explanation for a specific concept
     */
    public function explain(Request $request): JsonResponse
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'concept' => 'required|string|max:255',
            'difficulty_level' => 'nullable|in:beginner,intermediate,advanced',
        ]);

        $course = Course::findOrFail($request->course_id);
        $level = $request->difficulty_level ?? 'intermediate';
        
        $prompt = "Explain the concept of '{$request->concept}' at a {$level} level for a course on {$course->title}. Include analogies and real-world examples.";
        $explanation = $this->aiService->generateTutoringResponse($request->concept, $prompt, $course->title);

        return response()->json([
            'success' => true,
            'concept' => $request->concept,
            'difficulty_level' => $level,
            'explanation' => $explanation,
            'follow_up_topics' => $this->getFollowUpTopics($request->concept),
        ]);
    }

    protected function getSuggestedResources(Course $course, string $topic): array
    {
        // Return related learning outcomes for the topic
        if ($course->learningOutcomes()->exists()) {
            return $course->learningOutcomes()
                ->where('title', 'like', "%{$topic}%")
                ->limit(3)
                ->pluck('title')
                ->toArray();
        }
        return [];
    }

    protected function getFollowUpTopics(string $concept): array
    {
        // Mock follow-up topics
        $topics = [
            'foundations' => ['Core Principles', 'Historical Context', 'Real-World Applications'],
            'advanced' => ['Edge Cases', 'Optimization', 'Integration with Other Concepts'],
            'default' => ['Practice Problems', 'Case Studies', 'Assessment Preparation'],
        ];

        return $topics['default'];
    }
}
