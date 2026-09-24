<?php
require_once __DIR__ . '/../config/database.php';
$pdo = getDBConnection();
$stmt = $pdo->prepare('SELECT id, quiz_id, name, session_token, status, joined_at FROM participants WHERE quiz_id = 7 ORDER BY id DESC');
$stmt->execute();
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT);
