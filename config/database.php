<?php
/**
 * Database Configuration & PDO Connection Handler
 * QuizSpark Live Quiz Application
 */

define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'quizspark_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define(
    'DB_PASSWORD',
    getenv('DB_PASSWORD') !== false
        ? getenv('DB_PASSWORD')
        : (getenv('DB_PASS') !== false ? getenv('DB_PASS') : 'root1234')
);
define('DB_PASS', DB_PASSWORD);

function isProductionEnvironment(): bool
{
    $renderEnvironment = strtolower((string)getenv('RENDER')) === 'true';
    $applicationEnvironment = strtolower((string)getenv('APP_ENV'));

    return $renderEnvironment || in_array($applicationEnvironment, ['production', 'prod'], true);
}

function failDatabaseConnection(string $message, ?Throwable $exception = null): void
{
    if ($exception !== null) {
        error_log(sprintf(
            'QuizSpark database connection failed for %s:%s/%s: %s',
            DB_HOST,
            DB_PORT,
            DB_NAME,
            $exception->getMessage()
        ));
    } else {
        error_log('QuizSpark database configuration error: ' . $message);
    }

    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');

    echo json_encode([
        'success' => false,
        'message' => $message
    ]);

    exit;
}

function getDBConnection(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        if (isProductionEnvironment()) {
            $missingVariables = [];

            foreach (['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'] as $variable) {
                if (getenv($variable) === false || getenv($variable) === '') {
                    $missingVariables[] = $variable;
                }
            }

            if ($missingVariables !== []) {
                failDatabaseConnection(
                    'Production database configuration is incomplete. Set these Render environment variables: ' .
                    implode(', ', $missingVariables) . '.'
                );
            }

            if (in_array(strtolower(DB_HOST), ['localhost', '127.0.0.1', '::1'], true)) {
                failDatabaseConnection(
                    'Production database configuration must use a remote MySQL host, not localhost or 127.0.0.1.'
                );
            }
        }

        $dsn = "mysql:host=" . DB_HOST .
               ";port=" . DB_PORT .
               ";dbname=" . DB_NAME .
               ";charset=utf8mb4";

        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        try {

            $pdo = new PDO(
                $dsn,
                DB_USER,
                DB_PASSWORD,
                $options
            );

        } catch (PDOException $e) {
            failDatabaseConnection(
                'Database connection failed. Check the remote MySQL host, port, database name, credentials, and network access.',
                $e
            );
        }
    }

    return $pdo;
}