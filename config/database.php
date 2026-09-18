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

    if (isset($databaseLocalConfig[$localName]) && $databaseLocalConfig[$localName] !== '') {
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

            foreach ([
                'DB_HOST' => DB_HOST,
                'DB_PORT' => DB_PORT,
                'DB_NAME' => DB_NAME,
                'DB_USER' => DB_USER,
                'DB_PASSWORD' => DB_PASSWORD,
            ] as $variable => $value) {
                if ($value === '') {
                    $missingVariables[] = $variable;
                }
            }

            if ($missingVariables !== []) {
                failDatabaseConnection(
                    'Hosted database configuration is incomplete. Set the database values in environment variables or config/database.local.php: ' .
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