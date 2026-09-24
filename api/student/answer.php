<?php
/**
 * Student Answer Submission API Endpoint
 * QuizSpark Live Quiz Application
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../../config/live_quiz.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, 'Invalid request method.', [], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) $input = $_POST;

$quizId = (int)($input['quiz_id'] ?? 0);
$qNum = (int)($input['question_number'] ?? 0);
$selectedOption = strtoupper(trim($input['selected_option'] ?? ''));

$token = getStudentToken();
if (!$token) {
    $token = trim((string)($input['token'] ?? $input['session_token'] ?? $_GET['token'] ?? ''));
    if ($token) {
        setStudentToken($token);
    }
}
if (!$token) {
    sendJsonResponse(false, 'Student session token missing. Please re-join.', [], 401);
}

if (!$quizId || !$qNum || !in_array($selectedOption, ['A', 'B', 'C', 'D'])) {
    sendJsonResponse(false, 'Invalid option selection or parameters.', [], 400);
}

try {
    $pdo = getDBConnection();

    // 1. Fetch Participant
    $pStmt = $pdo->prepare("SELECT * FROM `participants` WHERE `session_token` = :token AND `quiz_id` = :quiz_id LIMIT 1");
    $pStmt->execute(['token' => $token, 'quiz_id' => $quizId]);
    $participant = $pStmt->fetch();

    if (!$participant) {
        sendJsonResponse(false, 'Participant session not found.', [], 404);
    }

    $participantId = (int)$participant['id'];

    // 2. Fetch Quiz State (also processes any pending transitions)
    $quiz = processLiveQuizState($pdo, $quizId);

    if (!$quiz || $quiz['status'] !== 'running' || $quiz['current_question_status'] !== 'active') {
        sendJsonResponse(false, 'Question is not currently active for answering.', [], 400);
    }

    // Verify submitted question matches current active question
    if ((int)$quiz['current_question'] !== $qNum) {
        sendJsonResponse(false, 'Submitted question number does not match current active question.', [], 400);
    }

    // 3. Fetch Question Details
    $qStmt = $pdo->prepare("SELECT * FROM `questions` WHERE `quiz_id` = :quiz_id AND `question_number` = :q_num LIMIT 1");
    $qStmt->execute(['quiz_id' => $quizId, 'q_num' => $qNum]);
    $question = $qStmt->fetch();

    if (!$question) {
        sendJsonResponse(false, 'Question not found.', [], 404);
    }

    $questionId = (int)$question['id'];

    // 4. Server-Side Timer Validation
    $now = getMicroTime();
    $startTime = (float)$quiz['question_start_time'];
    $timeLimit = (int)$question['time_limit'];

    $actualTimeTaken = max(0.1, round($now - $startTime, 2));

    // Allow 1.0s buffer for network latency
    if ($actualTimeTaken > ($timeLimit + 1.0)) {
        // Time expired; auto transition to leaderboard if not already
        transitionToLeaderboard($pdo, $quizId, 'Answer submitted after timer expired');
        sendJsonResponse(false, 'Time expired. Answer submitted too late!', [
            'is_correct' => false,
            'points'     => 0,
            'time_taken' => $actualTimeTaken
        ], 400);
    }

    // 5. Evaluate Correctness & Calculate Score
    $isCorrect = ($selectedOption === $question['correct_option']) ? 1 : 0;
    $points = 0;

    if ($isCorrect) {
        // Kahoot Speed Score: max 1000 pts down to min 100 pts
        $remainingRatio = max(0.1, ($timeLimit - min($actualTimeTaken, $timeLimit)) / $timeLimit);
        $points = max(100, (int)round(1000 * $remainingRatio));
    }

    $pdo->beginTransaction();

    // 6. Insert Answer (Duplicate protection via UNIQUE KEY)
    try {
        $ansIns = $pdo->prepare("
            INSERT INTO `answers` 
            (`quiz_id`, `question_id`, `participant_id`, `selected_option`, `is_correct`, `response_time`, `time_taken`, `points`, `answered_at`) 
            VALUES (:quiz_id, :q_id, :p_id, :option, :correct, :resp_time, :time_taken, :pts, NOW())
        ");
        $ansIns->execute([
            'quiz_id'    => $quizId,
            'q_id'       => $questionId,
            'p_id'       => $participantId,
            'option'     => $selectedOption,
            'correct'    => $isCorrect,
            'resp_time'  => $actualTimeTaken,
            'time_taken' => $actualTimeTaken,
            'pts'        => $points
        ]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        if ($e->getCode() == '23000') {
            sendJsonResponse(false, 'You have already submitted an answer for this question.', [], 400);
        }
        throw $e;
    }

    // 7. Update Participant Total Score & Total Time
    $updP = $pdo->prepare("
        UPDATE `participants` 
        SET `total_score` = `total_score` + :pts, 
            `total_time` = `total_time` + :time_taken,
            `last_seen` = NOW() 
        WHERE `id` = :id
    ");
    $updP->execute([
        'pts'        => $points,
        'time_taken' => $actualTimeTaken,
        'id'         => $participantId
    ]);

    $pdo->commit();

    // 8. Check if ALL active participants have now answered
    $pCountStmt = $pdo->prepare("SELECT COUNT(*) AS total FROM `participants` WHERE `quiz_id` = :quiz_id");
    $pCountStmt->execute(['quiz_id' => $quizId]);
    $participantCount = (int)($pCountStmt->fetch()['total'] ?? 0);

    $ansCountStmt = $pdo->prepare("SELECT COUNT(*) AS total FROM `answers` WHERE `quiz_id` = :quiz_id AND `question_id` = :q_id");
    $ansCountStmt->execute(['quiz_id' => $quizId, 'q_id' => $questionId]);
    $answeredCount = (int)($ansCountStmt->fetch()['total'] ?? 0);

    $questionEnded = false;
    if ($participantCount > 0 && $answeredCount >= $participantCount) {
        $questionEnded = transitionToLeaderboard(
            $pdo,
            $quizId,
            "All {$answeredCount}/{$participantCount} answers received"
        );
    }

    sendJsonResponse(true, 'Answer submitted successfully!', [
        'is_correct'     => (bool)$isCorrect,
        'points'         => $points,
        'time_taken'     => $actualTimeTaken,
        'question_ended' => $questionEnded,
        'answered_count' => $answeredCount,
        'total_players'  => $participantCount
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendJsonResponse(false, 'Failed to process answer: ' . $e->getMessage(), [], 500);
}
