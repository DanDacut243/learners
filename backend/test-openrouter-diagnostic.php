<?php
require 'vendor/autoload.php';

// Load environment
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

echo "🔍 Diagnostics: Checking OpenRouter Configuration\n";
echo "===============================================\n\n";

// Check configuration
echo "1. Configuration Check:\n";
echo "   - AI Provider: " . config('ai.ai.provider') . "\n";
echo "   - Use Mock AI: " . (config('ai.ai.use_mock') ? 'YES' : 'NO') . "\n";
echo "   - OpenRouter API Key exists: " . (config('ai.openrouter.api_key') ? 'YES (length: ' . strlen(config('ai.openrouter.api_key')) . ')' : 'NO') . "\n";
echo "   - OpenRouter Model: " . config('ai.openrouter.model') . "\n";
echo "   - OpenRouter Base URL: " . config('ai.openrouter.base_url') . "\n\n";

// Test direct API call to OpenRouter
echo "2. Testing Direct OpenRouter API Connection:\n";

$apiKey = config('ai.openrouter.api_key');
$model = config('ai.openrouter.model');
$baseUrl = config('ai.openrouter.base_url');

if (!$apiKey) {
    echo "   ✗ ERROR: OpenRouter API key not configured\n";
} else {
    try {
        $response = Http::withHeader('Authorization', 'Bearer ' . $apiKey)
            ->withHeader('HTTP-Referer', config('app.url'))
            ->withHeader('X-Title', 'ERUDITE LMS')
            ->timeout(30)
            ->post($baseUrl . '/chat/completions', [
                'model' => $model,
                'messages' => [
                    ['role' => 'user', 'content' => 'Explain quantum computing in one sentence.']
                ],
                'temperature' => 0.7,
                'max_tokens' => 100,
            ]);

        echo "   - HTTP Status: " . $response->status() . "\n";
        
        if ($response->failed()) {
            echo "   ✗ API Error:\n";
            echo "   " . $response->body() . "\n";
        } else {
            $content = $response->json('choices.0.message.content', null);
            if ($content) {
                echo "   ✓ API Connection Successful!\n";
                echo "   Response: " . substr($content, 0, 100) . "...\n";
            } else {
                echo "   ✗ API returned but no content extracted\n";
                echo "   Full response: " . json_encode($response->json()) . "\n";
            }
        }
    } catch (Exception $e) {
        echo "   ✗ Connection Error: " . $e->getMessage() . "\n";
    }
}

echo "\n3. Environment Variables (.env):\n";
echo "   - OPENROUTER_API_KEY: " . (env('OPENROUTER_API_KEY') ? '✓ SET' : '✗ NOT SET') . "\n";
echo "   - OPENROUTER_MODEL: " . (env('OPENROUTER_MODEL') ? '✓ ' . env('OPENROUTER_MODEL') : '✗ NOT SET') . "\n";
echo "   - AI_PROVIDER: " . env('AI_PROVIDER') . "\n";
echo "   - USE_MOCK_AI: " . env('USE_MOCK_AI') . "\n";

echo "\n===============================================\n";
