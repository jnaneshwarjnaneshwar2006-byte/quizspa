<?php
/**
 * Database Initialization Script
 * QuizSpark Live Quiz Application
 */

require_once __DIR__ . '/../config/database.php';

echo "=== Initializing QuizSpark Database ===\n";

try {
    // 1. Connect without database selected to create database
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    echo "[+] Creating database `" . DB_NAME . "` if not exists...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    $pdo->exec("USE `" . DB_NAME . "`;");
    
    // 2. Import Schema
    echo "[+] Importing database schema...\n";
    $schemaSql = file_get_contents(__DIR__ . '/schema.sql');
    $pdo->exec($schemaSql);
    echo "    -> Schema imported successfully.\n";
    
    // 3. Import Seed
    echo "[+] Importing seed data...\n";
    $seedSql = file_get_contents(__DIR__ . '/seed.sql');
    $pdo->exec($seedSql);
    echo "    -> Seed data imported successfully.\n";

    echo "=== Database Setup Complete! ===\n";

} catch (Exception $e) {
    echo "[!] Error initializing database: " . $e->getMessage() . "\n";
    exit(1);
}
