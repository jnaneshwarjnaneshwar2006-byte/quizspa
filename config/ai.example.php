<?php
/**
 * QuizSpark - AI Configuration Local Override Example
 *
 * Copy this file to `config/ai.local.php` (which is git-ignored and never committed)
 * or set OPENAI_API_KEY in your server environment variables (.env / Apache / cPanel / InfinityFree).
 */
return [
    // OpenAI API Key (or Google Gemini API Key)
    'openai_api_key' => 'sk-proj-YOUR_REAL_OPENAI_API_KEY_HERE',

    // Configured model name (default: gpt-4o-mini)
    'model' => 'gpt-4o-mini',
];
