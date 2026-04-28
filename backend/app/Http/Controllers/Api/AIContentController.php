<?php

namespace App\Http\Controllers\Api;

use App\Models\Course;
use App\Models\StudentCompetency;
use App\Models\LearningOutcome;
use App\Services\AIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AIContentController
{
    protected AIService $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * POST /api/ai/content/generate-course-outline
     * Generate course outline using AI
     */
    public function generateCourseOutline(Request $request): JsonResponse
    {
        $request->validate([
            'course_title' => 'required|string|max:255',
            'topic' => 'required|string|max:255',
            'num_modules' => 'nullable|integer|min:2|max:20',
        ]);

        $numModules = $request->num_modules ?? 5;
        $outline = $this->aiService->generateCourseContent(
            $request->course_title,
            $request->topic,
            $numModules
        );

        return response()->json([
            'success' => true,
            'course_title' => $request->course_title,
            'topic' => $request->topic,
            'outline' => $outline,
            'estimated_hours' => $numModules * 6,
            'generated_at' => now(),
        ]);
    }

    /**
     * POST /api/ai/content/generate-learning-outcomes
     * Generate learning outcomes for a course
     */
    public function generateLearningOutcomes(Request $request): JsonResponse
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'bloom_level' => 'nullable|in:Remember,Understand,Apply,Analyze,Evaluate,Create',
        ]);

        $course = Course::findOrFail($request->course_id);
        $bloomLevel = $request->bloom_level ?? 'Understand';

        $prompt = "Generate 5 learning outcomes for a course on '{$course->name}' at the '{$bloomLevel}' level of Bloom's taxonomy. Format as JSON: {\"outcomes\": [{\"title\": \"\", \"description\": \"\"}]}";
        
        $response = $this->aiService->generateTutoringResponse($bloomLevel, $prompt, $course->name);

        try {
            $outcomes = json_decode($response, true)['outcomes'] ?? [];
        } catch (\Exception $e) {
            $outcomes = $this->getDefaultOutcomes($bloomLevel);
        }

        return response()->json([
            'success' => true,
            'course_id' => $course->id,
            'bloom_level' => $bloomLevel,
            'outcomes' => $outcomes,
            'implementation_guide' => $this->getImplementationGuide($bloomLevel),
        ]);
    }

    /**
     * POST /api/ai/content/rubric-generation
     * Generate grading rubric for assignments
     */
    public function generateRubric(Request $request): JsonResponse
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'assignment_type' => 'required|string|in:essay,project,presentation,code,discussion',
            'skill_level' => 'nullable|in:introductory,intermediate,advanced',
        ]);

        $course = Course::findOrFail($request->course_id);
        $skillLevel = $request->skill_level ?? 'intermediate';

        $prompt = "Create a detailed grading rubric for a {$skillLevel} {$request->assignment_type} assignment in {$course->name}. Format as JSON: {\"criteria\": [{\"name\": \"\", \"points\": 0, \"descriptors\": {\"excellent\": \"\", \"good\": \"\", \"fair\": \"\", \"poor\": \"\"}}], \"total_points\": 100}";

        $response = $this->aiService->generateTutoringResponse('rubric', $prompt, $course->name);

        try {
            $rubric = json_decode($response, true) ?? $this->getDefaultRubric();
        } catch (\Exception $e) {
            $rubric = $this->getDefaultRubric();
        }

        return response()->json([
            'success' => true,
            'assignment_type' => $request->assignment_type,
            'skill_level' => $skillLevel,
            'rubric' => $rubric,
            'tips' => $this->getRubricTips($request->assignment_type),
        ]);
    }

    /**
     * GET /api/ai/content/study-plan/{studentId}
     * Generate personalized study plan
     */
    public function generateStudyPlan(Request $request, $studentId): JsonResponse
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
        ]);

        $course = Course::findOrFail($request->course_id);
        
        $competencies = StudentCompetency::where('user_id', $studentId)
            ->where('course_id', $request->course_id)
            ->get()
            ->map(function ($c) {
                return [
                    'outcome' => $c->learningOutcome->title,
                    'current_mastery' => $c->mastery_level,
                ];
            })
            ->toArray();

        $outcomes = $course->learningOutcomes()
            ->limit(5)
            ->pluck('title')
            ->toArray();

        $user = \App\Models\User::find($studentId);
        $studyPlan = $this->aiService->generateStudyPlan($user->name, $competencies, $outcomes);

        return response()->json([
            'success' => true,
            'student_name' => $user->name,
            'course' => $course->only(['id', 'name']),
            'current_competencies' => $competencies,
            'study_plan' => $studyPlan['study_plan'] ?? [],
            'estimated_completion_days' => $studyPlan['estimated_completion_days'] ?? 14,
            'personalized_tips' => $this->getStudyTips($competencies),
        ]);
    }

    protected function getDefaultOutcomes($bloomLevel): array
    {
        return [
            [
                'title' => "Students will be able to identify key concepts in {$bloomLevel} level",
                'description' => 'Master the fundamental understanding required for this course'
            ],
            [
                'title' => "Students will demonstrate {$bloomLevel} knowledge",
                'description' => 'Apply learned concepts to new situations'
            ],
        ];
    }

    protected function getDefaultRubric(): array
    {
        return [
            'criteria' => [
                [
                    'name' => 'Content Mastery',
                    'points' => 40,
                    'descriptors' => [
                        'excellent' => 'Demonstrates comprehensive understanding',
                        'good' => 'Shows solid understanding',
                        'fair' => 'Basic understanding shown',
                        'poor' => 'Limited understanding',
                    ]
                ],
                [
                    'name' => 'Organization',
                    'points' => 30,
                    'descriptors' => [
                        'excellent' => 'Clearly organized and logical flow',
                        'good' => 'Well organized',
                        'fair' => 'Somewhat organized',
                        'poor' => 'Poorly organized',
                    ]
                ],
                [
                    'name' => 'Writing Quality',
                    'points' => 30,
                    'descriptors' => [
                        'excellent' => 'Excellent writing with no errors',
                        'good' => 'Minor errors',
                        'fair' => 'Multiple errors',
                        'poor' => 'Many errors',
                    ]
                ],
            ],
            'total_points' => 100,
        ];
    }

    protected function getImplementationGuide($bloomLevel): array
    {
        return [
            'teaching_methods' => ['Lectures', 'Interactive discussions', 'Hands-on activities', 'Problem-solving sessions'],
            'assessment_types' => ['Quizzes', 'Projects', 'Presentations', 'Critical thinking exercises'],
            'estimated_time' => '2-3 weeks',
            'bloom_level' => $bloomLevel,
        ];
    }

    protected function getRubricTips($assignmentType): array
    {
        $tips = [
            'essay' => ['Focus on thesis clarity', 'Check argumentation flow', 'Verify citations'],
            'project' => ['Assess creativity and implementation', 'Check technical accuracy', 'Evaluate presentation'],
            'code' => ['Check code quality and documentation', 'Verify functionality', 'Assess efficiency'],
        ];

        return $tips[$assignmentType] ?? ['Clear expectations', 'Consistent grading', 'Detailed feedback'];
    }

    protected function getStudyTips($competencies): array
    {
        return [
            'Review weak areas regularly',
            'Use active recall techniques',
            'Teach concepts to others',
            'Practice with real-world examples',
            'Join study groups',
        ];
    }
}
