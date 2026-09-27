<?php
/**
 * Secure CSV Results Export API Endpoint
 * QuizSpark Live Quiz Application
 * 
 * STRICT ACCESS CONTROL:
 * - Only authenticated Teachers/Creators can export results.
 * - Teachers can ONLY export quizzes they own (teacher_id matches session).
 * - Students, logged-out users, or unauthorized teachers receive HTTP 403 Forbidden.
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/security.php';

// 1. Check Teacher Authentication
if (!isTeacherLoggedIn()) {
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success'    => false,
        'message'    => 'Forbidden: You must be logged in as an authorized teacher to export quiz results.',
        'error_code' => 'AUTH_FORBIDDEN'
    ]);
    exit;
}

$teacherId = getTeacherId();
if (!$teacherId || $teacherId <= 0) {
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success'    => false,
        'message'    => 'Forbidden: Invalid teacher session.',
        'error_code' => 'INVALID_SESSION'
    ]);
    exit;
}

// 2. Validate Quiz ID
$quizId = (int)($_GET['quiz_id'] ?? $_GET['id'] ?? 0);
if ($quizId <= 0) {
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success'    => false,
        'message'    => 'Valid Quiz ID is required.',
        'error_code' => 'INVALID_QUIZ_ID'
    ]);
    exit;
}

try {
    $pdo = getDBConnection();

    // 3. Verify Quiz Existence & Strict Ownership on the SERVER
    $stmt = $pdo->prepare("SELECT `id`, `title`, `status`, `teacher_id` FROM `quizzes` WHERE `id` = :id LIMIT 1");
    $stmt->execute(['id' => $quizId]);
    $quiz = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$quiz) {
        http_response_code(404);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success'    => false,
            'message'    => 'Quiz not found.',
            'error_code' => 'QUIZ_NOT_FOUND'
        ]);
        exit;
    }

    // Strict ownership verification: teacher_id must match current teacher session
    if ((int)$quiz['teacher_id'] !== $teacherId) {
        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success'    => false,
            'message'    => 'Forbidden: You are not authorized to export results for this quiz.',
            'error_code' => 'UNAUTHORIZED_QUIZ_ACCESS'
        ]);
        exit;
    }

    // 4. Fetch Results from quiz_results JOIN participants (or fallback compute from participants)
    $resStmt = $pdo->prepare("
        SELECT 
            r.`rank`,
            p.`name` AS `student_name`,
            r.`total_score`,
            r.`correct_answers`,
            r.`total_questions`,
            r.`total_time`,
            r.`completed_at`
        FROM `quiz_results` r
        JOIN `participants` p ON r.`participant_id` = p.`id`
        WHERE r.`quiz_id` = :quiz_id
        ORDER BY r.`rank` ASC
    ");
    $resStmt->execute(['quiz_id' => $quizId]);
    $results = $resStmt->fetchAll(PDO::FETCH_ASSOC);

    // Fallback: If quiz_results table is empty (e.g. quiz just finished or in progress), query participants directly
    if (empty($results)) {
        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM `questions` WHERE `quiz_id` = :quiz_id");
        $countStmt->execute(['quiz_id' => $quizId]);
        $totalQuestions = (int)$countStmt->fetchColumn();

        $pStmt = $pdo->prepare("
            SELECT 
                p.`id`,
                p.`name` AS `student_name`,
                p.`total_score`,
                p.`total_time`,
                COUNT(CASE WHEN a.`is_correct` = 1 THEN 1 END) AS `correct_answers`
            FROM `participants` p
            LEFT JOIN `answers` a ON p.`id` = a.`participant_id`
            WHERE p.`quiz_id` = :quiz_id
            GROUP BY p.`id`
            ORDER BY p.`total_score` DESC, p.`total_time` ASC
        ");
        $pStmt->execute(['quiz_id' => $quizId]);
        $pRows = $pStmt->fetchAll(PDO::FETCH_ASSOC);

        $results = [];
        foreach ($pRows as $idx => $pr) {
            $results[] = [
                'rank'            => $idx + 1,
                'student_name'    => $pr['student_name'],
                'total_score'     => (int)$pr['total_score'],
                'correct_answers' => (int)$pr['correct_answers'],
                'total_questions' => $totalQuestions,
                'total_time'      => (float)$pr['total_time'],
                'completed_at'    => date('Y-m-d H:i:s')
            ];
        }
    }

    // 5. Output CSV stream with headers
    $safeTitle = preg_replace('/[^a-zA-Z0-9_-]/', '_', $quiz['title'] ?: 'quiz');
    $filename = "quizspark_{$safeTitle}_results_" . date('Ymd_His') . ".csv";

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Pragma: no-cache');
    header('Expires: 0');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');

    $output = fopen('php://output', 'w');

    // UTF-8 BOM for Excel compatibility
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

    // Header Row
    fputcsv($output, [
        'Rank',
        'Student Name',
        'Total Score',
        'Correct Answers',
        'Total Questions',
        'Accuracy (%)',
        'Total Time (seconds)',
        'Completed At'
    ]);

    // Data Rows
    foreach ($results as $row) {
        $totalQ = (int)($row['total_questions'] ?? 0);
        $correct = (int)($row['correct_answers'] ?? 0);
        $accuracy = $totalQ > 0 ? round(($correct / $totalQ) * 100, 1) : 0;

        fputcsv($output, [
            $row['rank'],
            $row['student_name'],
            $row['total_score'],
            $correct,
            $totalQ,
            $accuracy . '%',
            number_format((float)($row['total_time'] ?? 0), 2, '.', ''),
            $row['completed_at'] ?? ''
        ]);
    }

    fclose($output);
    exit;

} catch (Throwable $e) {
    error_log("[QuizSpark CSV Export Error] Quiz {$quizId}: " . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success'    => false,
        'message'    => 'An error occurred while generating the CSV report.',
        'error_code' => 'SERVER_ERROR'
    ]);
    exit;
}
