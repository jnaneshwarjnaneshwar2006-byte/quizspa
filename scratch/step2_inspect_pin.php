<?php
require_once __DIR__ . '/../config/database.php';

$pdo = getDBConnection();

echo "===============================================\n";
echo "STEP 2: DIRECT PIN AND QUIZ INSPECTION\n";
echo "===============================================\n\n";

$quizzes = $pdo->query("SELECT * FROM quizzes ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);

foreach ($quizzes as $q) {
    echo "PIN: " . ($q['join_code'] ?: 'NONE') . "\n";
    echo "LIVE SESSION / QUIZ ID: " . $q['id'] . "\n";
    echo "QUIZ ID: " . $q['id'] . "\n";
    echo "CREATOR / TEACHER ID: " . $q['teacher_id'] . "\n";
    echo "SESSION STATUS: " . $q['status'] . "\n";
    echo "CURRENT QUESTION STATUS: " . $q['current_question_status'] . "\n";
    echo "CREATED TIME: " . $q['created_at'] . "\n";
    echo "START TIME: " . ($q['started_at'] ?: 'Not started') . "\n";
    echo "JOIN ALLOWED: " . (in_array($q['status'], ['lobby', 'published', 'active', 'open']) ? 'YES' : 'NO') . "\n";

    $pCount = $pdo->query("SELECT COUNT(*) FROM participants WHERE quiz_id = " . (int)$q['id'])->fetchColumn();
    echo "PLAYER COUNT: " . $pCount . "\n";
    echo "-----------------------------------------------\n";
}
