<?php

// Test AI Service with real Laravel app bootstrapping
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\AIService;
use App\Models\User;
use App\Models\Course;

$aiService = new AIService();

echo "\n=== AI SERVICE TEST ===\n\n";

// Test 1: Tutoring Response
echo "TEST 1: AI Tutor Response\n";
$tutorResponse = $aiService->generateTutoringResponse('Calculus', 'What is a derivative?', 'Calculus 101');
echo "Response: " . substr($tutorResponse, 0, 100) . "...\n\n";

// Test 2: Content Generation
echo "TEST 2: Course Content Generation\n";
$content = $aiService->generateCourseContent('Web Development', 'React Fundamentals', 5);
echo "Modules generated: " . count($content['modules'] ?? []) . "\n\n";

// Test 3: Risk Analysis
echo "TEST 3: Risk Detection\n";
$studentData = [
    [
        'name' => 'John Doe',
        'avg_grade' => 65,
        'submissions' => 2,
        'competencies' => [50, 55]
    ]
];
$risks = $aiService->identifyAtRiskStudents($studentData);
echo "At Risk: " . ($risks['at_risk'] ? 'YES' : 'NO') . "\n";
echo "Factors: " . count($risks['risk_factors'] ?? []) . "\n\n";

// Test 4: Study Plan
echo "TEST 4: Study Plan Generation\n";
$outcomes = ['Algebra', 'Geometry', 'Trigonometry'];
$competencies = [['outcome' => 'Algebra', 'current_mastery' => 70]];
$plan = $aiService->generateStudyPlan('Student Name', $competencies, $outcomes);
echo "Plan weeks: " . count($plan['study_plan'] ?? []) . "\n";
echo "Est. completion: " . ($plan['estimated_completion_days'] ?? 7) . " days\n\n";

// Test 5: Grading Feedback
echo "TEST 5: Grading Feedback Generation\n";
$rubric = ['Content' => 40, 'Organization' => 30, 'Writing' => 30];
$feedback = $aiService->generateGradingFeedback($rubric, 'Sample student essay', 85);
echo "Feedback: " . substr($feedback, 0, 100) . "...\n\n";

// Database Check
echo "=== DATABASE CHECK ===\n";
$users = User::all(['id', 'name', 'email', 'role']);
echo "Total Users: " . $users->count() . "\n";
echo "Users:\n";
foreach ($users as $user) {
    echo "  - {$user->name} ({$user->email}) - {$user->role}\n";
}

$courses = Course::all(['id', 'name', 'instructor_id']);
echo "\nTotal Courses: " . $courses->count() . "\n";
echo "Courses:\n";
foreach ($courses as $course) {
    echo "  - {$course->name} (ID: {$course->id})\n";
}

echo "\n✅ AI Service Test Complete\n";
