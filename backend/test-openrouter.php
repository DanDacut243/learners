<?php
require 'vendor/autoload.php';

// Load environment and Laravel app
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\AIService;
use Illuminate\Support\Facades\Log;

echo "🤖 Testing OpenRouter AI Integration with Gemma 3 27B\n";
echo "================================================\n\n";

$aiService = new AIService();

// Test 1: Tutoring Response
echo "TEST 1: AI Tutor Response (Gemma 3 27B)\n";
echo "----------------------------------------\n";
try {
    $response = $aiService->generateTutoringResponse(
        'Quantum Computing',
        'Can you explain what quantum bits (qubits) are and how they differ from classical bits?',
        'Introduction to Quantum Computing - Week 3'
    );
    echo "✓ Response generated:\n";
    echo substr($response, 0, 300) . "...\n\n";
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n\n";
}

// Test 2: Course Content Generation
echo "TEST 2: Course Content Generation\n";
echo "-----------------------------------\n";
try {
    $content = $aiService->generateCourseContent(
        'Machine Learning Fundamentals',
        'Supervised Learning Algorithms',
        3
    );
    echo "✓ Generated " . count($content['modules'] ?? []) . " modules:\n";
    if (isset($content['modules']) && count($content['modules']) > 0) {
        foreach ($content['modules'] as $i => $module) {
            echo "  Module " . ($i + 1) . ": " . ($module['title'] ?? 'Untitled') . "\n";
        }
    }
    echo "\n";
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n\n";
}

// Test 3: Risk Detection
echo "TEST 3: Risk Detection Analysis\n";
echo "--------------------------------\n";
try {
    $studentData = [
        'student_name' => 'Eleanor Vance',
        'grades' => [78, 65, 72, 58],
        'assignments_completed' => 6,
        'total_assignments' => 10,
        'last_submission' => '2026-04-20',
        'attendance_rate' => 0.65
    ];
    
    $riskAnalysis = $aiService->identifyAtRiskStudents($studentData);
    echo "✓ Risk Analysis Complete:\n";
    echo "  At Risk: " . ($riskAnalysis['at_risk'] ? 'YES' : 'NO') . "\n";
    if (isset($riskAnalysis['risk_factors'])) {
        echo "  Risk Factors: " . count($riskAnalysis['risk_factors']) . " identified\n";
    }
    echo "\n";
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n\n";
}

// Test 4: Study Plan Generation
echo "TEST 4: Personalized Study Plan\n";
echo "--------------------------------\n";
try {
    $competencies = ['Basic Python', 'Variables & Data Types', 'Loops'];
    $outcomes = ['Understand functions', 'Master OOP concepts', 'Build real applications'];
    
    $plan = $aiService->generateStudyPlan('Marcus Aurelius', $competencies, $outcomes);
    echo "✓ Study Plan Generated:\n";
    echo "  Estimated Completion: " . ($plan['estimated_completion_days'] ?? 14) . " days\n";
    echo "  Weeks Planned: " . count($plan['study_plan'] ?? []) . "\n";
    echo "\n";
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n\n";
}

// Test 5: Grading Feedback
echo "TEST 5: Grading Feedback Generation\n";
echo "-------------------------------------\n";
try {
    $rubric = [
        'criteria' => [
            'accuracy' => 40,
            'completeness' => 30,
            'clarity' => 30
        ]
    ];
    $submission = 'This is a comprehensive analysis of cloud computing architecture including scalability, reliability, and cost considerations.';
    
    $feedback = $aiService->generateGradingFeedback($rubric, $submission, 85);
    echo "✓ Feedback Generated:\n";
    echo substr($feedback, 0, 200) . "...\n\n";
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n\n";
}

echo "================================================\n";
echo "✅ OpenRouter AI Integration Test Complete\n";
echo "================================================\n";
echo "\nAI Provider: " . config('ai.ai.provider') . "\n";
echo "Model: " . config('ai.openrouter.model') . "\n";
echo "Mock AI Enabled: " . (config('ai.ai.use_mock') ? 'YES' : 'NO') . "\n";
