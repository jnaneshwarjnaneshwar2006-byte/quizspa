<?php
/**
 * Session Management & Base URL Resolution
 * QuizSpark Live Quiz Application
 */

if (session_status() === PHP_SESSION_NONE) {
    // Set secure session parameters
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    session_start();
}

/**
 * Returns dynamic Base URL without trailing slash
 * Example: http://localhost:8000 or https://fahh.example.com
 */
function getBaseUrl(): string {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['SERVER_PORT'] ?? 80) == 443 ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost:8000';
    
    // Deduce subdirectory if hosted under folder
    $scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? ''));
    $baseDir = rtrim($scriptDir, '/');
    
    // Trim known subfolders if present in SCRIPT_NAME
    $subfolders = ['/teacher', '/student', '/api/auth', '/api/quiz', '/api/live', '/api/student', '/api/upload', '/api'];
    foreach ($subfolders as $sf) {
        if (substr($baseDir, -strlen($sf)) === $sf) {
            $baseDir = substr($baseDir, 0, -strlen($sf));
        }
    }
    
    return $protocol . '://' . $host . rtrim($baseDir, '/');
}

/**
 * Teacher session authentication helpers
 */
function isTeacherLoggedIn(): bool {
    return !empty($_SESSION['teacher_id']);
}

function getTeacherId(): ?int {
    return $_SESSION['teacher_id'] ?? null;
}

function clearQuizSparkSession(): void {
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires' => time() - 42000,
            'path' => $params['path'] ?: '/',
            'domain' => $params['domain'] ?? '',
            'secure' => (bool)$params['secure'],
            'httponly' => (bool)$params['httponly'],
            'samesite' => $params['samesite'] ?? 'Lax',
        ]);
    }

    if (session_status() === PHP_SESSION_ACTIVE) {
        session_destroy();
    }

    setcookie('student_token', '', [
        'expires' => time() - 42000,
        'path' => '/',
        'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function requireTeacherAuth(): void {
    if (!isTeacherLoggedIn()) {
        if (isApiRequest()) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'Unauthorized. Please log in as a teacher.'
            ]);
            exit;
        } else {
            header('Location: ' . getBaseUrl() . '/teacher/login.php');
            exit;
        }
    }
}

function isApiRequest(): bool {
    return strpos($_SERVER['REQUEST_URI'] ?? '', '/api/') !== false;
}

/**
 * Student participant token helper
 */
function getStudentToken(): ?string {
    return $_SESSION['student_token'] ?? $_COOKIE['student_token'] ?? null;
}

function setStudentToken(string $token): void {
    $_SESSION['student_token'] = $token;
    setcookie('student_token', $token, time() + (86400 * 7), '/'); // 7 days
}

function clearStudentToken(): void {
    unset($_SESSION['student_token']);
    setcookie('student_token', '', time() - 3600, '/');
}
