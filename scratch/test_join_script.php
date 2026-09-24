<?php
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['HTTP_HOST'] = 'localhost';
$_SERVER['SCRIPT_NAME'] = '/q1/api/student/join.php';
$_SERVER['REQUEST_URI'] = '/q1/api/student/join.php';

$jsonInput = json_encode([
    'join_code' => '112501',
    'name' => 'Jnanesh'
]);

// Use php://memory or stream wrapper mockup if needed, or set global input
file_put_contents(__DIR__ . '/test_input.json', $jsonInput);

// Test executing join logic directly
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/avatar.php';

$pdo = getDBConnection();
$stmt = $pdo->prepare("SELECT * FROM `quizzes` WHERE `join_code` = '112501' LIMIT 1");
$stmt->execute();
$quiz = $stmt->fetch(PDO::FETCH_ASSOC);

echo "Quiz Found: " . json_encode($quiz) . "\n";
