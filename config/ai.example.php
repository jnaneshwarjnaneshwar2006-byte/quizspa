<?php
/**
 * QuizSpark - AI Configuration Local Override Example
 *
 * Copy this file to `config/ai.local.php` (which is git-ignored and never committed)
 * or set environment variables in your server (.env / cPanel / InfinityFree).
 */
return [
    // 🌟 PRIMARY PROVIDER: Google Gemini API Key (Recommended - Free Tier Available)
    'gemini_api_key' => 'AIzaSy_YOUR_REAL_GEMINI_API_KEY_HERE',
    'gemini_model'   => 'gemini-2.5-flash',

    // 🔄 FALLBACK PROVIDER: OpenAI API Key (Optional)
    'openai_api_key' => 'sk-proj-YOUR_REAL_OPENAI_API_KEY_HERE',
    'openai_model'   => 'gpt-4o-mini',
];
