<?php
require_once __DIR__ . '/../config/database.php';
$pdo = getDBConnection();
$stmt = $pdo->query('DESCRIBE questions');
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT);
