<?php
/**
 * Database Configuration & PDO Connection Handler
 * QuizSpark Live Quiz Application
 */

// 1. Load .env file if present in project root
$dotEnvFile = __DIR__ . '/../.env';
if (is_file($dotEnvFile) && is_readable($dotEnvFile)) {
    $lines = file($dotEnvFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if (is_array($lines)) {
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }
            if (strpos($line, '=') !== false) {
                list($envKey, $envVal) = explode('=', $line, 2);
                $envKey = trim($envKey);
                $envVal = trim($envVal);
                if ((str_starts_with($envVal, '"') && str_ends_with($envVal, '"')) ||
                    (str_starts_with($envVal, "'") && str_ends_with($envVal, "'"))) {
                    $envVal = substr($envVal, 1, -1);
                }
                if (!isset($_ENV[$envKey])) {
                    $_ENV[$envKey] = $envVal;
                }
                if (!isset($_SERVER[$envKey])) {
                    $_SERVER[$envKey] = $envVal;
                }
                putenv("{$envKey}={$envVal}");
            }
        }
    }
}

// 2. Load database.local.php if present
$databaseLocalConfig = [];
$databaseLocalConfigFile = __DIR__ . '/database.local.php';
if (is_file($databaseLocalConfigFile) && is_readable($databaseLocalConfigFile)) {
    $loadedDatabaseConfig = require $databaseLocalConfigFile;
    if (is_array($loadedDatabaseConfig)) {
        $databaseLocalConfig = $loadedDatabaseConfig;
    }
}

/**
 * Resolves a database configuration setting across environment sources and local config.
 * Checks: $_ENV -> $_SERVER -> getenv() -> database.local.php -> default.
 */
function getDatabaseSetting(array|string $envNames, string $localName, string $default): string
{
    global $databaseLocalConfig;

    $names = is_array($envNames) ? $envNames : [$envNames];

    foreach ($names as $name) {
        $val = $_ENV[$name] ?? ($_SERVER[$name] ?? getenv($name));
        if ($val !== false && $val !== null && $val !== '') {
            return (string)$val;
        }
    }

    if (array_key_exists($localName, $databaseLocalConfig) && $databaseLocalConfig[$localName] !== null) {
        return (string)$databaseLocalConfig[$localName];
    }

    return $default;
}

if (!defined('DB_HOST')) {
    define('DB_HOST', getDatabaseSetting(['DB_HOST', 'MYSQL_HOST', 'DATABASE_HOST'], 'host', '127.0.0.1'));
}
if (!defined('DB_PORT')) {
    define('DB_PORT', getDatabaseSetting(['DB_PORT', 'MYSQL_PORT', 'DATABASE_PORT'], 'port', '3306'));
}
if (!defined('DB_NAME')) {
    define('DB_NAME', getDatabaseSetting(['DB_NAME', 'MYSQL_DATABASE', 'DATABASE_NAME'], 'name', 'quizspark_db'));
}
if (!defined('DB_USER')) {
    define('DB_USER', getDatabaseSetting(['DB_USER', 'MYSQL_USER', 'DATABASE_USER'], 'user', 'root'));
}
if (!defined('DB_PASSWORD')) {
    define('DB_PASSWORD', getDatabaseSetting(['DB_PASSWORD', 'DB_PASS', 'MYSQL_PASSWORD', 'MYSQL_PASS'], 'password', ''));
}
if (!defined('DB_PASS')) {
    define('DB_PASS', DB_PASSWORD);
}

function isProductionEnvironment(): bool
{
    $renderEnvironment = strtolower((string)(getenv('RENDER') ?: ($_ENV['RENDER'] ?? ($_SERVER['RENDER'] ?? '')))) === 'true';
    $applicationEnvironment = strtolower((string)(getenv('APP_ENV') ?: ($_ENV['APP_ENV'] ?? ($_SERVER['APP_ENV'] ?? ''))));
    $requestHost = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
    $requestHost = preg_replace('/:\d+$/', '', $requestHost);
    $isHostedRequest = $requestHost !== '' && !in_array($requestHost, ['localhost', '127.0.0.1', '::1'], true);

    return $renderEnvironment || $isHostedRequest || in_array($applicationEnvironment, ['production', 'prod'], true);
}

/**
 * Handles database connection failures safely without exposing credentials or internal errors to visitors.
 */
function failDatabaseConnection(string $message, ?Throwable $exception = null): void
{
    // Log detailed diagnostics securely to server error log (masking any sensitive data)
    if ($exception !== null) {
        $rawError = $exception->getMessage();
        $safeError = preg_replace('/(password|pwd)[=:][^\s;,)]+/i', '$1=***', $rawError);
        error_log(sprintf(
            '[QuizSpark DB] Connection failed to %s:%s/%s as user %s: %s',
            DB_HOST,
            DB_PORT,
            DB_NAME,
            DB_USER,
            $safeError
        ));
    } else {
        error_log('[QuizSpark DB Configuration Error] ' . $message);
    }

    if (ob_get_length()) {
        ob_clean();
    }
    http_response_code(500);

    // Detect if the request expects JSON (API calls) or HTML (browser navigation)
    $isJson = false;
    $accept = strtolower((string)($_SERVER['HTTP_ACCEPT'] ?? ''));
    $contentType = strtolower((string)($_SERVER['CONTENT_TYPE'] ?? ''));
    $requestUri = strtolower((string)($_SERVER['REQUEST_URI'] ?? ''));

    if (strpos($accept, 'application/json') !== false ||
        strpos($contentType, 'application/json') !== false ||
        strpos($requestUri, '/api/') !== false) {
        $isJson = true;
    }

    if ($isJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success'    => false,
            'message'    => 'Database connection temporarily unavailable.',
            'error_code' => 'DB_CONNECTION_ERROR'
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } else {
        header('Content-Type: text/html; charset=utf-8');
        echo '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Unavailable - QuizSpark</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: #161f30; border: 1px solid #1e293b; border-radius: 16px; padding: 40px; max-width: 520px; text-align: center; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); }
    h1 { font-size: 1.5rem; color: #f87171; margin-bottom: 12px; }
    p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; margin-bottom: 24px; }
    .btn { display: inline-block; background: #4f46e5; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; transition: background 0.2s; }
    .btn:hover { background: #4338ca; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Database connection temporarily unavailable.</h1>
    <p>We are currently experiencing a brief connection issue with the database service. Please try refreshing in a few moments.</p>
    <a href="javascript:location.reload()" class="btn">🔄 Refresh Page</a>
  </div>
</body>
</html>';
    }

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
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
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
                'Database connection failed.',
                $e
            );
        }
    }

    return $pdo;
}