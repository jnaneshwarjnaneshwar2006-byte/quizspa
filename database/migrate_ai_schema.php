<?php
/**
 * Migration Script: AI Quiz Generator Schema Enhancements
 * Non-destructive migration for QuizSpark
 * 
 * Tables updated:
 * 1. quizzes:
 *    - topic VARCHAR(255) NULL
 *    - difficulty VARCHAR(50) NULL
 *    - source VARCHAR(50) DEFAULT 'manual'
 * 2. questions:
 *    - explanation TEXT NULL
 *    - points INT DEFAULT 100
 *    - difficulty VARCHAR(50) NULL
 * 3. ai_rate_limits (new table):
 *    - id INT AUTO_INCREMENT PRIMARY KEY
 *    - teacher_id INT NOT NULL
 *    - action VARCHAR(50) NOT NULL
 *    - created_at DATETIME DEFAULT CURRENT_TIMESTAMP
 */

require_once __DIR__ . '/../config/database.php';

echo "====================================================\n";
echo "QUIZSPARK AI SCHEMA MIGRATION\n";
echo "====================================================\n\n";

try {
    $pdo = getDBConnection();

    // Helper to check column existence
    function columnExists($pdo, $table, $column) {
        $cleanCol = preg_replace('/[^a-zA-Z0-9_]/', '', $column);
        $cleanTbl = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
        $stmt = $pdo->query("SHOW COLUMNS FROM `{$cleanTbl}` LIKE '{$cleanCol}'");
        return $stmt && (bool)$stmt->fetch();
    }

    // Helper to check table existence
    function tableExists($pdo, $table) {
        $cleanTbl = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
        $stmt = $pdo->query("SHOW TABLES LIKE '{$cleanTbl}'");
        return $stmt && (bool)$stmt->fetch();
    }

    // 1. Update quizzes table
    echo "[1] Checking 'quizzes' table...\n";
    if (!columnExists($pdo, 'quizzes', 'topic')) {
        $pdo->exec("ALTER TABLE `quizzes` ADD COLUMN `topic` VARCHAR(255) NULL AFTER `title`");
        echo "  [+] Added column 'topic' to 'quizzes'\n";
    } else {
        echo "  [*] Column 'topic' already exists in 'quizzes'\n";
    }

    if (!columnExists($pdo, 'quizzes', 'difficulty')) {
        $pdo->exec("ALTER TABLE `quizzes` ADD COLUMN `difficulty` VARCHAR(50) NULL AFTER `topic`");
        echo "  [+] Added column 'difficulty' to 'quizzes'\n";
    } else {
        echo "  [*] Column 'difficulty' already exists in 'quizzes'\n";
    }

    if (!columnExists($pdo, 'quizzes', 'source')) {
        $pdo->exec("ALTER TABLE `quizzes` ADD COLUMN `source` VARCHAR(50) DEFAULT 'manual' AFTER `difficulty`");
        echo "  [+] Added column 'source' to 'quizzes'\n";
    } else {
        echo "  [*] Column 'source' already exists in 'quizzes'\n";
    }

    // 2. Update questions table
    echo "\n[2] Checking 'questions' table...\n";
    if (!columnExists($pdo, 'questions', 'explanation')) {
        $pdo->exec("ALTER TABLE `questions` ADD COLUMN `explanation` TEXT NULL AFTER `correct_option`");
        echo "  [+] Added column 'explanation' to 'questions'\n";
    } else {
        echo "  [*] Column 'explanation' already exists in 'questions'\n";
    }

    if (!columnExists($pdo, 'questions', 'points')) {
        $pdo->exec("ALTER TABLE `questions` ADD COLUMN `points` INT DEFAULT 100 AFTER `explanation`");
        echo "  [+] Added column 'points' to 'questions'\n";
    } else {
        echo "  [*] Column 'points' already exists in 'questions'\n";
    }

    if (!columnExists($pdo, 'questions', 'difficulty')) {
        $pdo->exec("ALTER TABLE `questions` ADD COLUMN `difficulty` VARCHAR(50) NULL AFTER `points`");
        echo "  [+] Added column 'difficulty' to 'questions'\n";
    } else {
        echo "  [*] Column 'difficulty' already exists in 'questions'\n";
    }

    // 3. Create ai_rate_limits table
    echo "\n[3] Checking 'ai_rate_limits' table...\n";
    if (!tableExists($pdo, 'ai_rate_limits')) {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `ai_rate_limits` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `teacher_id` INT NOT NULL,
                `action` VARCHAR(50) NOT NULL,
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX `idx_teacher_action_time` (`teacher_id`, `action`, `created_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        echo "  [+] Created table 'ai_rate_limits'\n";
    } else {
        echo "  [*] Table 'ai_rate_limits' already exists\n";
    }

    echo "\n====================================================\n";
    echo "MIGRATION COMPLETED SUCCESSFULLY!\n";
    echo "====================================================\n";

} catch (Exception $e) {
    echo "\n[ERROR] Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
