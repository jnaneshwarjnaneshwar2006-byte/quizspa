<?php
/**
 * AI Quiz Generator - Explicit Publish API
 * POST /api/creator/ai/publish.php
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

// 3. Decode JSON Payload
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if ($input === null && !empty($rawInput)) {
    sendAiError('VALIDATION_ERROR', 'Invalid JSON request.', [], 400);
}
if (!is_array($input)) {
    sendAiError('VALIDATION_ERROR', 'Request body must be a JSON object.', [], 400);
}

$quizId = (int)($input['quiz_id'] ?? 0);
if ($quizId <= 0) {
    sendAiError('VALIDATION_ERROR', 'Valid quiz_id is required.', ['quiz_id' => 'Must be a positive integer.'], 400);
}

$pdo = getDBConnection();

// 4. Verify Quiz Ownership & Draft Status
$quiz = verifyQuizOwnership($pdo, $quizId, $teacherId, true);

// 5. Verify Title
if (empty(trim((string)$quiz['title']))) {
    sendAiError('VALIDATION_ERROR', 'Quiz title cannot be empty.', ['title' => 'Title is required to publish.'], 400);
}

// 6. Fetch & Validate All Questions
$qStmt = $pdo->prepare("SELECT * FROM `questions` WHERE `quiz_id` = :quiz_id ORDER BY `question_number` ASC");
$qStmt->execute(['quiz_id' => $quizId]);
$questions = $qStmt->fetchAll();

if (empty($questions)) {
    sendAiError('VALIDATION_ERROR', 'Cannot publish a quiz without questions. Please add questions first.', ['questions' => 'At least one question is required.'], 400);
}

foreach ($questions as $i => $q) {
    $qNum = $i + 1;
    // Map DB fields to validator input
    $qType = ($q['question_type'] === 'true_false') ? 'true_false' : 'mcq';
    $opts = ($qType === 'true_false') ? ['True', 'False'] : [$q['option_a'], $q['option_b'], $q['option_c'], $q['option_d']];
    
    $valInput = [
        'question_text'  => $q['question_text'],
        'question_type'  => $qType,
        'options'        => $opts,
        'correct_answer' => $q['correct_option'],
        'points'         => $q['points'] ?? 100,
        'difficulty'     => $q['difficulty'] ?? 'medium'
    ];

    $val = validateQuestionStructure($valInput, $qNum);
    if (!$val['valid']) {
        sendAiError('VALIDATION_ERROR', "Cannot publish: " . reset($val['errors']), $val['errors'], 400);
    }
}

// 7. Generate Unique 6-Digit Join Code (Reusing QuizSpark Publish logic)
try {
    $joinCode = $quiz['join_code'];
    if (empty($joinCode)) {
        do {
            $candidateCode = generateJoinCode();
            $codeCheck = $pdo->prepare("SELECT `id` FROM `quizzes` WHERE `join_code` = :code AND `status` IN ('published', 'lobby', 'running')");
            $codeCheck->execute(['code' => $candidateCode]);
        } while ($codeCheck->fetch());
        $joinCode = $candidateCode;
    }

    $joinUrl = getBaseUrl() . '/student/join.php?code=' . $joinCode;

    // 8. Update Quiz Status from 'draft' to 'published'
    $updateStmt = $pdo->prepare("
        UPDATE `quizzes` SET
            `status`       = 'published',
            `join_code`    = :join_code,
            `join_url`     = :join_url,
            `published_at` = NOW()
        WHERE `id` = :id AND `teacher_id` = :t_id AND `status` = 'draft'
    ");
    $updateStmt->execute([
        'join_code' => $joinCode,
        'join_url'  => $joinUrl,
        'id'        => $quizId,
        't_id'      => $teacherId
    ]);

    if ($updateStmt->rowCount() === 0) {
        sendAiError('QUIZ_ALREADY_PUBLISHED', 'Quiz is no longer in draft status.', [], 400);
    }

    logAiEvent($teacherId, 'publish_quiz_success', [
        'quiz_id'        => $quizId,
        'join_code'      => $joinCode,
        'question_count' => count($questions)
    ]);

    sendAiResponse(true, 'Quiz published successfully.', [
        'quiz_id'        => $quizId,
        'status'         => 'published',
        'join_code'      => $joinCode,
        'join_url'       => $joinUrl,
        'question_count' => count($questions)
    ], 200);

} catch (Exception $e) {
    error_log("[QuizSpark AI Publish DB Error] " . $e->getMessage());
    sendAiError('DATABASE_ERROR', 'Unable to publish quiz. Please try again.', [], 500);
}
