<?php
/**
 * List Teacher Quizzes API Endpoint
 * fahh Live Quiz Application
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/security.php';

requireTeacherAuth();

try {
    $pdo = getDBConnection();
    $teacherId = getTeacherId();

    $stmt = $pdo->prepare("
        SELECT 
            q.*,
            COUNT(DISTINCT qs.id) as question_count,
            COUNT(DISTINCT p.id) as total_participants
        FROM `quizzes` q
        LEFT JOIN `questions` qs ON q.id = qs.quiz_id
        LEFT JOIN `participants` p ON q.id = p.quiz_id
        WHERE q.teacher_id = :teacher_id
        GROUP BY q.id
        ORDER BY q.created_at DESC
    ");
    $stmt->execute(['teacher_id' => $teacherId]);
    $quizzes = $stmt->fetchAll();

    sendJsonResponse(true, 'Quizzes retrieved.', ['quizzes' => $quizzes]);
} catch (Exception $e) {
    sendJsonResponse(false, 'Failed to retrieve quizzes: ' . $e->getMessage(), [], 500);
}
