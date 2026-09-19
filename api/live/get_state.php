<?php
/**
 * Master Real-Time State API Endpoint (Teacher Live Control & Sync)
 * QuizSpark Live Quiz Application
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/live_quiz.php';

header('Content-Type: application/json; charset=utf-8');

$quizId = (int)($_GET['quiz_id'] ?? 0);
if (!$quizId) {
    sendJsonResponse(false, 'Quiz ID is required.', [], 400);
}

try {
    $pdo = getDBConnection();

    // 1. Process server-side live quiz state transitions
    $quiz = processLiveQuizState($pdo, $quizId);

    if (!$quiz) {
        sendJsonResponse(false, 'Quiz not found.', [], 404);
    }

    $currentQuestionNum = (int)$quiz['current_question'];
    $currentQStatus = $quiz['current_question_status'];
    $stateName = getLiveQuizStateName($quiz);
    $question = null;
    $timeRemaining = 0;
    $stats = ['A' => 0, 'B' => 0, 'C' => 0, 'D' => 0, 'total' => 0];
    $now = getMicroTime();

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
            $startTime = (float)($quiz['question_start_time'] ?? 0);
            $timeLimit = (int)$question['time_limit'];
            $elapsed = $startTime > 0 ? max(0, $now - $startTime) : 0;
            $timeRemaining = max(0, round($timeLimit - $elapsed, 2));

            // Fetch answer statistics for teacher display
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

    // 5. Compute Leaderboard countdown
    $leaderboardStartedAt = (float)($quiz['leaderboard_start_time'] ?? 0);
    $nextQuestionAt = (float)($quiz['next_question_at'] ?? 0);
    if ($nextQuestionAt <= 0 && $leaderboardStartedAt > 0) {
        $nextQuestionAt = $leaderboardStartedAt + 5.0;
    }

    $leaderboardRemaining = 0;
    if ($currentQStatus === 'leaderboard' && $nextQuestionAt > 0) {
        $leaderboardRemaining = max(0, ceil($nextQuestionAt - $now));
    }

    // 6. Include live leaderboard data for teacher view
    $leaderboardList = [];
    if ($currentQStatus === 'leaderboard' || $quiz['status'] === 'completed') {
        $lbStmt = $pdo->prepare("
            SELECT 
                p.id, p.name, p.emoji, p.total_score, p.total_time,
                COUNT(CASE WHEN a.is_correct = 1 THEN 1 END) as correct_answers
            FROM `participants` p
            LEFT JOIN `answers` a ON p.id = a.participant_id
            WHERE p.quiz_id = :quiz_id
            GROUP BY p.id
            ORDER BY p.total_score DESC, p.total_time ASC
        ");
        $lbStmt->execute(['quiz_id' => $quizId]);
        $allParticipants = $lbStmt->fetchAll();

        foreach ($allParticipants as $index => $p) {
            $leaderboardList[] = [
                'rank'            => $index + 1,
                'id'              => (int)$p['id'],
                'name'            => $p['name'],
                'emoji'           => $p['emoji'],
                'total_score'     => (int)$p['total_score'],
                'total_time'      => (float)$p['total_time'],
                'correct_answers' => (int)$p['correct_answers']
            ];
        }
    }

    sendJsonResponse(true, 'Live state retrieved.', [
        'quiz' => [
            'id'                      => (int)$quiz['id'],
            'title'                   => $quiz['title'],
            'status'                  => $quiz['status'],
            'state'                   => $stateName,
            'current_question'        => $currentQuestionNum,
            'question_number'         => $currentQuestionNum,
            'current_question_status' => $quiz['current_question_status'],
            'total_questions'         => $totalQuestions,
            'participant_count'       => $participantCount,
            'server_time'             => $now,
            'leaderboard_started_at'  => $leaderboardStartedAt,
            'next_question_at'        => $nextQuestionAt,
            'leaderboard_remaining'   => $leaderboardRemaining
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
            'audio_url'       => $question['audio_url'] ?? null,
            'correct_option'  => $question['correct_option'],
            'time_limit'      => (int)$question['time_limit'],
            'time_remaining'  => $timeRemaining
        ] : null,
        'stats'       => $stats,
        'leaderboard' => $leaderboardList
    ]);

} catch (Exception $e) {
    sendJsonResponse(false, 'Failed to fetch live state: ' . $e->getMessage(), [], 500);
}
