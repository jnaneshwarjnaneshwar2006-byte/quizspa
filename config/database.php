<?php
/**
 * Database Configuration & PDO Connection Handler
 * QuizSpark Live Quiz Application
 */

$databaseLocalConfig = [];
$databaseLocalConfigFile = __DIR__ . '/database.local.php';
if (is_file($databaseLocalConfigFile)) {
    $loadedDatabaseConfig = require $databaseLocalConfigFile;
    if (is_array($loadedDatabaseConfig)) {
        $databaseLocalConfig = $loadedDatabaseConfig;
    }
}

function getDatabaseSetting(string $environmentName, string $localName, string $default): string
{
    global $databaseLocalConfig;

    $environmentValue = getenv($environmentName);
    if ($environmentValue !== false && $environmentValue !== '') {
        return (string)$environmentValue;
    }

    if (array_key_exists($localName, $databaseLocalConfig) && $databaseLocalConfig[$localName] !== null) {
        return (string)$databaseLocalConfig[$localName];
    }

    return $default;
}

define('DB_HOST', getDatabaseSetting('DB_HOST', 'host', '127.0.0.1'));
define('DB_PORT', getDatabaseSetting('DB_PORT', 'port', '3306'));
define('DB_NAME', getDatabaseSetting('DB_NAME', 'name', 'quizspark_db'));
define('DB_USER', getDatabaseSetting('DB_USER', 'user', 'root'));
define('DB_PASSWORD', getDatabaseSetting('DB_PASSWORD', 'password', ''));
define('DB_PASS', DB_PASSWORD);

function isProductionEnvironment(): bool
{
    $renderEnvironment = strtolower((string)getenv('RENDER')) === 'true';
    $applicationEnvironment = strtolower((string)getenv('APP_ENV'));
    $requestHost = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
    $requestHost = preg_replace('/:\d+$/', '', $requestHost);
    $isHostedRequest = $requestHost !== '' && !in_array($requestHost, ['localhost', '127.0.0.1', '::1'], true);

    return $renderEnvironment || $isHostedRequest || in_array($applicationEnvironment, ['production', 'prod'], true);
}

function failDatabaseConnection(string $message, ?Throwable $exception = null): void
{
    $debugMessage = $exception ? $exception->getMessage() : $message;
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

    if (ob_get_length()) {
        ob_clean();
    }
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');

    echo json_encode([
        'success'    => false,
        'message'    => 'Database connection error: ' . $debugMessage,
        'error_code' => 'DB_CONNECTION_ERROR',
        'debug'      => $debugMessage
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    exit;
}

function getDBConnection(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
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
                'Database connection failed. Check host, port, database name, and credentials.',
                $e
            );
        }
    }

    return $pdo;
}