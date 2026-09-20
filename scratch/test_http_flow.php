<?php
$cookieFile = __DIR__ . '/cookie.txt';
if (file_exists($cookieFile)) unlink($cookieFile);

// 1. Get Login Page & CSRF
$ch = curl_init('http://127.0.0.1:8000/teacher/login.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_COOKIEJAR, $cookieFile);
curl_setopt($ch, CURLOPT_COOKIEFILE, $cookieFile);
$html = curl_exec($ch);
preg_match('/id="csrfToken"\s+value="([^"]+)"/', $html, $m);
$csrf = $m[1] ?? '';
echo "1. Got CSRF: " . $csrf . "\n";

// 2. Perform Creator Login
curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000/api/auth/login.php');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => 'creator_test@example.com',
    'password' => 'Secret123!',
    'csrf_token' => $csrf
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$res = curl_exec($ch);
echo "2. Login Response: " . $res . "\n";

// 3. Create a Quiz via API
curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000/api/quiz/create.php');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'title' => 'HTTP Live Test Quiz',
    'category' => 'Geography',
    'description' => 'Tested over HTTP server',
    'questions' => [
        [
            'question_type' => 'multiple_choice',
            'question_text' => 'What is the capital of Japan?',
            'option_a' => 'Kyoto',
            'option_b' => 'Tokyo',
            'option_c' => 'Osaka',
            'option_d' => 'Nagoya',
            'correct_option' => 'B',
            'time_limit' => 10
        ]
    ]
]));
$res = curl_exec($ch);
echo "3. Create Quiz Response: " . $res . "\n";
$createdData = json_decode($res, true);
$quizId = $createdData['data']['quiz_id'] ?? 0;

// 4. Publish Quiz
curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000/api/quiz/publish.php');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['quiz_id' => $quizId]));
$res = curl_exec($ch);
echo "4. Publish Quiz Response: " . $res . "\n";
$publishData = json_decode($res, true);
$joinCode = $publishData['data']['join_code'] ?? '';

// 5. Student Joins
$chStudent = curl_init('http://127.0.0.1:8000/api/student/join.php');
curl_setopt($chStudent, CURLOPT_RETURNTRANSFER, true);
curl_setopt($chStudent, CURLOPT_POST, true);
curl_setopt($chStudent, CURLOPT_POSTFIELDS, json_encode([
    'join_code' => $joinCode,
    'name' => 'Carol HTTP',
    'emoji' => '🌟'
]));
curl_setopt($chStudent, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$cookieStudent = __DIR__ . '/cookie_student.txt';
if (file_exists($cookieStudent)) unlink($cookieStudent);
curl_setopt($chStudent, CURLOPT_COOKIEJAR, $cookieStudent);
curl_setopt($chStudent, CURLOPT_COOKIEFILE, $cookieStudent);
$res = curl_exec($chStudent);
echo "5. Student Join Response: " . $res . "\n";

// 6. Start Quiz (Creator)
curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000/api/live/start_quiz.php');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['quiz_id' => $quizId]));
$res = curl_exec($ch);
echo "6. Start Quiz Response: " . $res . "\n";

// 7. Student checks state
curl_setopt($chStudent, CURLOPT_URL, "http://127.0.0.1:8000/api/student/state.php?quiz_id={$quizId}");
curl_setopt($chStudent, CURLOPT_HTTPGET, true);
$res = curl_exec($chStudent);
echo "7. Student State Response: " . $res . "\n";

// Cleanup created quiz
curl_close($ch);
curl_close($chStudent);
if (file_exists($cookieFile)) unlink($cookieFile);
if (file_exists($cookieStudent)) unlink($cookieStudent);

echo "HTTP TEST COMPLETED!\n";
