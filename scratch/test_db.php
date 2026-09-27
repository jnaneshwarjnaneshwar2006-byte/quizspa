<?php
$passwords = ["", "root", "root1234", "admin", "password", "123456", "mysql"];
foreach ($passwords as $p) {
    try {
        $pdo = new PDO("mysql:host=127.0.0.1;port=3306", "root", $p);
        echo "SUCCESS with root password: [$p]\n";
        
        $stmt = $pdo->query("SHOW DATABASES");
        $dbs = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo "Databases: " . implode(", ", $dbs) . "\n";
        exit(0);
    } catch (Exception $e) {
        echo "Failed with [$p]: " . $e->getMessage() . "\n";
    }
}
