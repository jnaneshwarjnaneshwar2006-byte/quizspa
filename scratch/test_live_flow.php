<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/avatar.php';

echo "=== QuizSpark Live Quiz Join & Lobby Test ===\n";

$pdo = getDBConnection();

// 1. Find or create a test quiz in 'lobby' state
$stmt = $pdo->prepare("SELECT * FROM `quizzes` WHERE `status` IN ('lobby', 'published') LIMIT 1");
$stmt->execute();
$quiz = $stmt->fetch();

if (!$quiz) {
    echo "No lobby quiz found, creating one for testing...\n";
    $joinCode = sprintf('%06d', mt_rand(100000, 999999));
    $ins = $pdo->prepare("INSERT INTO `quizzes` (`teacher_id`, `title`, `description`, `join_code`, `status`, `created_at`) VALUES (1, 'Test Live Quiz', 'Testing live join', :code, 'lobby', NOW())");
    $ins->execute(['code' => $joinCode]);
    $quizId = (int)$pdo->lastInsertId();
    $quiz = ['id' => $quizId, 'join_code' => $joinCode, 'title' => 'Test Live Quiz', 'status' => 'lobby'];
}

$quizId = (int)$quiz['id'];
$pin = $quiz['join_code'];

echo "Target Quiz ID: {$quizId}, PIN: {$pin}, Status: {$quiz['status']}\n";

// Function to simulate student join API request
function simulateJoin($pin, $name, $avatarData, $token = null) {
    $url = "http://localhost/q1/api/student/join.php";
    $payload = json_encode([
        'join_code' => $pin,
        'name' => $name,
        'avatar_data' => $avatarData
    ]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    $headers = ['Content-Type: application/json'];
    if ($token) {
        $headers[] = "X-Student-Token: {$token}";
        $headers[] = "Cookie: student_token={$token}";
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $res = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ['status' => $httpCode, 'response' => json_decode($res, true), 'raw' => $res];
}

// 2. Test Student 1 Join
$avatar1 = [
    'style' => 'boy',
    'hair_style' => 'short_messy',
    'hair_color' => '#2c3e50',
    'skin_tone' => '#fad390',
    'outfit_type' => 'hoodie',
    'outfit_color' => '#6c5ce7',
    'face_expression' => 'smile'
];

echo "\n--- Joining Student 1: 'Jnanesh' ---\n";
$res1 = simulateJoin($pin, 'Jnanesh', $avatar1);
echo "Response Code: {$res1['status']}\n";
echo "Response Body: " . json_encode($res1['response'], JSON_PRETTY_PRINT) . "\n";

$token1 = $res1['response']['data']['session_token'] ?? null;
$player1Id = $res1['response']['data']['player_id'] ?? null;

// 3. Test Student 2 Join (different student, different avatar)
$avatar2 = [
    'style' => 'girl',
    'hair_style' => 'long_wavy',
    'hair_color' => '#e17055',
    'skin_tone' => '#ffeaa7',
    'outfit_type' => 'sweater',
    'outfit_color' => '#fd79a8',
    'face_expression' => 'cool'
];

echo "\n--- Joining Student 2: 'Aria' ---\n";
$res2 = simulateJoin($pin, 'Aria', $avatar2);
echo "Response Code: {$res2['status']}\n";
echo "Response Body: " . json_encode($res2['response'], JSON_PRETTY_PRINT) . "\n";

$token2 = $res2['response']['data']['session_token'] ?? null;
$player2Id = $res2['response']['data']['player_id'] ?? null;

// 4. Test Student 3 Join with SAME name 'Jnanesh' but different session
$avatar3 = [
    'style' => 'boy',
    'hair_style' => 'curly',
    'hair_color' => '#00b894',
    'skin_tone' => '#d63031',
    'outfit_type' => 'jacket',
    'outfit_color' => '#0984e3',
    'face_expression' => 'laugh'
];

echo "\n--- Joining Student 3: Another 'Jnanesh' (Different session) ---\n";
$res3 = simulateJoin($pin, 'Jnanesh', $avatar3);
echo "Response Code: {$res3['status']}\n";
echo "Response Body: " . json_encode($res3['response'], JSON_PRETTY_PRINT) . "\n";

$token3 = $res3['response']['data']['session_token'] ?? null;
$player3Id = $res3['response']['data']['player_id'] ?? null;

// 5. Verify Uniqueness of IDs
echo "\n--- Verifying Participant Uniqueness ---\n";
echo "Student 1 ID: {$player1Id}, Token: " . substr($token1 ?? '', 0, 10) . "...\n";
echo "Student 2 ID: {$player2Id}, Token: " . substr($token2 ?? '', 0, 10) . "...\n";
echo "Student 3 ID: {$player3Id}, Token: " . substr($token3 ?? '', 0, 10) . "...\n";

if ($player1Id && $player2Id && $player3Id && $player1Id !== $player2Id && $player1Id !== $player3Id && $player2Id !== $player3Id) {
    echo "✅ SUCCESS: All 3 participants have distinct, unique player IDs!\n";
} else {
    echo "❌ ERROR: Participant collision or missing ID detected!\n";
}

// 6. Test Lobby Query as Student 1
echo "\n--- Testing api/live/get_lobby.php as Student 1 ---\n";
$ch = curl_init("http://localhost/q1/api/live/get_lobby.php?quiz_id={$quizId}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Cookie: student_token={$token1}"]);
$lobbyRes = curl_exec($ch);
curl_close($ch);
$lobbyData = json_decode($lobbyRes, true);
echo "Lobby Response: " . json_encode($lobbyData, JSON_PRETTY_PRINT) . "\n";

if (!empty($lobbyData['data']['participants'])) {
    echo "✅ SUCCESS: Lobby returned " . count($lobbyData['data']['participants']) . " distinct players.\n";
    foreach ($lobbyData['data']['participants'] as $p) {
        echo " - Player #{$p['id']}: {$p['name']} (style: " . ($p['avatar_data']['style'] ?? 'none') . ")\n";
    }
}
