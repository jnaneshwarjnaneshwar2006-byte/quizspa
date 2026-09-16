<?php
/**
 * End Quiz API Endpoint (Teacher Control)
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

    $pdo->beginTransaction();

    // 1. Update Quiz Status to Completed
    $updQuiz = $pdo->prepare("UPDATE `quizzes` SET `status` = 'completed', `current_question_status` = 'ended', `ended_at` = NOW() WHERE `id` = :id");
    $updQuiz->execute(['id' => $quizId]);

    // 2. Fetch Total Questions
    $qCountStmt = $pdo->prepare("SELECT COUNT(*) as total FROM `questions` WHERE `quiz_id` = :quiz_id");
    $qCountStmt->execute(['quiz_id' => $quizId]);
    $totalQuestions = (int)($qCountStmt->fetch()['total'] ?? 0);

    // 3. Fetch Participants sorted by total_score DESC, total_time ASC
    $pStmt = $pdo->prepare("
        SELECT p.*, COUNT(CASE WHEN a.is_correct = 1 THEN 1 END) as correct_count
        FROM `participants` p
        LEFT JOIN `answers` a ON p.id = a.participant_id
        WHERE p.quiz_id = :quiz_id
        GROUP BY p.id
        ORDER BY p.total_score DESC, p.total_time ASC
    ");
    $pStmt->execute(['quiz_id' => $quizId]);
    $participants = $pStmt->fetchAll();

    // 4. Clear existing results for this quiz to avoid duplicate key errors
    $delRes = $pdo->prepare("DELETE FROM `quiz_results` WHERE `quiz_id` = :quiz_id");
    $delRes->execute(['quiz_id' => $quizId]);

    $insRes = $pdo->prepare("
        INSERT INTO `quiz_results` 
        (`quiz_id`, `participant_id`, `rank`, `total_score`, `total_time`, `correct_answers`, `total_questions`, `completed_at`) 
        VALUES (:quiz_id, :p_id, :rank, :score, :time, :correct, :total_q, NOW())
    ");

    foreach ($participants as $rankIdx => $p) {
        $insRes->execute([
            'quiz_id' => $quizId,
            'p_id'    => $p['id'],
            'rank'    => $rankIdx + 1,
            'score'   => $p['total_score'],
            'time'    => $p['total_time'],
            'correct' => $p['correct_count'],
            'total_q' => $totalQuestions
        ]);
    }

    // Update participants status to completed
    $updP = $pdo->prepare("UPDATE `participants` SET `status` = 'completed' WHERE `quiz_id` = :quiz_id");
    $updP->execute(['quiz_id' => $quizId]);

    $pdo->commit();

    sendJsonResponse(true, 'Quiz completed successfully! Final results compiled.', ['quiz_id' => $quizId]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendJsonResponse(false, 'Failed to complete quiz: ' . $e->getMessage(), [], 500);
}
