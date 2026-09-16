<?php
/**
 * Next Question API Endpoint (Teacher Control)
 * fahh Live Quiz Application
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/security.php';

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

    $currentQ = (int)$quiz['current_question'];

    // Fetch Total Questions
    $qCountStmt = $pdo->prepare("SELECT COUNT(*) as total FROM `questions` WHERE `quiz_id` = :quiz_id");
    $qCountStmt->execute(['quiz_id' => $quizId]);
    $totalQ = (int)($qCountStmt->fetch()['total'] ?? 0);

    if ($currentQ >= $totalQ) {
        // Auto trigger end quiz if no more questions
        header('Location: ' . getBaseUrl() . '/api/live/end_quiz.php');
        sendJsonResponse(false, 'All questions completed. Ending quiz...', ['redirect' => 'end_quiz']);
    }

    $nextQ = $currentQ + 1;
    $now = getMicroTime();

    $upd = $pdo->prepare("
        UPDATE `quizzes` 
        SET `current_question` = :next_q, 
            `current_question_status` = 'active',
            `question_start_time` = :start_time 
        WHERE `id` = :id
    ");
    $upd->execute([
        'next_q'     => $nextQ,
        'start_time' => $now,
        'id'         => $quizId
    ]);

    sendJsonResponse(true, "Advanced to Question {$nextQ}.", [
        'quiz_id'          => $quizId,
        'current_question' => $nextQ,
        'start_time'       => $now
    ]);

} catch (Exception $e) {
    sendJsonResponse(false, 'Failed to advance to next question: ' . $e->getMessage(), [], 500);
}
