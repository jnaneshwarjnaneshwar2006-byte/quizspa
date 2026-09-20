<?php
/**
 * Start Quiz API Endpoint (Teacher Control)
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

    // Verify Quiz Ownership
    $stmt = $pdo->prepare("SELECT * FROM `quizzes` WHERE `id` = :id AND `teacher_id` = :teacher_id");
    $stmt->execute(['id' => $quizId, 'teacher_id' => $teacherId]);
    $quiz = $stmt->fetch();

    if (!$quiz) {
        sendJsonResponse(false, 'Quiz not found or unauthorized.', [], 404);
    }

    // Verify Quiz has questions
    $qCountStmt = $pdo->prepare("SELECT COUNT(*) FROM `questions` WHERE `quiz_id` = :quiz_id");
    $qCountStmt->execute(['quiz_id' => $quizId]);
    $questionCount = (int)$qCountStmt->fetchColumn();

    if ($questionCount === 0) {
        sendJsonResponse(false, 'Cannot start quiz: Please add at least one question before starting.', [], 400);
    }

    $now = getMicroTime();

    $pdo->beginTransaction();

    // Update Quiz State to Running, Question 1 Active
    $upd = $pdo->prepare("
        UPDATE `quizzes` 
        SET `status` = 'running', 
            `current_question` = 1, 
            `current_question_status` = 'active',
            `question_start_time` = :start_time,
            `leaderboard_start_time` = NULL,
            `next_question_at` = NULL,
            `started_at` = NOW() 
        WHERE `id` = :id
    ");
    $upd->execute([
        'start_time'      => $now, 
        'id'              => $quizId
    ]);

    // Update Participants to playing
    $updP = $pdo->prepare("UPDATE `participants` SET `status` = 'playing' WHERE `quiz_id` = :quiz_id");
    $updP->execute(['quiz_id' => $quizId]);

    $pdo->commit();

    sendJsonResponse(true, 'Quiz started! Question 1 is live.', [
        'quiz_id'          => $quizId,
        'current_question' => 1,
        'total_questions'  => $questionCount,
        'start_time'       => $now
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendJsonResponse(false, 'Failed to start quiz: ' . $e->getMessage(), [], 500);
}
