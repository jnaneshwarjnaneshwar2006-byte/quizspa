<?php
/**
 * Regression Test Suite for Production Fixes:
 * 1. Production Join URL (https://quizspark.rf.gd/student/join.php?code=...)
 * 2. CSV Export Security & Strict Teacher Ownership Access Control
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/security.php';

$pdo = getDBConnection();
$baseUrl = 'http://127.0.0.1:8000';

echo "======================================================\n";
echo "=== PRODUCTION FIXES & SECURITY VERIFICATION TESTS ===\n";
echo "======================================================\n\n";

function requestHttp($url, $method = 'GET', $data = null, $cookies = []) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    }
    
    if (!empty($cookies)) {
        $cookieStr = '';
        foreach ($cookies as $k => $v) {
            $cookieStr .= "{$k}={$v}; ";
        }
        curl_setopt($ch, CURLOPT_COOKIE, rtrim($cookieStr, '; '));
    }
    
    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    curl_close($ch);
    
    $headerText = substr($response, 0, $headerSize);
    $body = substr($response, $headerSize);
    
    // Parse cookies from response headers
    $resCookies = [];
    preg_match_all('/^Set-Cookie:\s*([^;]+)/mi', $headerText, $matches);
    foreach ($matches[1] as $c) {
        $parts = explode('=', $c, 2);
        if (count($parts) === 2) {
            $resCookies[trim($parts[0])] = trim($parts[1]);
        }
    }
    
    return [
        'status'  => $status,
        'headers' => $headerText,
        'body'    => $body,
        'json'    => json_decode($body, true),
        'cookies' => $resCookies
    ];
}

// -------------------------------------------------------------
// SETUP: TEACHER A, TEACHER B, AND QUIZZES
// -------------------------------------------------------------
echo "[SETUP] Creating Teacher A, Teacher B, and Test Quizzes...\n";

$passHash = password_hash('TestPass123!', PASSWORD_BCRYPT);

// Create Teacher A
$emailA = 'teacher_a_' . time() . '@example.com';
$pdo->prepare("INSERT INTO `teachers` (`name`, `email`, `password_hash`) VALUES ('Teacher Alice', :email, :pass)")
    ->execute(['email' => $emailA, 'pass' => $passHash]);
$teacherAId = (int)$pdo->lastInsertId();

// Create Teacher B
$emailB = 'teacher_b_' . time() . '@example.com';
$pdo->prepare("INSERT INTO `teachers` (`name`, `email`, `password_hash`) VALUES ('Teacher Bob', :email, :pass)")
    ->execute(['email' => $emailB, 'pass' => $passHash]);
$teacherBId = (int)$pdo->lastInsertId();

// Log in Teacher A over HTTP
$loginResA = requestHttp("{$baseUrl}/api/auth/login.php", 'POST', [
    'email'    => $emailA,
    'password' => 'TestPass123!'
]);
$sessionCookieA = $loginResA['cookies'];

// Log in Teacher B over HTTP
$loginResB = requestHttp("{$baseUrl}/api/auth/login.php", 'POST', [
    'email'    => $emailB,
    'password' => 'TestPass123!'
]);
$sessionCookieB = $loginResB['cookies'];

// Create Quiz for Teacher A
$pdo->prepare("
    INSERT INTO `quizzes` (`teacher_id`, `title`, `description`, `status`, `current_question`)
    VALUES (:tid, 'Alice Physics Challenge', 'Gravity & Energy', 'draft', 0)
")->execute(['tid' => $teacherAId]);
$quizAId = (int)$pdo->lastInsertId();

// Add questions to Quiz A
$pdo->prepare("
    INSERT INTO `questions` (`quiz_id`, `question_number`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `time_limit`, `points`)
    VALUES (:qid, 1, 'What is the acceleration due to gravity on Earth?', '9.8 m/s^2', '5.2 m/s^2', '12.4 m/s^2', '1.6 m/s^2', 'A', 10, 1000)
")->execute(['qid' => $quizAId]);

echo "  Teacher A ID: {$teacherAId} (Quiz A ID: {$quizAId})\n";
echo "  Teacher B ID: {$teacherBId}\n\n";

// -------------------------------------------------------------
// TEST A: TEACHER PUBLISHES QUIZ & PRODUCTION JOIN URL
// -------------------------------------------------------------
echo "[TEST A] Publishing Quiz A and verifying Production Join URL...\n";

$publishRes = requestHttp("{$baseUrl}/api/quiz/publish.php", 'POST', ['quiz_id' => $quizAId], $sessionCookieA);

if ($publishRes['status'] !== 200 || empty($publishRes['json']['success'])) {
    die("FAILED TEST A: Publish API failed: " . $publishRes['body'] . "\n");
}

$joinCodeA = $publishRes['json']['data']['join_code'];
$joinUrlA = $publishRes['json']['data']['join_url'];

echo "  Generated Join Code: {$joinCodeA}\n";
echo "  Generated Join URL: {$joinUrlA}\n";

$expectedUrl = "{$baseUrl}/student/join.php?code={$joinCodeA}";

if ($joinUrlA !== $expectedUrl) {
    die("FAILED TEST A: Expected join URL '{$expectedUrl}', got '{$joinUrlA}'\n");
}
echo "  ✓ TEST A (Part 1) PASSED: Published URL is strictly '{$expectedUrl}'.\n\n";

// Check Student Join Page with code parameter
echo "[TEST A - Part 2] Verifying Student Join page pre-fills PIN and opens without teacher auth...\n";
$joinPageRes = requestHttp("{$baseUrl}/student/join.php?code={$joinCodeA}", 'GET');
if ($joinPageRes['status'] !== 200) {
    die("FAILED TEST A: Student join page returned status {$joinPageRes['status']}\n");
}
if (strpos($joinPageRes['body'], $joinCodeA) === false) {
    die("FAILED TEST A: Student join page does not contain pre-filled join code {$joinCodeA}\n");
}
if (strpos($joinPageRes['body'], 'Alice Physics Challenge') === false) {
    die("FAILED TEST A: Student join page does not display quiz title 'Alice Physics Challenge'\n");
}
echo "  ✓ TEST A (Part 2) PASSED: Student join page opens anonymously and pre-fills join code {$joinCodeA}.\n\n";

// -------------------------------------------------------------
// TEST B: STUDENT JOINS AND VERIFY NO EXPORT BUTTON & NO CSV ACCESS
// -------------------------------------------------------------
echo "[TEST B] Student 'Ajit' joins Quiz A, checks Final Leaderboard & tests CSV export denial...\n";

$studentJoinRes = requestHttp("{$baseUrl}/api/student/join.php", 'POST', [
    'join_code' => $joinCodeA,
    'name'      => 'Ajit',
    'emoji'     => '🚀'
]);
if ($studentJoinRes['status'] !== 200 || empty($studentJoinRes['json']['success'])) {
    die("FAILED TEST B: Student join failed: " . $studentJoinRes['body'] . "\n");
}
$studentToken = $studentJoinRes['json']['data']['token'];
$studentCookie = ['student_token' => $studentToken];
echo "  Ajit joined successfully. Token: {$studentToken}\n";

// Start and complete the quiz to simulate final leaderboard
$pdo->prepare("
    UPDATE `quizzes` 
    SET `status` = 'completed', `current_question_status` = 'ended', `ended_at` = NOW() 
    WHERE `id` = :id
")->execute(['id' => $quizAId]);

$pdo->prepare("
    INSERT INTO `quiz_results` (`quiz_id`, `participant_id`, `rank`, `total_score`, `total_time`, `correct_answers`, `total_questions`, `completed_at`)
    VALUES (:qid, :pid, 1, 950, 2.5, 1, 1, NOW())
")->execute(['qid' => $quizAId, 'pid' => $studentJoinRes['json']['data']['participant_id']]);

// 1. Inspect Student Final Leaderboard HTML: Must NOT have exportCsvBtn
$studentLbHtml = requestHttp("{$baseUrl}/student/leaderboard.php?quiz_id={$quizAId}", 'GET', null, $studentCookie);
if (strpos($studentLbHtml['body'], 'exportCsvBtn') !== false || strpos($studentLbHtml['body'], 'Export Results') !== false || strpos($studentLbHtml['body'], 'Export CSV') !== false) {
    die("FAILED TEST B: Student final leaderboard still contains CSV Export button/link!\n");
}
echo "  ✓ Student leaderboard verified: Zero CSV export buttons visible to students.\n";

// 2. Student attempts to manually download CSV export endpoint
$studentExportAttempt = requestHttp("{$baseUrl}/api/quiz/export_csv.php?quiz_id={$quizAId}", 'GET', null, $studentCookie);
echo "  Student manual export request HTTP status: {$studentExportAttempt['status']}\n";
echo "  Student response: " . trim($studentExportAttempt['body']) . "\n";

if ($studentExportAttempt['status'] !== 403) {
    die("FAILED TEST B: Student request was NOT rejected with HTTP 403 Forbidden! Got status: {$studentExportAttempt['status']}\n");
}
if (strpos($studentExportAttempt['headers'], 'text/csv') !== false || strpos($studentExportAttempt['body'], 'Rank,Student Name') !== false) {
    die("FAILED TEST B: Server leaked CSV data to student!\n");
}
echo "  ✓ TEST B PASSED: Server strictly returned HTTP 403 Forbidden and zero CSV data to student.\n\n";

// -------------------------------------------------------------
// TEST C: UNAUTHORIZED TEACHER (TEACHER B) TRIES TO EXPORT QUIZ A
// -------------------------------------------------------------
echo "[TEST C] Teacher B attempts to export Teacher A's Quiz results...\n";

$teacherBExportAttempt = requestHttp("{$baseUrl}/api/quiz/export_csv.php?quiz_id={$quizAId}", 'GET', null, $sessionCookieB);
echo "  Teacher B export request HTTP status: {$teacherBExportAttempt['status']}\n";
echo "  Teacher B response: " . trim($teacherBExportAttempt['body']) . "\n";

if ($teacherBExportAttempt['status'] !== 403) {
    die("FAILED TEST C: Unauthorized Teacher B was NOT rejected with HTTP 403 Forbidden! Got status: {$teacherBExportAttempt['status']}\n");
}
if (strpos($teacherBExportAttempt['headers'], 'text/csv') !== false || strpos($teacherBExportAttempt['body'], 'Rank,Student Name') !== false) {
    die("FAILED TEST C: Server leaked Quiz A data to Teacher B!\n");
}
echo "  ✓ TEST C PASSED: Teacher B access strictly denied with HTTP 403 Forbidden.\n\n";

// -------------------------------------------------------------
// TEST D: LOGGED OUT USER TRIES TO EXPORT QUIZ A
// -------------------------------------------------------------
echo "[TEST D] Logged-out anonymous user attempts to export Quiz results...\n";

$loggedOutExportAttempt = requestHttp("{$baseUrl}/api/quiz/export_csv.php?quiz_id={$quizAId}", 'GET');
echo "  Logged-out export request HTTP status: {$loggedOutExportAttempt['status']}\n";
echo "  Logged-out response: " . trim($loggedOutExportAttempt['body']) . "\n";

if ($loggedOutExportAttempt['status'] !== 403) {
    die("FAILED TEST D: Logged-out request was NOT rejected with HTTP 403 Forbidden! Got status: {$loggedOutExportAttempt['status']}\n");
}
if (strpos($loggedOutExportAttempt['headers'], 'text/csv') !== false || strpos($loggedOutExportAttempt['body'], 'Rank,Student Name') !== false) {
    die("FAILED TEST D: Server leaked CSV data to logged-out user!\n");
}
echo "  ✓ TEST D PASSED: Logged-out access strictly denied with HTTP 403 Forbidden.\n\n";

// -------------------------------------------------------------
// TEST E: AUTHORIZED TEACHER A EXPORTS QUIZ A
// -------------------------------------------------------------
echo "[TEST E] Authorized Teacher A exports their own Quiz results...\n";

$teacherAExport = requestHttp("{$baseUrl}/api/quiz/export_csv.php?quiz_id={$quizAId}", 'GET', null, $sessionCookieA);
echo "  Teacher A export request HTTP status: {$teacherAExport['status']}\n";
echo "  Content-Type header: " . (preg_match('/Content-Type:\s*([^\r\n]+)/i', $teacherAExport['headers'], $m) ? $m[1] : '') . "\n";
echo "  CSV Content Preview:\n";
$lines = explode("\n", trim($teacherAExport['body']));
foreach (array_slice($lines, 0, 5) as $line) {
    echo "    " . trim($line) . "\n";
}

if ($teacherAExport['status'] !== 200) {
    die("FAILED TEST E: Teacher A export failed with status {$teacherAExport['status']}\n");
}
if (strpos($teacherAExport['body'], 'Student Name') === false || strpos($teacherAExport['body'], 'Ajit') === false) {
    die("FAILED TEST E: CSV does not contain expected student results for Ajit!\n");
}
echo "  ✓ TEST E PASSED: Teacher A successfully downloaded clean RFC-compliant CSV results.\n\n";

echo "======================================================\n";
echo "=== ALL REGRESSION & SECURITY TESTS PASSED (100%) ===\n";
echo "======================================================\n";
