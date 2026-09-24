<?php
/**
 * Student Join Quiz API Endpoint
 * QuizSpark Live Quiz Application with 3D Avatar System & Idempotency
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/avatar.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, 'Invalid request method.', ['error_code' => 'INVALID_METHOD'], 405);
}

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);
if (!is_array($input)) {
    $input = $_POST;
}

$joinCode = preg_replace('/[^0-9]/', '', (string)($input['join_code'] ?? $input['pin'] ?? $input['code'] ?? ''));
$name = sanitizeString($input['name'] ?? $input['player_name'] ?? $input['display_name'] ?? '');
$rawAvatar = $input['avatar_data'] ?? null;

// Validate 6-digit numeric Join Code
if (empty($joinCode) || strlen($joinCode) !== 6) {
    sendJsonResponse(false, 'Please enter a valid 6-digit PIN code.', ['error_code' => 'INVALID_PIN'], 400);
}

// Validate Display Name
if (empty($name) || mb_strlen($name) < 1 || mb_strlen($name) > 30) {
    sendJsonResponse(false, 'Please enter a display name between 1 and 30 characters.', ['error_code' => 'INVALID_NAME'], 400);
}

// Validate & Sanitize Avatar Configuration
$avatarJson = validateAndSanitizeAvatar($rawAvatar);
$avatarArray = json_decode($avatarJson, true) ?: [];

// Fallback emoji for legacy UI elements
$fallbackEmoji = '👦';
if (($avatarArray['style'] ?? '') === 'girl') {
    $fallbackEmoji = '👧';
}

try {
    $pdo = getDBConnection();
    $pdo->beginTransaction();

    // 1. Fetch Quiz by Join Code
    $stmt = $pdo->prepare("SELECT * FROM `quizzes` WHERE `join_code` = :code LIMIT 1");
    $stmt->execute(['code' => $joinCode]);
    $quiz = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$quiz) {
        $pdo->rollBack();
        sendJsonResponse(false, "Quiz with PIN {$joinCode} not found. Please verify your game PIN.", [
            'error_code' => 'QUIZ_NOT_FOUND',
            'join_code'  => $joinCode
        ], 404);
    }

    $quizId = (int)$quiz['id'];
    $status = strtolower($quiz['status'] ?? '');

    // 2. Idempotent Participant Lookup (Check if player is reconnecting)
    $existingToken = getStudentToken();
    $participant = null;

    if (!empty($existingToken)) {
        $checkStmt = $pdo->prepare("SELECT * FROM `participants` WHERE `session_token` = :token AND `quiz_id` = :quiz_id LIMIT 1");
        $checkStmt->execute(['token' => $existingToken, 'quiz_id' => $quizId]);
        $participant = $checkStmt->fetch(PDO::FETCH_ASSOC);
    }

    // If not found by token, check if participant exists by exact name in this quiz
    if (!$participant) {
        $checkNameStmt = $pdo->prepare("SELECT * FROM `participants` WHERE `quiz_id` = :quiz_id AND `name` = :name LIMIT 1");
        $checkNameStmt->execute(['quiz_id' => $quizId, 'name' => $name]);
        $participant = $checkNameStmt->fetch(PDO::FETCH_ASSOC);
    }

    // 3. Validate Quiz Status for New vs Reconnecting Participants
    if ($status === 'completed') {
        $pdo->rollBack();
        sendJsonResponse(false, 'This quiz has already ended.', ['error_code' => 'QUIZ_ENDED'], 400);
    }

    // Reject NEW participants if quiz is already running, but ALLOW reconnecting players
    if ($status === 'running' && !$participant) {
        $pdo->rollBack();
        sendJsonResponse(false, 'This quiz is already in progress and cannot accept new players.', ['error_code' => 'QUIZ_RUNNING'], 400);
    }

    // Auto-advance published/draft quiz to lobby
    if (in_array($status, ['published', 'draft', 'active', 'open'], true)) {
        $updQ = $pdo->prepare("UPDATE `quizzes` SET `status` = 'lobby' WHERE `id` = :id");
        $updQ->execute(['id' => $quizId]);
        $quiz['status'] = 'lobby';
    }

    if (!$participant) {
        // Create new participant with fresh unique session token
        $sessionToken = bin2hex(random_bytes(32));
        setStudentToken($sessionToken);

        $insStmt = $pdo->prepare("
            INSERT INTO `participants` (`quiz_id`, `session_token`, `name`, `emoji`, `avatar_data`, `joined_at`, `last_seen`, `status`, `total_score`, `total_time`) 
            VALUES (:quiz_id, :token, :name, :emoji, :avatar_data, NOW(), NOW(), 'joined', 0, 0)
        ");
        $insStmt->execute([
            'quiz_id'     => $quizId,
            'token'       => $sessionToken,
            'name'        => $name,
            'emoji'       => $fallbackEmoji,
            'avatar_data' => $avatarJson
        ]);
        $participantId = (int)$pdo->lastInsertId();
    } else {
        // Re-join / Update existing participant record
        $participantId = (int)$participant['id'];
        $sessionToken = $participant['session_token'] ?: bin2hex(random_bytes(32));
        setStudentToken($sessionToken);

        $updStmt = $pdo->prepare("
            UPDATE `participants` 
            SET `session_token` = :token,
                `name` = :name, 
                `emoji` = :emoji, 
                `avatar_data` = :avatar_data, 
                `status` = 'joined', 
                `last_seen` = NOW() 
            WHERE `id` = :id
        ");
        $updStmt->execute([
            'token'       => $sessionToken,
            'name'        => $name, 
            'emoji'       => $fallbackEmoji, 
            'avatar_data' => $avatarJson,
            'id'          => $participantId
        ]);
    }

    $pdo->commit();

    // Store in student session variables
    $_SESSION['student_quiz_id'] = $quizId;
    $_SESSION['participant_id'] = $participantId;
    $_SESSION['student_name'] = $name;

    $responseData = [
        'quiz_id'        => $quizId,
        'player_id'      => $participantId,
        'participant_id' => $participantId,
        'player_name'    => $name,
        'name'           => $name,
        'quiz_title'     => $quiz['title'],
        'session_token'  => $sessionToken,
        'token'          => $sessionToken,
        'join_code'      => $joinCode,
        'emoji'          => $fallbackEmoji,
        'avatar_data'    => $avatarArray,
        'redirect'       => "lobby.php?quiz_id={$quizId}&token=" . urlencode($sessionToken)
    ];

    $response = [
        'success'        => true,
        'message'        => 'Joined successfully!',
        'data'           => $responseData,
        'quiz_id'        => $quizId,
        'player_id'      => $participantId,
        'participant_id' => $participantId,
        'player_name'    => $name,
        'name'           => $name,
        'token'          => $sessionToken,
        'join_code'      => $joinCode,
        'redirect'       => $responseData['redirect']
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;

} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("Error in api/student/join.php: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    sendJsonResponse(false, 'Unable to join the quiz right now. Please try again.', [
        'error_code' => 'SERVER_ERROR',
        'debug'      => $e->getMessage()
    ], 500);
}
