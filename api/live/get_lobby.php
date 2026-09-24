<?php
/**
 * Live Lobby State API Endpoint
 * Provides real-time participants and lobby state for Creator, Student, and Projector views.
 * QuizSpark Live Quiz Application
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/avatar.php';

header('Content-Type: application/json; charset=utf-8');

$quizId = (int)($_GET['quiz_id'] ?? $_GET['id'] ?? 0);
$pin = preg_replace('/[^0-9]/', '', (string)($_GET['pin'] ?? $_GET['join_code'] ?? $_GET['code'] ?? ''));

if (!$quizId && empty($pin)) {
    sendJsonResponse(false, 'Quiz ID or Join PIN is required.', [
        'error_code' => 'MISSING_PARAM'
    ], 400);
}

try {
    $pdo = getDBConnection();

    if ($quizId > 0) {
        $stmt = $pdo->prepare("SELECT * FROM `quizzes` WHERE `id` = :id LIMIT 1");
        $stmt->execute(['id' => $quizId]);
        $quiz = $stmt->fetch(PDO::FETCH_ASSOC);
    } else {
        $stmt = $pdo->prepare("SELECT * FROM `quizzes` WHERE `join_code` = :code LIMIT 1");
        $stmt->execute(['code' => $pin]);
        $quiz = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($quiz) {
            $quizId = (int)$quiz['id'];
        }
    }

    if (!$quiz) {
        sendJsonResponse(false, 'Quiz not found. Please verify your game PIN.', [
            'error_code' => 'QUIZ_NOT_FOUND',
            'quiz_id'    => $quizId,
            'pin'        => $pin
        ], 404);
    }

    // Auto update status to 'lobby' if currently 'published' or 'draft'
    if (in_array($quiz['status'], ['published', 'draft'], true)) {
        $upd = $pdo->prepare("UPDATE `quizzes` SET `status` = 'lobby' WHERE `id` = :id");
        $upd->execute(['id' => $quizId]);
        $quiz['status'] = 'lobby';
    }

    // Ensure join_code and join_url exist
    if (empty($quiz['join_code'])) {
        $newPin = generateJoinCode();
        $joinUrl = getBaseUrl() . '/student/join.php?code=' . $newPin;
        $pdo->prepare("UPDATE `quizzes` SET `join_code` = :code, `join_url` = :url WHERE `id` = :id")
            ->execute(['code' => $newPin, 'url' => $joinUrl, 'id' => $quizId]);
        $quiz['join_code'] = $newPin;
        $quiz['join_url'] = $joinUrl;
    } elseif (empty($quiz['join_url'])) {
        $quiz['join_url'] = getBaseUrl() . '/student/join.php?code=' . $quiz['join_code'];
    }

    // Fetch Joined Participants
    $pStmt = $pdo->prepare("
        SELECT `id`, `name`, `emoji`, `avatar_data`, `total_score`, `total_time`, `joined_at`, `status` 
        FROM `participants` 
        WHERE `quiz_id` = :quiz_id 
        ORDER BY `joined_at` ASC, `id` ASC
    ");
    $pStmt->execute(['quiz_id' => $quizId]);
    $rawParticipants = $pStmt->fetchAll(PDO::FETCH_ASSOC);

    $participants = [];
    $playerNames = [];
    foreach ($rawParticipants as $p) {
        $pData = [
            'id'          => (int)$p['id'],
            'name'        => $p['name'],
            'emoji'       => $p['emoji'] ?: '👦',
            'avatar_data' => getParticipantAvatarData($p),
            'total_score' => (int)($p['total_score'] ?? 0),
            'total_time'  => (float)($p['total_time'] ?? 0),
            'joined_at'   => $p['joined_at'],
            'status'      => $p['status'] ?: 'joined'
        ];
        $participants[] = $pData;
        $playerNames[] = $p['name'];
    }

    $playerCount = count($participants);
    $isStarted = ($quiz['status'] === 'running');
    $isCompleted = ($quiz['status'] === 'completed');

    $responseData = [
        'quiz' => [
            'id'                      => (int)$quiz['id'],
            'title'                   => $quiz['title'],
            'status'                  => $quiz['status'],
            'join_code'               => $quiz['join_code'],
            'join_url'                => $quiz['join_url'],
            'current_question'        => (int)($quiz['current_question'] ?? 0),
            'current_question_status' => $quiz['current_question_status'] ?? 'inactive'
        ],
        'player_count' => $playerCount,
        'participants' => $participants,
        'player_names' => $playerNames,
        'is_started'   => $isStarted,
        'is_completed' => $isCompleted
    ];

    // Also include top-level keys for backward-compatible client adapters
    $response = [
        'success'      => true,
        'message'      => 'Lobby state retrieved successfully.',
        'data'         => $responseData,
        'quiz'         => $responseData['quiz'],
        'player_count' => $playerCount,
        'participants' => $participants,
        'player_names' => $playerNames,
        'is_started'   => $isStarted,
        'is_completed' => $isCompleted
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;

} catch (Throwable $e) {
    error_log("Error in api/live/get_lobby.php: " . $e->getMessage());
    sendJsonResponse(false, 'Failed to retrieve lobby state.', [
        'error_code' => 'SERVER_ERROR',
        'debug'      => $e->getMessage()
    ], 500);
}
