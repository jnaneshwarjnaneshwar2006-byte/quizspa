<?php
/**
 * Leaderboard Data API Endpoint with 3D Avatar Data
 * QuizSpark Live Quiz Application
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/avatar.php';

header('Content-Type: application/json; charset=utf-8');

$quizId = (int)($_GET['quiz_id'] ?? 0);
$studentToken = getStudentToken();
if (!$studentToken && !empty($_GET['token'])) {
    $studentToken = trim((string)$_GET['token']);
    setStudentToken($studentToken);
}

if (!$quizId) {
    sendJsonResponse(false, 'Quiz ID is required.', [], 400);
}

try {
    $pdo = getDBConnection();

    // 1. Fetch Quiz Info
    $qzStmt = $pdo->prepare("SELECT * FROM `quizzes` WHERE `id` = :id LIMIT 1");
    $qzStmt->execute(['id' => $quizId]);
    $quiz = $qzStmt->fetch();

    if (!$quiz) {
        sendJsonResponse(false, 'Quiz not found.', [], 404);
    }

    // 2. Safely check if avatar_data column exists on participants
    $hasAvatarData = true;
    try {
        $checkCol = $pdo->query("SHOW COLUMNS FROM `participants` LIKE 'avatar_data'");
        if (!$checkCol || !$checkCol->fetch()) {
            $hasAvatarData = false;
        }
    } catch (Throwable $t) {
        $hasAvatarData = false;
    }

    $avatarField = $hasAvatarData ? "p.avatar_data," : "NULL AS avatar_data,";

    // Fetch Leaderboard (Ranked by total_score DESC, total_time ASC)
    $stmt = $pdo->prepare("
        SELECT 
            p.id, p.name, p.emoji, {$avatarField} p.total_score, p.total_time, p.session_token,
            COUNT(CASE WHEN a.is_correct = 1 THEN 1 END) as correct_answers
        FROM `participants` p
        LEFT JOIN `answers` a ON p.id = a.participant_id
        WHERE p.quiz_id = :quiz_id
        GROUP BY p.id
        ORDER BY p.total_score DESC, p.total_time ASC
    ");
    $stmt->execute(['quiz_id' => $quizId]);
    $participants = $stmt->fetchAll();

    $leaderboard = [];
    $myRankData = null;

    foreach ($participants as $index => $p) {
        $rank = $index + 1;
        $isMe = ($studentToken && $p['session_token'] === $studentToken);

        $row = [
            'rank'            => $rank,
            'id'              => (int)$p['id'],
            'name'            => $p['name'],
            'points'          => (int)$p['total_score'],
            'total_score'     => (int)$p['total_score'],
            'emoji'           => $p['emoji'] ?? '😀',
            'avatar_data'     => getParticipantAvatarData($p),
            'total_time'      => (float)($p['total_time'] ?? 0),
            'correct_answers' => (int)($p['correct_answers'] ?? 0),
            'is_me'           => $isMe
        ];

        $leaderboard[] = $row;

        if ($isMe) {
            $myRankData = $row;
        }
    }

    sendJsonResponse(true, 'Leaderboard data retrieved.', [
        'quiz' => [
            'id'                      => (int)$quiz['id'],
            'title'                   => $quiz['title'],
            'status'                  => $quiz['status'],
            'current_question'        => (int)$quiz['current_question'],
            'current_question_status' => $quiz['current_question_status']
        ],
        'leaderboard' => $leaderboard,
        'my_rank'     => $myRankData
    ]);

} catch (Exception $e) {
    error_log("[QuizSpark Leaderboard Error] Quiz {$quizId}: " . $e->getMessage());
    sendJsonResponse(false, 'Unable to load leaderboard. Please try again.', [], 500);
}
