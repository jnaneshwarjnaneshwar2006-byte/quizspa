<?php
/**
 * Safe, Idempotent Production Schema Migration
 * QuizSpark Live Quiz & AI Generator
 *
 * Rules:
 * 1. Uses existing PDO database connection via getDBConnection().
 * 2. Does NOT hardcode database name (no `USE db_name;`).
 * 3. Does NOT use unsupported `ADD COLUMN IF NOT EXISTS` syntax.
 * 4. Checks whether each column/table exists first, and only alters when missing.
 * 5. Strictly non-destructive: preserves all existing quizzes, questions, and participants data.
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Executes a safe, non-destructive schema migration against the configured database.
 * Can be called programmatically by API endpoints on schema errors or executed directly.
 *
 * @param PDO $pdo
 * @param bool $verbose
 * @return array List of applied changes
 */
function ensureProductionSchema(PDO $pdo, bool $verbose = false): array
{
    $changes = [];

    // Helper: Check if a column exists in a given table
    $hasColumn = function (string $table, string $column) use ($pdo): bool {
        $tableClean = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
        $colClean = preg_replace('/[^a-zA-Z0-9_]/', '', $column);
        $stmt = $pdo->query("SHOW COLUMNS FROM `{$tableClean}` LIKE '{$colClean}'");
        return $stmt && (bool)$stmt->fetch();
    };

    // Helper: Check if a table exists
    $hasTable = function (string $table) use ($pdo): bool {
        $tableClean = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
        $stmt = $pdo->query("SHOW TABLES LIKE '{$tableClean}'");
        return $stmt && (bool)$stmt->fetch();
    };

    // Helper: Check if an index exists
    $hasIndex = function (string $table, string $indexName) use ($pdo): bool {
        $tableClean = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
        $stmt = $pdo->query("SHOW INDEX FROM `{$tableClean}` WHERE `Key_name` = '{$indexName}'");
        return $stmt && (bool)$stmt->fetch();
    };

    // -------------------------------------------------------------
    // 1. Table: quizzes
    // -------------------------------------------------------------
    if ($hasTable('quizzes')) {
        // 1a. quizzes.topic
        if (!$hasColumn('quizzes', 'topic')) {
            $pdo->exec("ALTER TABLE `quizzes` ADD COLUMN `topic` VARCHAR(255) NULL");
            $changes[] = "Added column `topic` (VARCHAR(255) NULL) to `quizzes`";
        }

        // 1b. quizzes.difficulty
        if (!$hasColumn('quizzes', 'difficulty')) {
            $pdo->exec("ALTER TABLE `quizzes` ADD COLUMN `difficulty` VARCHAR(50) NULL");
            $changes[] = "Added column `difficulty` (VARCHAR(50) NULL) to `quizzes`";
        }

        // 1c. quizzes.source
        if (!$hasColumn('quizzes', 'source')) {
            $pdo->exec("ALTER TABLE `quizzes` ADD COLUMN `source` VARCHAR(50) DEFAULT 'manual'");
            $changes[] = "Added column `source` (VARCHAR(50) DEFAULT 'manual') to `quizzes`";
        }

        // 1d. quizzes.category
        if (!$hasColumn('quizzes', 'category')) {
            $pdo->exec("ALTER TABLE `quizzes` ADD COLUMN `category` VARCHAR(100) DEFAULT 'General'");
            $changes[] = "Added column `category` (VARCHAR(100) DEFAULT 'General') to `quizzes`";
        }

        // 1e. quizzes.question_start_time
        if (!$hasColumn('quizzes', 'question_start_time')) {
            $pdo->exec("ALTER TABLE `quizzes` ADD COLUMN `question_start_time` DOUBLE NULL");
            $changes[] = "Added column `question_start_time` (DOUBLE NULL) to `quizzes`";
        }

        // 1f. quizzes.leaderboard_start_time
        if (!$hasColumn('quizzes', 'leaderboard_start_time')) {
            $pdo->exec("ALTER TABLE `quizzes` ADD COLUMN `leaderboard_start_time` DOUBLE NULL");
            $changes[] = "Added column `leaderboard_start_time` (DOUBLE NULL) to `quizzes`";
        }

        // 1g. quizzes.next_question_at
        if (!$hasColumn('quizzes', 'next_question_at')) {
            $pdo->exec("ALTER TABLE `quizzes` ADD COLUMN `next_question_at` DOUBLE NULL");
            $changes[] = "Added column `next_question_at` (DOUBLE NULL) to `quizzes`";
        }

        // 1h. quizzes.current_question
        if (!$hasColumn('quizzes', 'current_question')) {
            $pdo->exec("ALTER TABLE `quizzes` ADD COLUMN `current_question` INT DEFAULT 0");
            $changes[] = "Added column `current_question` (INT DEFAULT 0) to `quizzes`";
        }

        // 1i. quizzes.current_question_status
        if (!$hasColumn('quizzes', 'current_question_status')) {
            $pdo->exec("ALTER TABLE `quizzes` ADD COLUMN `current_question_status` ENUM('inactive', 'active', 'ended', 'leaderboard') DEFAULT 'inactive'");
            $changes[] = "Added column `current_question_status` to `quizzes`";
        }

        // 1j. quizzes.join_code
        if (!$hasColumn('quizzes', 'join_code')) {
            $pdo->exec("ALTER TABLE `quizzes` ADD COLUMN `join_code` VARCHAR(6) NULL");
            $changes[] = "Added column `join_code` to `quizzes`";
        }

        // 1k. quizzes.join_url
        if (!$hasColumn('quizzes', 'join_url')) {
            $pdo->exec("ALTER TABLE `quizzes` ADD COLUMN `join_url` VARCHAR(500) NULL");
            $changes[] = "Added column `join_url` to `quizzes`";
        }

        // 1l. quizzes.qr_data
        if (!$hasColumn('quizzes', 'qr_data')) {
            $pdo->exec("ALTER TABLE `quizzes` ADD COLUMN `qr_data` TEXT NULL");
            $changes[] = "Added column `qr_data` to `quizzes`";
        }

        // 1m. quizzes.published_at
        if (!$hasColumn('quizzes', 'published_at')) {
            $pdo->exec("ALTER TABLE `quizzes` ADD COLUMN `published_at` DATETIME NULL");
            $changes[] = "Added column `published_at` to `quizzes`";
        }

        // 1n. quizzes.started_at
        if (!$hasColumn('quizzes', 'started_at')) {
            $pdo->exec("ALTER TABLE `quizzes` ADD COLUMN `started_at` DATETIME NULL");
            $changes[] = "Added column `started_at` to `quizzes`";
        }

        // 1o. quizzes.ended_at
        if (!$hasColumn('quizzes', 'ended_at')) {
            $pdo->exec("ALTER TABLE `quizzes` ADD COLUMN `ended_at` DATETIME NULL");
            $changes[] = "Added column `ended_at` to `quizzes`";
        }
    }

    // -------------------------------------------------------------
    // 2. Table: questions
    // -------------------------------------------------------------
    if ($hasTable('questions')) {
        // 2a. questions.explanation
        if (!$hasColumn('questions', 'explanation')) {
            $pdo->exec("ALTER TABLE `questions` ADD COLUMN `explanation` TEXT NULL");
            $changes[] = "Added column `explanation` (TEXT NULL) to `questions`";
        }

        // 2b. questions.points
        if (!$hasColumn('questions', 'points')) {
            $pdo->exec("ALTER TABLE `questions` ADD COLUMN `points` INT DEFAULT 100");
            $changes[] = "Added column `points` (INT DEFAULT 100) to `questions`";
        }

        // 2c. questions.difficulty
        if (!$hasColumn('questions', 'difficulty')) {
            $pdo->exec("ALTER TABLE `questions` ADD COLUMN `difficulty` VARCHAR(50) NULL");
            $changes[] = "Added column `difficulty` (VARCHAR(50) NULL) to `questions`";
        }

        // 2d. questions.image_url
        if (!$hasColumn('questions', 'image_url')) {
            $pdo->exec("ALTER TABLE `questions` ADD COLUMN `image_url` VARCHAR(500) NULL");
            $changes[] = "Added column `image_url` (VARCHAR(500) NULL) to `questions`";
        }

        // 2e. questions.audio_url
        if (!$hasColumn('questions', 'audio_url')) {
            $pdo->exec("ALTER TABLE `questions` ADD COLUMN `audio_url` VARCHAR(500) NULL");
            $changes[] = "Added column `audio_url` (VARCHAR(500) NULL) to `questions`";
        }

        // 2f. questions.time_limit
        if (!$hasColumn('questions', 'time_limit')) {
            $pdo->exec("ALTER TABLE `questions` ADD COLUMN `time_limit` INT DEFAULT 10");
            $changes[] = "Added column `time_limit` (INT DEFAULT 10) to `questions`";
        }

        // 2g. questions.question_type ENUM
        try {
            $typeStmt = $pdo->query("SHOW COLUMNS FROM `questions` LIKE 'question_type'");
            $typeCol = $typeStmt ? $typeStmt->fetch() : null;
            if ($typeCol && strpos($typeCol['Type'], "'image'") === false) {
                $pdo->exec("ALTER TABLE `questions` MODIFY `question_type` ENUM('multiple_choice', 'true_false', 'image', 'music') DEFAULT 'multiple_choice'");
                $changes[] = "Extended `question_type` ENUM to include 'image' and 'music'";
            }
        } catch (Exception $e) {
            error_log("[QuizSpark Migration Note] question_type ENUM: " . $e->getMessage());
        }
    }

    // -------------------------------------------------------------
    // 3. Table: participants
    // -------------------------------------------------------------
    if ($hasTable('participants')) {
        // 3a. participants.avatar_data
        if (!$hasColumn('participants', 'avatar_data')) {
            $pdo->exec("ALTER TABLE `participants` ADD COLUMN `avatar_data` LONGTEXT NULL");
            $changes[] = "Added column `avatar_data` (LONGTEXT NULL) to `participants`";
        }

        // 3b. participants.session_token
        if (!$hasColumn('participants', 'session_token')) {
            $pdo->exec("ALTER TABLE `participants` ADD COLUMN `session_token` VARCHAR(64) NULL");
            $changes[] = "Added column `session_token` to `participants`";
        }

        // 3c. participants.total_score
        if (!$hasColumn('participants', 'total_score')) {
            $pdo->exec("ALTER TABLE `participants` ADD COLUMN `total_score` INT DEFAULT 0");
            $changes[] = "Added column `total_score` to `participants`";
        }

        // 3d. participants.total_time
        if (!$hasColumn('participants', 'total_time')) {
            $pdo->exec("ALTER TABLE `participants` ADD COLUMN `total_time` DOUBLE DEFAULT 0");
            $changes[] = "Added column `total_time` to `participants`";
        }

        // 3e. Composite index on (quiz_id, status)
        if (!$hasIndex('participants', 'quiz_id_status') && !$hasIndex('participants', 'quiz_id')) {
            $pdo->exec("ALTER TABLE `participants` ADD INDEX `quiz_id_status` (`quiz_id`, `status`)");
            $changes[] = "Added index `quiz_id_status` to `participants`";
        }
    }

    // -------------------------------------------------------------
    // 4. Table: answers
    // -------------------------------------------------------------
    if ($hasTable('answers')) {
        // 4a. answers.response_time
        if (!$hasColumn('answers', 'response_time')) {
            $pdo->exec("ALTER TABLE `answers` ADD COLUMN `response_time` DOUBLE DEFAULT 0");
            $changes[] = "Added column `response_time` to `answers`";
        }

        // 4b. answers.time_taken
        if (!$hasColumn('answers', 'time_taken')) {
            $pdo->exec("ALTER TABLE `answers` ADD COLUMN `time_taken` DOUBLE DEFAULT 0");
            $changes[] = "Added column `time_taken` to `answers`";
        }

        // 4c. answers.points
        if (!$hasColumn('answers', 'points')) {
            $pdo->exec("ALTER TABLE `answers` ADD COLUMN `points` INT DEFAULT 0");
            $changes[] = "Added column `points` to `answers`";
        }

        // 4d. Unique constraint on (question_id, participant_id)
        if (!$hasIndex('answers', 'unique_answer')) {
            $pdo->exec("ALTER TABLE `answers` ADD UNIQUE KEY `unique_answer` (`question_id`, `participant_id`)");
            $changes[] = "Added unique constraint `unique_answer` on `answers(question_id, participant_id)`";
        }
    }

    // -------------------------------------------------------------
    // 5. Table: quiz_results
    // -------------------------------------------------------------
    if ($hasTable('quiz_results')) {
        // 5a. quiz_results.correct_answers
        if (!$hasColumn('quiz_results', 'correct_answers')) {
            $pdo->exec("ALTER TABLE `quiz_results` ADD COLUMN `correct_answers` INT DEFAULT 0");
            $changes[] = "Added column `correct_answers` to `quiz_results`";
        }

        // 5b. quiz_results.total_questions
        if (!$hasColumn('quiz_results', 'total_questions')) {
            $pdo->exec("ALTER TABLE `quiz_results` ADD COLUMN `total_questions` INT DEFAULT 0");
            $changes[] = "Added column `total_questions` to `quiz_results`";
        }
    }

    // -------------------------------------------------------------
    // 6. Table: ai_rate_limits
    // -------------------------------------------------------------
    if (!$hasTable('ai_rate_limits')) {
        $pdo->exec("
            CREATE TABLE `ai_rate_limits` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `teacher_id` INT NOT NULL,
                `action` VARCHAR(50) NOT NULL,
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX `idx_teacher_action` (`teacher_id`, `created_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        $changes[] = "Created table `ai_rate_limits`";
    }

    return $changes;
}

// If executed directly (via CLI or HTTP request)
if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
    if (!headers_sent() && php_sapi_name() !== 'cli') {
        header('Content-Type: text/plain; charset=utf-8');
    }

    echo "====================================================\n";
    echo "QUIZSPARK SAFE PRODUCTION SCHEMA MIGRATION\n";
    echo "====================================================\n\n";

    try {
        $pdo = getDBConnection();
        $applied = ensureProductionSchema($pdo, true);

        if (empty($applied)) {
            echo "All required tables and columns already exist. Schema is fully up to date!\n";
        } else {
            echo "Applied " . count($applied) . " change(s):\n";
            foreach ($applied as $ch) {
                echo "  [+] {$ch}\n";
            }
        }

        echo "\n====================================================\n";
        echo "MIGRATION COMPLETE: " . count($applied) . " change(s) applied. 0 errors.\n";
        echo "====================================================\n";

    } catch (Throwable $e) {
        echo "\n[ERROR] Migration aborted: " . $e->getMessage() . "\n";
        exit(1);
    }
}
