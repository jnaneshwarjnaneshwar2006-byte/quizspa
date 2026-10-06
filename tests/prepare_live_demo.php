<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';

$pdo = getDBConnection();

// Set up teacher session
$_SESSION['teacher_id'] = 1;
$_SESSION['teacher_name'] = 'Jnaneshwar B A';
$_SESSION['teacher_email'] = 'jnanesh2006@gmail.com';

// 1. Create clean demo quiz
$pdo->prepare("DELETE FROM quizzes WHERE join_code = '888999'")->execute();

$stmt = $pdo->prepare("
    INSERT INTO quizzes (teacher_id, title, description, category, join_code, status, current_question, current_question_status)
    VALUES (1, 'JavaScript & Web Architecture Live Quiz', 'Demonstration of QuizSpark Live Lobby & 10s Transitions', 'Computer Science', '888999', 'lobby', 0, 'inactive')
");
$stmt->execute();
$quizId = (int)$pdo->lastInsertId();

// 2. Insert 3 exciting questions
$qStmt = $pdo->prepare("
    INSERT INTO questions (quiz_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_option, time_limit)
    VALUES (:quiz_id, :q_num, :text, :opt_a, :opt_b, :opt_c, :opt_d, :correct, :time_limit)
");
$qStmt->execute(['quiz_id' => $quizId, 'q_num' => 1, 'text' => 'Which keyword defines a block-scoped variable in modern JavaScript?', 'opt_a' => 'var', 'opt_b' => 'let', 'opt_c' => 'global', 'opt_d' => 'define', 'correct' => 'B', 'time_limit' => 10]);
$qStmt->execute(['quiz_id' => $quizId, 'q_num' => 2, 'text' => 'Is HTTP stateless by default?', 'opt_a' => 'True', 'opt_b' => 'False', 'opt_c' => '', 'opt_d' => '', 'correct' => 'A', 'time_limit' => 8]);
$qStmt->execute(['quiz_id' => $quizId, 'q_num' => 3, 'text' => 'Which CSS property creates a 3D perspective context?', 'opt_a' => 'transform-style', 'opt_b' => 'perspective', 'opt_c' => 'backdrop-filter', 'opt_d' => 'box-shadow', 'correct' => 'B', 'time_limit' => 10]);

// 3. Insert 3 joined participants with unique avatars
$pStmt = $pdo->prepare("
    INSERT INTO participants (quiz_id, name, emoji, avatar_data, session_token, total_score)
    VALUES (:quiz_id, :name, :emoji, :avatar_data, :token, :score)
");
$pStmt->execute(['quiz_id' => $quizId, 'name' => 'Alex Rivera', 'emoji' => '🚀', 'avatar_data' => '{"style":"boy","skin":"skin_03","hair":"hair_boy_short","hairColor":"dark_brown","top":"top_casual","topColor":"blue","bottom":"bottom_jeans","bottomColor":"denim","shoes":"shoes_sneakers","shoeColor":"white","accessory":"acc_headphones","accessoryColor":"blue"}', 'token' => 'tok_alex_888', 'score' => 2400]);
$pStmt->execute(['quiz_id' => $quizId, 'name' => 'Maya Lin', 'emoji' => '⚡', 'avatar_data' => '{"style":"girl","skin":"skin_02","hair":"hair_girl_wavy","hairColor":"dark_brown","top":"top_casual","topColor":"purple","bottom":"bottom_jeans","bottomColor":"black","shoes":"shoes_sneakers","shoeColor":"white","accessory":"acc_earrings","accessoryColor":"gold"}', 'token' => 'tok_maya_888', 'score' => 1950]);
$pStmt->execute(['quiz_id' => $quizId, 'name' => 'Devon Vance', 'emoji' => '🔥', 'avatar_data' => '{"style":"boy","skin":"skin_04","hair":"hair_boy_curly","hairColor":"black","top":"top_hoodie","topColor":"coral","bottom":"bottom_jeans","bottomColor":"black","shoes":"shoes_sneakers","shoeColor":"white","glasses":"glasses_round","glassesColor":"black"}', 'token' => 'tok_devon_888', 'score' => 1600]);

echo json_encode([
    'success' => true,
    'quiz_id' => $quizId,
    'join_code' => '888999',
    'lobby_url' => "http://127.0.0.1:8080/teacher/live_lobby.php?id={$quizId}",
    'quiz_url' => "http://127.0.0.1:8080/teacher/live_quiz.php?id={$quizId}"
]);
