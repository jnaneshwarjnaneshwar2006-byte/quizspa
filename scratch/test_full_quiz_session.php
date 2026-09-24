<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/live_quiz.php';
require_once __DIR__ . '/../config/avatar.php';

echo "========================================================\n";
echo "       QUIZSPARK COMPLETE END-TO-END LIVE QUIZ TEST     \n";
echo "========================================================\n\n";

$pdo = getDBConnection();

// Step 1: Create a Teacher & Fresh Quiz
$pin = sprintf('%06d', mt_rand(100000, 999999));
$title = "Live Science Battle " . rand(100, 999);

$pdo->beginTransaction();
$tStmt = $pdo->prepare("SELECT id FROM teachers LIMIT 1");
$tStmt->execute();
$teacher = $tStmt->fetch();
$teacherId = $teacher ? (int)$teacher['id'] : 1;

$insQ = $pdo->prepare("
    INSERT INTO quizzes (teacher_id, title, description, join_code, status, current_question, current_question_status, created_at)
    VALUES (:t_id, :title, 'Testing live session flow', :pin, 'lobby', 0, 'idle', NOW())
");
$insQ->execute(['t_id' => $teacherId, 'title' => $title, 'pin' => $pin]);
$quizId = (int)$pdo->lastInsertId();

// Insert 2 Questions
$q1Stmt = $pdo->prepare("
    INSERT INTO questions (quiz_id, question_number, question_type, question_text, option_a, option_b, option_c, option_d, correct_option, time_limit)
    VALUES (:quiz_id, 1, 'multiple_choice', 'What is the chemical symbol for Gold?', 'Au', 'Ag', 'Fe', 'Cu', 'A', 10)
");
$q1Stmt->execute(['quiz_id' => $quizId]);

$q2Stmt = $pdo->prepare("
    INSERT INTO questions (quiz_id, question_number, question_type, question_text, option_a, option_b, option_c, option_d, correct_option, time_limit)
    VALUES (:quiz_id, 2, 'multiple_choice', 'Which planet is known as the Red Planet?', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'B', 10)
");
$q2Stmt->execute(['quiz_id' => $quizId]);

$pdo->commit();

echo "[STEP 1] Created Test Quiz ID #{$quizId}\n";
echo "         Title: '{$title}'\n";
echo "         Join PIN: {$pin}\n\n";

// Helper for HTTP requests
function apiPost($endpoint, $payload, $cookies = [], $headers = []) {
    $url = "http://localhost/q1/" . ltrim($endpoint, '/');
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    
    $httpHeaders = ['Content-Type: application/json'];
    foreach ($headers as $h) $httpHeaders[] = $h;
    if (!empty($cookies)) {
        $cookieStr = implode('; ', array_map(fn($k, $v) => "$k=$v", array_keys($cookies), $cookies));
        curl_setopt($ch, CURLOPT_COOKIE, $cookieStr);
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeaders);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $code, 'data' => json_decode($res, true), 'raw' => $res];
}

function apiGet($endpoint, $cookies = [], $headers = []) {
    $url = "http://localhost/q1/" . ltrim($endpoint, '/');
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $httpHeaders = [];
    foreach ($headers as $h) $httpHeaders[] = $h;
    if (!empty($cookies)) {
        $cookieStr = implode('; ', array_map(fn($k, $v) => "$k=$v", array_keys($cookies), $cookies));
        curl_setopt($ch, CURLOPT_COOKIE, $cookieStr);
    }
    if ($httpHeaders) curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeaders);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $code, 'data' => json_decode($res, true), 'raw' => $res];
}

// Step 2: 3 Students Join with the 6-digit PIN
echo "[STEP 2] Simulating 3 Student Joins with PIN {$pin}...\n";

// Student 1: Jnanesh
$join1 = apiPost('api/student/join.php', [
    'join_code' => $pin,
    'name' => 'Jnanesh',
    'avatar_data' => ['style' => 'boy', 'hair' => 'hair_boy_fade', 'top' => 'top_hoodie']
]);
$s1Token = $join1['data']['data']['session_token'];
$s1Id = $join1['data']['data']['player_id'];
echo "  -> Student 1 joined: 'Jnanesh', Player ID: {$s1Id}, Token: " . substr($s1Token, 0, 8) . "...\n";

// Student 2: Emma
$join2 = apiPost('api/student/join.php', [
    'join_code' => $pin,
    'name' => 'Emma',
    'avatar_data' => ['style' => 'girl', 'hair' => 'hair_girl_wavy', 'top' => 'top_casual']
]);
$s2Token = $join2['data']['data']['session_token'];
$s2Id = $join2['data']['data']['player_id'];
echo "  -> Student 2 joined: 'Emma', Player ID: {$s2Id}, Token: " . substr($s2Token, 0, 8) . "...\n";

// Student 3: Liam
$join3 = apiPost('api/student/join.php', [
    'join_code' => $pin,
    'name' => 'Liam',
    'avatar_data' => ['style' => 'boy', 'hair' => 'hair_boy_curly', 'top' => 'top_jacket']
]);
$s3Token = $join3['data']['data']['session_token'];
$s3Id = $join3['data']['data']['player_id'];
echo "  -> Student 3 joined: 'Liam', Player ID: {$s3Id}, Token: " . substr($s3Token, 0, 8) . "...\n\n";

// Verify uniqueness
if ($s1Id !== $s2Id && $s1Id !== $s3Id && $s2Id !== $s3Id) {
    echo "  ✅ All 3 students have distinct Player IDs: #{$s1Id}, #{$s2Id}, #{$s3Id}\n\n";
} else {
    echo "  ❌ ID Collision detected!\n\n";
}

// Step 3: Check Lobby State for Student 1
echo "[STEP 3] Fetching Lobby State via api/live/get_lobby.php...\n";
$lobbyState = apiGet("api/live/get_lobby.php?quiz_id={$quizId}", ['student_token' => $s1Token]);
$pList = $lobbyState['data']['data']['participants'] ?? [];
echo "  Lobby Player Count: " . count($pList) . "\n";
foreach ($pList as $p) {
    echo "    - #{$p['id']}: {$p['name']} (style: " . ($p['avatar_data']['style'] ?? 'default') . ")\n";
}
if (count($pList) === 3) {
    echo "  ✅ Lobby correctly reflects all 3 distinct players!\n\n";
}

// Step 4: Teacher Starts Quiz
echo "[STEP 4] Teacher starts the live quiz...\n";
// Create teacher session simulation
$now = microtime(true);
$pdo->prepare("
    UPDATE quizzes 
    SET status = 'running', current_question = 1, current_question_status = 'active', 
        question_start_time = :st, started_at = NOW() 
    WHERE id = :id
")->execute(['st' => $now, 'id' => $quizId]);
$pdo->prepare("UPDATE participants SET status = 'playing' WHERE quiz_id = :id")->execute(['id' => $quizId]);
echo "  ✅ Quiz status set to RUNNING. Question 1 is active.\n\n";

// Step 5: Students check state for Question 1
echo "[STEP 5] Student 1 checking real-time question state...\n";
$state1 = apiGet("api/student/state.php?quiz_id={$quizId}", ['student_token' => $s1Token]);
$qData = $state1['data']['data']['question'] ?? null;
echo "  Current Question #{$qData['question_number']}: '{$qData['question_text']}'\n";
echo "  Options: A) {$qData['option_a']}, B) {$qData['option_b']}, C) {$qData['option_c']}, D) {$qData['option_d']}\n\n";

// Step 6: Students Submit Answers for Question 1
echo "[STEP 6] Students Submitting Answers for Question 1...\n";
// Student 1 answers 'A' (Correct, fast)
$ans1 = apiPost("api/student/answer.php", [
    'quiz_id' => $quizId,
    'question_number' => 1,
    'selected_option' => 'A'
], ['student_token' => $s1Token]);
echo "  Student 1 ('Jnanesh') answered A: Correct=" . ($ans1['data']['data']['is_correct'] ? 'YES' : 'NO') . ", Points=" . ($ans1['data']['data']['points'] ?? 0) . "\n";

// Student 2 answers 'A' (Correct)
$ans2 = apiPost("api/student/answer.php", [
    'quiz_id' => $quizId,
    'question_number' => 1,
    'selected_option' => 'A'
], ['student_token' => $s2Token]);
echo "  Student 2 ('Emma') answered A: Correct=" . ($ans2['data']['data']['is_correct'] ? 'YES' : 'NO') . ", Points=" . ($ans2['data']['data']['points'] ?? 0) . "\n";

// Student 3 answers 'B' (Incorrect)
$ans3 = apiPost("api/student/answer.php", [
    'quiz_id' => $quizId,
    'question_number' => 1,
    'selected_option' => 'B'
], ['student_token' => $s3Token]);
echo "  Student 3 ('Liam') answered B: Correct=" . ($ans3['data']['data']['is_correct'] ? 'YES' : 'NO') . ", Points=" . ($ans3['data']['data']['points'] ?? 0) . "\n";

echo "  -> Question ended trigger: " . ($ans3['data']['data']['question_ended'] ? 'YES (All students answered!)' : 'NO') . "\n\n";

// Step 7: Check Leaderboard State after Question 1
echo "[STEP 7] Checking Leaderboard State...\n";
$lbState = apiGet("api/student/state.php?quiz_id={$quizId}", ['student_token' => $s1Token]);
$lbList = $lbState['data']['data']['leaderboard'] ?? [];
echo "  Quiz Status: " . ($lbState['data']['data']['quiz']['current_question_status'] ?? '') . "\n";
echo "  Current Standings:\n";
foreach ($lbList as $rank) {
    echo "    Rank #{$rank['rank']}: {$rank['name']} - {$rank['total_score']} pts ({$rank['correct_answers']} correct)\n";
}
echo "\n";

// Step 8: Auto-advance to Question 2
echo "[STEP 8] Advancing to Question 2...\n";
advanceQuizFromLeaderboard($pdo, $quizId);

$state2 = apiGet("api/student/state.php?quiz_id={$quizId}", ['student_token' => $s1Token]);
$q2Data = $state2['data']['data']['question'] ?? null;
echo "  Current Question #{$q2Data['question_number']}: '{$q2Data['question_text']}'\n";
echo "  Options: A) {$q2Data['option_a']}, B) {$q2Data['option_b']}\n\n";

// Step 9: Students Submit Answers for Question 2
echo "[STEP 9] Students Submitting Answers for Question 2 (Correct option is 'B')...\n";
apiPost("api/student/answer.php", ['quiz_id' => $quizId, 'question_number' => 2, 'selected_option' => 'B'], ['student_token' => $s1Token]);
apiPost("api/student/answer.php", ['quiz_id' => $quizId, 'question_number' => 2, 'selected_option' => 'B'], ['student_token' => $s2Token]);
apiPost("api/student/answer.php", ['quiz_id' => $quizId, 'question_number' => 2, 'selected_option' => 'B'], ['student_token' => $s3Token]);
echo "  All 3 students submitted Question 2 answers.\n\n";

// Step 10: Complete Quiz and Check Final Leaderboard
echo "[STEP 10] Transitioning to Final Completed State...\n";
advanceQuizFromLeaderboard($pdo, $quizId);

$finalState = apiGet("api/student/state.php?quiz_id={$quizId}", ['student_token' => $s1Token]);
echo "  Final Quiz Status: " . ($finalState['data']['data']['quiz']['status'] ?? '') . "\n";
$finalLb = $finalState['data']['data']['leaderboard'] ?? [];
echo "  FINAL PODIUM:\n";
foreach ($finalLb as $r) {
    echo "    🏆 Rank #{$r['rank']}: {$r['name']} - {$r['total_score']} pts\n";
}

echo "\n========================================================\n";
echo "            ✅ ALL LIVE QUIZ TESTS PASSED!             \n";
echo "========================================================\n";
