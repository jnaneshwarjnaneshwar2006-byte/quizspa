<?php
/**
 * Creator Live Lobby API Endpoint with 3D Avatar Data
 * QuizSpark Live Quiz Application
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/avatar.php';

$isTeacher = isTeacherLoggedIn();
$studentToken = getStudentToken();

if (!$isTeacher && !$studentToken) {
    sendJsonResponse(false, 'Unauthorized. Please login or join quiz.', [], 401);
}

$quizId = (int)($_GET['quiz_id'] ?? 0);
if (!$quizId) {
    sendJsonResponse(false, 'Quiz ID is required.', [], 400);
}

try {
    $pdo = getDBConnection();

    if ($isTeacher) {
        $teacherId = getTeacherId();
        $stmt = $pdo->prepare("SELECT * FROM `quizzes` WHERE `id` = :id AND `teacher_id` = :teacher_id");
        $stmt->execute(['id' => $quizId, 'teacher_id' => $teacherId]);
        $quiz = $stmt->fetch();
    } else {
        // Verify student joined this quiz
        $spStmt = $pdo->prepare("SELECT `id` FROM `participants` WHERE `quiz_id` = :quiz_id AND `session_token` = :token LIMIT 1");
        $spStmt->execute(['quiz_id' => $quizId, 'token' => $studentToken]);
        $student = $spStmt->fetch();

        if (!$student) {
            sendJsonResponse(false, 'Unauthorized student session.', [], 403);
        }

        $stmt = $pdo->prepare("SELECT * FROM `quizzes` WHERE `id` = :id");
        $stmt->execute(['id' => $quizId]);
        $quiz = $stmt->fetch();
    }

    if (!$quiz) {
        sendJsonResponse(false, 'Quiz not found or unauthorized.', [], 404);
    }

    // Auto update status to 'lobby' if teacher and currently 'published'
    if ($isTeacher && $quiz['status'] === 'published') {
        $upd = $pdo->prepare("UPDATE `quizzes` SET `status` = 'lobby' WHERE `id` = :id");
        $upd->execute(['id' => $quizId]);
        $quiz['status'] = 'lobby';
    }

    // Fetch Joined Participants
    $pStmt = $pdo->prepare("SELECT `id`, `name`, `emoji`, `avatar_data`, `total_score`, `total_time`, `joined_at`, `status` FROM `participants` WHERE `quiz_id` = :quiz_id ORDER BY `joined_at` ASC");
    $pStmt->execute(['quiz_id' => $quizId]);
    $rawParticipants = $pStmt->fetchAll();

    $participants = [];
    foreach ($rawParticipants as $p) {
        $participants[] = [
            'id'          => (int)$p['id'],
            'name'        => $p['name'],
            'emoji'       => $p['emoji'],
            'avatar_data' => getParticipantAvatarData($p),
            'total_score' => (int)($p['total_score'] ?? 0),
            'total_time'  => (float)($p['total_time'] ?? 0),
            'joined_at'   => $p['joined_at'],
            'status'      => $p['status']
        ];
    }

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
