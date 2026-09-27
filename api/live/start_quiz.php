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
    sendJsonResponse(false, 'Invalid request method. POST required.', ['error_code' => 'METHOD_NOT_ALLOWED'], 200);
}

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);
if (!is_array($input)) {
    $input = $_POST;
}

// 1. Verify CSRF Token if provided
$csrfToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? $input['csrf_token'] ?? $_POST['csrf_token'] ?? null;
if ($csrfToken !== null && !validateCsrfToken($csrfToken)) {
    sendJsonResponse(false, 'Invalid session token. Please refresh the page.', ['error_code' => 'CSRF_INVALID'], 200);
}

// 2. Validate Quiz ID from body, POST, or GET
$quizId = (int)($input['quiz_id'] ?? $input['id'] ?? $_POST['quiz_id'] ?? $_POST['id'] ?? $_GET['quiz_id'] ?? $_GET['id'] ?? 0);

if ($quizId <= 0) {
    sendJsonResponse(false, 'Valid quiz ID is required.', ['error_code' => 'INVALID_QUIZ_ID'], 200);
}

try {
    $pdo = getDBConnection();
    $teacherId = getTeacherId();

    // 3. Verify Quiz Existence & Ownership
    $stmt = $pdo->prepare("SELECT * FROM `quizzes` WHERE `id` = :id LIMIT 1");
    $stmt->execute(['id' => $quizId]);
    $quiz = $stmt->fetch();

    if (!$quiz) {
        sendJsonResponse(false, 'Quiz not found.', ['error_code' => 'QUIZ_NOT_FOUND'], 200);
    }

    if ((int)$quiz['teacher_id'] !== $teacherId) {
        if ($quiz['teacher_id'] === null || (int)$quiz['teacher_id'] === 0) {
            $pdo->prepare("UPDATE `quizzes` SET `teacher_id` = :teacher_id WHERE `id` = :id")
                ->execute(['teacher_id' => $teacherId, 'id' => $quizId]);
            $quiz['teacher_id'] = $teacherId;
        } else {
            sendJsonResponse(false, 'You are not authorized to start this quiz.', ['error_code' => 'UNAUTHORIZED'], 200);
        }
    }

    // 4. Verify Quiz has questions
    $qCountStmt = $pdo->prepare("SELECT COUNT(*) FROM `questions` WHERE `quiz_id` = :quiz_id");
    $qCountStmt->execute(['quiz_id' => $quizId]);
    $questionCount = (int)$qCountStmt->fetchColumn();

    if ($questionCount === 0) {
        sendJsonResponse(false, 'Quiz cannot start because no questions are available.', [
            'error_code' => 'NO_QUESTIONS',
            'quiz_id'    => $quizId
        ], 200);
    }

    // 5. Verify Question 1 / First question exists
    $q1Stmt = $pdo->prepare("SELECT * FROM `questions` WHERE `quiz_id` = :quiz_id ORDER BY `question_number` ASC LIMIT 1");
    $q1Stmt->execute(['quiz_id' => $quizId]);
    $firstQuestion = $q1Stmt->fetch();

    if (!$firstQuestion || empty($firstQuestion['question_text'])) {
        sendJsonResponse(false, 'Quiz cannot start because question data is missing or incomplete.', [
            'error_code' => 'INVALID_QUESTION_DATA',
            'quiz_id'    => $quizId
        ], 200);
    }

    $firstQuestionNum = (int)$firstQuestion['question_number'];

    // 6. Handle Duplicate / Already Started Requests (Idempotency)
    if ($quiz['status'] === 'running') {
        $currentQ = (int)($quiz['current_question'] ?: $firstQuestionNum);
        $currentQStatus = $quiz['current_question_status'] ?: 'active';
        $startTime = (float)($quiz['question_start_time'] ?? getMicroTime());

        error_log(sprintf(
            '[QuizSpark START_QUIZ] Duplicate start request received. Quiz %d already running on question %d (%s).',
            $quizId, $currentQ, $currentQStatus
        ));

        sendJsonResponse(true, 'Quiz started successfully', [
            'quiz_id'                 => $quizId,
            'session_id'              => $quizId,
            'status'                  => 'running',
            'current_question'        => $currentQ,
            'current_question_status' => $currentQStatus,
            'total_questions'         => $questionCount,
            'start_time'              => $startTime
        ]);
    }

    $startSuccess = false;
    $retryAttempted = false;
    $now = getMicroTime();

    while (!$startSuccess) {
        try {
            $now = getMicroTime();
            $pdo->beginTransaction();

            // 7. Update Quiz State to Running, Question 1 Active, and Set Timing Fields
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

            // 8. Update Participants to playing
            $updP = $pdo->prepare("UPDATE `participants` SET `status` = 'playing' WHERE `quiz_id` = :quiz_id");
            $updP->execute(['quiz_id' => $quizId]);

            $pdo->commit();
            $startSuccess = true;

        } catch (PDOException $e) {
            if (isset($pdo) && $pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log(sprintf('[QuizSpark START_QUIZ ERROR] Quiz %d: %s', $quizId ?? 0, $e->getMessage()));

            // Auto-heal missing column schema differences on production if needed
            if (!$retryAttempted && ($e->getCode() == '42S22' || strpos($e->getMessage(), '1054') !== false)) {
                $retryAttempted = true;
                require_once __DIR__ . '/../../database/migrate_production_safe.php';
                ensureProductionSchema($pdo);
                continue;
            }

            sendJsonResponse(false, 'Unable to start quiz. Please try again.', [
                'error_code' => 'START_QUIZ_FAILED'
            ], 200);
        } catch (Throwable $e) {
            if (isset($pdo) && $pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log(sprintf('[QuizSpark START_QUIZ ERROR] Quiz %d: %s', $quizId ?? 0, $e->getMessage()));
            sendJsonResponse(false, 'Unable to start quiz. Please try again.', [
                'error_code' => 'START_QUIZ_FAILED'
            ], 200);
        }
    }

    error_log(sprintf(
        '[QuizSpark START_QUIZ] Quiz %d started by teacher %d. Total questions: %d, Question 1 ID: %d at %f.',
        $quizId, $teacherId, $questionCount, $firstQuestion['id'], $now
    ));

    sendJsonResponse(true, 'Quiz started successfully', [
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
    sendJsonResponse(false, 'Unable to start quiz. Please try again.', [
        'error_code' => 'START_QUIZ_FAILED'
    ], 200);
}

