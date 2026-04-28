<?php

return [
    'default' => env('AI_PROVIDER', 'openrouter'),

    'ai' => [
        'provider' => env('AI_PROVIDER', 'openrouter'),
        'use_mock' => env('USE_MOCK_AI', false),
    ],

    'openrouter' => [
        'api_key' => env('OPENROUTER_API_KEY'),
        'model' => env('OPENROUTER_MODEL', 'google/gemma-3-27b-it:free'),
        'temperature' => 0.7,
        'max_tokens' => 2000,
        'base_url' => 'https://openrouter.ai/api/v1',
    ],

    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
        'model' => 'gpt-3.5-turbo',
        'temperature' => 0.7,
        'max_tokens' => 1000,
    ],

    'anthropic' => [
        'api_key' => env('ANTHROPIC_API_KEY'),
        'model' => 'claude-3-haiku-20240307',
        'max_tokens' => 1000,
    ],
];
