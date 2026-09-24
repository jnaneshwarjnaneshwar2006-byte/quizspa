<?php
require_once __DIR__ . '/../config/database.php';
$pdo = getDBConnection();
$pdo->query("UPDATE `quizzes` SET `status` = 'lobby', `current_question` = 0, `current_question_status` = 'inactive', `started_at` = NULL, `ended_at` = NULL, `question_start_time` = NULL, `leaderboard_start_time` = NULL, `next_question_at` = NULL WHERE `id` = 7");
$pdo->query("DELETE FROM `answers` WHERE `quiz_id` = 7");
$pdo->query("DELETE FROM `participants` WHERE `quiz_id` = 7");

echo "Quiz 7 is ready in lobby state with PIN 428857\n";
