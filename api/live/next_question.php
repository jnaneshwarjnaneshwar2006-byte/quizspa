<?php
/**
 * Next Question API Endpoint (Teacher Control)
 * fahh Live Quiz Application
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/live_quiz.php';

requireTeacherAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, 'Invalid request method.', [], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$quizId = (int)($input['quiz_id'] ?? 0);

if (!$quizId) {
    sendJsonResponse(false, 'Quiz ID is required.', [], 400);
}

try {
    $pdo = getDBConnection();
    $teacherId = getTeacherId();

    $stmt = $pdo->prepare("SELECT * FROM `quizzes` WHERE `id` = :id AND `teacher_id` = :teacher_id");
    $stmt->execute(['id' => $quizId, 'teacher_id' => $teacherId]);
    $quiz = $stmt->fetch();

    if (!$quiz) {
        sendJsonResponse(false, 'Quiz not found or unauthorized.', [], 404);
    }

    $transition = advanceQuizFromLeaderboard($pdo, $quizId);

    if (!$transition['changed']) {
        sendJsonResponse(false, 'The quiz is not waiting at a leaderboard.', [], 409);
    }

    if ($transition['completed']) {
        sendJsonResponse(true, 'Quiz completed successfully.', ['redirect' => 'end_quiz']);
    }

    sendJsonResponse(true, 'Advanced to the next question.', ['quiz_id' => $quizId]);

} catch (Exception $e) {
    sendJsonResponse(false, 'Failed to advance to next question: ' . $e->getMessage(), [], 500);
}
