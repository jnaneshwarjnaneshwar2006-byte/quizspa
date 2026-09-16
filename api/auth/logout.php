<?php
/**
 * Teacher Logout API Endpoint
 * fahh Live Quiz Application
 */

require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/security.php';

$_SESSION = array();

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

session_destroy();

if (isApiRequest()) {
    sendJsonResponse(true, 'Logged out successfully.');
} else {
    header('Location: ' . getBaseUrl() . '/teacher/login.php');
    exit;
}
