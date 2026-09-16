<?php
/**
 * Master Real-Time State API Endpoint (Teacher & Student Sync)
 * fahh Live Quiz Application
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/security.php';

$quizId = (int)($_GET['quiz_id'] ?? 0);
if (!$quizId) {
    sendJsonResponse(false, 'Quiz ID is required.', [], 400);
}

try {
    $pdo = getDBConnection();

    // 1. Fetch Quiz
    $stmt = $pdo->prepare("SELECT * FROM `quizzes` WHERE `id` = :id LIMIT 1");
    $stmt->execute(['id' => $quizId]);
    $quiz = $stmt->fetch();

    if (!$quiz) {
        sendJsonResponse(false, 'Quiz not found.', [], 404);
    }

    $currentQuestionNum = (int)$quiz['current_question'];
    $currentQStatus = $quiz['current_question_status'];
    $question = null;
    $timeRemaining = 0;
    $stats = ['A' => 0, 'B' => 0, 'C' => 0, 'D' => 0, 'total' => 0];

    // 2. Fetch Total Questions count
    $qCountStmt = $pdo->prepare("SELECT COUNT(*) as total FROM `questions` WHERE `quiz_id` = :quiz_id");
    $qCountStmt->execute(['quiz_id' => $quizId]);
    $totalQuestions = (int)($qCountStmt->fetch()['total'] ?? 0);

    // 3. Fetch Current Question details
    if ($currentQuestionNum > 0) {
        $qStmt = $pdo->prepare("SELECT * FROM `questions` WHERE `quiz_id` = :quiz_id AND `question_number` = :q_num LIMIT 1");
        $qStmt->execute(['quiz_id' => $quizId, 'q_num' => $currentQuestionNum]);
        $question = $qStmt->fetch();

        if ($question) {
            $startTime = (float)$quiz['question_start_time'];
            $timeLimit = (int)$question['time_limit'];
            $now = getMicroTime();

            $elapsed = max(0, $now - $startTime);
            $timeRemaining = max(0, round($timeLimit - $elapsed, 2));

            // Auto-expire question if timer reached 0 and still marked 'active'
            if ($timeRemaining <= 0 && $currentQStatus === 'active') {
                $upd = $pdo->prepare("UPDATE `quizzes` SET `current_question_status` = 'ended' WHERE `id` = :id");
                $upd->execute(['id' => $quizId]);
                $quiz['current_question_status'] = 'ended';
                $currentQStatus = 'ended';
            }

            // Fetch answer statistics for teacher / display
            $ansStmt = $pdo->prepare("
                SELECT selected_option, COUNT(*) as count 
                FROM `answers` 
                WHERE `question_id` = :q_id 
                GROUP BY selected_option
            ");
            $ansStmt->execute(['q_id' => $question['id']]);
            $ansRows = $ansStmt->fetchAll();

            foreach ($ansRows as $row) {
                if ($row['selected_option'] && isset($stats[$row['selected_option']])) {
                    $stats[$row['selected_option']] = (int)$row['count'];
                    $stats['total'] += (int)$row['count'];
                }
            }
        }
    }

    // 4. Fetch Participant Count
    $pCountStmt = $pdo->prepare("SELECT COUNT(*) as count FROM `participants` WHERE `quiz_id` = :quiz_id");
    $pCountStmt->execute(['quiz_id' => $quizId]);
    $participantCount = (int)($pCountStmt->fetch()['count'] ?? 0);

    sendJsonResponse(true, 'Live state retrieved.', [
        'quiz' => [
            'id'                      => (int)$quiz['id'],
            'title'                   => $quiz['title'],
            'status'                  => $quiz['status'],
            'current_question'        => $currentQuestionNum,
            'current_question_status' => $quiz['current_question_status'],
            'total_questions'         => $totalQuestions,
            'participant_count'       => $participantCount
        ],
        'question' => $question ? [
            'id'              => (int)$question['id'],
            'question_number' => (int)$question['question_number'],
            'question_type'   => $question['question_type'] ?? 'multiple_choice',
            'question_text'   => $question['question_text'],
            'option_a'        => $question['option_a'],
            'option_b'        => $question['option_b'],
            'option_c'        => $question['option_c'],
            'option_d'        => $question['option_d'],
            'image_url'       => $question['image_url'] ?? null,
            'correct_option'  => ($currentQStatus === 'ended' || isTeacherLoggedIn()) ? $question['correct_option'] : null,
            'time_limit'      => (int)$question['time_limit'],
            'time_remaining'  => $timeRemaining
        ] : null,
        'stats' => $stats
    ]);

} catch (Exception $e) {
    sendJsonResponse(false, 'Failed to fetch live state: ' . $e->getMessage(), [], 500);
}
