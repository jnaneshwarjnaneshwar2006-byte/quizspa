<?php
/**
 * AI Quiz Generator - Get Draft API
 * GET /api/creator/ai/draft.php?id={quiz_id}
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/session.php';
require_once __DIR__ . '/../../../config/security.php';
require_once __DIR__ . '/../../../config/ai.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendAiError('METHOD_NOT_ALLOWED', 'Invalid request method. GET required.', [], 405);
}

// 1. Authenticate Creator
$teacherId = requireCreatorAuth();

// 2. Validate Quiz ID
$quizId = (int)($_GET['id'] ?? ($_GET['quiz_id'] ?? 0));
if ($quizId <= 0) {
    sendAiError('VALIDATION_ERROR', 'Valid quiz ID parameter is required.', ['id' => 'Must be a positive integer.'], 400);
}

$pdo = getDBConnection();

// 3. Verify Ownership (Allows viewing draft or published for previewing/editing)
$quiz = verifyQuizOwnership($pdo, $quizId, $teacherId, false);

// 4. Fetch Questions
$qStmt = $pdo->prepare("SELECT * FROM `questions` WHERE `quiz_id` = :quiz_id ORDER BY `question_number` ASC, `id` ASC");
$qStmt->execute(['quiz_id' => $quizId]);
$rows = $qStmt->fetchAll();

$questions = [];
foreach ($rows as $row) {
    $questions[] = formatQuestionResponse($row);
}

sendAiResponse(true, 'Draft quiz retrieved successfully.', [
    'csrf_token'     => generateCsrfToken(),
    'quiz' => [
        'id'             => (int)$quiz['id'],
        'title'          => $quiz['title'],
        'topic'          => $quiz['topic'] ?? '',
        'difficulty'     => $quiz['difficulty'] ?? 'medium',
        'status'         => $quiz['status'],
        'source'         => $quiz['source'] ?? 'ai',
        'question_count' => count($questions)
    ],
    'questions' => $questions
], 200);
