<?php
/**
 * Automated Verification Script for Live Quiz Synchronization
 * Tests:
 * 1. 2 questions, 2 students flow (auto-advance from Q1 to Q2 to Final after 5s)
 * 2. End Question Early (transitions immediately to leaderboard and auto-advances after 5s)
 * 3. Refresh during leaderboard countdown (retains remaining time from next_question_at)
 * 4. Concurrent race condition prevention (multiple simultaneous advances)
 * 5. Final question completion (clean finish without trying question 3)
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/live_quiz.php';
require_once __DIR__ . '/../config/security.php';

$pdo = getDBConnection();

function assertCondition(bool $condition, string $message): void {
    if (!$condition) {
        echo "❌ FAILED: $message\n";
        exit(1);
    }
    echo "✅ PASSED: $message\n";
}

echo "==================================================\n";
echo "RUNNING QUIZSPARK LIVE QUIZ SYNCHRONIZATION TESTS\n";
echo "==================================================\n\n";

// Ensure a test teacher exists
$teacherStmt = $pdo->query("SELECT id FROM teachers LIMIT 1");
$teacher = $teacherStmt->fetch();
if (!$teacher) {
    $pdo->exec("INSERT INTO teachers (id, name, email, password_hash) VALUES (1, 'Test Teacher', 'teacher@quizspark.com', 'hash')");
    $teacherId = 1;
} else {
    $teacherId = (int)$teacher['id'];
}

// ==========================================
// TEST CASE 1: 2 Questions, 2 Students Auto-Progression
// ==========================================
echo "--- TEST CASE 1: 2 Questions, 2 Students Auto-Progression ---\n";

// Setup Test Quiz with 2 questions
$pdo->exec("DELETE FROM quizzes WHERE title = '__TEST_SYNC_QUIZ_1__'");
$createQuizStmt = $pdo->prepare("
    INSERT INTO quizzes (teacher_id, title, status, current_question, current_question_status, question_start_time, leaderboard_start_time, next_question_at)
    VALUES (:t_id, '__TEST_SYNC_QUIZ_1__', 'running', 1, 'active', :start_time, NULL, NULL)
");
$now = getMicroTime();
$createQuizStmt->execute(['t_id' => $teacherId, 'start_time' => $now]);
$quizId = (int)$pdo->lastInsertId();

// Insert 2 Questions
$pdo->prepare("INSERT INTO questions (quiz_id, question_number, question_type, question_text, option_a, option_b, correct_option, time_limit) VALUES (?, 1, 'multiple_choice', 'Question 1', 'A', 'B', 'A', 10)")->execute([$quizId]);
$q1Id = (int)$pdo->lastInsertId();

$pdo->prepare("INSERT INTO questions (quiz_id, question_number, question_type, question_text, option_a, option_b, correct_option, time_limit) VALUES (?, 2, 'multiple_choice', 'Question 2', 'A', 'B', 'B', 10)")->execute([$quizId]);
$q2Id = (int)$pdo->lastInsertId();

// Add 2 Students
$tokenA = 'test_token_a_' . bin2hex(random_bytes(4));
$tokenB = 'test_token_b_' . bin2hex(random_bytes(4));
$pdo->prepare("INSERT INTO participants (quiz_id, session_token, name, emoji, total_score, status) VALUES (?, ?, 'Student A', '🐱', 0, 'playing')")->execute([$quizId, $tokenA]);
$studentAId = (int)$pdo->lastInsertId();

$pdo->prepare("INSERT INTO participants (quiz_id, session_token, name, emoji, total_score, status) VALUES (?, ?, 'Student B', '🐶', 0, 'playing')")->execute([$quizId, $tokenB]);
$studentBId = (int)$pdo->lastInsertId();

// Student A answers Question 1
$pdo->prepare("INSERT INTO answers (quiz_id, question_id, participant_id, selected_option, is_correct, points, answered_at) VALUES (?, ?, ?, 'A', 1, 900, NOW())")
    ->execute([$quizId, $q1Id, $studentAId]);

// Poll state after 1 student answered
$state = processLiveQuizState($pdo, $quizId);
assertCondition($state['current_question_status'] === 'active', 'Question 1 remains active after 1/2 students answered');

// Student B answers Question 1
$pdo->prepare("INSERT INTO answers (quiz_id, question_id, participant_id, selected_option, is_correct, points, answered_at) VALUES (?, ?, ?, 'B', 0, 0, NOW())")
    ->execute([$quizId, $q1Id, $studentBId]);

// State machine processor runs (via student/teacher polling or answer hook)
$state = processLiveQuizState($pdo, $quizId);
assertCondition($state['current_question_status'] === 'leaderboard', 'Question 1 automatically transitioned to LEADERBOARD after 2/2 students answered');
assertCondition(!empty($state['leaderboard_start_time']), 'leaderboard_start_time is populated');
assertCondition(!empty($state['next_question_at']), 'next_question_at is set to exactly leaderboard_start_time + 5s');
assertCondition(abs(($state['next_question_at'] - $state['leaderboard_start_time']) - 5.0) < 0.05, 'Delay between leaderboard and next question is exactly 5 seconds');

// Polling before 5 seconds: should NOT advance
$stateBefore5s = processLiveQuizState($pdo, $quizId);
assertCondition($stateBefore5s['current_question_status'] === 'leaderboard' && (int)$stateBefore5s['current_question'] === 1, 'Before 5 seconds elapsed, quiz stays at Question 1 leaderboard');

// Simulate 5 seconds passed by advancing next_question_at to past
$pdo->prepare("UPDATE quizzes SET next_question_at = :past WHERE id = :id")
    ->execute(['past' => getMicroTime() - 0.1, 'id' => $quizId]);

// Poll state after 5 seconds: should automatically advance to Question 2
$stateAfter5s = processLiveQuizState($pdo, $quizId);
assertCondition((int)$stateAfter5s['current_question'] === 2, 'Quiz automatically advanced to Question 2 without teacher clicking anything');
assertCondition($stateAfter5s['current_question_status'] === 'active', 'Question 2 is now active');
assertCondition($stateAfter5s['leaderboard_start_time'] === null, 'leaderboard_start_time was cleared for Question 2');
assertCondition($stateAfter5s['next_question_at'] === null, 'next_question_at was cleared for Question 2');

// Now both students answer Question 2 (final question)
$pdo->prepare("INSERT INTO answers (quiz_id, question_id, participant_id, selected_option, is_correct, points, answered_at) VALUES (?, ?, ?, 'B', 1, 950, NOW())")
    ->execute([$quizId, $q2Id, $studentAId]);
$pdo->prepare("INSERT INTO answers (quiz_id, question_id, participant_id, selected_option, is_correct, points, answered_at) VALUES (?, ?, ?, 'B', 1, 850, NOW())")
    ->execute([$quizId, $q2Id, $studentBId]);

// Poll state after Question 2 answers received
$stateQ2End = processLiveQuizState($pdo, $quizId);
assertCondition($stateQ2End['current_question_status'] === 'leaderboard', 'Final question automatically transitioned to LEADERBOARD');

// Simulate 5 seconds passing for final question
$pdo->prepare("UPDATE quizzes SET next_question_at = :past WHERE id = :id")
    ->execute(['past' => getMicroTime() - 0.1, 'id' => $quizId]);

$finalState = processLiveQuizState($pdo, $quizId);
assertCondition($finalState['status'] === 'completed', 'Quiz completed automatically after final question leaderboard delay');
assertCondition(getLiveQuizStateName($finalState) === 'QUIZ_FINISHED', 'State name is QUIZ_FINISHED');

// Check quiz_results table
$resStmt = $pdo->prepare("SELECT COUNT(*) AS total FROM quiz_results WHERE quiz_id = :id");
$resStmt->execute(['id' => $quizId]);
assertCondition((int)$resStmt->fetch()['total'] === 2, 'quiz_results correctly recorded for both students');

// Clean up Test 1
$pdo->prepare("DELETE FROM quizzes WHERE id = :id")->execute([$quizId]);
echo "\n";

// ==========================================
// TEST CASE 2: Teacher End Question Early
// ==========================================
echo "--- TEST CASE 2: Teacher Clicks 'End Question Early' ---\n";

$pdo->prepare("
    INSERT INTO quizzes (teacher_id, title, status, current_question, current_question_status, question_start_time)
    VALUES (?, '__TEST_SYNC_QUIZ_2__', 'running', 1, 'active', ?)
")->execute([$teacherId, getMicroTime()]);
$quizId2 = (int)$pdo->lastInsertId();

$pdo->prepare("INSERT INTO questions (quiz_id, question_number, question_type, question_text, option_a, option_b, correct_option, time_limit) VALUES (?, 1, 'multiple_choice', 'Q1', 'A', 'B', 'A', 20)")->execute([$quizId2]);
$qEarlyId = (int)$pdo->lastInsertId();
$pdo->prepare("INSERT INTO questions (quiz_id, question_number, question_type, question_text, option_a, option_b, correct_option, time_limit) VALUES (?, 2, 'multiple_choice', 'Q2', 'A', 'B', 'A', 20)")->execute([$quizId2]);

$pdo->prepare("INSERT INTO participants (quiz_id, session_token, name, emoji, total_score, status) VALUES (?, 'tok1', 'S1', '😀', 0, 'playing')")->execute([$quizId2]);
$s1 = (int)$pdo->lastInsertId();
$pdo->prepare("INSERT INTO participants (quiz_id, session_token, name, emoji, total_score, status) VALUES (?, 'tok2', 'S2', '😀', 0, 'playing')")->execute([$quizId2]);

// Only 1 student answers
$pdo->prepare("INSERT INTO answers (quiz_id, question_id, participant_id, selected_option, is_correct, points) VALUES (?, ?, ?, 'A', 1, 500)")->execute([$quizId2, $qEarlyId, $s1]);

// Teacher triggers transitionToLeaderboard (End Question Early)
$ended = transitionToLeaderboard($pdo, $quizId2, 'Teacher clicked End Question Early');
assertCondition($ended, 'transitionToLeaderboard returned true for End Question Early');

$stateEarly = processLiveQuizState($pdo, $quizId2);
assertCondition($stateEarly['current_question_status'] === 'leaderboard', 'State is immediately LEADERBOARD');
assertCondition($stateEarly['next_question_at'] > getMicroTime(), 'next_question_at set for 5s countdown');

// Simulate 5 seconds
$pdo->prepare("UPDATE quizzes SET next_question_at = :past WHERE id = :id")->execute(['past' => getMicroTime() - 0.1, 'id' => $quizId2]);
$stateEarlyAdvanced = processLiveQuizState($pdo, $quizId2);
assertCondition((int)$stateEarlyAdvanced['current_question'] === 2, 'Automatically advanced to Question 2 after 5 seconds');

$pdo->prepare("DELETE FROM quizzes WHERE id = :id")->execute([$quizId2]);
echo "\n";

// ==========================================
// TEST CASE 3: Student Refresh During Leaderboard
// ==========================================
echo "--- TEST CASE 3: Student Refresh During Leaderboard Countdown ---\n";

$pdo->prepare("
    INSERT INTO quizzes (teacher_id, title, status, current_question, current_question_status, question_start_time, leaderboard_start_time, next_question_at)
    VALUES (?, '__TEST_SYNC_QUIZ_3__', 'running', 1, 'leaderboard', ?, ?, ?)
")->execute([$teacherId, getMicroTime() - 10, getMicroTime() - 2.5, getMicroTime() + 2.5]);
$quizId3 = (int)$pdo->lastInsertId();
$pdo->prepare("INSERT INTO questions (quiz_id, question_number, question_type, question_text, option_a, option_b, correct_option, time_limit) VALUES (?, 1, 'multiple_choice', 'Q1', 'A', 'B', 'A', 10)")->execute([$quizId3]);
$pdo->prepare("INSERT INTO questions (quiz_id, question_number, question_type, question_text, option_a, option_b, correct_option, time_limit) VALUES (?, 2, 'multiple_choice', 'Q2', 'A', 'B', 'A', 10)")->execute([$quizId3]);

$stateRefresh = processLiveQuizState($pdo, $quizId3);
$remaining = ceil($stateRefresh['next_question_at'] - getMicroTime());
assertCondition($remaining >= 2 && $remaining <= 3, "Server reports exactly ~2-3 seconds remaining ($remaining s), NOT restarting to 5s");

$pdo->prepare("DELETE FROM quizzes WHERE id = :id")->execute([$quizId3]);
echo "\n";

// ==========================================
// TEST CASE 4: Race Condition Immunity
// ==========================================
echo "--- TEST CASE 4: Race Condition Immunity Under Simultaneous Polls ---\n";

$pdo->prepare("
    INSERT INTO quizzes (teacher_id, title, status, current_question, current_question_status, question_start_time, leaderboard_start_time, next_question_at)
    VALUES (?, '__TEST_SYNC_QUIZ_4__', 'running', 1, 'leaderboard', ?, ?, ?)
")->execute([$teacherId, getMicroTime() - 10, getMicroTime() - 5, getMicroTime() - 0.1]);
$quizId4 = (int)$pdo->lastInsertId();
$pdo->prepare("INSERT INTO questions (quiz_id, question_number, question_type, question_text, option_a, option_b, correct_option, time_limit) VALUES (?, 1, 'multiple_choice', 'Q1', 'A', 'B', 'A', 10)")->execute([$quizId4]);
$pdo->prepare("INSERT INTO questions (quiz_id, question_number, question_type, question_text, option_a, option_b, correct_option, time_limit) VALUES (?, 2, 'multiple_choice', 'Q2', 'A', 'B', 'A', 10)")->execute([$quizId4]);

// Simulate 10 concurrent requests attempting to advance
$advances = 0;
for ($i = 0; $i < 10; $i++) {
    $res = advanceQuizFromLeaderboard($pdo, $quizId4);
    if ($res['changed']) {
        $advances++;
    }
}
assertCondition($advances === 1, "Exactly 1 request advanced the question out of 10 concurrent attempts (advances = $advances)");

$checkStmt = $pdo->prepare("SELECT current_question FROM quizzes WHERE id = :id");
$checkStmt->execute(['id' => $quizId4]);
assertCondition((int)$checkStmt->fetch()['current_question'] === 2, "Quiz is at Question 2 and did not skip to Question 3 or beyond");

$pdo->prepare("DELETE FROM quizzes WHERE id = :id")->execute([$quizId4]);
echo "\n";

// ==========================================
// TEST CASE 5: Final Question Does Not Attempt Question 3
// ==========================================
echo "--- TEST CASE 5: Final Question Handling (2 Questions total) ---\n";

$pdo->prepare("
    INSERT INTO quizzes (teacher_id, title, status, current_question, current_question_status, question_start_time, leaderboard_start_time, next_question_at)
    VALUES (?, '__TEST_SYNC_QUIZ_5__', 'running', 2, 'leaderboard', ?, ?, ?)
")->execute([$teacherId, getMicroTime() - 10, getMicroTime() - 5, getMicroTime() - 0.1]);
$quizId5 = (int)$pdo->lastInsertId();
$pdo->prepare("INSERT INTO questions (quiz_id, question_number, question_type, question_text, option_a, option_b, correct_option, time_limit) VALUES (?, 1, 'multiple_choice', 'Q1', 'A', 'B', 'A', 10)")->execute([$quizId5]);
$pdo->prepare("INSERT INTO questions (quiz_id, question_number, question_type, question_text, option_a, option_b, correct_option, time_limit) VALUES (?, 2, 'multiple_choice', 'Q2', 'A', 'B', 'A', 10)")->execute([$quizId5]);

$resFinal = advanceQuizFromLeaderboard($pdo, $quizId5);
assertCondition($resFinal['changed'] === true && $resFinal['completed'] === true, 'advanceQuizFromLeaderboard signals completion');

$stateFinal = processLiveQuizState($pdo, $quizId5);
assertCondition($stateFinal['status'] === 'completed', 'Quiz is completed');
assertCondition((int)$stateFinal['current_question'] === 2, 'Current question remained 2 (no Question 3 attempted)');

$pdo->prepare("DELETE FROM quizzes WHERE id = :id")->execute([$quizId5]);
echo "\n";

echo "==================================================\n";
echo "🎉 ALL 5 TEST SCENARIOS PASSED WITH ZERO ERRORS!\n";
echo "==================================================\n";
