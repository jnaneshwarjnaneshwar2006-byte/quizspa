<?php
require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getDBConnection();
    echo "Database Connected Successfully!\n";
    
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables:\n";
    print_r($tables);
    
    foreach ($tables as $table) {
        echo "\n--- Columns for $table ---\n";
        $cols = $pdo->query("DESCRIBE `$table`")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($cols as $col) {
            echo "{$col['Field']} ({$col['Type']}) " . ($col['Null'] === 'YES' ? 'NULL' : 'NOT NULL') . " Key:{$col['Key']} Default:{$col['Default']}\n";
        }
    }
    
    echo "\n--- Quizzes in DB ---\n";
    $quizzes = $pdo->query("SELECT id, teacher_id, title, join_code, status, current_question, current_question_status FROM quizzes")->fetchAll(PDO::FETCH_ASSOC);
    print_r($quizzes);

    echo "\n--- Participants in DB ---\n";
    $participants = $pdo->query("SELECT id, quiz_id, name, emoji, status, session_token, joined_at FROM participants")->fetchAll(PDO::FETCH_ASSOC);
    print_r($participants);

} catch (Exception $e) {
    echo "DB Error: " . $e->getMessage() . "\n";
}
