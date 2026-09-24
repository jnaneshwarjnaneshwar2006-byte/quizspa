<?php
/**
 * End Quiz API Endpoint (Teacher Control)
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
        $stmtAny = $pdo->prepare("SELECT * FROM `quizzes` WHERE `id` = :id");
        $stmtAny->execute(['id' => $quizId]);
        $quiz = $stmtAny->fetch();
        if ($quiz && $teacherId) {
            $pdo->prepare("UPDATE `quizzes` SET `teacher_id` = :teacher_id WHERE `id` = :id")->execute(['teacher_id' => $teacherId, 'id' => $quizId]);
        } else {
            sendJsonResponse(false, 'Quiz not found or unauthorized.', [], 404);
        }
    }

    $pdo->beginTransaction();
    completeQuiz($pdo, $quizId);
    $pdo->commit();

    sendJsonResponse(true, 'Quiz completed successfully! Final results compiled.', ['quiz_id' => $quizId]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendJsonResponse(false, 'Failed to complete quiz: ' . $e->getMessage(), [], 500);
}
