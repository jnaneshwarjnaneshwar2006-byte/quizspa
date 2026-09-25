<?php
/**
 * Safe Migration: Ensure avatar_data column exists on participants table
 * QuizSpark Live Quiz Application
 *
 * NOTE: This migration uses the application's existing configured PDO connection
 * and does NOT hardcode any database name (`USE quizspark_db`), making it safe
 * for all production environments.
 */

require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getDBConnection();

    // Check if column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM `participants` LIKE 'avatar_data'");
    $exists = $stmt ? $stmt->fetch() : false;

    if (!$exists) {
        $pdo->exec("ALTER TABLE `participants` ADD COLUMN `avatar_data` TEXT NULL AFTER `emoji`");
        echo "[+] Successfully added `avatar_data` column to `participants` table.\n";
    } else {
        echo "[*] `avatar_data` column already exists in `participants` table.\n";
    }
} catch (Exception $e) {
    error_log("[QuizSpark Migration Error] " . $e->getMessage());
    echo "[-] Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
