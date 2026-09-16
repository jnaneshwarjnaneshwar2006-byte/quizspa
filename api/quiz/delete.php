<?php
/**
 * Delete Quiz API Endpoint
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

    $stmt = $pdo->prepare("DELETE FROM `quizzes` WHERE `id` = :id AND `teacher_id` = :teacher_id");
    $stmt->execute(['id' => $quizId, 'teacher_id' => $teacherId]);

    if ($stmt->rowCount() > 0) {
        sendJsonResponse(true, 'Quiz deleted successfully.');
    } else {
        sendJsonResponse(false, 'Quiz not found or unauthorized access.', [], 404);
    }
} catch (Exception $e) {
    sendJsonResponse(false, 'Failed to delete quiz: ' . $e->getMessage(), [], 500);
}
