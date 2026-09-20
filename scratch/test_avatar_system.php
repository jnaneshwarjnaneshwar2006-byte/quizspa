<?php
/**
 * Automated Verification Test for QuizSpark 3D Avatar System
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/avatar.php';

echo "=== QuizSpark 3D Avatar System Automated Test ===\n\n";

$pdo = getDBConnection();

// Test 1: Config Whitelist Validation
echo "Test 1: Testing Config Whitelists and Sanitization...\n";
$sampleBoy = getAvatarDefaultConfig('boy');
$sanitizedBoyJson = validateAndSanitizeAvatar($sampleBoy);
$sanitizedBoy = json_decode($sanitizedBoyJson, true);

assert($sanitizedBoy['style'] === 'boy', "Boy style match failed");
assert(!empty($sanitizedBoy['hair']), "Hair should not be empty");
assert(!empty($sanitizedBoy['skin']), "Skin should not be empty");

$tampered = [
    'style' => 'alien_monster',
    'hair' => 'hacked_hair_script',
    'skin' => 'fake_skin_hack',
    'face' => 'face_oval',
    'top' => 'top_hoodie',
    'topColor' => 'purple'
];
$sanitizedTamperedJson = validateAndSanitizeAvatar($tampered);
$sanitizedTampered = json_decode($sanitizedTamperedJson, true);
assert($sanitizedTampered['style'] === 'boy', "Fallback to default style failed");
assert($sanitizedTampered['hair'] === 'hair_boy_fade', "Invalid hair fallback failed");
assert($sanitizedTampered['skin'] === 'skin_04', "Invalid skin fallback failed");
echo "  [PASS] Whitelist sanitization and fallback working correctly.\n\n";

// Test 2: Database Schema
echo "Test 2: Verifying database column `avatar_data` in `participants` table...\n";
$colStmt = $pdo->query("SHOW COLUMNS FROM `participants` LIKE 'avatar_data'");
$col = $colStmt->fetch();
assert(!empty($col), "Column `avatar_data` not found in `participants` table!");
echo "  [PASS] `avatar_data` column verified in MySQL table: " . $col['Field'] . " (" . $col['Type'] . ")\n\n";

// Test 3: Legacy Fallback Verification
echo "Test 3: Verifying legacy participant avatar fallback...\n";
$legacyRecord = [
    'id' => 999,
    'name' => 'Legacy Student',
    'emoji' => '👧',
    'avatar_data' => null
];
$fallbackData = getParticipantAvatarData($legacyRecord);
assert($fallbackData['style'] === 'girl', "Legacy emoji girl fallback failed");
assert(!empty($fallbackData['hair']), "Fallback avatar data must be complete");
echo "  [PASS] Legacy participant fallback successfully created 3D avatar structure.\n\n";

// Test 4: Full Join Flow via API simulation
echo "Test 4: Creating a test quiz & joining student with custom 3D avatar...\n";
// Find or create a test quiz
$qStmt = $pdo->query("SELECT id, join_code FROM `quizzes` WHERE `status` = 'published' LIMIT 1");
$testQuiz = $qStmt->fetch();

if (!$testQuiz) {
    // Look for any quiz
    $qStmt = $pdo->query("SELECT id, join_code FROM `quizzes` LIMIT 1");
    $testQuiz = $qStmt->fetch();
}

if (!$testQuiz) {
    echo "  [SKIP] No quiz found in DB to test API join.\n";
} else {
    $quizId = (int)$testQuiz['id'];
    $joinCode = $testQuiz['join_code'];
    echo "  Testing with Quiz ID: $quizId (Code: $joinCode)\n";

    $customAvatar = [
        'style' => 'girl',
        'body' => 'regular',
        'skin' => 'skin_03',
        'face' => 'face_oval',
        'hair' => 'hair_girl_curly',
        'hairColor' => 'auburn',
        'eyes' => 'eyes_large',
        'eyeColor' => 'green',
        'eyebrows' => 'brows_curved',
        'nose' => 'nose_small',
        'mouth' => 'mouth_big_smile',
        'facialHair' => 'none',
        'top' => 'top_casual',
        'topColor' => 'purple',
        'bottom' => 'bottom_jeans',
        'bottomColor' => 'denim',
        'dress' => 'none',
        'dressColor' => 'pink',
        'shoes' => 'shoes_sneakers',
        'shoeColor' => 'white',
        'headwear' => 'headwear_crown',
        'glasses' => 'none',
        'accessory' => 'acc_necklace',
        'specialItem' => 'item_trophy'
    ];

    $avatarJson = validateAndSanitizeAvatar($customAvatar);
    $token = bin2hex(random_bytes(16));

    $insStmt = $pdo->prepare("
        INSERT INTO `participants` (`quiz_id`, `session_token`, `name`, `emoji`, `avatar_data`, `status`, `joined_at`)
        VALUES (:quiz_id, :token, :name, :emoji, :avatar_data, 'joined', NOW())
    ");
    $insStmt->execute([
        'quiz_id' => $quizId,
        'token' => $token,
        'name' => 'AutoTest Player',
        'emoji' => '👧',
        'avatar_data' => $avatarJson
    ]);
    $participantId = (int)$pdo->lastInsertId();

    // Verify stored data
    $fetchStmt = $pdo->prepare("SELECT * FROM `participants` WHERE `id` = :id");
    $fetchStmt->execute(['id' => $participantId]);
    $savedP = $fetchStmt->fetch();

    $parsedAvatar = getParticipantAvatarData($savedP);
    assert($parsedAvatar['hair'] === 'hair_girl_curly', "Stored hair does not match: " . ($parsedAvatar['hair'] ?? 'null'));
    assert($parsedAvatar['skin'] === 'skin_03', "Stored skin does not match");
    assert($parsedAvatar['specialItem'] === 'item_trophy', "Stored specialItem does not match");

    echo "  [PASS] Student with 3D avatar successfully inserted and retrieved (ID: $participantId).\n";

    // Clean up test participant
    $pdo->prepare("DELETE FROM `participants` WHERE `id` = :id")->execute(['id' => $participantId]);
    echo "  [CLEANUP] Test participant removed.\n\n";
}

echo "=== ALL 3D AVATAR SYSTEM BACKEND TESTS PASSED! ===\n";
