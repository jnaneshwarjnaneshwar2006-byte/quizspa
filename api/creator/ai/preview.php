<?php
/**
 * AI Quiz Generator - Preview Quiz Draft API
 * POST /api/creator/ai/preview.php
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

// 4. Verify Quiz Ownership (Can preview both draft and published, but does NOT publish or alter status)
$quiz = verifyQuizOwnership($pdo, $quizId, $teacherId, false);

// 5. Fetch Questions
$qStmt = $pdo->prepare("SELECT * FROM `questions` WHERE `quiz_id` = :quiz_id ORDER BY `question_number` ASC, `id` ASC");
$qStmt->execute(['quiz_id' => $quizId]);
$rows = $qStmt->fetchAll();

$questions = [];
$totalPoints = 0;
foreach ($rows as $row) {
    $formatted = formatQuestionResponse($row);
    $questions[] = $formatted;
    $totalPoints += (int)$formatted['points'];
}

// Ensure preview does NOT publish or alter quiz state
sendAiResponse(true, 'Preview data retrieved.', [
    'quiz' => [
        'id'             => (int)$quiz['id'],
        'title'          => $quiz['title'],
        'topic'          => $quiz['topic'] ?? '',
        'difficulty'     => $quiz['difficulty'] ?? 'medium',
        'status'         => $quiz['status'],
        'source'         => $quiz['source'] ?? 'ai',
        'question_count' => count($questions),
        'total_points'   => $totalPoints,
        'is_preview'     => true
    ],
    'questions' => $questions
], 200);
