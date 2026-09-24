<?php
require_once __DIR__ . '/../config/database.php';
$pdo = getDBConnection();
$stmt = $pdo->query('SELECT id, teacher_id, title, status, join_code FROM quizzes ORDER BY id DESC LIMIT 10');
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT);
