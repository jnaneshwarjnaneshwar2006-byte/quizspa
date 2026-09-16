<?php
/**
 * Teacher Live Lobby API Endpoint
 * fahh Live Quiz Application
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/security.php';

requireTeacherAuth();

$quizId = (int)($_GET['quiz_id'] ?? 0);
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

    // Auto update status to 'lobby' if currently 'published'
    if ($quiz['status'] === 'published') {
        $upd = $pdo->prepare("UPDATE `quizzes` SET `status` = 'lobby' WHERE `id` = :id");
        $upd->execute(['id' => $quizId]);
        $quiz['status'] = 'lobby';
    }

    // Fetch Joined Participants
    $pStmt = $pdo->prepare("SELECT `id`, `name`, `emoji`, `joined_at`, `status` FROM `participants` WHERE `quiz_id` = :quiz_id ORDER BY `joined_at` ASC");
    $pStmt->execute(['quiz_id' => $quizId]);
    $participants = $pStmt->fetchAll();

    sendJsonResponse(true, 'Lobby state retrieved.', [
        'quiz' => [
            'id'               => $quiz['id'],
            'title'            => $quiz['title'],
            'status'           => $quiz['status'],
            'join_code'        => $quiz['join_code'],
            'join_url'         => $quiz['join_url'],
            'current_question' => (int)$quiz['current_question']
        ],
        'player_count' => count($participants),
        'participants' => $participants
    ]);

} catch (Exception $e) {
    sendJsonResponse(false, 'Error getting lobby data: ' . $e->getMessage(), [], 500);
}
