<?php
require_once __DIR__ . '/../config/database.php';

$pdo = getDBConnection();
$t = $pdo->query("SELECT id FROM teachers LIMIT 1")->fetchColumn();
$stmt = $pdo->prepare("INSERT INTO quizzes (teacher_id, title, status, current_question, current_question_status) VALUES (?, '__HTTP_TEST__', 'running', 1, 'active')");
$stmt->execute([$t]);
$quizId = (int)$pdo->lastInsertId();

$url = "http://127.0.0.1:8080/api/live/get_state.php?quiz_id=" . $quizId;
$json = file_get_contents($url);
echo "HTTP RESPONSE FROM get_state.php:\n";
echo $json . "\n";

$data = json_decode($json, true);
if ($data && $data['success'] && isset($data['data']['quiz']['state'])) {
    echo "SUCCESS: API returned state = " . $data['data']['quiz']['state'] . "\n";
} else {
    echo "FAILED: Invalid API response\n";
    exit(1);
}

// Clean up
$pdo->prepare("DELETE FROM quizzes WHERE id = ?")->execute([$quizId]);
