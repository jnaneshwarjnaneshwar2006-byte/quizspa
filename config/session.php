<?php
/**
 * Session Management & Base URL Resolution
 * QuizSpark Live Quiz Application
 */

if (session_status() === PHP_SESSION_NONE) {
    // Set secure session parameters
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    
    // Persistent sessions (30 days)
    ini_set('session.cookie_lifetime', (string)(86400 * 30));
    ini_set('session.gc_maxlifetime', (string)(86400 * 30));
    
    session_start();
}

if (!defined('QUIZSPARK_PRODUCTION_BASE_URL')) {
    define('QUIZSPARK_PRODUCTION_BASE_URL', 'https://quizspark.rf.gd');
}

/**
 * Returns canonical production base URL (without trailing slash)
 */
function getProductionBaseUrl(): string {
    return 'https://quizspark.rf.gd';
}

/**
 * Generates authoritative student sharing/join URL for published quizzes
 * Format: https://quizspark.rf.gd/student/join.php?code=XXXXXX
 */
function getStudentJoinUrl(string $joinCode): string {
    $cleanCode = preg_replace('/[^0-9]/', '', $joinCode);
    return 'https://quizspark.rf.gd/student/join.php?code=' . $cleanCode;
}

/**
 * Returns dynamic Base URL without trailing slash
 */
function getBaseUrl(): string {
    $host = $_SERVER['HTTP_HOST'] ?? '';
    
    // If on production domain or InfinityFree host, return canonical production base URL
    if (strpos($host, 'quizspark.rf.gd') !== false) {
        return 'https://quizspark.rf.gd';
    }

    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['SERVER_PORT'] ?? 80) == 443 ? 'https' : 'http';
    $host = !empty($host) ? $host : 'quizspark.rf.gd';
    
    // Deduce subdirectory if hosted under folder
    $scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? ''));
    $baseDir = rtrim($scriptDir, '/');
    
    // Trim known subfolders if present in SCRIPT_NAME
    $subfolders = ['/teacher', '/student', '/api/auth', '/api/quiz', '/api/live', '/api/student', '/api/upload', '/api', '/api/creator/ai'];
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
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'] ?: '/',
            $params['domain'] ?? '',
            (bool)$params['secure'],
            (bool)$params['httponly']
        );
    }

    if (session_status() === PHP_SESSION_ACTIVE) {
        session_destroy();
    }

    setcookie(
        'student_token',
        '',
        time() - 42000,
        '/',
        '',
        (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        true
    );
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
    if (!empty($_SESSION['student_token'])) {
        return $_SESSION['student_token'];
    }
    if (!empty($_COOKIE['student_token'])) {
        return $_COOKIE['student_token'];
    }
    if (!empty($_GET['token'])) {
        return trim((string)$_GET['token']);
    }
    if (!empty($_SERVER['HTTP_X_STUDENT_TOKEN'])) {
        return trim((string)$_SERVER['HTTP_X_STUDENT_TOKEN']);
    }
    if (!empty($_SERVER['HTTP_AUTHORIZATION']) && preg_match('/Bearer\s+(\S+)/i', $_SERVER['HTTP_AUTHORIZATION'], $m)) {
        return trim($m[1]);
    }
    return null;
}

function setStudentToken(string $token): void {
    $_SESSION['student_token'] = $token;
    setcookie('student_token', $token, time() + (86400 * 7), '/'); // 7 days
}

function clearStudentToken(): void {
    unset($_SESSION['student_token']);
    setcookie('student_token', '', time() - 3600, '/');
}
