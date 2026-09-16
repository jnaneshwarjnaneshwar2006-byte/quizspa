<?php
/**
 * Update Quiz API Endpoint
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
$title = sanitizeString($input['title'] ?? '');
$description = sanitizeString($input['description'] ?? '');
$category = sanitizeString($input['category'] ?? 'General');
$questions = $input['questions'] ?? [];

if (!$quizId || empty($title)) {
    sendJsonResponse(false, 'Valid quiz ID and title are required.', [], 400);
}

if (!is_array($questions) || count($questions) === 0) {
    sendJsonResponse(false, 'At least one question is required.', [], 400);
}

try {
    $pdo = getDBConnection();
    $teacherId = getTeacherId();

    // Verify ownership
    $checkStmt = $pdo->prepare("SELECT `id` FROM `quizzes` WHERE `id` = :id AND `teacher_id` = :teacher_id");
    $checkStmt->execute(['id' => $quizId, 'teacher_id' => $teacherId]);
    if (!$checkStmt->fetch()) {
        sendJsonResponse(false, 'Quiz not found or unauthorized access.', [], 403);
    }

    $pdo->beginTransaction();

    // Update Quiz Metadata
    $stmt = $pdo->prepare("UPDATE `quizzes` SET `title` = :title, `description` = :description, `category` = :category WHERE `id` = :id");
    $stmt->execute([
        'title'       => $title,
        'description' => $description,
        'category'    => $category,
        'id'          => $quizId
    ]);

    // Replace Questions
    $delStmt = $pdo->prepare("DELETE FROM `questions` WHERE `quiz_id` = :quiz_id");
    $delStmt->execute(['quiz_id' => $quizId]);

    $qStmt = $pdo->prepare("
        INSERT INTO `questions` 
        (`quiz_id`, `question_number`, `question_type`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `image_url`, `audio_url`, `time_limit`)
        VALUES (:quiz_id, :q_num, :q_type, :q_text, :opt_a, :opt_b, :opt_c, :opt_d, :correct, :image_url, :audio_url, :time_limit)
    ");

    foreach ($questions as $idx => $q) {
        $qText = sanitizeString($q['question_text'] ?? '');
        $qType = $q['question_type'] ?? 'multiple_choice';
        if (!in_array($qType, ['multiple_choice', 'true_false', 'image', 'music'], true)) {
            $qType = 'multiple_choice';
        }
        $imageUrl = !empty($q['image_url']) ? sanitizeString($q['image_url']) : null;
        $audioUrl = !empty($q['audio_url']) ? sanitizeString($q['audio_url']) : null;
        $correct = strtoupper(trim($q['correct_option'] ?? 'A'));
        $timeLimit = (int)($q['time_limit'] ?? 10);

        if ($qType === 'true_false') {
            $optA = 'True';
            $optB = 'False';
            $optC = null;
            $optD = null;
            if (!in_array($correct, ['A', 'B'])) {
                $correct = 'A';
            }
            if (empty($qText)) {
                $pdo->rollBack();
                sendJsonResponse(false, "Question #" . ($idx + 1) . " has incomplete text.", [], 400);
            }
        } else {
            $optA = sanitizeString($q['option_a'] ?? '');
            $optB = sanitizeString($q['option_b'] ?? '');
            $optC = sanitizeString($q['option_c'] ?? '');
            $optD = sanitizeString($q['option_d'] ?? '');
            if (!in_array($correct, ['A', 'B', 'C', 'D'])) {
                $correct = 'A';
            }
            if (empty($qText) || empty($optA) || empty($optB) || empty($optC) || empty($optD)) {
                $pdo->rollBack();
                sendJsonResponse(false, "Question #" . ($idx + 1) . " has incomplete text or options.", [], 400);
            }
        }

        if ($qType === 'image' && empty($imageUrl)) {
            $pdo->rollBack();
            sendJsonResponse(false, "Question #" . ($idx + 1) . " requires an image URL.", [], 400);
        }
        if ($qType === 'music' && empty($audioUrl)) {
            $pdo->rollBack();
            sendJsonResponse(false, "Question #" . ($idx + 1) . " requires an audio URL.", [], 400);
        }
        if ($qType === 'image' && !isValidMediaUrl($imageUrl)) {
            $pdo->rollBack();
            sendJsonResponse(false, "Question #" . ($idx + 1) . " has an invalid image URL.", [], 400);
        }
        if ($qType === 'music' && !isValidMediaUrl($audioUrl)) {
            $pdo->rollBack();
            sendJsonResponse(false, "Question #" . ($idx + 1) . " has an invalid audio URL.", [], 400);
        }

        $qStmt->execute([
            'quiz_id'    => $quizId,
            'q_num'      => $idx + 1,
            'q_type'     => $qType,
            'q_text'     => $qText,
            'opt_a'      => $optA,
            'opt_b'      => $optB,
            'opt_c'      => $optC,
            'opt_d'      => $optD,
            'correct'    => $correct,
            'image_url'  => $imageUrl,
            'audio_url'  => $audioUrl,
            'time_limit' => $timeLimit
        ]);
    }

    $pdo->commit();

    sendJsonResponse(true, 'Quiz updated successfully!', ['quiz_id' => $quizId]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendJsonResponse(false, 'Failed to update quiz: ' . $e->getMessage(), [], 500);
}
