<?php
/**
 * AI Quiz Generator - Edit & Delete Question API
 * PUT    /api/creator/ai/question.php -> Edit Question
 * DELETE /api/creator/ai/question.php -> Delete Question
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/session.php';
require_once __DIR__ . '/../../../config/security.php';
require_once __DIR__ . '/../../../config/ai.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'PUT' && $method !== 'DELETE') {
    sendAiError('METHOD_NOT_ALLOWED', 'Invalid request method. PUT or DELETE required.', [], 405);
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
$questionId = (int)($input['question_id'] ?? 0);

$fields = [];
if ($quizId <= 0) {
    $fields['quiz_id'] = 'Valid quiz_id is required.';
}
if ($questionId <= 0) {
    $fields['question_id'] = 'Valid question_id is required.';
}
if (!empty($fields)) {
    sendAiError('VALIDATION_ERROR', reset($fields), $fields, 400);
}

$pdo = getDBConnection();

// 4. Verify Quiz Ownership & Draft Status
$quiz = verifyQuizOwnership($pdo, $quizId, $teacherId, true);

// 5. Verify Question Belongs to Quiz
$qStmt = $pdo->prepare("SELECT * FROM `questions` WHERE `id` = :q_id AND `quiz_id` = :qz_id LIMIT 1");
$qStmt->execute(['q_id' => $questionId, 'qz_id' => $quizId]);
$existingQ = $qStmt->fetch();

if (!$existingQ) {
    sendAiError('QUESTION_NOT_FOUND', 'Question not found in the specified quiz.', [], 404);
}

// -------------------------------------------------------------
// HANDLE DELETE REQUEST
// -------------------------------------------------------------
if ($method === 'DELETE') {
    try {
        $delStmt = $pdo->prepare("DELETE FROM `questions` WHERE `id` = :id AND `quiz_id` = :quiz_id");
        $delStmt->execute(['id' => $questionId, 'quiz_id' => $quizId]);

        // Re-number remaining questions
        $remStmt = $pdo->prepare("SELECT `id` FROM `questions` WHERE `quiz_id` = :quiz_id ORDER BY `question_number` ASC, `id` ASC");
        $remStmt->execute(['quiz_id' => $quizId]);
        $remaining = $remStmt->fetchAll();

        $updateNum = $pdo->prepare("UPDATE `questions` SET `question_number` = :num WHERE `id` = :id");
        foreach ($remaining as $i => $row) {
            $updateNum->execute(['num' => $i + 1, 'id' => $row['id']]);
        }

        logAiEvent($teacherId, 'delete_question_success', ['quiz_id' => $quizId, 'question_id' => $questionId]);

        sendAiResponse(true, 'Question deleted successfully.', [
            'question_id'     => $questionId,
            'remaining_count' => count($remaining)
        ], 200);

    } catch (Exception $e) {
        error_log("[QuizSpark Delete Question DB Error] " . $e->getMessage());
        sendAiError('DATABASE_ERROR', 'Unable to delete question. Please try again.', [], 500);
    }
}

// -------------------------------------------------------------
// HANDLE PUT (EDIT) REQUEST
// -------------------------------------------------------------
if ($method === 'PUT') {
    // Merge existing fields if omitted
    $input['question_type'] = $input['question_type'] ?? $existingQ['question_type'];
    $input['points'] = $input['points'] ?? $existingQ['points'] ?? 100;
    $input['difficulty'] = $input['difficulty'] ?? $existingQ['difficulty'] ?? 'medium';

    $val = validateQuestionStructure($input, (int)$existingQ['question_number']);
    if (!$val['valid']) {
        sendAiError('VALIDATION_ERROR', reset($val['errors']), $val['errors'], 400);
    }
    $sanitized = $val['sanitized'];

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

        logAiEvent($teacherId, 'edit_question_success', ['quiz_id' => $quizId, 'question_id' => $questionId]);

        sendAiResponse(true, 'Question updated successfully.', [
            'question' => $formatted
        ], 200);

    } catch (Exception $e) {
        error_log("[QuizSpark Edit Question DB Error] " . $e->getMessage());
        sendAiError('DATABASE_ERROR', 'Unable to update question in database.', [], 500);
    }
}
