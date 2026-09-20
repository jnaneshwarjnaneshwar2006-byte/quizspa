<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/avatar.php';

echo "=== Running QuizSpark Live Lobby & Avatar Validation Tests ===\n\n";

// Test 1: Whitelist Verification (No Neutral)
echo "Test 1: Verifying Avatar Whitelist...\n";
$whitelists = getAvatarWhitelists();
assert(!in_array('neutral', $whitelists['style']), "Neutral style should not be in whitelist");
assert(in_array('boy', $whitelists['style']), "Boy style must be in whitelist");
assert(in_array('girl', $whitelists['style']), "Girl style must be in whitelist");
echo "  [PASS] Whitelist contains only Boy and Girl.\n\n";

// Test 2: Database Column Check
echo "Test 2: Verifying `avatar_data` column in `participants` table...\n";
$pdo = getDBConnection();
$cols = $pdo->query("SHOW COLUMNS FROM `participants`")->fetchAll(PDO::FETCH_COLUMN);
assert(in_array('avatar_data', $cols), "`avatar_data` column must exist in `participants` table");
echo "  [PASS] `avatar_data` column exists in database.\n\n";

// Test 3: Avatar Validation & Sanitization
echo "Test 3: Testing Avatar Sanitization...\n";
$boyConfig = getAvatarDefaultConfig('boy');
$cleanBoy = json_decode(validateAndSanitizeAvatar($boyConfig), true);
assert($cleanBoy['style'] === 'boy', "Boy style mismatch");

$girlConfig = getAvatarDefaultConfig('girl');
$cleanGirl = json_decode(validateAndSanitizeAvatar($girlConfig), true);
assert($cleanGirl['style'] === 'girl', "Girl style mismatch");

// If neutral is passed into validator, it should safely normalize to 'boy'
$fakeNeutral = ['style' => 'neutral', 'hair' => 'hair_boy_fade'];
$cleanNormalized = json_decode(validateAndSanitizeAvatar($fakeNeutral), true);
assert($cleanNormalized['style'] === 'boy', "Neutral must normalize to boy");
echo "  [PASS] Avatar configuration sanitization verified.\n\n";

// Test 4: Participant Insert & Select (Simulate Student Join)
echo "Test 4: Simulating Participant Join Query...\n";
$quizStmt = $pdo->query("SELECT id, join_code FROM quizzes WHERE status != 'completed' LIMIT 1");
$quiz = $quizStmt->fetch();
assert(!empty($quiz), "A test quiz must exist");

$token = "test_token_" . time() . "_" . rand(1000, 9999);
$name = "Test Astronaut";
$avatarJson = json_encode($cleanBoy);

$insStmt = $pdo->prepare("
    INSERT INTO `participants` (`quiz_id`, `session_token`, `name`, `emoji`, `avatar_data`, `joined_at`, `status`) 
    VALUES (:quiz_id, :token, :name, '👦', :avatar_data, NOW(), 'joined')
");
$insStmt->execute([
    'quiz_id'     => $quiz['id'],
    'token'       => $token,
    'name'        => $name,
    'avatar_data' => $avatarJson
]);
$pId = (int)$pdo->lastInsertId();
assert($pId > 0, "Insert participant failed");

// Test 5: Verify Select Query in Live Lobby
echo "Test 5: Testing Live Lobby Participant Query...\n";
$pStmt = $pdo->prepare("SELECT `id`, `name`, `emoji`, `avatar_data`, `total_score`, `total_time`, `joined_at`, `status` FROM `participants` WHERE `id` = :id LIMIT 1");
$pStmt->execute(['id' => $pId]);
$fetched = $pStmt->fetch();
assert(!empty($fetched), "Failed to fetch inserted participant");
assert(!empty($fetched['avatar_data']), "Fetched participant avatar_data is empty");

$parsedAvatar = getParticipantAvatarData($fetched);
assert($parsedAvatar['style'] === 'boy', "Parsed avatar style mismatch");
echo "  [PASS] Participant inserted and retrieved with avatar_data successfully without SQL error.\n\n";

// Cleanup test participant
$pdo->prepare("DELETE FROM `participants` WHERE `id` = :id")->execute(['id' => $pId]);

echo "=== ALL UNIT & DATABASE TESTS PASSED SUCCESSFULLY! ===\n";
