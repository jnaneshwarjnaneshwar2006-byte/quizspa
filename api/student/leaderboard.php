<?php
/**
 * Leaderboard Data API Endpoint
 * fahh Live Quiz Application
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/security.php';

$quizId = (int)($_GET['quiz_id'] ?? 0);
$studentToken = getStudentToken();

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

    // 2. Fetch Leaderboard (Ranked by total_score DESC, total_time ASC)
    $stmt = $pdo->prepare("
        SELECT 
            p.id, p.name, p.emoji, p.total_score, p.total_time, p.session_token,
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
            'emoji'           => $p['emoji'],
            'total_score'     => (int)$p['total_score'],
            'total_time'      => (float)$p['total_time'],
            'correct_answers' => (int)$p['correct_answers'],
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
    sendJsonResponse(false, 'Failed to fetch leaderboard: ' . $e->getMessage(), [], 500);
}
