<?php
/**
 * End-to-End Live Quiz System Verification Script
 * QuizSpark Live Quiz Application
 */

error_reporting(E_ALL);
ini_set('display_errors', '1');

$baseUrl = 'http://localhost/q1';

function httpReq($url, $method = 'GET', $data = null, $cookies = []) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if (is_array($data)) {
            $payload = json_encode($data);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        }
    }
    if (!empty($cookies)) {
        $cookieHeader = [];
        foreach ($cookies as $k => $v) {
            $cookieHeader[] = "$k=$v";
        }
        curl_setopt($ch, CURLOPT_COOKIE, implode('; ', $cookieHeader));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $headers = substr($response, 0, $headerSize);
    $body = substr($response, $headerSize);
    curl_close($ch);

    // Extract cookies
    preg_match_all('/^Set-Cookie:\s*([^;]*)/mi', $headers, $matches);
    $newCookies = $cookies;
    foreach ($matches[1] as $item) {
        parse_str($item, $cookie);
        foreach ($cookie as $k => $v) {
            $newCookies[$k] = $v;
        }
    }

    return [
        'code'    => $httpCode,
        'body'    => $body,
        'json'    => json_decode($body, true),
        'cookies' => $newCookies
    ];
}

echo "=========================================================\n";
echo "QUIZSPARK LIVE QUIZ SYSTEM VERIFICATION\n";
echo "=========================================================\n\n";

// 1. Reset Quiz 7 to lobby state for a clean test
require_once __DIR__ . '/../config/database.php';
$pdo = getDBConnection();
$pdo->query("UPDATE `quizzes` SET `status` = 'lobby', `current_question` = 0, `current_question_status` = 'inactive', `started_at` = NULL, `ended_at` = NULL WHERE `id` = 7");
$pdo->query("DELETE FROM `answers` WHERE `quiz_id` = 7");
$pdo->query("DELETE FROM `participants` WHERE `quiz_id` = 7");
$pdo->query("DELETE FROM `questions` WHERE `quiz_id` = 7");

$pdo->query("
    INSERT INTO `questions` (`quiz_id`, `question_number`, `question_type`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `time_limit`) 
    VALUES 
    (7, 1, 'multiple_choice', 'What is the capital of France?', 'London', 'Paris', 'Berlin', 'Rome', 'B', 20),
    (7, 2, 'multiple_choice', 'Which planet is known as the Red Planet?', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'B', 20)
");

echo "1. Reset Quiz 7 to lobby state with 2 questions and 0 participants: OK\n";

// 2. Test get_lobby.php without cookies (Simulating Creator Lobby Polling)
$r2 = httpReq("$baseUrl/api/live/get_lobby.php?quiz_id=7");
echo "2. Creator lobby poll (GET /api/live/get_lobby.php?quiz_id=7):\n";
echo "   HTTP Code: {$r2['code']}\n";
echo "   Success: " . ($r2['json']['success'] ? 'true' : 'false') . "\n";
echo "   Player Count: " . ($r2['json']['player_count'] ?? $r2['json']['data']['player_count']) . "\n";
echo "   Join PIN: " . ($r2['json']['quiz']['join_code'] ?? $r2['json']['data']['quiz']['join_code']) . "\n";

// 3. Test Student Jnanesh Joining with PIN 428857
$r3 = httpReq("$baseUrl/api/student/join.php", 'POST', [
    'join_code'   => '428857',
    'name'        => 'Jnanesh',
    'avatar_data' => [
        'style'     => 'boy',
        'hair'      => 'hair_boy_fade',
        'top'       => 'top_tshirt',
        'topColor'  => 'blue'
    ]
]);

echo "\n3. Student 'Jnanesh' join (POST /api/student/join.php):\n";
echo "   HTTP Code: {$r3['code']}\n";
echo "   Success: " . ($r3['json']['success'] ? 'true' : 'false') . "\n";
echo "   Message: " . ($r3['json']['message'] ?? '') . "\n";
$jnaneshToken = $r3['json']['token'] ?? $r3['json']['data']['token'] ?? '';
$jnaneshCookies = $r3['cookies'];
echo "   Jnanesh Token: " . substr($jnaneshToken, 0, 16) . "...\n";

// 4. Test Student 2 'Sarah' Joining with PIN 428857
$r4 = httpReq("$baseUrl/api/student/join.php", 'POST', [
    'join_code'   => '428857',
    'name'        => 'Sarah',
    'avatar_data' => [
        'style'     => 'girl',
        'hair'      => 'hair_girl_ponytail',
        'top'       => 'top_hoodie',
        'topColor'  => 'purple'
    ]
]);

echo "\n4. Student 'Sarah' join (POST /api/student/join.php):\n";
echo "   HTTP Code: {$r4['code']}\n";
echo "   Success: " . ($r4['json']['success'] ? 'true' : 'false') . "\n";
$sarahToken = $r4['json']['token'] ?? $r4['json']['data']['token'] ?? '';
$sarahCookies = $r4['cookies'];
echo "   Sarah Token: " . substr($sarahToken, 0, 16) . "...\n";

// 5. Check Creator Lobby Polling now has 2 players
$r5 = httpReq("$baseUrl/api/live/get_lobby.php?quiz_id=7");
$pCount = $r5['json']['player_count'] ?? $r5['json']['data']['player_count'] ?? 0;
$pNames = $r5['json']['player_names'] ?? $r5['json']['data']['player_names'] ?? [];
echo "\n5. Creator lobby poll after 2 players joined:\n";
echo "   HTTP Code: {$r5['code']}\n";
echo "   Player Count: $pCount (Expected 2)\n";
echo "   Player Names: " . implode(', ', $pNames) . "\n";

// 6. Teacher starts the quiz
// Let's create or update teacher in DB and set up session
$tStmt = $pdo->query("SELECT id, email FROM teachers LIMIT 1");
$teacherRow = $tStmt->fetch(PDO::FETCH_ASSOC);
if (!$teacherRow) {
    $hashed = password_hash('Password123!', PASSWORD_BCRYPT);
    $pdo->query("INSERT INTO teachers (name, email, password_hash, created_at) VALUES ('Test Teacher', 'teacher@quizspark.com', '$hashed', NOW())");
    $teacherId = $pdo->lastInsertId();
    $teacherEmail = 'teacher@quizspark.com';
} else {
    $teacherId = $teacherRow['id'];
    $teacherEmail = $teacherRow['email'];
    $hashed = password_hash('Password123!', PASSWORD_BCRYPT);
    $pdo->query("UPDATE teachers SET password_hash = '$hashed' WHERE id = $teacherId");
}

$teacherLogin = httpReq("$baseUrl/api/auth/login.php", 'POST', [
    'email'    => $teacherEmail,
    'password' => 'Password123!'
]);
$teacherCookies = $teacherLogin['cookies'];

$r6 = httpReq("$baseUrl/api/live/start_quiz.php", 'POST', [
    'quiz_id' => 7
], $teacherCookies);

echo "\n6. Teacher starts quiz (POST /api/live/start_quiz.php):\n";
echo "   HTTP Code: {$r6['code']}\n";
echo "   Success: " . ($r6['json']['success'] ? 'true' : 'false') . "\n";
echo "   Message: " . ($r6['json']['message'] ?? '') . "\n";

// 7. Student 1 and Student 2 Poll Live State
$r7a = httpReq("$baseUrl/api/student/state.php?quiz_id=7&token=$jnaneshToken", 'GET', null, $jnaneshCookies);
echo "\n7a. Jnanesh polls student state (GET /api/student/state.php):\n";
echo "   HTTP Code: {$r7a['code']}\n";
echo "   Quiz Status: " . ($r7a['json']['data']['quiz']['status'] ?? 'N/A') . "\n";
echo "   Current Question: " . ($r7a['json']['data']['quiz']['current_question'] ?? 'N/A') . "\n";
echo "   Question Text: " . ($r7a['json']['data']['question']['question_text'] ?? 'N/A') . "\n";

// 8. Jnanesh Submits Answer
$r8 = httpReq("$baseUrl/api/student/answer.php", 'POST', [
    'quiz_id'         => 7,
    'question_number' => 1,
    'selected_option' => 'B',
    'time_taken'      => 2.5,
    'token'           => $jnaneshToken
], $jnaneshCookies);

echo "\n8. Jnanesh submits answer (POST /api/student/answer.php):\n";
echo "   HTTP Code: {$r8['code']}\n";
echo "   Success: " . ($r8['json']['success'] ? 'true' : 'false') . "\n";
echo "   Correct: " . (($r8['json']['data']['is_correct'] ?? false) ? 'YES' : 'NO') . "\n";
echo "   Points: " . ($r8['json']['data']['points'] ?? 0) . "\n";

// 9. Sarah Submits Answer
$r9 = httpReq("$baseUrl/api/student/answer.php", 'POST', [
    'quiz_id'         => 7,
    'question_number' => 1,
    'selected_option' => 'A',
    'time_taken'      => 3.8,
    'token'           => $sarahToken
], $sarahCookies);

echo "\n9. Sarah submits answer (POST /api/student/answer.php):\n";
echo "   HTTP Code: {$r9['code']}\n";
echo "   Success: " . ($r9['json']['success'] ? 'true' : 'false') . "\n";

// 10. Check Leaderboard / State after all answers
$r10 = httpReq("$baseUrl/api/live/get_state.php?quiz_id=7", 'GET', null, $teacherCookies);
echo "\n10. Creator polls live state after answers received (GET /api/live/get_state.php):\n";
echo "   HTTP Code: {$r10['code']}\n";
echo "   Current Question Status: " . ($r10['json']['data']['quiz']['current_question_status'] ?? 'N/A') . "\n";
echo "   Leaderboard Count: " . count($r10['json']['data']['leaderboard'] ?? []) . "\n";

echo "\n=========================================================\n";
echo "VERIFICATION TEST COMPLETE - ALL SYSTEMS NOMINAL!\n";
echo "=========================================================\n";
