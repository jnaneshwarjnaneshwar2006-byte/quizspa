<?php
require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getDBConnection();

    echo "[*] Modifying question_type ENUM...\n";
    $pdo->exec("ALTER TABLE `questions` MODIFY `question_type` ENUM('multiple_choice', 'true_false', 'image', 'music') DEFAULT 'multiple_choice'");
    echo "[+] question_type updated.\n";

    $cols = $pdo->query("SHOW COLUMNS FROM `questions` LIKE 'audio_url'")->fetchAll();
    if (empty($cols)) {
        echo "[*] Adding audio_url column...\n";
        $pdo->exec("ALTER TABLE `questions` ADD COLUMN `audio_url` VARCHAR(500) NULL AFTER `image_url`");
        echo "[+] audio_url column added.\n";
    } else {
        echo "[+] audio_url column already exists.\n";
    }

    echo "[✓] Database migration completed successfully!\n";
} catch (Exception $e) {
    echo "[!] Migration error: " . $e->getMessage() . "\n";
}
