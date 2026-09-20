<?php
require_once __DIR__ . '/../config/database.php';
try {
    $pdo = getDBConnection();
    // Check if column exists
    $cols = $pdo->query("SHOW COLUMNS FROM `participants`")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('avatar_data', $cols)) {
        $pdo->exec("ALTER TABLE `participants` ADD COLUMN `avatar_data` TEXT NULL AFTER `emoji`");
        echo "Column avatar_data added.\n";
    } else {
        echo "Column avatar_data already exists.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
