<?php
/**
 * Automated Verification Script for QuizSpark Application
 */

require_once __DIR__ . '/../config/database.php';

$baseUrl = 'http://127.0.0.1:8000';

echo "=== Running QuizSpark End-to-End Verification Tests ===\n";

function makeRequest($url, $method = 'GET', $data = null, $cookies = []) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, is_array($data) ? json_encode($data) : $data);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        }
    }
    
    if (!empty($cookies)) {
        $cookieStr = '';
        foreach ($cookies as $k => $v) {
            $cookieStr .= "$k=$v; ";
        }
        curl_setopt($ch, CURLOPT_COOKIE, rtrim($cookieStr, '; '));
    }
    
    $response = curl_exec($ch);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $header = substr($response, 0, $headerSize);
    $body = substr($response, $headerSize);
    
    // Parse cookies from header
    preg_match_all('/Set-Cookie:\s*([^=]+)=([^;]+)/i', $header, $matches);
    $respCookies = [];
    if (!empty($matches[1])) {
        for ($i = 0; $i < count($matches[1]); $i++) {
            $respCookies[$matches[1][$i]] = $matches[2][$i];
        }
    }
    
    curl_close($ch);
    return ['body' => json_decode($body, true), 'raw_body' => $body, 'cookies' => $respCookies];
}

// TEST 1: Teacher Login
echo "[1/10] Testing Teacher Login...\n";
$res1 = makeRequest("$baseUrl/api/auth/login.php", 'POST', [
    'email' => 'jnanesh2006@gmail.com',
    'password' => '123456'
]);

if ($res1['body']['success'] ?? false) {
    echo "  ✔ Teacher login successful!\n";
    $teacherCookies = $res1['cookies'];
} else {
    echo "  ✖ Teacher login failed: " . json_encode($res1['body']) . "\n";
    exit(1);
}

// TEST 2: List Quizzes
echo "[2/10] Testing List Quizzes...\n";
$res2 = makeRequest("$baseUrl/api/quiz/list.php", 'GET', null, $teacherCookies);
if ($res2['body']['success'] ?? false) {
    $quizzes = $res2['body']['data']['quizzes'];
    echo "  ✔ Found " . count($quizzes) . " quiz(zes).\n";
    $quizId = $quizzes[0]['id'];
} else {
    echo "  ✖ List quizzes failed.\n";
    exit(1);
}

// TEST 3: Publish Quiz
echo "[3/10] Testing Publish Quiz...\n";
$res3 = makeRequest("$baseUrl/api/quiz/publish.php", 'POST', ['quiz_id' => $quizId], $teacherCookies);
if ($res3['body']['success'] ?? false) {
    $joinCode = $res3['body']['data']['join_code'];
    echo "  ✔ Quiz published with 6-digit Join Code: $joinCode\n";
} else {
    echo "  ✖ Publish quiz failed: " . json_encode($res3['body']) . "\n";
    exit(1);
}

// TEST 4: Student 1 Join (Jnaneshwar)
echo "[4/10] Testing Student 1 Join (Jnaneshwar)...\n";
$res4 = makeRequest("$baseUrl/api/student/join.php", 'POST', [
    'join_code' => $joinCode,
    'name' => 'Jnaneshwar',
    'emoji' => '😀'
]);
if ($res4['body']['success'] ?? false) {
    echo "  ✔ Student 1 joined successfully!\n";
    $student1Cookies = $res4['cookies'];
} else {
    echo "  ✖ Student 1 join failed: " . json_encode($res4['body']) . "\n";
    exit(1);
}

// TEST 5: Student 2 Join (Rahul)
echo "[5/10] Testing Student 2 Join (Rahul)...\n";
$res5 = makeRequest("$baseUrl/api/student/join.php", 'POST', [
    'join_code' => $joinCode,
    'name' => 'Rahul',
    'emoji' => '🔥'
]);
if ($res5['body']['success'] ?? false) {
    echo "  ✔ Student 2 joined successfully!\n";
    $student2Cookies = $res5['cookies'];
} else {
    echo "  ✖ Student 2 join failed.\n";
    exit(1);
}

// TEST 6: Get Lobby Data (Teacher)
echo "[6/10] Testing Teacher Live Lobby Data...\n";
$res6 = makeRequest("$baseUrl/api/live/get_lobby.php?quiz_id=$quizId", 'GET', null, $teacherCookies);
if ($res6['body']['data']['player_count'] == 2) {
    echo "  ✔ Teacher live lobby confirmed 2 joined players!\n";
} else {
    echo "  ✖ Player count mismatch: " . json_encode($res6['body']) . "\n";
    exit(1);
}

// TEST 7: Start Quiz
echo "[7/10] Testing Start Quiz...\n";
$res7 = makeRequest("$baseUrl/api/live/start_quiz.php", 'POST', ['quiz_id' => $quizId], $teacherCookies);
if ($res7['body']['success'] ?? false) {
    echo "  ✔ Quiz started! Question 1 is live.\n";
} else {
    echo "  ✖ Start quiz failed.\n";
    exit(1);
}

// TEST 8: Submit Student Answer
echo "[8/10] Testing Student Answer Submission & Server Scoring...\n";
$res8 = makeRequest("$baseUrl/api/student/answer.php", 'POST', [
    'quiz_id' => $quizId,
    'question_number' => 1,
    'selected_option' => 'B'
], $student1Cookies);

if ($res8['body']['success'] ?? false) {
    $points = $res8['body']['data']['points'];
    echo "  ✔ Answer submitted! Correct: " . ($res8['body']['data']['is_correct'] ? 'YES' : 'NO') . " | Points Awarded: $points pts\n";
} else {
    echo "  ✖ Answer submission failed: " . json_encode($res8['body']) . "\n";
    exit(1);
}

// TEST 9: End Question & Leaderboard
echo "[9/10] Testing End Question & Fetch Leaderboard...\n";
makeRequest("$baseUrl/api/live/end_question.php", 'POST', ['quiz_id' => $quizId], $teacherCookies);
$res9 = makeRequest("$baseUrl/api/student/leaderboard.php?quiz_id=$quizId", 'GET');

if (!empty($res9['body']['data']['leaderboard'])) {
    $top = $res9['body']['data']['leaderboard'][0];
    echo "  ✔ Leaderboard updated! Top Player: {$top['name']} ({$top['total_score']} pts)\n";
} else {
    echo "  ✖ Leaderboard fetch failed.\n";
    exit(1);
}

// TEST 10: End Quiz
echo "[10/10] Testing End Quiz & Results Compilation...\n";
$res10 = makeRequest("$baseUrl/api/live/end_quiz.php", 'POST', ['quiz_id' => $quizId], $teacherCookies);
if ($res10['body']['success'] ?? false) {
    echo "  ✔ Quiz ended! Final results compiled in MySQL database.\n";
} else {
    echo "  ✖ End quiz failed.\n";
    exit(1);
}

echo "\n🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉\n";
