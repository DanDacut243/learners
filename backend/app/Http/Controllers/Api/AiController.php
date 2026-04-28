<?php

namespace App\Http\Controllers\Api;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\User;
use App\Models\ModuleCompletion;
use App\Models\QuizResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiController
{
    /**
     * AI Tutor Chat — Student asks questions about their course material.
     * Context-aware: injects course modules, student progress, and quiz history.
     */
    public function chat(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:2000',
            'course_id' => 'required|exists:courses,id',
            'module_id' => 'nullable|integer',
            'history' => 'nullable|array',
        ]);

        $user = $request->user();
        $course = Course::with(['modules', 'instructor'])->find($validated['course_id']);

        // Authorization and enrollment check
        $enrollment = null;
        if ($user->role === 'student') {
            // Students can only access AI chat for courses they're enrolled in
            $enrollment = Enrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();
            
            if (!$enrollment) {
                return response()->json(['message' => 'You are not enrolled in this course'], 403);
            }
        } else if ($user->role === 'instructor') {
            // Instructors can only access AI chat for their own courses
            if ($course->instructor_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        } else if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $studentContext = $this->buildStudentContext($user, $course, $enrollment);

        // Build conversation history
        $conversationHistory = [];
        if (!empty($validated['history'])) {
            foreach (array_slice($validated['history'], -6) as $msg) {
                $conversationHistory[] = [
                    'role' => $msg['role'] === 'student' ? 'user' : 'model',
                    'parts' => [['text' => $msg['text']]],
                ];
            }
        }

        // Add current user message
        $conversationHistory[] = [
            'role' => 'user',
            'parts' => [['text' => $validated['message']]],
        ];

        // Get active module context
        $moduleContext = '';
        if (!empty($validated['module_id'])) {
            $module = $course->modules->firstWhere('id', $validated['module_id']);
            if ($module) {
                $moduleContext = "\n\nCurrent Module: \"{$module->title}\" (Type: {$module->type})";
                if ($module->content) {
                    $contentStr = is_array($module->content) ? json_encode($module->content) : $module->content;
                    $moduleContext .= "\nModule Content Summary: " . substr($contentStr, 0, 500);
                }
            }
        }

        $systemPrompt = "You are an expert AI Tutor for the ERUDITE Learning Platform. Your role is to help students understand their course material deeply.

CONTEXT:
- Course: \"{$course->name}\"
- Instructor: {$course->instructor->name}
- Student: {$user->name}{$moduleContext}

STUDENT PERFORMANCE:
{$studentContext}

RULES:
1. Be encouraging, warm, and pedagogically sound.
2. Use analogies and real-world examples to explain complex concepts.
3. If the student is struggling (low quiz scores), simplify your explanations.
4. Reference specific module titles when relevant.
5. Keep responses concise (2-3 paragraphs max) unless the student asks for detail.
6. Use markdown formatting for clarity (bold key terms, bullet lists).
7. If you don't know something specific to the course, say so honestly.
8. End responses with a thought-provoking follow-up question when appropriate.";

        $response = $this->callAI($systemPrompt, $conversationHistory);

        return response()->json([
            'message' => $response,
            'context' => [
                'course' => $course->name,
                'module' => $validated['module_id'] ? $course->modules->firstWhere('id', $validated['module_id'])?->title : null,
            ],
        ]);
    }

    /**
     * Generate dynamic AI Insights for the Admin Dashboard.
     * Analyzes real platform data and returns actionable insights.
     */
    public function insights(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Gather real platform metrics
        $totalStudents = User::where('role', 'student')->count();
        $totalInstructors = User::where('role', 'instructor')->count();
        $activeCourses = Course::where('status', 'active')->count();
        $draftCourses = Course::where('status', 'draft')->count();
        $totalEnrollments = Enrollment::count();
        $completedEnrollments = Enrollment::whereNotNull('completed_at')->count();
        $activeEnrollments = Enrollment::where('status', 'active')->count();
        $completionRate = $totalEnrollments > 0
            ? round(($completedEnrollments / $totalEnrollments) * 100, 1)
            : 0;

        // Get recent enrollment trend (last 7 days vs previous 7 days)
        $recentEnrollments = Enrollment::where('created_at', '>=', now()->subDays(7))->count();
        $previousEnrollments = Enrollment::whereBetween('created_at', [now()->subDays(14), now()->subDays(7)])->count();
        $enrollmentTrend = $previousEnrollments > 0
            ? round((($recentEnrollments - $previousEnrollments) / $previousEnrollments) * 100, 1)
            : ($recentEnrollments > 0 ? 100 : 0);

        // Get average quiz scores
        $avgQuizScore = QuizResult::avg('score') ?? 0;

        // Find courses with low completion
        $lowCompletionCourses = Course::where('status', 'active')
            ->withCount(['enrollments as total_enrollments'])
            ->get()
            ->filter(fn($c) => $c->total_enrollments > 0)
            ->sortBy('total_enrollments')
            ->take(3)
            ->pluck('name')
            ->toArray();

        $dataContext = "Platform Metrics:
- Total Students: {$totalStudents}
- Total Instructors: {$totalInstructors}
- Active Courses: {$activeCourses}
- Draft Courses: {$draftCourses}
- Total Enrollments: {$totalEnrollments}
- Completed Enrollments: {$completedEnrollments}
- Active Enrollments: {$activeEnrollments}
- Completion Rate: {$completionRate}%
- Enrollment Trend (7-day): {$enrollmentTrend}%
- Average Quiz Score: " . round($avgQuizScore, 1) . "%
- Low-enrollment courses: " . implode(', ', $lowCompletionCourses);

        $systemPrompt = "You are an AI analytics assistant for the ERUDITE Learning Management System admin dashboard. Based on the following REAL platform data, generate exactly 3 brief, actionable insights. Each insight should be 1 sentence max. Format as a JSON array of objects with 'icon' (material icon name), 'title' (short label), and 'text' (the insight).

Example format:
[{\"icon\":\"trending_up\",\"title\":\"Growth\",\"text\":\"Enrollment increased 14% this week.\"}]

Only return the JSON array, nothing else.";

        $response = $this->callAI($systemPrompt, [
            ['role' => 'user', 'parts' => [['text' => $dataContext]]],
        ]);

        // Try to parse AI response as JSON
        $insights = $this->parseJsonResponse($response);

        if (empty($insights)) {
            // Fallback: generate insights from raw data
            $insights = $this->generateFallbackInsights(
                $totalStudents, $activeCourses, $completionRate,
                $enrollmentTrend, $avgQuizScore, $draftCourses
            );
        }

        return response()->json([
            'insights' => $insights,
            'metrics' => [
                'students' => $totalStudents,
                'instructors' => $totalInstructors,
                'activeCourses' => $activeCourses,
                'completionRate' => $completionRate,
                'enrollmentTrend' => $enrollmentTrend,
                'avgQuizScore' => round($avgQuizScore, 1),
            ],
        ]);
    }

    /**
     * Predict at-risk students for an instructor's course.
     */
    public function predictRisk(Request $request, $courseId)
    {
        $course = Course::find($courseId);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        if ($course->instructor_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $enrollments = Enrollment::where('course_id', $courseId)
            ->with('user')
            ->get();

        $riskData = $enrollments->map(function ($enrollment) use ($course) {
            $completedModules = ModuleCompletion::where('enrollment_id', $enrollment->id)->count();
            $totalModules = $course->modules()->count();
            $progress = $totalModules > 0 ? round(($completedModules / $totalModules) * 100) : 0;

            $quizResults = QuizResult::where('enrollment_id', $enrollment->id)->get();
            $avgScore = $quizResults->isNotEmpty() ? round($quizResults->avg('score')) : null;

            // Simple risk calculation
            $riskScore = 0;
            if ($progress < 30) $riskScore += 40;
            elseif ($progress < 60) $riskScore += 20;

            if ($avgScore !== null && $avgScore < 60) $riskScore += 35;
            elseif ($avgScore !== null && $avgScore < 75) $riskScore += 15;

            // Check for inactivity (no completions in last 7 days)
            $recentActivity = ModuleCompletion::where('enrollment_id', $enrollment->id)
                ->where('created_at', '>=', now()->subDays(7))
                ->exists();
            if (!$recentActivity && $progress < 100) $riskScore += 25;

            $riskLevel = $riskScore >= 60 ? 'High' : ($riskScore >= 30 ? 'Medium' : 'Low');

            return [
                'student_id' => $enrollment->user->id,
                'student_name' => $enrollment->user->name,
                'progress' => $progress,
                'avg_quiz_score' => $avgScore ?? 0,
                'risk_score' => min($riskScore, 100),
                'risk_level' => $riskLevel,
                'recent_activity' => $recentActivity,
                'recommendation' => $this->getRiskRecommendation($riskLevel, $progress, $avgScore),
            ];
        })->sortByDesc('risk_score')->values();

        return response()->json([
            'course' => $course->name,
            'total_students' => $riskData->count(),
            'at_risk_count' => $riskData->filter(fn($s) => $s['risk_level'] !== 'Low')->count(),
            'students' => $riskData->toArray(),
        ]);
    }

    /**
     * Call the AI model via OpenRouter (OpenAI-compatible API).
     */
    private function callAI(string $systemPrompt, array $contents): string
    {
        $apiKey = env('OPENROUTER_API_KEY');
        $model = env('OPENROUTER_MODEL', 'google/gemma-3-27b-it:free');

        if (empty($apiKey)) {
            return $this->getFallbackResponse($contents);
        }

        try {
            // Convert contents to OpenAI message format
            $messages = [
                ['role' => 'system', 'content' => $systemPrompt],
            ];

            foreach ($contents as $content) {
                $role = ($content['role'] ?? 'user') === 'model' ? 'assistant' : 'user';
                $text = $content['parts'][0]['text'] ?? ($content['text'] ?? '');
                if (!empty($text)) {
                    $messages[] = ['role' => $role, 'content' => $text];
                }
            }

            $response = Http::timeout(60)
                ->withHeaders([
                    'Authorization' => "Bearer {$apiKey}",
                    'HTTP-Referer' => config('app.url', 'http://localhost'),
                    'X-Title' => 'ERUDITE LMS',
                    'Content-Type' => 'application/json',
                ])
                ->post('https://openrouter.ai/api/v1/chat/completions', [
                    'model' => $model,
                    'messages' => $messages,
                    'temperature' => 0.7,
                    'max_tokens' => 1024,
                    'top_p' => 0.9,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $reply = $data['choices'][0]['message']['content'] ?? null;

                if ($reply) {
                    return trim($reply);
                }

                Log::warning('OpenRouter empty response: ' . json_encode($data));
                return $this->getFallbackResponse($contents);
            }

            Log::warning('OpenRouter API error: ' . $response->status() . ' - ' . $response->body());
            return $this->getFallbackResponse($contents);

        } catch (\Exception $e) {
            Log::error('OpenRouter API exception: ' . $e->getMessage());
            return $this->getFallbackResponse($contents);
        }
    }

    /**
     * Fallback response when Gemini API is unavailable.
     * Uses intelligent pattern-matching on the question to give helpful responses.
     */
    private function getFallbackResponse(array $contents): string
    {
        $lastMessage = '';
        foreach ($contents as $content) {
            if (($content['role'] ?? '') === 'user') {
                $lastMessage = $content['parts'][0]['text'] ?? '';
            }
        }

        $lower = strtolower($lastMessage);

        if (str_contains($lower, 'explain') || str_contains($lower, 'what is') || str_contains($lower, 'how does')) {
            return "Great question! Let me break this down for you:\n\n" .
                "This concept is fundamental to understanding the module material. Think of it like building blocks — " .
                "each piece connects to form the larger picture.\n\n" .
                "**Key points to remember:**\n" .
                "- Start with the basics and build up gradually\n" .
                "- Practice with the examples in your module\n" .
                "- Connect it to real-world applications\n\n" .
                "Would you like me to go deeper into any specific aspect?";
        }

        if (str_contains($lower, 'quiz') || str_contains($lower, 'test') || str_contains($lower, 'exam')) {
            return "Here are some tips for your assessment preparation:\n\n" .
                "1. **Review the key concepts** from each module\n" .
                "2. **Practice problems** — the more you solve, the more confident you'll feel\n" .
                "3. **Focus on understanding**, not memorization\n" .
                "4. **Review your previous quiz results** to identify weak areas\n\n" .
                "What specific topic would you like to review?";
        }

        if (str_contains($lower, 'help') || str_contains($lower, 'stuck') || str_contains($lower, 'confused')) {
            return "Don't worry — getting stuck is a natural part of learning! 💪\n\n" .
                "Here's what I suggest:\n" .
                "- **Re-read the current module** with fresh eyes\n" .
                "- **Break the problem down** into smaller parts\n" .
                "- **Try explaining it to yourself** out loud (the rubber duck method!)\n\n" .
                "Tell me specifically what's confusing you and I'll help you work through it step by step.";
        }

        return "That's an interesting point! Based on your course material, here's what I think:\n\n" .
            "The key is to connect this concept with what you've already learned in previous modules. " .
            "Try to think about it from a practical perspective — how would you apply this in a real scenario?\n\n" .
            "**Pro tip:** Writing short summaries after each module helps reinforce your understanding.\n\n" .
            "What aspect would you like to explore further?";
    }

    /**
     * Build student context string for the AI prompt.
     */
    private function buildStudentContext($user, $course, $enrollment): string
    {
        if (!$enrollment) {
            return "- Not yet enrolled in this course.";
        }

        $completedModules = ModuleCompletion::where('enrollment_id', $enrollment->id)->count();
        $totalModules = $course->modules->count();
        $progress = $totalModules > 0 ? round(($completedModules / $totalModules) * 100) : 0;

        $quizResults = QuizResult::where('enrollment_id', $enrollment->id)->get();
        $avgScore = $quizResults->isNotEmpty() ? round($quizResults->avg('score')) : 0;

        $grade = Grade::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        $context = "- Progress: {$progress}% ({$completedModules}/{$totalModules} modules completed)\n";
        $context .= "- Average Quiz Score: {$avgScore}%\n";
        $context .= "- Quizzes Taken: {$quizResults->count()}\n";
        if ($grade) {
            $context .= "- Current Grade: {$grade->grade}\n";
        }
        $context .= "- Enrollment Status: {$enrollment->status}";

        return $context;
    }

    /**
     * Parse JSON response from AI.
     */
    private function parseJsonResponse(string $response): array
    {
        // Remove markdown code fences if present
        $cleaned = preg_replace('/```json\s*/', '', $response);
        $cleaned = preg_replace('/```\s*/', '', $cleaned);
        $cleaned = trim($cleaned);

        $parsed = json_decode($cleaned, true);
        return is_array($parsed) ? $parsed : [];
    }

    /**
     * Generate fallback insights when AI is unavailable.
     */
    private function generateFallbackInsights($students, $courses, $completion, $trend, $quizAvg, $drafts): array
    {
        $insights = [];

        if ($trend > 0) {
            $insights[] = [
                'icon' => 'trending_up',
                'title' => 'Growing',
                'text' => "Enrollment grew {$trend}% this week — strong momentum across the platform.",
            ];
        } elseif ($trend < 0) {
            $insights[] = [
                'icon' => 'trending_down',
                'title' => 'Declining',
                'text' => "Enrollment dropped " . abs($trend) . "% this week. Consider promoting active courses.",
            ];
        } else {
            $insights[] = [
                'icon' => 'balance',
                'title' => 'Steady',
                'text' => "Enrollment is stable. A good time to launch new courses to drive growth.",
            ];
        }

        if ($completion < 50) {
            $insights[] = [
                'icon' => 'warning',
                'title' => 'Attention',
                'text' => "Completion rate is {$completion}% — consider sending progress reminders to students.",
            ];
        } else {
            $insights[] = [
                'icon' => 'check_circle',
                'title' => 'Healthy',
                'text' => "Strong {$completion}% completion rate across all courses.",
            ];
        }

        if ($drafts > 0) {
            $insights[] = [
                'icon' => 'edit_note',
                'title' => 'Pending',
                'text' => "{$drafts} course(s) are in draft — review and publish to expand catalog.",
            ];
        } else {
            $insights[] = [
                'icon' => 'school',
                'title' => 'Active',
                'text' => "All {$courses} courses are published and live for students.",
            ];
        }

        return $insights;
    }

    /**
     * Get recommendation text for at-risk students.
     */
    private function getRiskRecommendation(string $level, int $progress, ?int $score): string
    {
        if ($level === 'High') {
            if ($progress < 20) return 'Student has barely started. Consider a personal check-in.';
            if ($score !== null && $score < 50) return 'Struggling with assessments. Recommend tutoring or office hours.';
            return 'Falling behind significantly. Intervention recommended.';
        }
        if ($level === 'Medium') {
            if ($progress < 50) return 'Behind schedule. Send a progress reminder.';
            return 'Moderate performance. Encourage continued engagement.';
        }
        return 'On track. No action needed.';
    }
}
