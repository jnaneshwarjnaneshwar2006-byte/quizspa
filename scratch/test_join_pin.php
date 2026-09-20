<?php
require_once __DIR__ . '/../config/database.php';

$pdo = getDBConnection();
// Ensure teacher exists
$t = $pdo->query("SELECT id FROM teachers LIMIT 1")->fetchColumn();
if (!$t) {
    $pdo->query("INSERT INTO teachers (name, email, password_hash) VALUES ('Teacher', 'teacher@example.com', 'hash')");
    $t = (int)$pdo->lastInsertId();
}

// Create a quiz with PIN 240877 and status 'lobby'
$pdo->prepare("DELETE FROM quizzes WHERE join_code = '240877'")->execute();
$stmt = $pdo->prepare("INSERT INTO quizzes (teacher_id, title, join_code, status, created_at, published_at) VALUES (?, 'Test Quiz 240877', '240877', 'lobby', NOW(), NOW())");
$stmt->execute([$t]);
$quizId = (int)$pdo->lastInsertId();

echo "Created Quiz $quizId with PIN 240877 in status 'lobby'\n\n";

function testJoin($payload) {
    $opts = [
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => json_encode($payload),
            'ignore_errors' => true
        ]
    ];
    $ctx = stream_context_create($opts);
    $response = file_get_contents('http://127.0.0.1:8000/api/student/join.php', false, $ctx);
    echo "Payload: " . json_encode($payload) . "\n";
    echo "Response: " . $response . "\n\n";
    return json_decode($response, true);
}

echo "--- ATTEMPT 1: Join Jnaneshwar with Boy Avatar ---\n";
$res1 = testJoin([
    'join_code' => '240877',
    'name' => 'Jnaneshwar',
    'avatar_data' => [
        'style' => 'boy',
        'hair' => 'hair_boy_fade',
        'top' => 'top_tshirt',
        'bottom' => 'bottom_jeans'
    ]
]);

echo "--- ATTEMPT 2: Join again (Idempotent check / same name & token) ---\n";
$res2 = testJoin([
    'join_code' => '240877',
    'name' => 'Jnaneshwar',
    'avatar_data' => [
        'style' => 'boy',
        'hair' => 'hair_boy_fade',
        'top' => 'top_tshirt',
        'bottom' => 'bottom_jeans'
    ]
]);

// Check participants in DB
$parts = $pdo->query("SELECT id, quiz_id, session_token, name, emoji, avatar_data, status FROM participants WHERE quiz_id = $quizId")->fetchAll();
echo "Participants in DB:\n";
print_r($parts);
