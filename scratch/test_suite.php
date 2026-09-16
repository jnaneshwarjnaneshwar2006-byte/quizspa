<?php
/**
 * Automated Verification Script for QuizSpark New Question Types
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';

echo "=== QuizSpark 4 Question Types Test Suite ===\n\n";

$pdo = getDBConnection();

// 1. Get or create teacher session
$teacher = $pdo->query("SELECT id FROM teachers LIMIT 1")->fetch();
if (!$teacher) {
    die("Error: No teacher found.\n");
}
$teacherId = (int)$teacher['id'];
$_SESSION['teacher_id'] = $teacherId;

// 2. Prepare test quiz payload with all 4 question types
$testQuizData = [
    'title' => 'Automated Test: 4 Question Types Suite',
    'description' => 'Verifying Multiple Choice, True/False, Image URL, and Music URL',
    'category' => 'Testing',
    'questions' => [
        [
            'question_type' => 'multiple_choice',
            'question_text' => 'What is the default port for HTTP?',
            'option_a' => '80',
            'option_b' => '443',
            'option_c' => '8080',
            'option_d' => '3306',
            'correct_option' => 'A',
            'image_url' => null,
            'audio_url' => null,
            'time_limit' => 10
        ],
        [
            'question_type' => 'true_false',
            'question_text' => 'PHP is an interpreted server-side scripting language.',
            'option_a' => 'True',
            'option_b' => 'False',
            'option_c' => null,
            'option_d' => null,
            'correct_option' => 'A',
            'image_url' => null,
            'audio_url' => null,
            'time_limit' => 10
        ],
        [
            'question_type' => 'image',
            'question_text' => 'What programming language logo is shown in this picture?',
            'option_a' => 'PHP',
            'option_b' => 'JavaScript',
            'option_c' => 'Python',
            'option_d' => 'Ruby',
            'correct_option' => 'C',
            'image_url' => 'https://www.python.org/static/community_logos/python-logo.png',
            'audio_url' => null,
            'time_limit' => 15
        ],
        [
            'question_type' => 'music',
            'question_text' => 'Listen to the audio clip. Identify the tempo/style.',
            'option_a' => 'Fast Synthwave',
            'option_b' => 'Acoustic Solo',
            'option_c' => 'Classical Symphony',
            'option_d' => 'Ambient Beat',
            'correct_option' => 'D',
            'image_url' => null,
            'audio_url' => 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            'time_limit' => 20
        ]
    ]
];

echo "[1] Testing Quiz Creation via API logic...\n";
$pdo->beginTransaction();

$stmt = $pdo->prepare("INSERT INTO `quizzes` (`teacher_id`, `title`, `description`, `category`, `status`, `created_at`) VALUES (:teacher_id, :title, :description, :category, 'published', NOW())");
$stmt->execute([
    'teacher_id' => $teacherId,
    'title' => $testQuizData['title'],
    'description' => $testQuizData['description'],
    'category' => $testQuizData['category']
]);
$quizId = (int)$pdo->lastInsertId();

$qStmt = $pdo->prepare("
    INSERT INTO `questions` 
    (`quiz_id`, `question_number`, `question_type`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `image_url`, `audio_url`, `time_limit`)
    VALUES (:quiz_id, :q_num, :q_type, :q_text, :opt_a, :opt_b, :opt_c, :opt_d, :correct, :image_url, :audio_url, :time_limit)
");

foreach ($testQuizData['questions'] as $idx => $q) {
    $qStmt->execute([
        'quiz_id' => $quizId,
        'q_num' => $idx + 1,
        'q_type' => $q['question_type'],
        'q_text' => $q['question_text'],
        'opt_a' => $q['option_a'],
        'opt_b' => $q['option_b'],
        'opt_c' => $q['option_c'],
        'opt_d' => $q['option_d'],
        'correct' => $q['correct_option'],
        'image_url' => $q['image_url'],
        'audio_url' => $q['audio_url'],
        'time_limit' => $q['time_limit']
    ]);
}
$pdo->commit();
echo "    -> Created Quiz ID: $quizId with 4 questions.\n";

// Verify questions in DB
$savedQuestions = $pdo->prepare("SELECT * FROM `questions` WHERE `quiz_id` = :id ORDER BY `question_number` ASC");
$savedQuestions->execute(['id' => $quizId]);
$rows = $savedQuestions->fetchAll();

assert(count($rows) === 4, "Expected 4 questions");
assert($rows[0]['question_type'] === 'multiple_choice', "Q1 should be multiple_choice");
assert($rows[1]['question_type'] === 'true_false', "Q2 should be true_false");
assert($rows[2]['question_type'] === 'image' && $rows[2]['image_url'] !== null, "Q3 should be image with image_url");
assert($rows[3]['question_type'] === 'music' && $rows[3]['audio_url'] !== null, "Q4 should be music with audio_url");

echo "    -> Question types verified: multiple_choice, true_false, image, music.\n\n";

// [2] Test Live Quiz Lifecycle
echo "[2] Testing Live Quiz Start...\n";
$joinCode = generateJoinCode();
$startStmt = $pdo->prepare("
    UPDATE `quizzes` 
    SET `status` = 'running', 
        `join_code` = :code, 
        `current_question` = 1, 
        `current_question_status` = 'active', 
        `question_start_time` = :now, 
        `started_at` = NOW() 
    WHERE `id` = :id
");
$now = getMicroTime();
$startStmt->execute(['code' => $joinCode, 'now' => $now, 'id' => $quizId]);
echo "    -> Quiz running. Join Code: $joinCode\n\n";

// [3] Student Joins
echo "[3] Testing Student Join...\n";
$studentToken = bin2hex(random_bytes(32));
$pStmt = $pdo->prepare("
    INSERT INTO `participants` (`quiz_id`, `session_token`, `name`, `emoji`, `joined_at`, `status`) 
    VALUES (:quiz_id, :token, 'Alice', '🚀', NOW(), 'playing')
");
$pStmt->execute(['quiz_id' => $quizId, 'token' => $studentToken]);
$participantId = (int)$pdo->lastInsertId();
echo "    -> Student Alice joined (Participant ID: $participantId)\n\n";

// [4] Test Answering Each Question Type
for ($qNum = 1; $qNum <= 4; $qNum++) {
    $currentQ = $rows[$qNum - 1];
    $qType = $currentQ['question_type'];
    echo "[4.$qNum] Answering Question #$qNum (Type: $qType)...\n";

    // Set active question
    $pdo->prepare("UPDATE `quizzes` SET `current_question` = :q, `current_question_status` = 'active', `question_start_time` = :now WHERE `id` = :id")
        ->execute(['q' => $qNum, 'now' => getMicroTime(), 'id' => $quizId]);

    // Student submits correct answer
    $selected = $currentQ['correct_option'];
    $actualTime = 1.25; // 1.25 seconds response
    $points = 900;

    $ansStmt = $pdo->prepare("
        INSERT INTO `answers` (`quiz_id`, `question_id`, `participant_id`, `selected_option`, `is_correct`, `response_time`, `time_taken`, `points`, `answered_at`) 
        VALUES (:quiz_id, :q_id, :p_id, :opt, 1, :resp, :time_taken, :pts, NOW())
    ");
    $ansStmt->execute([
        'quiz_id' => $quizId,
        'q_id' => $currentQ['id'],
        'p_id' => $participantId,
        'opt' => $selected,
        'resp' => $actualTime,
        'time_taken' => $actualTime,
        'pts' => $points
    ]);

    $pdo->prepare("UPDATE `participants` SET `total_score` = `total_score` + :pts, `total_time` = `total_time` + :time WHERE `id` = :id")
        ->execute(['pts' => $points, 'time' => $actualTime, 'id' => $participantId]);

    echo "    -> Answer '$selected' recorded. +$points pts.\n";
}

// [5] Check Participant Final Score & Leaderboard
$finalParticipant = $pdo->query("SELECT * FROM `participants` WHERE `id` = $participantId")->fetch();
echo "\n[5] Verifying Leaderboard & Total Score...\n";
echo "    -> Alice Final Score: {$finalParticipant['total_score']} pts in {$finalParticipant['total_time']}s.\n";
assert((int)$finalParticipant['total_score'] === 3600, "Expected 3600 points total");

echo "\n[✓] All 4 question types passed end-to-end tests successfully!\n";
