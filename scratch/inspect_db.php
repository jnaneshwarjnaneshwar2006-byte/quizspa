<?php
require_once __DIR__ . '/../config/database.php';

$pdo = getDBConnection();

echo "--- TABLES IN DB ---\n";
$tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
foreach ($tables as $tbl) {
    echo "\n=== Table: $tbl ===\n";
    $cols = $pdo->query("DESCRIBE `$tbl`")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cols as $c) {
        echo sprintf("  %-25s %-30s Null:%-4s Key:%-4s Default:%s\n", $c['Field'], $c['Type'], $c['Null'], $c['Key'], $c['Default'] ?? 'NULL');
    }
}
