<?php
/**
 * QuizSpark AI Quiz Generator - Real LLM Configuration, Provider Integration & Strict Validation
 * Stack: PHP + MySQL + JavaScript
 */

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/session.php';
require_once __DIR__ . '/security.php';

// Rate Limits (per hour per creator)
if (!defined('AI_RATE_LIMIT_GENERATE')) define('AI_RATE_LIMIT_GENERATE', 15);
if (!defined('AI_RATE_LIMIT_REGENERATE')) define('AI_RATE_LIMIT_REGENERATE', 30);
if (!defined('AI_RATE_LIMIT_CHAT')) define('AI_RATE_LIMIT_CHAT', 60);

/**
 * Standard AI JSON Success Response
 */
function sendAiResponse(bool $success, string $message, array $data = [], int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data'    => $data
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Standard AI JSON Error Response
 */
function sendAiError(string $code, string $message, array $fields = [], int $statusCode = 400): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    $error = [
        'code'    => $code,
        'message' => $message
    ];
    if (!empty($fields)) {
        $error['fields'] = $fields;
    }
    echo json_encode([
        'success'    => false,
        'message'    => $message,
        'error_code' => $code,
        'error'      => $error
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Require Authenticated Creator/Teacher
 */
function requireCreatorAuth(): int {
    if (!isTeacherLoggedIn()) {
        sendAiError('AUTH_REQUIRED', 'Authentication required. Please log in as a teacher/creator.', [], 401);
    }
    $teacherId = getTeacherId();
    if (!$teacherId) {
        sendAiError('AUTH_REQUIRED', 'Invalid teacher session.', [], 401);
    }
    return (int)$teacherId;
}

/**
 * CSRF Validation for state-changing requests
 */
function verifyAiCsrf(): void {
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
    if (!$token) {
        $raw = file_get_contents('php://input');
        if (!empty($raw)) {
            $parsed = json_decode($raw, true);
            $token = $parsed['csrf_token'] ?? null;
        }
    }
    if (!$token && isset($_POST['csrf_token'])) {
        $token = $_POST['csrf_token'];
    }

    if (!validateCsrfToken($token)) {
        sendAiError('CSRF_ERROR', 'Invalid or missing session CSRF token. Please refresh the page.', [], 403);
    }
}

/**
 * Check & record sliding-window rate limit
 */
function enforceRateLimit(PDO $pdo, int $teacherId, string $action): void {
    $limits = [
        'generate'   => AI_RATE_LIMIT_GENERATE,
        'regenerate' => AI_RATE_LIMIT_REGENERATE,
        'chat'       => AI_RATE_LIMIT_CHAT
    ];
    $maxPerHour = $limits[$action] ?? 20;

    try {
        if (mt_rand(1, 50) === 1) {
            $pdo->exec("DELETE FROM `ai_rate_limits` WHERE `created_at` < NOW() - INTERVAL 24 HOUR");
        }

        $stmt = $pdo->prepare("
            SELECT COUNT(*) FROM `ai_rate_limits` 
            WHERE `teacher_id` = :t_id AND `action` = :act AND `created_at` >= NOW() - INTERVAL 1 HOUR
        ");
        $stmt->execute(['t_id' => $teacherId, 'act' => $action]);
        $count = (int)$stmt->fetchColumn();

        if ($count >= $maxPerHour) {
            logAiEvent($teacherId, 'rate_limit_exceeded', ['action' => $action, 'count' => $count]);
            sendAiError('RATE_LIMITED', 'AI generation limit reached. Please try again later.', [], 429);
        }

        $ins = $pdo->prepare("INSERT INTO `ai_rate_limits` (`teacher_id`, `action`, `created_at`) VALUES (:t_id, :act, NOW())");
        $ins->execute(['t_id' => $teacherId, 'act' => $action]);

    } catch (Exception $e) {
        error_log("[QuizSpark AI RateLimit Warning] " . $e->getMessage());
    }
}

/**
 * Verify Quiz Ownership and Draft Status
 */
function verifyQuizOwnership(PDO $pdo, int $quizId, int $teacherId, bool $requireDraft = true): array {
    if ($quizId <= 0) {
        sendAiError('VALIDATION_ERROR', 'Valid Quiz ID is required.', ['quiz_id' => 'Must be a positive integer.'], 400);
    }

    $stmt = $pdo->prepare("SELECT * FROM `quizzes` WHERE `id` = :id LIMIT 1");
    $stmt->execute(['id' => $quizId]);
    $quiz = $stmt->fetch();

    if (!$quiz) {
        sendAiError('NOT_FOUND', 'Quiz not found.', [], 404);
    }

    if ((int)$quiz['teacher_id'] !== $teacherId) {
        sendAiError('FORBIDDEN', 'You are not authorized to modify this quiz.', [], 403);
    }

    if ($requireDraft && $quiz['status'] !== 'draft') {
        if ($quiz['status'] === 'published') {
            sendAiError('QUIZ_ALREADY_PUBLISHED', 'This quiz is already published and cannot be modified as a draft.', [], 400);
        } else {
            sendAiError('DRAFT_REQUIRED', 'This operation is only allowed on draft quizzes.', [], 400);
        }
    }

    return $quiz;
}

/**
 * Format Question for API Response
 */
function formatQuestionResponse(array $q): array {
    $qType = ($q['question_type'] === 'true_false') ? 'true_false' : 'mcq';
    $options = [];
    if ($qType === 'true_false') {
        $options = ['True', 'False'];
    } else {
        $options = [
            $q['option_a'] ?? '',
            $q['option_b'] ?? '',
            $q['option_c'] ?? '',
            $q['option_d'] ?? ''
        ];
    }

    $correctOption = strtoupper(trim($q['correct_option'] ?? 'A'));
    $letterToIndex = ['A' => 0, 'B' => 1, 'C' => 2, 'D' => 3];
    $idx = $letterToIndex[$correctOption] ?? 0;
    $correctAnswer = $options[$idx] ?? ($options[0] ?? 'Option A');

    return [
        'id'              => (int)($q['id'] ?? 0),
        'question_number' => (int)($q['question_number'] ?? 1),
        'question_text'   => $q['question_text'] ?? '',
        'question_type'   => $qType,
        'options'         => $options,
        'option_a'        => $q['option_a'] ?? ($options[0] ?? ''),
        'option_b'        => $q['option_b'] ?? ($options[1] ?? ''),
        'option_c'        => $q['option_c'] ?? ($options[2] ?? null),
        'option_d'        => $q['option_d'] ?? ($options[3] ?? null),
        'correct_answer'  => $correctAnswer,
        'correct_option'  => $correctOption,
        'explanation'     => $q['explanation'] ?? '',
        'points'          => (int)($q['points'] ?? 100),
        'difficulty'      => $q['difficulty'] ?? 'medium',
        'time_limit'      => (int)($q['time_limit'] ?? 10)
    ];
}

/**
 * Get configured AI API Key from environment or local config
 */
function getAiApiKey(): ?string {
    $keys = ['OPENAI_API_KEY', 'AI_API_KEY', 'GEMINI_API_KEY'];
    foreach ($keys as $k) {
        if (!empty($_ENV[$k])) return trim($_ENV[$k]);
        if (!empty($_SERVER[$k])) return trim($_SERVER[$k]);
        $val = getenv($k);
        if (!empty($val)) return trim($val);
    }

    $localConfigFile = __DIR__ . '/ai.local.php';
    if (file_exists($localConfigFile)) {
        $conf = require $localConfigFile;
        if (is_array($conf)) {
            if (!empty($conf['openai_api_key'])) return trim($conf['openai_api_key']);
            if (!empty($conf['api_key'])) return trim($conf['api_key']);
        } elseif (is_string($conf) && !empty($conf)) {
            return trim($conf);
        }
    }

    return null;
}

/**
 * Get configured AI Model Name
 */
function getAiModel(): string {
    $keys = ['AI_MODEL', 'OPENAI_MODEL'];
    foreach ($keys as $k) {
        if (!empty($_ENV[$k])) return trim($_ENV[$k]);
        if (!empty($_SERVER[$k])) return trim($_SERVER[$k]);
        $val = getenv($k);
        if (!empty($val)) return trim($val);
    }

    $localConfigFile = __DIR__ . '/ai.local.php';
    if (file_exists($localConfigFile)) {
        $conf = require $localConfigFile;
        if (is_array($conf) && !empty($conf['model'])) {
            return trim($conf['model']);
        }
    }

    return 'gpt-4o-mini';
}

/**
 * Execute Real LLM API Call (OpenAI API / Gemini fallback)
 *
 * @param string $systemPrompt
 * @param string $userPrompt
 * @param int $timeout
 * @return array ['success' => bool, 'data' => array, 'code' => string, 'message' => string]
 */
function callAiService(string $systemPrompt, string $userPrompt, int $timeout = 40): array {
    $apiKey = getAiApiKey();

    if (empty($apiKey)) {
        error_log("[QuizSpark AI Config Error] Server AI API key is not configured.");
        return [
            'success' => false,
            'code'    => 'AI_NOT_CONFIGURED',
            'message' => 'AI service is not configured. Please configure the server AI API key.'
        ];
    }

    // Determine provider based on key format or prefix
    $isGeminiKey = (str_starts_with($apiKey, 'AIzaSy') || strlen($apiKey) === 39);

    if ($isGeminiKey) {
        return callGeminiApi($apiKey, $systemPrompt, $userPrompt, $timeout);
    }

    return callOpenAiApi($apiKey, $systemPrompt, $userPrompt, $timeout);
}

/**
 * Real OpenAI API Integration (Chat Completions JSON mode)
 */
function callOpenAiApi(string $apiKey, string $systemPrompt, string $userPrompt, int $timeout = 40): array {
    $model = getAiModel();
    $endpoint = "https://api.openai.com/v1/chat/completions";

    $payload = [
        'model'           => $model,
        'temperature'     => 0.3,
        'response_format' => ['type' => 'json_object'],
        'messages'        => [
            [
                'role'    => 'system',
                'content' => $systemPrompt
            ],
            [
                'role'    => 'user',
                'content' => $userPrompt
            ]
        ]
    ];

    $ch = curl_init($endpoint);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json'
        ],
        CURLOPT_TIMEOUT        => $timeout,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true
    ]);

    $response = curl_exec($ch);
    $curlErr = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($curlErr) {
        error_log("[QuizSpark OpenAI Network Error] " . $curlErr);
        if (strpos($curlErr, 'timed out') !== false || strpos($curlErr, 'timeout') !== false) {
            return [
                'success' => false,
                'code'    => 'AI_TIMEOUT',
                'message' => 'AI generation timed out. Please try again with fewer questions.'
            ];
        }
        return [
            'success' => false,
            'code'    => 'AI_SERVICE_UNAVAILABLE',
            'message' => 'AI service is temporarily unavailable. Please try again.'
        ];
    }

    if ($httpCode === 401) {
        error_log("[QuizSpark OpenAI Auth Error 401] Invalid or expired OpenAI API key.");
        return [
            'success' => false,
            'code'    => 'AI_AUTH_ERROR',
            'message' => 'AI service authentication failed. Please check the server configuration.'
        ];
    }

    if ($httpCode === 429) {
        error_log("[QuizSpark OpenAI Rate Limit 429] OpenAI upstream quota/rate limit reached.");
        return [
            'success' => false,
            'code'    => 'AI_RATE_LIMITED',
            'message' => 'AI generation limit reached. Please try again later.'
        ];
    }

    if ($httpCode >= 400) {
        error_log("[QuizSpark OpenAI HTTP {$httpCode}] Upstream error: " . substr((string)$response, 0, 500));
        return [
            'success' => false,
            'code'    => 'AI_SERVICE_UNAVAILABLE',
            'message' => 'AI service is temporarily unavailable. Please try again.'
        ];
    }

    $decoded = json_decode((string)$response, true);
    if (!isset($decoded['choices'][0]['message']['content'])) {
        error_log("[QuizSpark OpenAI Invalid Format] " . substr((string)$response, 0, 500));
        return [
            'success' => false,
            'code'    => 'INVALID_AI_OUTPUT',
            'message' => 'AI generated an invalid quiz response. Please try again.'
        ];
    }

    $rawContent = trim($decoded['choices'][0]['message']['content']);
    $structured = json_decode($rawContent, true);
    if (!$structured || !is_array($structured)) {
        $clean = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', $rawContent);
        $structured = json_decode($clean, true);
    }

    if (!$structured || !is_array($structured)) {
        error_log("[QuizSpark OpenAI JSON Parse Error] " . substr($rawContent, 0, 400));
        return [
            'success' => false,
            'code'    => 'INVALID_AI_OUTPUT',
            'message' => 'AI generated an invalid quiz response. Please try again.'
        ];
    }

    return ['success' => true, 'data' => $structured];
}

/**
 * Google Gemini Provider Integration
 */
function callGeminiApi(string $apiKey, string $systemPrompt, string $userPrompt, int $timeout = 40): array {
    $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . urlencode($apiKey);

    $payload = [
        'systemInstruction' => [
            'parts' => [['text' => $systemPrompt]]
        ],
        'contents' => [
            ['role' => 'user', 'parts' => [['text' => $userPrompt]]]
        ],
        'generationConfig' => [
            'temperature'      => 0.2,
            'responseMimeType' => 'application/json'
        ]
    ];

    $ch = curl_init($endpoint);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT        => $timeout,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true
    ]);

    $response = curl_exec($ch);
    $curlErr = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($curlErr) {
        error_log("[QuizSpark Gemini Network Error] " . $curlErr);
        return [
            'success' => false,
            'code'    => 'AI_SERVICE_UNAVAILABLE',
            'message' => 'AI service is temporarily unavailable. Please try again.'
        ];
    }

    if ($httpCode === 401 || $httpCode === 403) {
        return [
            'success' => false,
            'code'    => 'AI_AUTH_ERROR',
            'message' => 'AI service authentication failed. Please check the server configuration.'
        ];
    }

    if ($httpCode === 429) {
        return [
            'success' => false,
            'code'    => 'AI_RATE_LIMITED',
            'message' => 'AI generation limit reached. Please try again later.'
        ];
    }

    if ($httpCode >= 400) {
        return [
            'success' => false,
            'code'    => 'AI_SERVICE_UNAVAILABLE',
            'message' => 'AI service is temporarily unavailable. Please try again.'
        ];
    }

    $decoded = json_decode((string)$response, true);
    if (!isset($decoded['candidates'][0]['content']['parts'][0]['text'])) {
        return [
            'success' => false,
            'code'    => 'INVALID_AI_OUTPUT',
            'message' => 'AI generated an invalid quiz response. Please try again.'
        ];
    }

    $rawText = trim($decoded['candidates'][0]['content']['parts'][0]['text']);
    $structured = json_decode($rawText, true);
    if (!$structured || !is_array($structured)) {
        $clean = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', $rawText);
        $structured = json_decode($clean, true);
    }

    if (!$structured || !is_array($structured)) {
        return [
            'success' => false,
            'code'    => 'INVALID_AI_OUTPUT',
            'message' => 'AI generated an invalid quiz response. Please try again.'
        ];
    }

    return ['success' => true, 'data' => $structured];
}

/**
 * Validate Question Structure & Sanitize
 */
function validateQuestionStructure(array $q, int $questionNum = 1): array {
    $errors = [];
    $text = trim((string)($q['question_text'] ?? ($q['text'] ?? '')));
    if ($text === '') {
        $errors['question_text'] = "Question #{$questionNum}: Question text cannot be empty.";
    } elseif (mb_strlen($text) > 1500) {
        $errors['question_text'] = "Question #{$questionNum}: Question text exceeds limit.";
    }

    $type = strtolower(trim((string)($q['question_type'] ?? 'mcq')));
    if (!in_array($type, ['mcq', 'true_false', 'multiple_choice'], true)) {
        $type = 'mcq';
    }
    $normType = ($type === 'true_false') ? 'true_false' : 'mcq';

    $optA = ''; $optB = ''; $optC = null; $optD = null;
    $correctLetter = 'A';

    if ($normType === 'true_false') {
        $optA = 'True';
        $optB = 'False';
        $rawCorrect = trim((string)($q['correct_option'] ?? ($q['correct_answer'] ?? 'A')));
        if (strtoupper($rawCorrect) === 'A' || strcasecmp($rawCorrect, 'true') === 0) {
            $correctLetter = 'A';
        } elseif (strtoupper($rawCorrect) === 'B' || strcasecmp($rawCorrect, 'false') === 0) {
            $correctLetter = 'B';
        } else {
            $errors['correct_option'] = "Question #{$questionNum}: True/False correct answer must be 'A' (True) or 'B' (False).";
        }
    } else {
        // Extract 4 options from either explicit keys or options array
        if (isset($q['option_a'], $q['option_b'], $q['option_c'], $q['option_d'])) {
            $optA = trim((string)$q['option_a']);
            $optB = trim((string)$q['option_b']);
            $optC = trim((string)$q['option_c']);
            $optD = trim((string)$q['option_d']);
        } elseif (isset($q['options']) && is_array($q['options']) && count($q['options']) === 4) {
            $optA = trim((string)$q['options'][0]);
            $optB = trim((string)$q['options'][1]);
            $optC = trim((string)$q['options'][2]);
            $optD = trim((string)$q['options'][3]);
        }

        if ($optA === '' || $optB === '' || $optC === '' || $optD === '') {
            $errors['options'] = "Question #{$questionNum}: All four MCQ options must be non-empty.";
        } else {
            // Check duplicate options within question
            $optsLower = [mb_strtolower($optA), mb_strtolower($optB), mb_strtolower($optC), mb_strtolower($optD)];
            if (count(array_unique($optsLower)) < 4) {
                $errors['options'] = "Question #{$questionNum}: Options must be unique.";
            }

            // Determine correct_option letter A, B, C, or D
            $rawCorrect = trim((string)($q['correct_option'] ?? ($q['correct_answer'] ?? '')));
            $rawUpper = strtoupper($rawCorrect);

            if (in_array($rawUpper, ['A', 'B', 'C', 'D'], true)) {
                $correctLetter = $rawUpper;
            } elseif ($rawCorrect === $optA) {
                $correctLetter = 'A';
            } elseif ($rawCorrect === $optB) {
                $correctLetter = 'B';
            } elseif ($rawCorrect === $optC) {
                $correctLetter = 'C';
            } elseif ($rawCorrect === $optD) {
                $correctLetter = 'D';
            } else {
                $errors['correct_option'] = "Question #{$questionNum}: Correct option must be A, B, C, or D.";
            }
        }
    }

    $explanation = trim((string)($q['explanation'] ?? ''));
    if ($explanation === '') {
        $explanation = "Educational explanation for Question #{$questionNum}.";
    }

    $points = (int)($q['points'] ?? 100);
    if ($points < 1 || $points > 10000) {
        $points = 100;
    }

    $difficulty = strtolower(trim((string)($q['difficulty'] ?? 'medium')));
    if (!in_array($difficulty, ['easy', 'medium', 'hard'], true)) {
        $difficulty = 'medium';
    }

    return [
        'valid'     => empty($errors),
        'errors'    => $errors,
        'sanitized' => [
            'question_number' => $questionNum,
            'question_type'   => ($normType === 'true_false') ? 'true_false' : 'multiple_choice',
            'question_text'   => $text,
            'option_a'        => $optA,
            'option_b'        => $optB,
            'option_c'        => $optC,
            'option_d'        => $optD,
            'correct_option'  => $correctLetter,
            'explanation'     => $explanation,
            'points'          => $points,
            'difficulty'      => $difficulty,
            'time_limit'      => (int)($q['time_limit'] ?? 10)
        ]
    ];
}

/**
 * Validates the entire AI-generated Quiz payload (count, duplicates, topic relevance)
 */
function validateGeneratedQuiz(array $aiData, string $topic, int $expectedCount, string $difficulty, int $pointsPerQ, string $questionType): array {
    $questionsRaw = $aiData['questions'] ?? [];
    if (!is_array($questionsRaw) || empty($questionsRaw)) {
        return ['valid' => false, 'message' => 'AI generated an invalid quiz response. Please try again.'];
    }

    if (count($questionsRaw) !== $expectedCount) {
        error_log(sprintf("[QuizSpark AI Validation] Question count mismatch: expected %d, got %d", $expectedCount, count($questionsRaw)));
        return ['valid' => false, 'message' => 'AI generated an invalid quiz response. Please try again.'];
    }

    $sanitizedList = [];
    $seenQuestions = [];
    $allGeneratedText = mb_strtolower((string)($aiData['title'] ?? ''));

    foreach ($questionsRaw as $idx => $q) {
        $qNum = $idx + 1;
        $q['question_type'] = $questionType;
        $q['points'] = $pointsPerQ;
        $q['difficulty'] = $difficulty;

        $val = validateQuestionStructure($q, $qNum);
        if (!$val['valid']) {
            error_log("[QuizSpark AI Question Validation Failed] " . json_encode($val['errors']));
            return ['valid' => false, 'message' => 'AI generated an invalid quiz response. Please try again.'];
        }

        $s = $val['sanitized'];

        // Duplicate question check across quiz
        $normQ = preg_replace('/[^a-z0-9]/', '', mb_strtolower($s['question_text']));
        if (isset($seenQuestions[$normQ])) {
            error_log("[QuizSpark AI Duplicate Question Detected] " . $s['question_text']);
            return ['valid' => false, 'message' => 'AI generated an invalid quiz response. Please try again.'];
        }
        $seenQuestions[$normQ] = true;

        $allGeneratedText .= ' ' . mb_strtolower($s['question_text'] . ' ' . $s['option_a'] . ' ' . $s['option_b'] . ' ' . $s['option_c'] . ' ' . $s['option_d'] . ' ' . $s['explanation']);
        $sanitizedList[] = $s;
    }

    // Basic topic relevance check
    if (!checkTopicRelevance($topic, $allGeneratedText)) {
        error_log("[QuizSpark AI Relevance Check Failed] Generated content failed topic relevance for: {$topic}");
        return ['valid' => false, 'message' => 'AI generated an invalid quiz response. Please try again.'];
    }

    $title = trim((string)($aiData['title'] ?? "{$topic} Quiz"));
    if (mb_strlen($title) > 150) {
        $title = mb_substr($title, 0, 150);
    }

    return [
        'valid'     => true,
        'title'     => $title,
        'questions' => $sanitizedList
    ];
}

/**
 * Basic topic relevance check (ensures questions pertain to creator topic)
 */
function checkTopicRelevance(string $topic, string $combinedText): bool {
    // Extract keywords of length >= 3, excluding common stop words
    $stopWords = ['the','and','for','with','about','from','that','this','what','which','when','where','how','why','are','is','was','were','have','has','had','you','your'];
    $words = preg_split('/[\s,\-\.\:\;\(\)\/]+/', mb_strtolower($topic), -1, PREG_SPLIT_NO_EMPTY);
    $keywords = [];

    foreach ($words as $w) {
        $w = trim($w);
        if (mb_strlen($w) >= 3 && !in_array($w, $stopWords, true)) {
            $keywords[] = $w;
        }
    }

    if (empty($keywords)) {
        return true;
    }

    // Check if at least one meaningful keyword is present in the quiz text
    foreach ($keywords as $kw) {
        if (strpos($combinedText, $kw) !== false) {
            return true;
        }
    }

    return false;
}

/**
 * Structured Logging
 */
function logAiEvent(int $creatorId, string $action, array $context = []): void {
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $entry = [
        'timestamp'  => $timestamp,
        'creator_id' => $creatorId,
        'action'     => $action,
        'ip'         => $ip,
        'context'    => $context
    ];
    unset($entry['context']['api_key'], $entry['context']['password'], $entry['context']['csrf_token']);
    error_log("[QuizSpark AI Event] " . json_encode($entry, JSON_UNESCAPED_SLASHES));
}
