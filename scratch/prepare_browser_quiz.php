<?php
require_once __DIR__ . '/../config/database.php';

$pdo = getDBConnection();
$pin = '112233';

$pdo->prepare("DELETE FROM `quizzes` WHERE `join_code` = :code")->execute(['code' => $pin]);

// Fetch default teacher
$tStmt = $pdo->query("SELECT id FROM `teachers` LIMIT 1");
$teacher = $tStmt->fetch();
$teacherId = $teacher ? (int)$teacher['id'] : 1;

$pdo->prepare("
    INSERT INTO `quizzes` (`teacher_id`, `title`, `description`, `category`, `join_code`, `status`, `current_question`, `current_question_status`, `created_at`)
    VALUES (:tid, 'Browser Live Test Quiz', 'Java OOP', 'Computer Science', :code, 'lobby', 0, 'inactive', NOW())
")->execute(['tid' => $teacherId, 'code' => $pin]);

$quizId = (int)$pdo->lastInsertId();

$pdo->prepare("
    INSERT INTO `questions` (`quiz_id`, `question_number`, `question_type`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `time_limit`)
    VALUES (:qid, 1, 'multiple_choice', 'What is the primary concept of Object-Oriented Programming that binds code and data together?', 'Encapsulation', 'Polymorphism', 'Inheritance', 'Abstraction', 'A', 10)
")->execute(['qid' => $quizId]);

echo "Created Browser Quiz ID {$quizId} with PIN {$pin}\n";
