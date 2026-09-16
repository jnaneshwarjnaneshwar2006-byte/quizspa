<?php
/**
 * Student-Specific Real-Time State API Endpoint
 * fahh Live Quiz Application
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/security.php';

$quizId = (int)($_GET['quiz_id'] ?? 0);
$token = getStudentToken();

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

    // 2. Fetch Total Questions
    $qCountStmt = $pdo->prepare("SELECT COUNT(*) as total FROM `questions` WHERE `quiz_id` = :quiz_id");
    $qCountStmt->execute(['quiz_id' => $quizId]);
    $totalQuestions = (int)($qCountStmt->fetch()['total'] ?? 0);

    // 3. Fetch Current Question
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

            if ($timeRemaining <= 0 && $currentQStatus === 'active') {
                $upd = $pdo->prepare("UPDATE `quizzes` SET `current_question_status` = 'ended' WHERE `id` = :id");
                $upd->execute(['id' => $quizId]);
                $quiz['current_question_status'] = 'ended';
                $currentQStatus = 'ended';
            }
        }
    }

    // 4. Fetch Participant Details & Answer for current question
    $participant = null;
    $myAnswer = null;

    if ($token) {
        $pStmt = $pdo->prepare("SELECT * FROM `participants` WHERE `session_token` = :token AND `quiz_id` = :quiz_id LIMIT 1");
        $pStmt->execute(['token' => $token, 'quiz_id' => $quizId]);
        $participant = $pStmt->fetch();

        if ($participant && $question) {
            $ansStmt = $pdo->prepare("SELECT * FROM `answers` WHERE `question_id` = :q_id AND `participant_id` = :p_id LIMIT 1");
            $ansStmt->execute(['q_id' => $question['id'], 'p_id' => $participant['id']]);
            $myAnswer = $ansStmt->fetch();
        }
    }

    sendJsonResponse(true, 'Student state retrieved.', [
        'quiz' => [
            'id'                      => (int)$quiz['id'],
            'title'                   => $quiz['title'],
            'status'                  => $quiz['status'],
            'current_question'        => $currentQuestionNum,
            'current_question_status' => $quiz['current_question_status'],
            'total_questions'         => $totalQuestions
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
            'correct_option'  => ($currentQStatus === 'ended' || $currentQStatus === 'leaderboard') ? $question['correct_option'] : null,
            'time_limit'      => (int)$question['time_limit'],
            'time_remaining'  => $timeRemaining
        ] : null,
        'student' => $participant ? [
            'id'          => (int)$participant['id'],
            'name'        => $participant['name'],
            'emoji'       => $participant['emoji'],
            'total_score' => (int)$participant['total_score'],
            'total_time'  => (float)$participant['total_time']
        ] : null,
        'my_answer' => $myAnswer ? [
            'selected_option' => $myAnswer['selected_option'],
            'is_correct'      => (bool)$myAnswer['is_correct'],
            'points'          => (int)$myAnswer['points']
        ] : null
    ]);

} catch (Exception $e) {
    sendJsonResponse(false, 'Failed to fetch student state: ' . $e->getMessage(), [], 500);
}
