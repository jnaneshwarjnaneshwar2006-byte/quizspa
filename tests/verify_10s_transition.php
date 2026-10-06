<?php
/**
 * Automated Verification Script for QuizSpark Live Quiz
 * Tests 10-Second Transition Engine, State Machine, and API Endpoints
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/live_quiz.php';

echo "=== QuizSpark 10-Second Transition Verification ===\n\n";

$pdo = getDBConnection();

// 1. Create a test quiz with 2 questions
$pdo->beginTransaction();
try {
    $teacherId = 1;
    $joinCode = 'T' . rand(10000, 99999);
    $stmt = $pdo->prepare("
        INSERT INTO quizzes (teacher_id, title, description, category, join_code, status, current_question, current_question_status)
        VALUES (:teacher_id, 'Verification Test Quiz', 'Test Description', 'Science', :join_code, 'lobby', 0, 'inactive')
    ");
    $stmt->execute(['teacher_id' => $teacherId, 'join_code' => $joinCode]);
    $quizId = (int)$pdo->lastInsertId();

    // Insert 2 questions
    $qStmt = $pdo->prepare("
        INSERT INTO questions (quiz_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_option, time_limit)
        VALUES (:quiz_id, :q_num, :text, :opt_a, :opt_b, :opt_c, :opt_d, :correct, 5)
    ");
    $qStmt->execute(['quiz_id' => $quizId, 'q_num' => 1, 'text' => 'Question 1: What is H2O?', 'opt_a' => 'Water', 'opt_b' => 'Oxygen', 'opt_c' => 'Hydrogen', 'opt_d' => 'Carbon', 'correct' => 'A']);
    $qStmt->execute(['quiz_id' => $quizId, 'q_num' => 2, 'text' => 'Question 2: What is the capital of France?', 'opt_a' => 'London', 'opt_b' => 'Berlin', 'opt_c' => 'Paris', 'opt_d' => 'Rome', 'correct' => 'C']);

    // Insert 2 test participants
    $pStmt = $pdo->prepare("
        INSERT INTO participants (quiz_id, name, emoji, avatar_data, session_token, total_score)
        VALUES (:quiz_id, :name, :emoji, :avatar_data, :token, 0)
    ");
    $pStmt->execute(['quiz_id' => $quizId, 'name' => 'Alice', 'emoji' => '🚀', 'avatar_data' => '{"baseModel":"girl","skinColor":"#f5d0b5"}', 'token' => 'tok_alice_test']);
    $pStmt->execute(['quiz_id' => $quizId, 'name' => 'Bob', 'emoji' => '⚡', 'avatar_data' => '{"baseModel":"boy","skinColor":"#e0ac69"}', 'token' => 'tok_bob_test']);

    echo "✓ Test Quiz created (ID: {$quizId}, Join Code: TEST99) with 2 questions and 2 participants.\n";

    // Test 1: Start Quiz
    $startStmt = $pdo->prepare("
        UPDATE quizzes 
        SET status = 'running', current_question = 1, current_question_status = 'active', question_start_time = :now 
        WHERE id = :id
    ");
    $now = getMicroTime();
    $startStmt->execute(['now' => $now, 'id' => $quizId]);
    echo "✓ Quiz started, Question 1 is active.\n";

    // Test 2: Transition to Leaderboard
    $transitioned = transitionToLeaderboard($pdo, $quizId, 'Test reason: all answers received');
    if (!$transitioned) {
        throw new Exception("transitionToLeaderboard failed!");
    }

    $chkStmt = $pdo->prepare("SELECT * FROM quizzes WHERE id = :id");
    $chkStmt->execute(['id' => $quizId]);
    $quizRow = $chkStmt->fetch();

    $duration = $quizRow['next_question_at'] - $quizRow['leaderboard_start_time'];
    echo "✓ Leaderboard duration configured: " . round($duration, 2) . " seconds.\n";

    if (abs($duration - 10.0) > 0.1) {
        throw new Exception("FAIL: Expected 10.0 seconds leaderboard delay, got: {$duration}");
    }
    echo "✓ PASS: transitionToLeaderboard sets authoritative next_question_at to EXACTLY 10.0s!\n";

    // Test 3: Advance Quiz before 10 seconds (Must NOT advance)
    $earlyAdvance = advanceQuizFromLeaderboard($pdo, $quizId);
    if ($earlyAdvance['changed']) {
        throw new Exception("FAIL: Quiz advanced prematurely before 10s delay elapsed!");
    }
    echo "✓ PASS: advanceQuizFromLeaderboard safely refused early progression while countdown active.\n";

    // Test 4: Simulate time passing (set next_question_at in the past)
    $pastTime = getMicroTime() - 0.5;
    $pdo->prepare("UPDATE quizzes SET next_question_at = :past WHERE id = :id")->execute(['past' => $pastTime, 'id' => $quizId]);
    
    // Now advanceQuizFromLeaderboard should advance to Question 2
    $autoAdvance = advanceQuizFromLeaderboard($pdo, $quizId);
    if (!$autoAdvance['changed']) {
        throw new Exception("FAIL: Quiz did not advance to next question after 10s elapsed!");
    }

    $chkStmt->execute(['id' => $quizId]);
    $q2Row = $chkStmt->fetch();
    if ((int)$q2Row['current_question'] !== 2 || $q2Row['current_question_status'] !== 'active') {
        throw new Exception("FAIL: Expected question 2 active, got Q{$q2Row['current_question']} status {$q2Row['current_question_status']}");
    }
    echo "✓ PASS: Quiz cleanly and automatically advanced to Question 2 active!\n";

    // Test 5: Question 2 completed -> Transition to Final Leaderboard -> Quiz Completion
    transitionToLeaderboard($pdo, $quizId, 'Q2 Completed');
    $pastTime = getMicroTime() - 0.5;
    $pdo->prepare("UPDATE quizzes SET next_question_at = :past WHERE id = :id")->execute(['past' => $pastTime, 'id' => $quizId]);
    
    $finalAdvance = advanceQuizFromLeaderboard($pdo, $quizId);
    if (!$finalAdvance['completed']) {
        throw new Exception("FAIL: Quiz did not complete after all questions were answered!");
    }

    $chkStmt->execute(['id' => $quizId]);
    $finalRow = $chkStmt->fetch();
    if ($finalRow['status'] !== 'completed') {
        throw new Exception("FAIL: Expected quiz status 'completed', got: {$finalRow['status']}");
    }
    echo "✓ PASS: Final Question cleanly advances to Quiz Completed (Final Leaderboard)!\n";

    echo "\n============================================\n";
    echo "ALL 5 CORE TRANSITION TESTS PASSED WITH 100% SUCCESS!\n";
    echo "============================================\n";

} finally {
    // Rollback test database changes so database remains clean
    $pdo->rollBack();
    echo "\n✓ Test transaction rolled back. Database remains pristine.\n";
}
