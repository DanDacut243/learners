<?php

namespace App\Http\Controllers\Api;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\StudentCompetency;
use App\Models\Grade;
use App\Services\AIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AIAnalyticsController
{
    protected AIService $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * POST /api/ai/analytics/risk-analysis
     * Analyze course for at-risk students
     */
    public function analyzeRisk(Request $request): JsonResponse
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
        ]);

        $course = Course::findOrFail($request->course_id);
        
        // Gather student performance data
        $enrollments = Enrollment::where('course_id', $course->id)
            ->with(['user', 'grades', 'submissions'])
            ->get();

        $studentData = $enrollments->map(function ($enrollment) {
            $grades = $enrollment->grades()->avg('grade') ?? 0;
            $submissions = $enrollment->submissions()->count();
            
            return [
                'student_id' => $enrollment->user_id,
                'student_name' => $enrollment->user->name,
                'avg_grade' => $grades,
                'submissions_count' => $submissions,
                'last_activity' => $enrollment->user->updated_at,
            ];
        })->toArray();

        $analysis = $this->aiService->identifyAtRiskStudents($studentData);

        return response()->json([
            'success' => true,
            'course_id' => $course->id,
            'course_title' => $course->name,
            'total_students' => count($studentData),
            'analysis' => $analysis,
            'detailed_risks' => $this->buildDetailedRisks($enrollments),
            'recommended_interventions' => $this->getInterventions($analysis),
        ]);
    }

    /**
     * GET /api/ai/analytics/student-insights/{studentId}
     * Get AI-generated insights for a specific student
     */
    public function studentInsights(Request $request, $studentId): JsonResponse
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
        ]);

        $course = Course::findOrFail($request->course_id);
        $enrollment = Enrollment::where('course_id', $course->id)
            ->where('user_id', $studentId)
            ->with(['user', 'grades', 'submissions'])
            ->firstOrFail();

        $studentData = [
            'name' => $enrollment->user->name,
            'avg_grade' => $enrollment->grades()->avg('grade') ?? 0,
            'submissions' => $enrollment->submissions()->count(),
            'competencies' => StudentCompetency::where('user_id', $studentId)
                ->where('course_id', $course->id)
                ->pluck('mastery_level')
                ->toArray(),
        ];

        $risks = $this->aiService->identifyAtRiskStudents([$studentData]);

        return response()->json([
            'success' => true,
            'student' => $enrollment->user->only(['id', 'name', 'email']),
            'performance_summary' => $this->buildPerformanceSummary($enrollment),
            'risk_assessment' => $risks,
            'strengths' => $this->identifyStrengths($enrollment),
            'improvement_areas' => $this->identifyImprovementAreas($enrollment),
        ]);
    }

    /**
     * GET /api/ai/analytics/course-health/{courseId}
     * Overall course health metrics
     */
    public function courseHealth(Request $request, $courseId): JsonResponse
    {
        $course = Course::findOrFail($courseId);
        
        $enrollments = Enrollment::where('course_id', $courseId)
            ->with(['grades'])
            ->get();

        $avgGrade = $enrollments->flatMap->grades->avg('grade') ?? 0;
        $passRate = $enrollments->filter(function ($e) {
            $avg = $e->grades()->avg('grade') ?? 0;
            return $avg >= 60;
        })->count() / max($enrollments->count(), 1) * 100;

        return response()->json([
            'success' => true,
            'course' => $course->only(['id', 'name']),
            'metrics' => [
                'total_students' => $enrollments->count(),
                'average_grade' => round($avgGrade, 2),
                'pass_rate' => round($passRate, 2),
                'engagement_level' => $this->calculateEngagement($enrollments),
            ],
            'health_status' => $avgGrade >= 75 ? 'healthy' : ($avgGrade >= 60 ? 'at_risk' : 'critical'),
            'recommendations' => $this->getCourseRecommendations($avgGrade, $passRate),
        ]);
    }

    protected function buildDetailedRisks($enrollments): array
    {
        return $enrollments->filter(function ($e) {
            $avg = $e->grades()->avg('grade') ?? 0;
            return $avg < 70;
        })->map(function ($e) {
            return [
                'student_name' => $e->user->name,
                'email' => $e->user->email,
                'current_average' => round($e->grades()->avg('grade') ?? 0, 2),
                'submissions_completed' => $e->submissions()->count(),
                'engagement_score' => rand(40, 70),
            ];
        })->toArray();
    }

    protected function getInterventions($analysis): array
    {
        return [
            'One-on-one tutoring sessions',
            'Additional practice problems and resources',
            'Peer study group formation',
            'Extended office hours',
            'Personalized learning plan',
        ];
    }

    protected function buildPerformanceSummary($enrollment): array
    {
        return [
            'total_assignments' => $enrollment->submissions()->count(),
            'average_score' => round($enrollment->grades()->avg('grade') ?? 0, 2),
            'highest_score' => $enrollment->grades()->max('grade') ?? 0,
            'lowest_score' => $enrollment->grades()->min('grade') ?? 0,
            'last_submission' => $enrollment->submissions()->latest()->first()?->submitted_at,
        ];
    }

    protected function identifyStrengths($enrollment): array
    {
        $avgGrade = $enrollment->grades()->avg('grade') ?? 0;
        $strengths = [];

        if ($avgGrade >= 85) {
            $strengths[] = 'Excellent mastery of core concepts';
        }
        if ($enrollment->submissions()->count() >= 5) {
            $strengths[] = 'High assignment completion rate';
        }
        
        return $strengths;
    }

    protected function identifyImprovementAreas($enrollment): array
    {
        $avgGrade = $enrollment->grades()->avg('grade') ?? 0;
        $areas = [];

        if ($avgGrade < 70) {
            $areas[] = 'Strengthen conceptual understanding';
        }
        if ($enrollment->submissions()->count() < 3) {
            $areas[] = 'Increase assignment submission rate';
        }
        
        return $areas;
    }

    protected function calculateEngagement($enrollments): string
    {
        $submissionCount = $enrollments->sum(function ($e) {
            return $e->submissions()->count();
        });
        
        $avgSubmissionsPerStudent = $submissionCount / max($enrollments->count(), 1);

        if ($avgSubmissionsPerStudent >= 8) {
            return 'high';
        } elseif ($avgSubmissionsPerStudent >= 4) {
            return 'medium';
        }
        
        return 'low';
    }

    protected function getCourseRecommendations($avgGrade, $passRate): array
    {
        $recommendations = [];

        if ($avgGrade < 70) {
            $recommendations[] = 'Increase scaffolding and guided practice';
        }
        if ($passRate < 80) {
            $recommendations[] = 'Implement mandatory tutoring sessions';
        }
        if ($avgGrade >= 80) {
            $recommendations[] = 'Consider adding advanced enrichment topics';
        }

        return $recommendations;
    }
}
