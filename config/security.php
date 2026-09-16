<?php
/**
 * Security, CSRF, Sanitization, and JSON Response Helpers
 * QuizSpark Live Quiz Application
 */

require_once __DIR__ . '/session.php';

/**
 * Generate CSRF Token for forms and AJAX headers
 */
function generateCsrfToken(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Validate CSRF Token
 */
function validateCsrfToken(?string $token): bool {
    if (empty($_SESSION['csrf_token']) || empty($token)) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Sanitize user string input
 */
function sanitizeString(?string $str): string {
    if ($str === null) return '';
    return htmlspecialchars(trim($str), ENT_QUOTES, 'UTF-8');
}

function isValidMediaUrl(?string $url): bool {
    if (empty($url)) {
        return false;
    }

    if (filter_var($url, FILTER_VALIDATE_URL)) {
        $scheme = strtolower((string)parse_url($url, PHP_URL_SCHEME));
        return in_array($scheme, ['http', 'https'], true);
    }

    // Allow local uploaded file paths
    if (preg_match('/^(\/|\.\.\/|\.\/)?uploads\/[a-zA-Z0-9_\-\.\/]+$/i', $url)) {
        return true;
    }

    return false;
}

/**
 * Return JSON response and exit
 */
function sendJsonResponse(bool $success, string $message, array $data = [], int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data'    => $data
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * High precision time in seconds (float)
 */
function getMicroTime(): float {
    return microtime(true);
}

/**
 * Generate 6-digit numeric join code
 */
function generateJoinCode(): string {
    return sprintf('%06d', mt_rand(100000, 999999));
}
