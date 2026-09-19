<?php
/**
 * End Question API Endpoint (Teacher Control: "End Question Early")
 * QuizSpark Live Quiz Application
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

    if ($quiz['status'] !== 'running') {
        sendJsonResponse(false, 'Quiz is not running.', [], 400);
    }

    $ended = transitionToLeaderboard($pdo, $quizId, 'Teacher clicked End Question Early');

    sendJsonResponse(true, 'Question ended early. Showing leaderboard for 5 seconds.', [
        'quiz_id' => $quizId,
        'ended'   => $ended
    ]);

} catch (Exception $e) {
    sendJsonResponse(false, 'Failed to end question: ' . $e->getMessage(), [], 500);
}
