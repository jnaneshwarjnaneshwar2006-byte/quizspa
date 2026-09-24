<?php
require_once __DIR__ . '/../config/database.php';
$pdo = getDBConnection();

$schema = [];
$tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
foreach ($tables as $tbl) {
    $schema[$tbl] = $pdo->query("DESCRIBE `$tbl`")->fetchAll(PDO::FETCH_ASSOC);
}

header('Content-Type: application/json');
echo json_encode([
    'mysql_version' => $pdo->query('SELECT VERSION()')->fetchColumn(),
    'tables' => $schema
], JSON_PRETTY_PRINT);
