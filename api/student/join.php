<?php
/**
 * Student Join Quiz API Endpoint
 * fahh Live Quiz Application
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/security.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, 'Invalid request method.', [], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) $input = $_POST;

$joinCode = trim($input['join_code'] ?? '');
$name = sanitizeString($input['name'] ?? '');
$emoji = sanitizeString($input['emoji'] ?? '😀');

if (empty($joinCode)) {
    sendJsonResponse(false, 'Please provide a valid 6-digit join code.', [], 400);
}

if (empty($name) || mb_strlen($name) > 40) {
    sendJsonResponse(false, 'Please enter a valid display name (1-40 characters).', [], 400);
}

// Valid emojis list fallback check
$allowedEmojis = ['😀', '😎', '🤓', '🥳', '😁', '😍', '🤩', '🧠', '🚀', '🔥', '👑', '🎯', '🐼', '🦁', '🐯', '🐸'];
if (!in_array($emoji, $allowedEmojis)) {
    $emoji = '😀';
}

try {
    $pdo = getDBConnection();

    // 1. Fetch Quiz by Join Code
    $stmt = $pdo->prepare("SELECT * FROM `quizzes` WHERE `join_code` = :code LIMIT 1");
    $stmt->execute(['code' => $joinCode]);
    $quiz = $stmt->fetch();

    if (!$quiz) {
        sendJsonResponse(false, 'Quiz not found. Please check your 6-digit join code.', [], 444);
    }

    // 2. Status Validation
    if ($quiz['status'] === 'completed') {
        sendJsonResponse(false, 'This quiz has already ended.', [], 400);
    }
    if ($quiz['status'] === 'running') {
        sendJsonResponse(false, 'The quiz is already in progress and cannot accept new players.', [], 400);
    }
    if ($quiz['status'] === 'draft') {
        sendJsonResponse(false, 'This quiz has not been published yet by the teacher.', [], 400);
    }

    // 3. Check for Existing Participant Session
    $existingToken = getStudentToken();
    $participant = null;

    if ($existingToken) {
        $checkStmt = $pdo->prepare("SELECT * FROM `participants` WHERE `session_token` = :token AND `quiz_id` = :quiz_id LIMIT 1");
        $checkStmt->execute(['token' => $existingToken, 'quiz_id' => $quiz['id']]);
        $participant = $checkStmt->fetch();
    }

    if (!$participant) {
        // Create new secure session token
        $sessionToken = bin2hex(random_bytes(32));
        setStudentToken($sessionToken);

        $insStmt = $pdo->prepare("INSERT INTO `participants` (`quiz_id`, `session_token`, `name`, `emoji`, `joined_at`, `status`) VALUES (:quiz_id, :token, :name, :emoji, NOW(), 'joined')");
        $insStmt->execute([
            'quiz_id' => $quiz['id'],
            'token'   => $sessionToken,
            'name'    => $name,
            'emoji'   => $emoji
        ]);
        $participantId = (int)$pdo->lastInsertId();
    } else {
        $sessionToken = $existingToken;
        $participantId = (int)$participant['id'];
        
        // Update name/emoji/status
        $updStmt = $pdo->prepare("UPDATE `participants` SET `name` = :name, `emoji` = :emoji, `status` = 'joined', `last_seen` = NOW() WHERE `id` = :id");
        $updStmt->execute(['name' => $name, 'emoji' => $emoji, 'id' => $participantId]);
    }

    sendJsonResponse(true, 'Joined successfully!', [
        'quiz_id'        => (int)$quiz['id'],
        'quiz_title'     => $quiz['title'],
        'participant_id' => $participantId,
        'session_token'  => $sessionToken,
        'name'           => $name,
        'emoji'          => $emoji
    ]);

} catch (Exception $e) {
    sendJsonResponse(false, 'Error joining quiz: ' . $e->getMessage(), [], 500);
}
