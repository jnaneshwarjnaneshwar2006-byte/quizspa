<?php
require_once __DIR__ . '/../config/database.php';
$pdo = getDBConnection();
$teachers = $pdo->query("SELECT id, name, email FROM teachers")->fetchAll();
echo "Teachers in DB:\n";
print_r($teachers);
if (empty($teachers)) {
    echo "Importing seed data...\n";
    $seedSql = file_get_contents(__DIR__ . '/../database/seed.sql');
    $pdo->exec($seedSql);
    echo "Seed data imported.\n";
}
