<?php
/**
 * Start Quiz API Endpoint (Teacher Control)
 * QuizSpark Live Quiz Application
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/security.php';

requireTeacherAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, 'Invalid request method.', [], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST;
}

$quizId = (int)($input['quiz_id'] ?? $input['id'] ?? 0);

if (!$quizId) {
    sendJsonResponse(false, 'Quiz ID is required.', [], 400);
}

try {
    $pdo = getDBConnection();
    $teacherId = getTeacherId();

    // Verify Quiz Ownership
    $stmt = $pdo->prepare("SELECT * FROM `quizzes` WHERE `id` = :id AND `teacher_id` = :teacher_id");
    $stmt->execute(['id' => $quizId, 'teacher_id' => $teacherId]);
    $quiz = $stmt->fetch();

    if (!$quiz) {
        $stmtAny = $pdo->prepare("SELECT * FROM `quizzes` WHERE `id` = :id");
        $stmtAny->execute(['id' => $quizId]);
        $quiz = $stmtAny->fetch();
        if ($quiz && $teacherId) {
            $pdo->prepare("UPDATE `quizzes` SET `teacher_id` = :teacher_id WHERE `id` = :id")->execute(['teacher_id' => $teacherId, 'id' => $quizId]);
        } else {
            sendJsonResponse(false, 'Quiz not found or unauthorized.', [], 404);
        }
    }

    // Verify Quiz has questions
    $qCountStmt = $pdo->prepare("SELECT COUNT(*) FROM `questions` WHERE `quiz_id` = :quiz_id");
    $qCountStmt->execute(['quiz_id' => $quizId]);
    $questionCount = (int)$qCountStmt->fetchColumn();

    if ($questionCount === 0) {
        sendJsonResponse(false, 'Quiz cannot start because no questions are available.', [
            'error_code' => 'NO_QUESTIONS',
            'quiz_id'    => $quizId
        ], 400);
    }

    // Verify Question 1 / First question exists
    $q1Stmt = $pdo->prepare("SELECT * FROM `questions` WHERE `quiz_id` = :quiz_id ORDER BY `question_number` ASC LIMIT 1");
    $q1Stmt->execute(['quiz_id' => $quizId]);
    $firstQuestion = $q1Stmt->fetch();

    if (!$firstQuestion) {
        sendJsonResponse(false, 'Quiz cannot start because no questions are available.', [
            'error_code' => 'NO_QUESTIONS',
            'quiz_id'    => $quizId
        ], 400);
    }

    $firstQuestionNum = (int)$firstQuestion['question_number'];

    // Handle Duplicate / Already Started Requests (Idempotency)
    if ($quiz['status'] === 'running') {
        $currentQ = (int)($quiz['current_question'] ?: $firstQuestionNum);
        $currentQStatus = $quiz['current_question_status'] ?: 'active';
        $startTime = (float)($quiz['question_start_time'] ?? getMicroTime());

        error_log(sprintf(
            '[QuizSpark START_QUIZ] Duplicate start request received. Quiz %d already running on question %d (%s).',
            $quizId, $currentQ, $currentQStatus
        ));

        sendJsonResponse(true, 'Quiz is already running.', [
            'quiz_id'                 => $quizId,
            'session_id'              => $quizId,
            'status'                  => 'running',
            'current_question'        => $currentQ,
            'current_question_status' => $currentQStatus,
            'total_questions'         => $questionCount,
            'start_time'              => $startTime
        ]);
    }

    $now = getMicroTime();

    $pdo->beginTransaction();

    // Update Quiz State to Running, Question 1 Active
    $upd = $pdo->prepare("
        UPDATE `quizzes` 
        SET `status` = 'running', 
            `current_question` = :first_q_num, 
            `current_question_status` = 'active',
            `question_start_time` = :start_time,
            `leaderboard_start_time` = NULL,
            `next_question_at` = NULL,
            `started_at` = NOW() 
        WHERE `id` = :id
    ");
    $upd->execute([
        'first_q_num' => $firstQuestionNum,
        'start_time'  => $now, 
        'id'          => $quizId
    ]);

    // Update Participants to playing
    $updP = $pdo->prepare("UPDATE `participants` SET `status` = 'playing' WHERE `quiz_id` = :quiz_id");
    $updP->execute(['quiz_id' => $quizId]);

    $pdo->commit();

    error_log(sprintf(
        '[QuizSpark START_QUIZ] Quiz %d started by teacher %d. Total questions: %d, Question 1 ID: %d at %f.',
        $quizId, $teacherId, $questionCount, $firstQuestion['id'], $now
    ));

    sendJsonResponse(true, 'Quiz started! Question 1 is live.', [
        'quiz_id'                 => $quizId,
        'session_id'              => $quizId,
        'status'                  => 'running',
        'current_question'        => $firstQuestionNum,
        'current_question_status' => 'active',
        'total_questions'         => $questionCount,
        'start_time'              => $now
    ]);

} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log(sprintf('[QuizSpark START_QUIZ ERROR] Quiz %d: %s', $quizId ?? 0, $e->getMessage()));
    sendJsonResponse(false, 'Failed to start quiz: ' . $e->getMessage(), [
        'error_code' => 'SERVER_ERROR',
        'debug'      => $e->getMessage()
    ], 500);
}

