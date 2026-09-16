<?php
require_once __DIR__ . '/../config/database.php';

$pdo = getDBConnection();
echo "Database connected successfully!\n";
$stmt = $pdo->query("SELECT DISTINCT question_type FROM questions");
echo "Available Question Types in DB: " . implode(', ', $stmt->fetchAll(PDO::FETCH_COLUMN)) . "\n";
$cols = $pdo->query("DESCRIBE questions")->fetchAll(PDO::FETCH_ASSOC);
echo "Columns in questions table:\n";
foreach ($cols as $col) {
    echo " - {$col['Field']} ({$col['Type']})\n";
}
