<?php
/**
 * AI Quiz Generator - Save Draft API
 * POST /api/creator/ai/save.php
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

// 5. Verify Quiz Contains Questions
$countStmt = $pdo->prepare("SELECT COUNT(*) FROM `questions` WHERE `quiz_id` = :quiz_id");
$countStmt->execute(['quiz_id' => $quizId]);
$qCount = (int)$countStmt->fetchColumn();

if ($qCount === 0) {
    sendAiError('VALIDATION_ERROR', 'Cannot save draft without any questions.', ['questions' => 'At least one question is required.'], 400);
}

// 6. Optional Title / Topic Update
$title = trim((string)($input['title'] ?? ''));
$topic = trim((string)($input['topic'] ?? ''));

$updateFields = [];
$params = ['quiz_id' => $quizId];

if ($title !== '') {
    if (mb_strlen($title) > 150) {
        sendAiError('VALIDATION_ERROR', 'Title cannot exceed 150 characters.', ['title' => 'Too long.'], 400);
    }
    $updateFields[] = "`title` = :title";
    $params['title'] = $title;
}

if ($topic !== '') {
    if (mb_strlen($topic) > 500) {
        sendAiError('VALIDATION_ERROR', 'Topic cannot exceed 500 characters.', ['topic' => 'Too long.'], 400);
    }
    $updateFields[] = "`topic` = :topic";
    $params['topic'] = $topic;
}

if (!empty($updateFields)) {
    $sql = "UPDATE `quizzes` SET " . implode(', ', $updateFields) . " WHERE `id` = :quiz_id";
    $upStmt = $pdo->prepare($sql);
    $upStmt->execute($params);
    if ($title !== '') $quiz['title'] = $title;
}

logAiEvent($teacherId, 'save_draft_success', ['quiz_id' => $quizId]);

sendAiResponse(true, 'Draft saved successfully.', [
    'quiz_id'        => $quizId,
    'title'          => $quiz['title'],
    'status'         => 'draft',
    'question_count' => $qCount
], 200);
