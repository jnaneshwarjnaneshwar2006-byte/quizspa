<?php
/**
 * Database Configuration & PDO Connection Handler
 * QuizSpark Live Quiz Application
 */

define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'quizspark_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');

function getDBConnection(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $passwordsToTry = [DB_PASS];
        if (DB_PASS !== '') {
            $passwordsToTry[] = '';
        }
        if (!in_array('root1234', $passwordsToTry, true)) {
            $passwordsToTry[] = 'root1234';
        }
        $lastException = null;
        foreach (array_unique($passwordsToTry) as $pass) {
            try {
                $pdo = new PDO($dsn, DB_USER, $pass, $options);
                break;
            } catch (PDOException $e) {
                $lastException = $e;
            }
        }
        if ($pdo === null) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'Database Connection Failure: ' . ($lastException ? $lastException->getMessage() : 'Unknown error')
            ]);
            exit;
        }
    }
    return $pdo;
}
