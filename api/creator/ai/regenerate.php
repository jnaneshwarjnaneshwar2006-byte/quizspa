<?php
/**
 * AI Quiz Generator - Regenerate Single Question API
 * POST /api/creator/ai/regenerate.php
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/session.php';
require_once __DIR__ . '/../../../config/security.php';
require_once __DIR__ . '/../../../config/ai.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendAiError('METHOD_NOT_ALLOWED', 'Invalid request method. POST required.', [], 405);
}

// 1. Authenticate Creator
$teacherId = requireCreatorAuth();

// 2. Validate CSRF
verifyAiCsrf();

// 3. Decode & Validate JSON Payload
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if ($input === null && !empty($rawInput)) {
    sendAiError('VALIDATION_ERROR', 'Invalid JSON request.', [], 400);
}
if (!is_array($input)) {
    sendAiError('VALIDATION_ERROR', 'Request body must be a JSON object.', [], 400);
}

$quizId = (int)($input['quiz_id'] ?? 0);
$questionId = (int)($input['question_id'] ?? 0);
$instructions = trim((string)($input['instructions'] ?? ''));

$fields = [];
if ($quizId <= 0) {
    $fields['quiz_id'] = 'Valid quiz_id is required.';
}
if ($questionId <= 0) {
    $fields['question_id'] = 'Valid question_id is required.';
}
if (mb_strlen($instructions) > 2000) {
    $fields['instructions'] = 'Instructions cannot exceed 2000 characters.';
}
if (!empty($fields)) {
    sendAiError('VALIDATION_ERROR', reset($fields), $fields, 400);
}

$pdo = getDBConnection();

// 4. Rate Limiting (Regenerate: max 30/hr)
enforceRateLimit($pdo, $teacherId, 'regenerate');

// 5. Verify Quiz Ownership & Draft Status
$quiz = verifyQuizOwnership($pdo, $quizId, $teacherId, true);

// 6. Verify Question Belongs to Quiz
$qStmt = $pdo->prepare("SELECT * FROM `questions` WHERE `id` = :q_id AND `quiz_id` = :qz_id LIMIT 1");
$qStmt->execute(['q_id' => $questionId, 'qz_id' => $quizId]);
$existingQ = $qStmt->fetch();

if (!$existingQ) {
    sendAiError('QUESTION_NOT_FOUND', 'Question not found in the specified quiz.', [], 404);
}

// 7. Build AI Prompt for Single Question Regeneration
$topic = $quiz['topic'] ?? $quiz['title'] ?? 'General';
$qType = ($existingQ['question_type'] === 'true_false') ? 'true_false' : 'mcq';
$currentPoints = (int)($existingQ['points'] ?? 100);
$currentDifficulty = $existingQ['difficulty'] ?? ($quiz['difficulty'] ?? 'medium');

$systemPrompt = <<<PROMPT
You are QuizSpark's expert educational AI.
Your objective is to regenerate a single quiz question based on teacher instructions while preserving educational rigor.
Return pure JSON only. Do not wrap in markdown or include extra text.
PROMPT;

$userPromptData = [
    'task'               => 'regenerate_single_question',
    'topic'              => $topic,
    'current_question'   => [
        'question_text'  => $existingQ['question_text'],
        'question_type'  => $qType,
        'difficulty'     => $currentDifficulty,
        'points'         => $currentPoints
    ],
    'teacher_request'    => $instructions ?: 'Please regenerate a fresh, higher quality version of this question.',
    'required_schema'    => [
        'question_text'  => 'string',
        'question_type'  => $qType,
        'options'        => ($qType === 'true_false') ? ['True', 'False'] : ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        'correct_answer' => 'Exact string matching one of the options',
        'explanation'    => 'Educational explanation',
        'difficulty'     => $currentDifficulty,
        'points'         => $currentPoints
    ]
];

$userPrompt = "Regenerate this question:\n" . json_encode($userPromptData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

$aiResult = callAiService($systemPrompt, $userPrompt, 25);
if (!$aiResult['success']) {
    logAiEvent($teacherId, 'regenerate_failed', ['code' => $aiResult['code'], 'message' => $aiResult['message']]);
    sendAiError($aiResult['code'], $aiResult['message'], [], 502);
}

$rawQ = $aiResult['data'];
if (isset($rawQ['questions'][0])) {
    $rawQ = $rawQ['questions'][0];
}

$rawQ['question_type'] = $qType;
$rawQ['points'] = $currentPoints;
if (empty($rawQ['difficulty'])) {
    $rawQ['difficulty'] = $currentDifficulty;
}

$val = validateQuestionStructure($rawQ, (int)$existingQ['question_number']);
if (!$val['valid']) {
    logAiEvent($teacherId, 'regenerate_validation_failed', ['errors' => $val['errors']]);
    sendAiError('INVALID_AI_OUTPUT', reset($val['errors']), $val['errors'], 422);
}
$sanitized = $val['sanitized'];

// 8. Update Question in Database
try {
    $updateStmt = $pdo->prepare("
        UPDATE `questions` SET 
            `question_text`   = :q_text,
            `question_type`   = :q_type,
            `option_a`        = :opt_a,
            `option_b`        = :opt_b,
            `option_c`        = :opt_c,
            `option_d`        = :opt_d,
            `correct_option`  = :correct,
            `explanation`     = :explanation,
            `points`          = :points,
            `difficulty`      = :diff
        WHERE `id` = :id AND `quiz_id` = :quiz_id
    ");

    $updateStmt->execute([
        'q_text'      => $sanitized['question_text'],
        'q_type'      => $sanitized['question_type'],
        'opt_a'       => $sanitized['option_a'],
        'opt_b'       => $sanitized['option_b'],
        'opt_c'       => $sanitized['option_c'],
        'opt_d'       => $sanitized['option_d'],
        'correct'     => $sanitized['correct_option'],
        'explanation' => $sanitized['explanation'],
        'points'      => $sanitized['points'],
        'diff'        => $sanitized['difficulty'],
        'id'          => $questionId,
        'quiz_id'     => $quizId
    ]);

    $sanitized['id'] = $questionId;
    $formatted = formatQuestionResponse($sanitized);

    logAiEvent($teacherId, 'regenerate_success', ['quiz_id' => $quizId, 'question_id' => $questionId]);

    sendAiResponse(true, 'Question regenerated successfully.', [
        'question' => $formatted
    ], 200);

} catch (Exception $e) {
    error_log("[QuizSpark AI Regenerate DB Error] " . $e->getMessage());
    sendAiError('DATABASE_ERROR', 'Unable to update question in database.', [], 500);
}
