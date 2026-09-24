<?php
require_once __DIR__ . '/../config/database.php';

$pdo = getDBConnection();

echo "=== QUIZZES ===\n";
$quizzes = $pdo->query("SELECT * FROM quizzes")->fetchAll(PDO::FETCH_ASSOC);
print_r($quizzes);

echo "=== PARTICIPANTS ===\n";
$parts = $pdo->query("SELECT * FROM participants")->fetchAll(PDO::FETCH_ASSOC);
print_r($parts);

echo "=== TEACHERS ===\n";
$teachers = $pdo->query("SELECT id, name, email FROM teachers")->fetchAll(PDO::FETCH_ASSOC);
print_r($teachers);
