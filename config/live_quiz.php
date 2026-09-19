<?php
/**
 * Live Quiz State Machine & Synchronization Engine
 * QuizSpark Live Quiz Application
 */

require_once __DIR__ . '/security.php';

/**
 * Log live quiz transitions for diagnostics and debugging
 */
function logLiveQuizTransition(int $quizId, string $oldState, string $newState, array $context = []): void
{
    $details = [
        'quiz_id'     => $quizId,
        'old_state'   => $oldState,
        'new_state'   => $newState,
        'timestamp'   => date('Y-m-d H:i:s'),
        'microtime'   => getMicroTime(),
    ];
    $merged = array_merge($details, $context);
    error_log('[QuizSpark LiveQuiz] ' . json_encode($merged));
}

/**
 * Maps database state to standardized state machine names
 */
function getLiveQuizStateName(array $quiz): string
{
    if (($quiz['status'] ?? '') === 'completed') {
        return 'QUIZ_FINISHED';
    }
    if (($quiz['status'] ?? '') === 'lobby') {
        return 'LOBBY';
    }

    $qStatus = $quiz['current_question_status'] ?? 'inactive';
    switch ($qStatus) {
        case 'leaderboard':
            return 'LEADERBOARD';
        case 'ended':
            return 'QUESTION_ENDED';
        case 'active':
            return 'QUESTION_ACTIVE';
        default:
            return 'INACTIVE';
    }
}

/**
 * Atomically transitions the quiz to LEADERBOARD state with an authoritative next_question_at
 */
function transitionToLeaderboard(PDO $pdo, int $quizId, string $reason = ''): bool
{
    $now = getMicroTime();
    $nextQuestionAt = $now + 5.0;

    $stmt = $pdo->prepare(
        "UPDATE `quizzes`
         SET `current_question_status` = 'leaderboard',
             `leaderboard_start_time` = :start_time,
             `next_question_at` = :next_question_at
         WHERE `id` = :id
           AND `status` = 'running'
           AND `current_question_status` IN ('active', 'ended')"
    );
    $stmt->execute([
        'start_time'       => $now,
        'next_question_at' => $nextQuestionAt,
        'id'               => $quizId,
    ]);

    $changed = $stmt->rowCount() === 1;
    if ($changed) {
        logLiveQuizTransition($quizId, 'QUESTION_ACTIVE', 'LEADERBOARD', [
            'reason'                 => $reason,
            'leaderboard_started_at' => $now,
            'next_question_at'       => $nextQuestionAt,
        ]);
    }

    return $changed;
}

/**
 * Authoritative Server-Side State Machine Processor
 * Triggered on every poll / request by teacher and students.
 * Detects question completion, timer expiry, and performs 5-second automatic progression.
 */
function processLiveQuizState(PDO $pdo, int $quizId): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM `quizzes` WHERE `id` = :id LIMIT 1');
    $stmt->execute(['id' => $quizId]);
    $quiz = $stmt->fetch();

    if (!$quiz) {
        return null;
    }

    if ($quiz['status'] !== 'running') {
        return $quiz;
    }

    $now = getMicroTime();
    $currentQuestionNum = (int)$quiz['current_question'];

    // 1. If question is active, check if all participants answered OR time expired
    if ($quiz['current_question_status'] === 'active' && $currentQuestionNum > 0) {
        $qStmt = $pdo->prepare(
            'SELECT `id`, `time_limit` FROM `questions` WHERE `quiz_id` = :quiz_id AND `question_number` = :q_num LIMIT 1'
        );
        $qStmt->execute(['quiz_id' => $quizId, 'q_num' => $currentQuestionNum]);
        $question = $qStmt->fetch();

        if ($question) {
            $questionId = (int)$question['id'];
            $timeLimit = (int)$question['time_limit'];
            $startTime = (float)($quiz['question_start_time'] ?? 0);
            $elapsed = $startTime > 0 ? max(0, $now - $startTime) : 0;

            // Count joined/playing participants
            $pCountStmt = $pdo->prepare('SELECT COUNT(*) AS total FROM `participants` WHERE `quiz_id` = :quiz_id');
            $pCountStmt->execute(['quiz_id' => $quizId]);
            $participantCount = (int)($pCountStmt->fetch()['total'] ?? 0);

            // Count answers submitted for current question
            $ansCountStmt = $pdo->prepare(
                'SELECT COUNT(*) AS total FROM `answers` WHERE `quiz_id` = :quiz_id AND `question_id` = :question_id'
            );
            $ansCountStmt->execute(['quiz_id' => $quizId, 'question_id' => $questionId]);
            $answeredCount = (int)($ansCountStmt->fetch()['total'] ?? 0);

            // Check if all students answered
            if ($participantCount > 0 && $answeredCount >= $participantCount) {
                transitionToLeaderboard(
                    $pdo,
                    $quizId,
                    "All {$answeredCount}/{$participantCount} answers received"
                );
                $stmt->execute(['id' => $quizId]);
                $quiz = $stmt->fetch();
            }
            // Check if time expired (with 0.5s grace for network/concurrency)
            elseif ($startTime > 0 && $elapsed >= $timeLimit) {
                transitionToLeaderboard($pdo, $quizId, 'Time expired');
                $stmt->execute(['id' => $quizId]);
                $quiz = $stmt->fetch();
            }
        }
    }

    // 2. If quiz is in leaderboard, check if 5-second delay has elapsed
    if ($quiz['current_question_status'] === 'leaderboard') {
        $nextQuestionAt = (float)($quiz['next_question_at'] ?? 0);
        $leaderboardStartedAt = (float)($quiz['leaderboard_start_time'] ?? 0);

        if ($nextQuestionAt <= 0) {
            if ($leaderboardStartedAt > 0) {
                $nextQuestionAt = $leaderboardStartedAt + 5.0;
            } else {
                $nextQuestionAt = $now + 5.0;
                $pdo->prepare(
                    "UPDATE `quizzes` SET `leaderboard_start_time` = :started, `next_question_at` = :next_at WHERE `id` = :id"
                )->execute(['started' => $now, 'next_at' => $nextQuestionAt, 'id' => $quizId]);
            }
        }

        if ($now >= $nextQuestionAt) {
            advanceQuizFromLeaderboard($pdo, $quizId, 0.0);
            $stmt->execute(['id' => $quizId]);
            $quiz = $stmt->fetch();
        }
    }

    return $quiz;
}

/**
 * Advance live quiz from Leaderboard to next question or completion.
 * Protected with SELECT ... FOR UPDATE transaction to guarantee race condition immunity
 * even when dozens of students poll simultaneously.
 */
function advanceQuizFromLeaderboard(PDO $pdo, int $quizId, ?float $minimumWaitSeconds = null): array
{
    $pdo->beginTransaction();

    try {
        $stmt = $pdo->prepare('SELECT * FROM `quizzes` WHERE `id` = :id LIMIT 1 FOR UPDATE');
        $stmt->execute(['id' => $quizId]);
        $quiz = $stmt->fetch();

        if (!$quiz || $quiz['current_question_status'] !== 'leaderboard') {
            $pdo->commit();
            return ['changed' => false, 'completed' => $quiz && $quiz['status'] === 'completed'];
        }

        $now = getMicroTime();
        $leaderboardStartedAt = (float)($quiz['leaderboard_start_time'] ?? 0);
        $nextQuestionAt = (float)($quiz['next_question_at'] ?? 0);

        if ($nextQuestionAt <= 0 && $leaderboardStartedAt > 0) {
            $nextQuestionAt = $leaderboardStartedAt + 5.0;
        }

        // Check if wait time has been reached
        if ($nextQuestionAt > 0 && $now < $nextQuestionAt) {
            $pdo->commit();
            return ['changed' => false, 'completed' => false];
        }

        if ($minimumWaitSeconds !== null && $minimumWaitSeconds > 0 &&
            ($leaderboardStartedAt <= 0 || $now - $leaderboardStartedAt < $minimumWaitSeconds)) {
            $pdo->commit();
            return ['changed' => false, 'completed' => false];
        }

        $countStmt = $pdo->prepare('SELECT COUNT(*) AS total FROM `questions` WHERE `quiz_id` = :quiz_id');
        $countStmt->execute(['quiz_id' => $quizId]);
        $totalQuestions = (int)($countStmt->fetch()['total'] ?? 0);
        $currentQuestion = (int)$quiz['current_question'];

        // If no more questions exist, complete the quiz
        if ($currentQuestion >= $totalQuestions) {
            completeQuiz($pdo, $quizId, $totalQuestions);
            $pdo->commit();
            logLiveQuizTransition($quizId, 'LEADERBOARD', 'QUIZ_FINISHED', [
                'reason'          => 'All questions completed',
                'total_questions' => $totalQuestions,
            ]);
            return ['changed' => true, 'completed' => true];
        }

        // Advance to next question
        $nextQuestion = $currentQuestion + 1;
        $update = $pdo->prepare(
            'UPDATE `quizzes`
             SET `current_question` = :next_question,
                 `current_question_status` = \'active\',
                 `question_start_time` = :start_time,
                 `leaderboard_start_time` = NULL,
                 `next_question_at` = NULL
             WHERE `id` = :id AND `current_question_status` = \'leaderboard\''
        );
        $update->execute([
            'next_question' => $nextQuestion,
            'start_time'    => $now,
            'id'            => $quizId,
        ]);

        $changed = $update->rowCount() === 1;
        $pdo->commit();

        if ($changed) {
            logLiveQuizTransition($quizId, 'LEADERBOARD', 'QUESTION_ACTIVE', [
                'question_number' => $nextQuestion,
                'total_questions' => $totalQuestions,
                'start_time'      => $now,
            ]);
        }

        return ['changed' => $changed, 'completed' => false];
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $exception;
    }
}

/**
 * Calculates final rankings, inserts into quiz_results, and finalizes the quiz
 */
function completeQuiz(PDO $pdo, int $quizId, ?int $totalQuestions = null): void
{
    if ($totalQuestions === null) {
        $countStmt = $pdo->prepare('SELECT COUNT(*) AS total FROM `questions` WHERE `quiz_id` = :quiz_id');
        $countStmt->execute(['quiz_id' => $quizId]);
        $totalQuestions = (int)($countStmt->fetch()['total'] ?? 0);
    }

    $participantsStmt = $pdo->prepare(
        'SELECT p.*, COUNT(CASE WHEN a.is_correct = 1 THEN 1 END) AS correct_count
         FROM `participants` p
         LEFT JOIN `answers` a ON p.id = a.participant_id
         WHERE p.quiz_id = :quiz_id
         GROUP BY p.id
         ORDER BY p.total_score DESC, p.total_time ASC'
    );
    $participantsStmt->execute(['quiz_id' => $quizId]);
    $participants = $participantsStmt->fetchAll();

    $pdo->prepare('DELETE FROM `quiz_results` WHERE `quiz_id` = :quiz_id')
        ->execute(['quiz_id' => $quizId]);

    $resultStmt = $pdo->prepare(
        'INSERT INTO `quiz_results`
         (`quiz_id`, `participant_id`, `rank`, `total_score`, `total_time`, `correct_answers`, `total_questions`, `completed_at`)
         VALUES (:quiz_id, :participant_id, :rank, :score, :time, :correct, :total_questions, NOW())'
    );

    foreach ($participants as $index => $participant) {
        $resultStmt->execute([
            'quiz_id'         => $quizId,
            'participant_id'  => $participant['id'],
            'rank'            => $index + 1,
            'score'           => $participant['total_score'],
            'time'            => $participant['total_time'],
            'correct'         => $participant['correct_count'],
            'total_questions' => $totalQuestions,
        ]);
    }

    $pdo->prepare(
        'UPDATE `quizzes`
         SET `status` = \'completed\',
             `current_question_status` = \'ended\',
             `ended_at` = NOW(),
             `leaderboard_start_time` = NULL,
             `next_question_at` = NULL
         WHERE `id` = :id'
    )->execute(['id' => $quizId]);

    $pdo->prepare('UPDATE `participants` SET `status` = \'completed\' WHERE `quiz_id` = :quiz_id')
        ->execute(['quiz_id' => $quizId]);
}