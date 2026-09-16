<?php
/**
 * Publish Quiz API Endpoint
 * fahh Live Quiz Application
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/security.php';

requireTeacherAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, 'Invalid request method.', [], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$quizId = (int)($input['quiz_id'] ?? 0);

if (!$quizId) {
    sendJsonResponse(false, 'Quiz ID is required.', [], 400);
}

try {
    $pdo = getDBConnection();
    $teacherId = getTeacherId();

    // Verify ownership & question count
    $stmt = $pdo->prepare("SELECT q.*, COUNT(qs.id) as question_count FROM `quizzes` q LEFT JOIN `questions` qs ON q.id = qs.quiz_id WHERE q.id = :id AND q.teacher_id = :teacher_id GROUP BY q.id");
    $stmt->execute(['id' => $quizId, 'teacher_id' => $teacherId]);
    $quiz = $stmt->fetch();

    if (!$quiz) {
        sendJsonResponse(false, 'Quiz not found or unauthorized.', [], 404);
    }

    if ((int)$quiz['question_count'] === 0) {
        sendJsonResponse(false, 'Cannot publish a quiz without questions. Please add questions first.', [], 400);
    }

    // Generate unique 6-digit numeric join code if not already assigned
    $joinCode = $quiz['join_code'];
    if (empty($joinCode)) {
        do {
            $candidateCode = generateJoinCode();
            $codeCheck = $pdo->prepare("SELECT `id` FROM `quizzes` WHERE `join_code` = :code AND `status` IN ('published', 'lobby', 'running')");
            $codeCheck->execute(['code' => $candidateCode]);
        } while ($codeCheck->fetch());
        $joinCode = $candidateCode;
    }

    // Generate Join URL dynamically using getBaseUrl()
    $joinUrl = getBaseUrl() . '/student/join.php?code=' . $joinCode;

    // Update Quiz Status
    $updateStmt = $pdo->prepare("UPDATE `quizzes` SET `status` = 'published', `join_code` = :join_code, `join_url` = :join_url, `published_at` = NOW() WHERE `id` = :id");
    $updateStmt->execute([
        'join_code' => $joinCode,
        'join_url'  => $joinUrl,
        'id'        => $quizId
    ]);

    sendJsonResponse(true, 'Quiz published successfully!', [
        'quiz_id'   => $quizId,
        'title'     => $quiz['title'],
        'join_code' => $joinCode,
        'join_url'  => $joinUrl
    ]);

} catch (Exception $e) {
    sendJsonResponse(false, 'Failed to publish quiz: ' . $e->getMessage(), [], 500);
}
