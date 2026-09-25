<?php
/**
 * QuizSpark AI Quiz Generator - Configuration, Security, Validation & Provider Integration
 */

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/session.php';
require_once __DIR__ . '/security.php';

// Rate Limits (per hour per creator)
define('AI_RATE_LIMIT_GENERATE', 10);
define('AI_RATE_LIMIT_REGENERATE', 30);
define('AI_RATE_LIMIT_CHAT', 60);

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
 * Standard AI JSON Error Response conforming to prompt Section 2 & 24
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
        'success' => false,
        'error'   => $error
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
    // Read CSRF from Header or Body
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
        // If session csrf_token is present but mismatch or missing
        sendAiError('CSRF_ERROR', 'Invalid or missing CSRF token.', [], 403);
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
    $maxPerHour = $limits[$action] ?? 30;

    try {
        // Clean up old entries older than 24h occasionally (1 in 50 requests)
        if (mt_rand(1, 50) === 1) {
            $pdo->exec("DELETE FROM `ai_rate_limits` WHERE `created_at` < NOW() - INTERVAL 24 HOUR");
        }

        // Count requests in last 1 hour
        $stmt = $pdo->prepare("
            SELECT COUNT(*) FROM `ai_rate_limits` 
            WHERE `teacher_id` = :t_id AND `action` = :act AND `created_at` >= NOW() - INTERVAL 1 HOUR
        ");
        $stmt->execute(['t_id' => $teacherId, 'act' => $action]);
        $count = (int)$stmt->fetchColumn();

        if ($count >= $maxPerHour) {
            logAiEvent($teacherId, 'rate_limit_exceeded', ['action' => $action, 'count' => $count]);
            sendAiError('RATE_LIMITED', "Too many AI requests for {$action}. Please try again later.", [], 429);
        }

        // Record this request
        $ins = $pdo->prepare("INSERT INTO `ai_rate_limits` (`teacher_id`, `action`, `created_at`) VALUES (:t_id, :act, NOW())");
        $ins->execute(['t_id' => $teacherId, 'act' => $action]);

    } catch (Exception $e) {
        error_log("[QuizSpark AI RateLimit Error] " . $e->getMessage());
        // Do not block creator if rate limit table has a transient issue
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
        'correct_answer'  => $correctAnswer,
        'correct_option'  => $correctOption,
        'explanation'     => $q['explanation'] ?? '',
        'points'          => (int)($q['points'] ?? 100),
        'difficulty'      => $q['difficulty'] ?? 'medium',
        'time_limit'      => (int)($q['time_limit'] ?? 10)
    ];
}

/**
 * Validate a Question against strict business rules
 */
function validateQuestionStructure(array $q, int $questionNum = 1): array {
    $errors = [];
    $text = trim((string)($q['question_text'] ?? ''));
    if ($text === '') {
        $errors['question_text'] = "Question #{$questionNum}: Question text cannot be empty.";
    } elseif (mb_strlen($text) > 1000) {
        $errors['question_text'] = "Question #{$questionNum}: Question text exceeds 1000 characters.";
    }

    $type = strtolower(trim((string)($q['question_type'] ?? 'mcq')));
    if (!in_array($type, ['mcq', 'true_false', 'multiple_choice'], true)) {
        $type = 'mcq';
    }
    $normType = ($type === 'true_false') ? 'true_false' : 'mcq';

    $options = $q['options'] ?? [];
    if (!is_array($options)) {
        $options = [];
    }

    $optA = ''; $optB = ''; $optC = null; $optD = null;
    $correctLetter = 'A';

    if ($normType === 'true_false') {
        $optA = 'True';
        $optB = 'False';
        $rawCorrect = trim((string)($q['correct_answer'] ?? ($q['correct_option'] ?? 'True')));
        if (strcasecmp($rawCorrect, 'true') === 0 || strtoupper($rawCorrect) === 'A') {
            $correctLetter = 'A';
        } elseif (strcasecmp($rawCorrect, 'false') === 0 || strtoupper($rawCorrect) === 'B') {
            $correctLetter = 'B';
        } else {
            $errors['correct_answer'] = "Question #{$questionNum}: True/False question correct answer must be 'True' or 'False'.";
        }
    } else {
        // MCQ validation: exactly 4 options
        if (count($options) !== 4) {
            $errors['options'] = "Question #{$questionNum}: MCQ must have exactly 4 options.";
        } else {
            $trimmedOpts = [];
            $seen = [];
            foreach ($options as $oi => $opt) {
                $trimmed = trim((string)$opt);
                if ($trimmed === '') {
                    $errors['options'] = "Question #{$questionNum}: Option " . chr(65 + $oi) . " cannot be empty.";
                    break;
                }
                $lower = mb_strtolower($trimmed);
                if (isset($seen[$lower])) {
                    $errors['options'] = "Question #{$questionNum}: Duplicate options detected ('{$trimmed}').";
                    break;
                }
                $seen[$lower] = true;
                $trimmedOpts[] = $trimmed;
            }

            if (empty($errors['options']) && count($trimmedOpts) === 4) {
                $optA = $trimmedOpts[0];
                $optB = $trimmedOpts[1];
                $optC = $trimmedOpts[2];
                $optD = $trimmedOpts[3];

                $rawCorrect = trim((string)($q['correct_answer'] ?? ($q['correct_option'] ?? '')));
                // Match exact text or letter
                if (strtoupper($rawCorrect) === 'A' || $rawCorrect === $optA) {
                    $correctLetter = 'A';
                } elseif (strtoupper($rawCorrect) === 'B' || $rawCorrect === $optB) {
                    $correctLetter = 'B';
                } elseif (strtoupper($rawCorrect) === 'C' || $rawCorrect === $optC) {
                    $correctLetter = 'C';
                } elseif (strtoupper($rawCorrect) === 'D' || $rawCorrect === $optD) {
                    $correctLetter = 'D';
                } else {
                    $errors['correct_answer'] = "Question #{$questionNum}: Correct answer ('{$rawCorrect}') does not match any of the 4 options.";
                }
            }
        }
    }

    $difficulty = strtolower(trim((string)($q['difficulty'] ?? 'medium')));
    if (!in_array($difficulty, ['easy', 'medium', 'hard'], true)) {
        $difficulty = 'medium';
    }

    $points = (int)($q['points'] ?? 100);
    if ($points < 1 || $points > 10000) {
        $errors['points'] = "Question #{$questionNum}: Points must be between 1 and 10000.";
    }

    $explanation = trim((string)($q['explanation'] ?? ''));
    if (mb_strlen($explanation) > 2000) {
        $explanation = mb_substr($explanation, 0, 2000);
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
 * Get configured AI API Key
 */
function getAiApiKey(): ?string {
    if (!empty($_SERVER['AI_API_KEY'])) return $_SERVER['AI_API_KEY'];
    if (!empty($_ENV['AI_API_KEY'])) return $_ENV['AI_API_KEY'];
    $envVal = getenv('AI_API_KEY');
    if (!empty($envVal)) return $envVal;

    $localConfigFile = __DIR__ . '/ai.local.php';
    if (file_exists($localConfigFile)) {
        $conf = require $localConfigFile;
        if (is_array($conf) && !empty($conf['api_key'])) {
            return $conf['api_key'];
        } elseif (is_string($conf) && !empty($conf)) {
            return $conf;
        }
    }

    return null;
}

/**
 * Secure Server-side AI Provider Integration
 */
function callAiService(string $systemPrompt, string $userPrompt, int $timeout = 30): array {
    $apiKey = getAiApiKey();

    // If no external key or in mock test mode, generate high quality structured mock
    if (empty($apiKey) || $apiKey === 'mock' || getenv('AI_MOCK_MODE') === 'true') {
        return generateMockAiResponse($userPrompt);
    }

    // Call Google Gemini API
    $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . urlencode($apiKey);

    $payload = [
        'systemInstruction' => [
            'parts' => [
                ['text' => $systemPrompt]
            ]
        ],
        'contents' => [
            [
                'role' => 'user',
                'parts' => [
                    ['text' => $userPrompt]
                ]
            ]
        ],
        'generationConfig' => [
            'temperature' => 0.2,
            'responseMimeType' => 'application/json'
        ]
    ];

    $ch = curl_init($endpoint);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_HTTPHEADER     => [
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
        error_log("[QuizSpark AI Provider Network Error] " . $curlErr);
        if (strpos($curlErr, 'timed out') !== false || strpos($curlErr, 'timeout') !== false) {
            return ['success' => false, 'code' => 'AI_TIMEOUT', 'message' => 'AI generation timed out. Please try again with fewer questions.'];
        }
        return ['success' => false, 'code' => 'AI_SERVICE_UNAVAILABLE', 'message' => 'AI generation is temporarily unavailable. Please try again.'];
    }

    if ($httpCode === 429) {
        error_log("[QuizSpark AI Provider HTTP 429] Rate limited by upstream AI provider.");
        return ['success' => false, 'code' => 'AI_RATE_LIMITED', 'message' => 'AI provider rate limit reached. Please wait a moment and try again.'];
    }

    if ($httpCode >= 400) {
        error_log("[QuizSpark AI Provider HTTP {$httpCode}] Upstream error.");
        return ['success' => false, 'code' => 'AI_SERVICE_UNAVAILABLE', 'message' => 'AI generation service error. Please try again.'];
    }

    $decoded = json_decode($response, true);
    if (!isset($decoded['candidates'][0]['content']['parts'][0]['text'])) {
        error_log("[QuizSpark AI Provider Invalid Schema] " . substr($response, 0, 500));
        return ['success' => false, 'code' => 'INVALID_AI_OUTPUT', 'message' => 'Received unexpected format from AI service.'];
    }

    $rawText = trim($decoded['candidates'][0]['content']['parts'][0]['text']);
    $structured = json_decode($rawText, true);
    if (!$structured || !is_array($structured)) {
        // Strip markdown backticks if present
        $clean = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', $rawText);
        $structured = json_decode($clean, true);
    }

    if (!$structured || !is_array($structured)) {
        error_log("[QuizSpark AI JSON Parse Error] " . substr($rawText, 0, 300));
        return ['success' => false, 'code' => 'INVALID_AI_OUTPUT', 'message' => 'AI returned malformed JSON output.'];
    }

    return ['success' => true, 'data' => $structured];
}

/**
 * Intelligent Mock Generator for development, local testing, and fallback
 */
function generateMockAiResponse(string $userPrompt): array {
    $topic = 'General Knowledge';
    if (preg_match('/topic:\s*["\']?([^"\',\n]+)/i', $userPrompt, $m)) {
        $topic = trim($m[1]);
    }

    $count = 5;
    if (preg_match('/question_count:\s*(\d+)/i', $userPrompt, $m)) {
        $count = (int)$m[1];
    }
    $count = max(1, min(50, $count));

    $diff = 'medium';
    if (preg_match('/difficulty:\s*["\']?(easy|medium|hard)/i', $userPrompt, $m)) {
        $diff = strtolower($m[1]);
    }

    $qType = 'mcq';
    if (preg_match('/question_type:\s*["\']?(true_false|mcq)/i', $userPrompt, $m)) {
        $qType = strtolower($m[1]);
    }

    $points = 100;
    if (preg_match('/points_per_question:\s*(\d+)/i', $userPrompt, $m)) {
        $points = (int)$m[1];
    }

    $questions = [];
    for ($i = 1; $i <= $count; $i++) {
        if ($qType === 'true_false') {
            $isTrue = ($i % 2 === 1);
            $questions[] = [
                'question_text'  => "Regarding {$topic} (Part {$i}): This concept is a core foundational principle.",
                'question_type'  => 'true_false',
                'options'        => ['True', 'False'],
                'correct_answer' => $isTrue ? 'True' : 'False',
                'explanation'    => "In {$topic}, this principle plays a fundamental role in standard implementations.",
                'difficulty'     => $diff,
                'points'         => $points
            ];
        } else {
            $correctOpt = "Key Concept {$i}: Principle of {$topic}";
            $distractor1 = "Alternative pattern {$i}A (Unrelated)";
            $distractor2 = "Deprecated method {$i}B";
            $distractor3 = "Syntax variation {$i}C";

            // Permute options based on $i
            $opts = [$correctOpt, $distractor1, $distractor2, $distractor3];
            $shift = ($i - 1) % 4;
            $rotated = array_merge(array_slice($opts, $shift), array_slice($opts, 0, $shift));

            $questions[] = [
                'question_text'  => "Which statement accurately describes element #{$i} in {$topic}?",
                'question_type'  => 'mcq',
                'options'        => $rotated,
                'correct_answer' => $correctOpt,
                'explanation'    => "{$correctOpt} correctly addresses the core requirement of {$topic}.",
                'difficulty'     => $diff,
                'points'         => $points
            ];
        }
    }

    return [
        'success' => true,
        'data' => [
            'title'     => ucwords($topic) . " Quiz",
            'questions' => $questions
        ]
    ];
}

/**
 * Server-Side Structured Logging conforming to prompt Section 25
 */
function logAiEvent(int $creatorId, string $action, array $context = []): void {
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $entry = [
        'timestamp'   => $timestamp,
        'creator_id'  => $creatorId,
        'action'      => $action,
        'ip'          => $ip,
        'context'     => $context
    ];
    // Strip sensitive fields if present
    unset($entry['context']['api_key'], $entry['context']['password'], $entry['context']['csrf_token']);
    error_log("[QuizSpark AI Event] " . json_encode($entry, JSON_UNESCAPED_SLASHES));
}
