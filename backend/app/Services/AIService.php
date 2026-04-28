<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    protected string $provider;
    protected bool $useMockAI;
    protected ?string $openaiKey;
    protected ?string $anthropicKey;
    protected ?string $openrouterKey;
    protected ?string $openrouterModel;

    public function __construct()
    {
        $this->provider = config('ai.ai.provider', 'openrouter');
        $this->useMockAI = config('ai.ai.use_mock', false);
        $this->openaiKey = config('ai.openai.api_key');
        $this->anthropicKey = config('ai.anthropic.api_key');
        $this->openrouterKey = config('ai.openrouter.api_key');
        $this->openrouterModel = config('ai.openrouter.model', 'google/gemma-3-27b-it:free');
    }

    /**
     * Generate AI tutoring response for student question
     */
    public function generateTutoringResponse(string $topic, string $question, string $courseContext = ''): string
    {
        $prompt = "You are an expert educational tutor. Student is asking about: {$topic}\n\nCourse Context: {$courseContext}\n\nStudent Question: {$question}\n\nProvide a clear, concise explanation with examples.";

        return $this->callAI($prompt);
    }

    /**
     * Generate course content/module outline
     */
    public function generateCourseContent(string $courseTitle, string $topic, int $numberOfModules = 5): array
    {
        $prompt = "Generate a structured course outline for '{$courseTitle}' on the topic '{$topic}' with {$numberOfModules} modules. For each module, provide a title and 3-4 learning objectives. Format as JSON: {\"modules\": [{\"title\": \"\", \"objectives\": []}]}";

        $response = $this->callAI($prompt);
        
        try {
            return json_decode($response, true) ?? ['modules' => []];
        } catch (Exception $e) {
            Log::warning('Failed to parse AI content generation response', ['error' => $e->getMessage()]);
            return ['modules' => []];
        }
    }

    /**
     * Analyze student performance and identify risks
     */
    public function identifyAtRiskStudents(array $studentData): array
    {
        $prompt = "Analyze this student performance data and identify risk factors:\n" . json_encode($studentData) . 
                  "\n\nReturn a JSON object with: {\"at_risk\": boolean, \"risk_factors\": [], \"recommendations\": []}";

        $response = $this->callAI($prompt);
        
        try {
            return json_decode($response, true) ?? ['at_risk' => false, 'risk_factors' => [], 'recommendations' => []];
        } catch (Exception $e) {
            Log::warning('Failed to parse risk analysis', ['error' => $e->getMessage()]);
            return ['at_risk' => false, 'risk_factors' => [], 'recommendations' => []];
        }
    }

    /**
     * Generate personalized study recommendations
     */
    public function generateStudyPlan(string $studentName, array $competencies, array $learningOutcomes): array
    {
        $prompt = "Generate a personalized study plan for student '{$studentName}'.\n\nCurrent Competencies: " . json_encode($competencies) . 
                  "\n\nLearning Outcomes to Master: " . json_encode($learningOutcomes) . 
                  "\n\nReturn JSON: {\"study_plan\": [{\"week\": 1, \"tasks\": [], \"resources\": []}], \"estimated_completion_days\": 0}";

        $response = $this->callAI($prompt);
        
        try {
            return json_decode($response, true) ?? ['study_plan' => [], 'estimated_completion_days' => 7];
        } catch (Exception $e) {
            Log::warning('Failed to generate study plan', ['error' => $e->getMessage()]);
            return ['study_plan' => [], 'estimated_completion_days' => 7];
        }
    }

    /**
     * Generate grading feedback using rubric
     */
    public function generateGradingFeedback(array $rubric, string $submissionContent, int $score): string
    {
        $prompt = "You are an expert educator grading student work.\n\nRubric: " . json_encode($rubric) . 
                  "\n\nStudent Submission: " . substr($submissionContent, 0, 500) . 
                  "\n\nScore Given: {$score}/100\n\nGenerate constructive, encouraging feedback that highlights strengths and areas for improvement.";

        return $this->callAI($prompt);
    }

    /**
     * Main AI call - routes to appropriate provider or mock
     */
    protected function callAI(string $prompt): string
    {
        try {
            // Try OpenRouter first if configured
            if ($this->provider === 'openrouter' && $this->openrouterKey) {
                return $this->callOpenRouter($prompt);
            }

            // Try Anthropic if configured
            if ($this->provider === 'anthropic' && $this->anthropicKey) {
                return $this->callAnthropic($prompt);
            }
            
            // Try OpenAI if configured
            if ($this->openaiKey) {
                return $this->callOpenAI($prompt);
            }

            // Fallback to mock if no providers configured
            return $this->mockAIResponse($prompt);
        } catch (Exception $e) {
            Log::error('AI API call failed', ['error' => $e->getMessage(), 'provider' => $this->provider]);
            return $this->mockAIResponse($prompt);
        }
    }

    /**
     * Call OpenRouter API (Gemma 3 27B)
     */
    protected function callOpenRouter(string $prompt): string
    {
        $baseUrl = config('ai.openrouter.base_url', 'https://openrouter.ai/api/v1');
        
        $response = Http::withHeader('Authorization', 'Bearer ' . $this->openrouterKey)
            ->withHeader('HTTP-Referer', config('app.url'))
            ->withHeader('X-Title', 'ERUDITE LMS')
            ->post($baseUrl . '/chat/completions', [
                'model' => $this->openrouterModel,
                'messages' => [
                    ['role' => 'system', 'content' => 'You are an expert educational AI assistant for a learning management system. Provide clear, accurate, and helpful responses grounded in real educational principles.'],
                    ['role' => 'user', 'content' => $prompt]
                ],
                'temperature' => config('ai.openrouter.temperature', 0.7),
                'max_tokens' => config('ai.openrouter.max_tokens', 2000),
            ]);

        if ($response->failed()) {
            throw new Exception('OpenRouter API error: ' . $response->status() . ' - ' . $response->body());
        }

        return $response->json('choices.0.message.content', 'No response generated');
    }

    /**
     * Call OpenAI API
     */
    protected function callOpenAI(string $prompt): string
    {
        $response = Http::withToken($this->openaiKey)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are an expert educational AI assistant.'],
                    ['role' => 'user', 'content' => $prompt]
                ],
                'temperature' => 0.7,
                'max_tokens' => 1000,
            ]);

        if ($response->failed()) {
            throw new Exception('OpenAI API error: ' . $response->status());
        }

        return $response->json('choices.0.message.content', 'No response generated');
    }

    /**
     * Call Anthropic API
     */
    protected function callAnthropic(string $prompt): string
    {
        $response = Http::withHeader('x-api-key', $this->anthropicKey)
            ->withHeader('anthropic-version', '2023-06-01')
            ->post('https://api.anthropic.com/v1/messages', [
                'model' => 'claude-3-haiku-20240307',
                'max_tokens' => 1000,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ],
            ]);

        if ($response->failed()) {
            throw new Exception('Anthropic API error: ' . $response->status());
        }

        return $response->json('content.0.text', 'No response generated');
    }

    /**
     * Mock AI response for offline/testing
     * Generates intelligent-sounding responses without API calls
     */
    protected function mockAIResponse(string $prompt): string
    {
        $responses = [
            // Tutoring responses
            'understand' => 'Great question! Let me break this down for you:\n\n1. **Core Concept**: This topic is fundamental because...\n2. **Practical Application**: Here\'s how you\'d use this in real-world scenarios...\n3. **Key Takeaway**: Remember that the main idea is...\n\nTry working through this practice problem to solidify your understanding!',
            
            'learning' => 'Excellent thinking! This concept builds on what you\'ve already learned about the previous topics. Here\'s how it connects:\n\n- Previous knowledge: [Foundation]\n- Current concept: [Building on foundation]\n- Future applications: [Where you\'ll use this]\n\nWould you like me to walk through an example?',
            
            // Content generation
            'module' => '{"modules": [{"title": "Foundations", "objectives": ["Understand core concepts", "Identify key principles", "Apply basics"]}, {"title": "Intermediate Skills", "objectives": ["Develop practical abilities", "Solve complex problems", "Integrate concepts"]}, {"title": "Advanced Applications", "objectives": ["Master advanced techniques", "Create innovative solutions", "Analyze critically"]}]}',
            
            // Risk detection
            'risk' => '{"at_risk": false, "risk_factors": [], "recommendations": ["Continue current study pace", "Engage with peer learning groups", "Utilize office hours for advanced topics"]}',
            
            // Study plan
            'study' => '{"study_plan": [{"week": 1, "tasks": ["Review foundational concepts", "Complete practice problems", "Watch tutorial videos"], "resources": ["Chapter 1-2", "Practice set A", "Video series"]}], "estimated_completion_days": 14}',
            
            // Default
            'default' => 'Based on your question, here\'s what I\'ve analyzed:\n\n**Key Points:**\n- This is an important concept that requires understanding multiple components\n- The relationship between components is: [interconnected]\n- You should focus on: [core principles]\n\n**Recommended Next Steps:**\n1. Review the foundational material\n2. Practice with concrete examples\n3. Connect to real-world applications\n\nLet me know if you need clarification on any part!'
        ];

        // Determine response type based on prompt keywords
        $prompt_lower = strtolower($prompt);
        
        if (strpos($prompt_lower, 'tutor') !== false || strpos($prompt_lower, 'question') !== false) {
            return $responses['learning'];
        } elseif (strpos($prompt_lower, 'course') !== false || strpos($prompt_lower, 'module') !== false) {
            return $responses['module'];
        } elseif (strpos($prompt_lower, 'risk') !== false || strpos($prompt_lower, 'struggling') !== false) {
            return $responses['risk'];
        } elseif (strpos($prompt_lower, 'study') !== false || strpos($prompt_lower, 'plan') !== false) {
            return $responses['study'];
        }
        
        return $responses['default'];
    }
}
