<?php
require 'config/database.php';
$pdo = getDBConnection();
$stmt = $pdo->query("SHOW COLUMNS FROM quizzes LIKE 'current_question_status'");
print_r($stmt->fetch(PDO::FETCH_ASSOC));
