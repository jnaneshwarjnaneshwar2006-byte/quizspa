<?php

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

        $leaderboardStartedAt = (float)($quiz['leaderboard_start_time'] ?? 0);
        if ($minimumWaitSeconds !== null &&
            ($leaderboardStartedAt <= 0 || getMicroTime() - $leaderboardStartedAt < $minimumWaitSeconds)) {
            $pdo->commit();
            return ['changed' => false, 'completed' => false];
        }

        $countStmt = $pdo->prepare('SELECT COUNT(*) AS total FROM `questions` WHERE `quiz_id` = :quiz_id');
        $countStmt->execute(['quiz_id' => $quizId]);
        $totalQuestions = (int)($countStmt->fetch()['total'] ?? 0);
        $currentQuestion = (int)$quiz['current_question'];

        if ($currentQuestion >= $totalQuestions) {
            completeQuiz($pdo, $quizId, $totalQuestions);
            $pdo->commit();
            return ['changed' => true, 'completed' => true];
        }

        $nextQuestion = $currentQuestion + 1;
        $update = $pdo->prepare(
            'UPDATE `quizzes`
             SET `current_question` = :next_question,
                 `current_question_status` = \'active\',
                 `question_start_time` = :start_time,
                 `leaderboard_start_time` = NULL
             WHERE `id` = :id AND `current_question_status` = \'leaderboard\''
        );
        $update->execute([
            'next_question' => $nextQuestion,
            'start_time' => getMicroTime(),
            'id' => $quizId,
        ]);

        $pdo->commit();
        return ['changed' => $update->rowCount() === 1, 'completed' => false];
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $exception;
    }
}

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
            'quiz_id' => $quizId,
            'participant_id' => $participant['id'],
            'rank' => $index + 1,
            'score' => $participant['total_score'],
            'time' => $participant['total_time'],
            'correct' => $participant['correct_count'],
            'total_questions' => $totalQuestions,
        ]);
    }

    $pdo->prepare(
        'UPDATE `quizzes`
         SET `status` = \'completed\', `current_question_status` = \'ended\', `ended_at` = NOW(), `leaderboard_start_time` = NULL
         WHERE `id` = :id'
    )->execute(['id' => $quizId]);

    $pdo->prepare('UPDATE `participants` SET `status` = \'completed\' WHERE `quiz_id` = :quiz_id')
        ->execute(['quiz_id' => $quizId]);
}