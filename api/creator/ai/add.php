<?php
/**
 * AI Quiz Generator - Add Question to Draft API
 * POST /api/creator/ai/add.php
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

// 5. Determine Next Question Number
$maxStmt = $pdo->prepare("SELECT COALESCE(MAX(`question_number`), 0) FROM `questions` WHERE `quiz_id` = :quiz_id");
$maxStmt->execute(['quiz_id' => $quizId]);
$nextNum = (int)$maxStmt->fetchColumn() + 1;

// 6. Validate Question Structure
$val = validateQuestionStructure($input, $nextNum);
if (!$val['valid']) {
    sendAiError('VALIDATION_ERROR', reset($val['errors']), $val['errors'], 400);
}
$sanitized = $val['sanitized'];

// 7. Insert Question into Database
try {
    $insStmt = $pdo->prepare("
        INSERT INTO `questions` 
        (`quiz_id`, `question_number`, `question_type`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `explanation`, `points`, `difficulty`, `time_limit`)
        VALUES (:quiz_id, :q_num, :q_type, :q_text, :opt_a, :opt_b, :opt_c, :opt_d, :correct, :explanation, :points, :diff, :time_limit)
    ");

    $insStmt->execute([
        'quiz_id'     => $quizId,
        'q_num'       => $sanitized['question_number'],
        'q_type'      => $sanitized['question_type'],
        'q_text'      => $sanitized['question_text'],
        'opt_a'       => $sanitized['option_a'],
        'opt_b'       => $sanitized['option_b'],
        'opt_c'       => $sanitized['option_c'],
        'opt_d'       => $sanitized['option_d'],
        'correct'     => $sanitized['correct_option'],
        'explanation' => $sanitized['explanation'],
        'points'      => $sanitized['points'],
        'diff'        => $sanitized['difficulty'],
        'time_limit'  => $sanitized['time_limit']
    ]);

    $newId = (int)$pdo->lastInsertId();
    $sanitized['id'] = $newId;
    $formatted = formatQuestionResponse($sanitized);

    logAiEvent($teacherId, 'add_question_success', ['quiz_id' => $quizId, 'question_id' => $newId]);

    sendAiResponse(true, 'Question added successfully.', [
        'question' => $formatted
    ], 201);

} catch (Exception $e) {
    error_log("[QuizSpark Add Question DB Error] " . $e->getMessage());
    sendAiError('DATABASE_ERROR', 'Unable to insert question into database.', [], 500);
}
