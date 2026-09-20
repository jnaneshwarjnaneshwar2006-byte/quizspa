<?php
/**
 * End-to-End API endpoint test for QuizSpark 3D Avatar System
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/avatar.php';

echo "=== QuizSpark 3D Avatar API Endpoints Test ===\n\n";

$baseUrl = 'http://127.0.0.1:8000';
$pdo = getDBConnection();

// Get an existing quiz or create one
$qStmt = $pdo->query("SELECT id, join_code, status FROM `quizzes` WHERE `status` IN ('published', 'lobby') LIMIT 1");
$quiz = $qStmt->fetch();

if (!$quiz) {
    // If all quizzes are completed/running, update an existing one to 'lobby'
    $pdo->query("UPDATE `quizzes` SET `status` = 'lobby', `current_question_status` = 'inactive' WHERE `id` = 19");
    $qStmt = $pdo->query("SELECT id, join_code, status FROM `quizzes` WHERE `id` = 19 LIMIT 1");
    $quiz = $qStmt->fetch();
}

if (!$quiz) {
    die("No quiz available in DB for testing.\n");
}

$quizId = (int)$quiz['id'];
$joinCode = $quiz['join_code'];
echo "Testing with Quiz ID: $quizId (Join Code: $joinCode, Status: {$quiz['status']})\n";

// 1. Join Quiz with 3D Avatar via POST to /api/student/join.php
$avatarPayload = [
    'style' => 'girl',
    'body' => 'regular',
    'skin' => 'skin_02',
    'face' => 'face_oval',
    'hair' => 'hair_girl_wavy',
    'hairColor' => 'dark_brown',
    'eyes' => 'eyes_bright',
    'eyeColor' => 'brown',
    'eyebrows' => 'brows_curved',
    'nose' => 'nose_small',
    'mouth' => 'mouth_smile',
    'facialHair' => 'none',
    'top' => 'top_casual',
    'topColor' => 'purple',
    'bottom' => 'bottom_jeans',
    'bottomColor' => 'denim',
    'dress' => 'none',
    'dressColor' => 'pink',
    'shoes' => 'shoes_sneakers',
    'shoeColor' => 'white',
    'headwear' => 'none',
    'glasses' => 'none',
    'accessory' => 'acc_earrings',
    'specialItem' => 'none'
];

$postData = json_encode([
    'join_code' => $joinCode,
    'name' => 'E2E_AvatarTester',
    'avatar_data' => $avatarPayload
]);

$ch = curl_init("$baseUrl/api/student/join.php");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_HEADER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$header = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);
curl_close($ch);

echo "1. POST /api/student/join.php -> HTTP $httpCode\n";
$joinRes = json_decode($body, true);
assert($joinRes['success'] === true, "Join failed: " . ($joinRes['message'] ?? $body));
echo "   [PASS] Student joined successfully with 3D avatar.\n";

// Extract all cookies from response headers
preg_match_all('/^Set-Cookie:\s*([^;]*)/mi', $header, $matches);
$cookies = [];
foreach ($matches[1] as $item) {
    $cookies[] = $item;
}
$cookieStr = implode('; ', $cookies);

// 2. GET /api/live/get_lobby.php (Student or Teacher check)
$ch = curl_init("$baseUrl/api/live/get_lobby.php?quiz_id=$quizId");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
if ($cookieStr) {
    curl_setopt($ch, CURLOPT_COOKIE, $cookieStr);
}
$lobbyBody = curl_exec($ch);
curl_close($ch);

$lobbyRes = json_decode($lobbyBody, true);
assert($lobbyRes['success'] === true, "Get lobby failed: " . ($lobbyRes['message'] ?? $lobbyBody));
$foundParticipant = false;
foreach ($lobbyRes['data']['participants'] as $p) {
    if ($p['name'] === 'E2E_AvatarTester') {
        $foundParticipant = true;
        assert(isset($p['avatar_data']), "Participant missing avatar_data in lobby");
        assert($p['avatar_data']['hair'] === 'hair_girl_wavy', "Avatar data mismatch in lobby");
        echo "   [PASS] Verified participant in teacher lobby with complete 3D avatar structure.\n";
        break;
    }
}
assert($foundParticipant, "Participant was not found in lobby list!");

// 3. GET /api/student/state.php with session cookie
$ch = curl_init("$baseUrl/api/student/state.php?quiz_id=$quizId");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
if ($cookieStr) {
    curl_setopt($ch, CURLOPT_COOKIE, $cookieStr);
}
$stateBody = curl_exec($ch);
curl_close($ch);

$stateRes = json_decode($stateBody, true);
assert($stateRes['success'] === true, "Get state failed: " . ($stateRes['message'] ?? ''));
assert(isset($stateRes['data']['student']['avatar_data']), "Student state missing avatar_data");
assert($stateRes['data']['student']['avatar_data']['style'] === 'girl', "Student state avatar style mismatch");
echo "   [PASS] Student state API returns full student 3D avatar profile.\n";

// 4. GET /api/student/leaderboard.php
$ch = curl_init("$baseUrl/api/student/leaderboard.php?quiz_id=$quizId");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
if ($cookieStr) {
    curl_setopt($ch, CURLOPT_COOKIE, $cookieStr);
}
$lbBody = curl_exec($ch);
curl_close($ch);

$lbRes = json_decode($lbBody, true);
assert($lbRes['success'] === true, "Get leaderboard failed");
if (!empty($lbRes['data']['leaderboard'])) {
    foreach ($lbRes['data']['leaderboard'] as $row) {
        assert(isset($row['avatar_data']), "Leaderboard item missing avatar_data");
        assert(is_array($row['avatar_data']), "avatar_data must be parsed array/object");
    }
    echo "   [PASS] Leaderboard API returns full 3D avatar for all ranked players.\n";
}

// Clean up test participant
$pdo->prepare("DELETE FROM `participants` WHERE `name` = 'E2E_AvatarTester'")->execute();
echo "   [CLEANUP] E2E test participant cleaned up.\n\n";

echo "=== ALL E2E API ENDPOINT TESTS PASSED SUCCESSFULLY! ===\n";
