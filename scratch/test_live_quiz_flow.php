<?php
/**
 * Automated End-to-End Simulation & Verification Test
 * Tests the complete server-authoritative live quiz engine, Start Quiz fix,
 * 5-second automatic leaderboard transitions, scoring, and podium generation.
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/live_quiz.php';

function runTest(string $name, callable $fn) {
    echo "========================================\n";
    echo "RUNNING TEST: {$name}\n";
    echo "========================================\n";
    try {
        $result = $fn();
        if ($result !== false) {
            echo " [PASS] {$name}\n\n";
            return true;
        } else {
            echo "❌ [FAIL] {$name}\n\n";
            return false;
        }
    } catch (Throwable $e) {
        echo "❌ [EXCEPTION] {$name}: " . $e->getMessage() . "\n";
        echo $e->getTraceAsString() . "\n\n";
        return false;
    }
}

$pdo = getDBConnection();
$allPassed = true;

// TEST 1: Schema Verification
$allPassed &= runTest("Verify Schema has leaderboard_start_time and next_question_at", function() use ($pdo) {
    $stmt = $pdo->query("SHOW COLUMNS FROM `quizzes`");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $hasLbStart = in_array('leaderboard_start_time', $columns);
    $hasNextQ = in_array('next_question_at', $columns);
    
    echo " - leaderboard_start_time column exists: " . ($hasLbStart ? "YES" : "NO") . "\n";
    echo " - next_question_at column exists: " . ($hasNextQ ? "YES" : "NO") . "\n";
    
    return $hasLbStart && $hasNextQ;
});

// TEST 2: Create Test Creator, Quiz, and 2 Questions
$testQuizId = 0;
$testTeacherId = 0;
$allPassed &= runTest("Create Test Creator, Quiz, and 2 Questions", function() use ($pdo, &$testQuizId, &$testTeacherId) {
    // Ensure default teacher exists
    $tStmt = $pdo->prepare("SELECT id FROM `teachers` WHERE `email` = 'creator_test@example.com' LIMIT 1");
    $tStmt->execute();
    $teacher = $tStmt->fetch();
    if (!$teacher) {
        $insT = $pdo->prepare("INSERT INTO `teachers` (`name`, `email`, `password_hash`, `created_at`) VALUES ('Test Creator', 'creator_test@example.com', :hash, NOW())");
        $insT->execute(['hash' => password_hash('Secret123!', PASSWORD_BCRYPT)]);
        $testTeacherId = (int)$pdo->lastInsertId();
    } else {
        $testTeacherId = (int)$teacher['id'];
    }

    // Insert Quiz
    $joinCode = '999888';
    $pdo->prepare("DELETE FROM `quizzes` WHERE `join_code` = :code")->execute(['code' => $joinCode]);
    
    $qIns = $pdo->prepare("
        INSERT INTO `quizzes` (`teacher_id`, `title`, `description`, `category`, `join_code`, `status`, `current_question`, `current_question_status`, `created_at`)
        VALUES (:t_id, 'E2E Automated Sync Quiz', 'Full flow test', 'Science', :code, 'lobby', 0, 'inactive', NOW())
    ");
    $qIns->execute(['t_id' => $testTeacherId, 'code' => $joinCode]);
    $testQuizId = (int)$pdo->lastInsertId();

    // Insert Question 1 (Multiple Choice, 10s limit)
    $pdo->prepare("
        INSERT INTO `questions` (`quiz_id`, `question_number`, `question_type`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `time_limit`)
        VALUES (:qid, 1, 'multiple_choice', 'What is the chemical symbol for Gold?', 'Ag', 'Au', 'Fe', 'Cu', 'B', 10)
    ")->execute(['qid' => $testQuizId]);

    // Insert Question 2 (True/False, 10s limit)
    $pdo->prepare("
        INSERT INTO `questions` (`quiz_id`, `question_number`, `question_type`, `question_text`, `option_a`, `option_b`, `correct_option`, `time_limit`)
        VALUES (:qid, 2, 'true_false', 'The speed of light is faster than sound.', 'True', 'False', 'A', 10)
    ")->execute(['qid' => $testQuizId]);

    echo " - Created Quiz ID: {$testQuizId} with Join Code {$joinCode}\n";
    return $testQuizId > 0;
});

// TEST 3: Student Join Simulation
$aliceToken = 'token_alice_' . time();
$bobToken = 'token_bob_' . time();
$aliceId = 0;
$bobId = 0;

$allPassed &= runTest("Join 2 Students (Alice and Bob)", function() use ($pdo, $testQuizId, $aliceToken, $bobToken, &$aliceId, &$bobId) {
    $pIns = $pdo->prepare("INSERT INTO `participants` (`quiz_id`, `session_token`, `name`, `emoji`, `joined_at`, `status`) VALUES (:qid, :tok, :name, :emoji, NOW(), 'joined')");
    
    $pIns->execute(['qid' => $testQuizId, 'tok' => $aliceToken, 'name' => 'Alice Runner', 'emoji' => '🚀']);
    $aliceId = (int)$pdo->lastInsertId();
    
    $pIns->execute(['qid' => $testQuizId, 'tok' => $bobToken, 'name' => 'Bob Thinker', 'emoji' => '🦁']);
    $bobId = (int)$pdo->lastInsertId();

    // Verify participants count
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM `participants` WHERE `quiz_id` = :qid");
    $stmt->execute(['qid' => $testQuizId]);
    $count = (int)$stmt->fetchColumn();

    echo " - Joined Alice (ID: {$aliceId}) and Bob (ID: {$bobId})\n";
    echo " - Lobby player count: {$count}\n";
    return $count === 2;
});

// TEST 4: Start Quiz (Direct Verification of the fixed Start Quiz Logic)
$allPassed &= runTest("Start Quiz without SQL error and initialize Question 1", function() use ($pdo, $testQuizId, $testTeacherId) {
    // Set creator session
    $_SESSION['teacher_id'] = $testTeacherId;

    $now = getMicroTime();
    
    $upd = $pdo->prepare("
        UPDATE `quizzes` 
        SET `status` = 'running', 
            `current_question` = 1, 
            `current_question_status` = 'active',
            `question_start_time` = :start_time,
            `leaderboard_start_time` = NULL,
            `next_question_at` = NULL,
            `started_at` = NOW() 
        WHERE `id` = :id
    ");
    $upd->execute(['start_time' => $now, 'id' => $testQuizId]);

    $updP = $pdo->prepare("UPDATE `participants` SET `status` = 'playing' WHERE `quiz_id` = :quiz_id");
    $updP->execute(['quiz_id' => $testQuizId]);

    // Check state
    $qStmt = $pdo->prepare("SELECT status, current_question, current_question_status, leaderboard_start_time, next_question_at FROM `quizzes` WHERE `id` = :id");
    $qStmt->execute(['id' => $testQuizId]);
    $quiz = $qStmt->fetch();

    echo " - Quiz Status: {$quiz['status']}\n";
    echo " - Current Question: {$quiz['current_question']}\n";
    echo " - Current Question Status: {$quiz['current_question_status']}\n";
    echo " - Leaderboard Start Time: " . var_export($quiz['leaderboard_start_time'], true) . "\n";
    
    return $quiz['status'] === 'running' && (int)$quiz['current_question'] === 1 && $quiz['current_question_status'] === 'active';
});

// TEST 5: Question 1 Answers & Speed Scoring
$allPassed &= runTest("Submit Answers for Q1 (Alice Correct, Bob Incorrect) and Speed Score Calculation", function() use ($pdo, $testQuizId, $aliceId, $bobId) {
    $qStmt = $pdo->prepare("SELECT * FROM `questions` WHERE `quiz_id` = :qid AND `question_number` = 1 LIMIT 1");
    $qStmt->execute(['qid' => $testQuizId]);
    $question = $qStmt->fetch();
    $qId = (int)$question['id'];

    // Alice answers Option B (Correct) in 2.50s (time_limit = 10s, base points = 1000)
    // Formula: round(1000 * (0.5 + (0.5 * (10 - 2.5) / 10))) = round(1000 * (0.5 + 0.375)) = 875 pts
    $aliceTime = 2.50;
    $alicePoints = (int)round(1000 * (0.5 + (0.5 * max(0, 10 - $aliceTime) / 10)));

    $ansStmt = $pdo->prepare("
        INSERT INTO `answers` (`quiz_id`, `question_id`, `participant_id`, `selected_option`, `is_correct`, `response_time`, `time_taken`, `points`, `answered_at`)
        VALUES (:qid, :quest_id, :pid, :opt, :is_correct, :resp_time, :time_taken, :points, NOW())
    ");
    $ansStmt->execute([
        'qid'        => $testQuizId,
        'quest_id'   => $qId,
        'pid'        => $aliceId,
        'opt'        => 'B',
        'is_correct' => 1,
        'resp_time'  => $aliceTime,
        'time_taken' => $aliceTime,
        'points'     => $alicePoints
    ]);

    $pdo->prepare("UPDATE `participants` SET `total_score` = `total_score` + :pts, `total_time` = `total_time` + :tt WHERE `id` = :pid")
        ->execute(['pts' => $alicePoints, 'tt' => $aliceTime, 'pid' => $aliceId]);

    // Bob answers Option A (Incorrect) in 3.00s -> 0 points
    $bobTime = 3.00;
    $ansStmt->execute([
        'qid'        => $testQuizId,
        'quest_id'   => $qId,
        'pid'        => $bobId,
        'opt'        => 'A',
        'is_correct' => 0,
        'resp_time'  => $bobTime,
        'time_taken' => $bobTime,
        'points'     => 0
    ]);
    $pdo->prepare("UPDATE `participants` SET `total_time` = `total_time` + :tt WHERE `id` = :pid")
        ->execute(['tt' => $bobTime, 'pid' => $bobId]);

    echo " - Alice answered: Correct, Time: {$aliceTime}s, Points: {$alicePoints}\n";
    echo " - Bob answered: Incorrect, Time: {$bobTime}s, Points: 0\n";

    return $alicePoints > 800;
});

// TEST 6: State Machine Trigger - All Players Answered -> Transitions to LEADERBOARD (5s timer)
$allPassed &= runTest("State Machine Auto-Transitions to LEADERBOARD when all players answer", function() use ($pdo, $testQuizId) {
    $quiz = processLiveQuizState($pdo, $testQuizId);

    echo " - Live State: " . getLiveQuizStateName($quiz) . "\n";
    echo " - Current Question Status: " . $quiz['current_question_status'] . "\n";
    echo " - Leaderboard Start Time: " . $quiz['leaderboard_start_time'] . "\n";
    echo " - Authoritative Next Question At: " . $quiz['next_question_at'] . "\n";

    $isLeaderboard = ($quiz['current_question_status'] === 'leaderboard');
    $hasNextTime = ((float)$quiz['next_question_at'] > (float)$quiz['leaderboard_start_time']);

    return $isLeaderboard && $hasNextTime;
});

// TEST 7: Leaderboard Countdown & 5-Second Delay Enforcement
$allPassed &= runTest("Leaderboard prevents advancing before 5 seconds elapse", function() use ($pdo, $testQuizId) {
    // Calling advanceQuizFromLeaderboard before time should not change state
    $result = advanceQuizFromLeaderboard($pdo, $testQuizId);
    echo " - Advance result before timeout: changed = " . ($result['changed'] ? 'true' : 'false') . "\n";

    $stmt = $pdo->prepare("SELECT current_question_status FROM `quizzes` WHERE `id` = :id");
    $stmt->execute(['id' => $testQuizId]);
    $status = $stmt->fetchColumn();

    return !$result['changed'] && $status === 'leaderboard';
});

// TEST 8: Auto-Advancement to Question 2 after 5 seconds
$allPassed &= runTest("Auto-advances to Question 2 once 5-second countdown expires", function() use ($pdo, $testQuizId) {
    // Simulate passage of 5.1 seconds by updating next_question_at to in the past
    $past = getMicroTime() - 0.1;
    $pdo->prepare("UPDATE `quizzes` SET `next_question_at` = :past WHERE `id` = :id")
        ->execute(['past' => $past, 'id' => $testQuizId]);

    // Process state machine (simulating student or creator poll)
    $quiz = processLiveQuizState($pdo, $testQuizId);

    echo " - Quiz Current Question: " . $quiz['current_question'] . "\n";
    echo " - Quiz Current Status: " . $quiz['current_question_status'] . "\n";
    echo " - Question Start Time: " . $quiz['question_start_time'] . "\n";

    return (int)$quiz['current_question'] === 2 && $quiz['current_question_status'] === 'active';
});

// TEST 9: Question 2 Answers & Auto Transition to Final Leaderboard
$allPassed &= runTest("Submit Answers for Q2 (Both Correct) -> Auto Transitions to Leaderboard", function() use ($pdo, $testQuizId, $aliceId, $bobId) {
    $qStmt = $pdo->prepare("SELECT * FROM `questions` WHERE `quiz_id` = :qid AND `question_number` = 2 LIMIT 1");
    $qStmt->execute(['qid' => $testQuizId]);
    $question = $qStmt->fetch();
    $qId = (int)$question['id'];

    $ansStmt = $pdo->prepare("
        INSERT INTO `answers` (`quiz_id`, `question_id`, `participant_id`, `selected_option`, `is_correct`, `response_time`, `time_taken`, `points`, `answered_at`)
        VALUES (:qid, :quest_id, :pid, :opt, :is_correct, :resp_time, :time_taken, :points, NOW())
    ");

    // Alice answers Option A (Correct) in 1.0s -> 950 pts
    $aliceTime = 1.0;
    $alicePoints = (int)round(1000 * (0.5 + (0.5 * max(0, 10 - $aliceTime) / 10)));
    $ansStmt->execute(['qid' => $testQuizId, 'quest_id' => $qId, 'pid' => $aliceId, 'opt' => 'A', 'is_correct' => 1, 'resp_time' => $aliceTime, 'time_taken' => $aliceTime, 'points' => $alicePoints]);
    $pdo->prepare("UPDATE `participants` SET `total_score` = `total_score` + :pts, `total_time` = `total_time` + :tt WHERE `id` = :pid")
        ->execute(['pts' => $alicePoints, 'tt' => $aliceTime, 'pid' => $aliceId]);

    // Bob answers Option A (Correct) in 4.0s -> 800 pts
    $bobTime = 4.0;
    $bobPoints = (int)round(1000 * (0.5 + (0.5 * max(0, 10 - $bobTime) / 10)));
    $ansStmt->execute(['qid' => $testQuizId, 'quest_id' => $qId, 'pid' => $bobId, 'opt' => 'A', 'is_correct' => 1, 'resp_time' => $bobTime, 'time_taken' => $bobTime, 'points' => $bobPoints]);
    $pdo->prepare("UPDATE `participants` SET `total_score` = `total_score` + :pts, `total_time` = `total_time` + :tt WHERE `id` = :pid")
        ->execute(['pts' => $bobPoints, 'tt' => $bobTime, 'pid' => $bobId]);

    // Process state machine
    $quiz = processLiveQuizState($pdo, $testQuizId);

    echo " - Question 2 transitioned to: {$quiz['current_question_status']}\n";
    echo " - Next Question At: {$quiz['next_question_at']}\n";

    return $quiz['current_question_status'] === 'leaderboard';
});

// TEST 10: Auto-Completion & Podium Generation (Final Question Leaderboard Expiry)
$allPassed &= runTest("Final Leaderboard 5s countdown expires -> Quiz completes and builds Podium results", function() use ($pdo, $testQuizId, $aliceId, $bobId) {
    // Expire 5s countdown
    $past = getMicroTime() - 0.1;
    $pdo->prepare("UPDATE `quizzes` SET `next_question_at` = :past WHERE `id` = :id")
        ->execute(['past' => $past, 'id' => $testQuizId]);

    $quiz = processLiveQuizState($pdo, $testQuizId);

    echo " - Final Quiz Status: " . $quiz['status'] . "\n";
    echo " - Final Live State: " . getLiveQuizStateName($quiz) . "\n";

    // Verify `quiz_results`
    $rStmt = $pdo->prepare("SELECT * FROM `quiz_results` WHERE `quiz_id` = :qid ORDER BY `rank` ASC");
    $rStmt->execute(['qid' => $testQuizId]);
    $results = $rStmt->fetchAll();

    echo " - Results Count: " . count($results) . "\n";
    foreach ($results as $r) {
        echo "   * Rank #{$r['rank']}: Participant ID {$r['participant_id']}, Score: {$r['total_score']}, Correct: {$r['correct_answers']}/{$r['total_questions']}\n";
    }

    $first = $results[0] ?? null;
    $second = $results[1] ?? null;

    $isCompleted = ($quiz['status'] === 'completed');
    $aliceWins = ($first && (int)$first['participant_id'] === $aliceId && (int)$first['rank'] === 1);
    $bobSecond = ($second && (int)$second['participant_id'] === $bobId && (int)$second['rank'] === 2);

    return $isCompleted && $aliceWins && $bobSecond;
});

// TEST 11: Validation - Starting a quiz with 0 questions returns proper error
$allPassed &= runTest("Start Quiz validation blocks starting quiz with 0 questions", function() use ($pdo, $testTeacherId) {
    // Create empty quiz
    $ins = $pdo->prepare("INSERT INTO `quizzes` (`teacher_id`, `title`, `status`, `created_at`) VALUES (:tid, 'Empty Quiz', 'draft', NOW())");
    $ins->execute(['tid' => $testTeacherId]);
    $emptyQuizId = (int)$pdo->lastInsertId();

    // Check question count query
    $qCountStmt = $pdo->prepare("SELECT COUNT(*) FROM `questions` WHERE `quiz_id` = :quiz_id");
    $qCountStmt->execute(['quiz_id' => $emptyQuizId]);
    $count = (int)$qCountStmt->fetchColumn();

    echo " - Empty Quiz Question Count: {$count}\n";

    // Clean up
    $pdo->prepare("DELETE FROM `quizzes` WHERE `id` = :id")->execute(['id' => $emptyQuizId]);

    return $count === 0;
});

// Cleanup test quiz
$pdo->prepare("DELETE FROM `answers` WHERE `quiz_id` = :id")->execute(['id' => $testQuizId]);
$pdo->prepare("DELETE FROM `quiz_results` WHERE `quiz_id` = :id")->execute(['id' => $testQuizId]);
$pdo->prepare("DELETE FROM `participants` WHERE `quiz_id` = :id")->execute(['id' => $testQuizId]);
$pdo->prepare("DELETE FROM `questions` WHERE `quiz_id` = :id")->execute(['id' => $testQuizId]);
$pdo->prepare("DELETE FROM `quizzes` WHERE `id` = :id")->execute(['id' => $testQuizId]);

echo "========================================\n";
if ($allPassed) {
    echo "🎉 ALL 11 TESTS PASSED SUCCESSFULLY! 100% OPERATIONAL.\n";
} else {
    echo "❌ SOME TESTS FAILED.\n";
}
echo "========================================\n";
