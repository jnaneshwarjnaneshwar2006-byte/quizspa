<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';

$pdo = getDBConnection();

// Create or ensure a quiz with PIN 428857 exists
$teacherId = $pdo->query("SELECT id FROM teachers LIMIT 1")->fetchColumn();
if (!$teacherId) {
    $pdo->query("INSERT INTO teachers (name, email, password_hash) VALUES ('Jnaneshwar', 'teacher@example.com', 'hash')");
    $teacherId = (int)$pdo->lastInsertId();
}

$pdo->prepare("DELETE FROM quizzes WHERE join_code = '428857'")->execute();
$stmt = $pdo->prepare("
    INSERT INTO quizzes (teacher_id, title, join_code, status, current_question, current_question_status, created_at, published_at)
    VALUES (?, 'Live Battle 428857', '428857', 'lobby', 0, 'inactive', NOW(), NOW())
");
$stmt->execute([$teacherId]);
$quizId = (int)$pdo->lastInsertId();

echo "Created Quiz ID: $quizId with PIN: 428857 (Teacher ID: $teacherId)\n\n";

// Now test HTTP POST to http://localhost/q1/api/student/join.php
$postData = json_encode([
    'join_code' => '428857',
    'name' => 'Jnanesh',
    'avatar_data' => [
        'style' => 'boy',
        'hair' => 'hair_boy_fade',
        'top' => 'top_tshirt',
        'bottom' => 'bottom_jeans'
    ]
]);

$opts = [
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\nContent-Length: " . strlen($postData) . "\r\n",
        'content' => $postData,
        'ignore_errors' => true
    ]
];

$ctx = stream_context_create($opts);
$res = file_get_contents('http://localhost/q1/api/student/join.php', false, $ctx);

echo "HTTP Response from http://localhost/q1/api/student/join.php:\n";
echo $res . "\n\n";
echo "HTTP Response Headers:\n";
print_r($http_response_header);
