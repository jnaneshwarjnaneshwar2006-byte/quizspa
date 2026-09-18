<?php
/**
 * Teacher Login API Endpoint
 * fahh Live Quiz Application
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/security.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, 'Invalid request method.', [], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$email = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL);
$password = is_string($input['password'] ?? null) ? $input['password'] : '';
$csrfToken = $input['csrf_token'] ?? '';

if (!$email || empty($password)) {
    sendJsonResponse(false, 'Please provide a valid email and password.', [], 400);
}

if (!validateCsrfToken($csrfToken)) {
    // Note: Allow initial login if session CSRF token is being established
    if (!empty($_SESSION['csrf_token']) && !empty($csrfToken)) {
        sendJsonResponse(false, 'Invalid CSRF security token.', [], 403);
    }
}

try {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("SELECT * FROM `teachers` WHERE `email` = :email LIMIT 1");
    $stmt->execute(['email' => $email]);
    $teacher = $stmt->fetch();

    if (!$teacher || empty($teacher['password_hash']) || !password_verify($password, $teacher['password_hash'])) {
        sendJsonResponse(false, 'Invalid email or password.', [], 401);
    }

    // Regenerate session ID for security against session fixation
    session_regenerate_id(true);

    $_SESSION['teacher_id'] = (int)$teacher['id'];
    $_SESSION['teacher_name'] = $teacher['name'];
    $_SESSION['teacher_email'] = $teacher['email'];
    generateCsrfToken();

    sendJsonResponse(true, 'Login successful!', [
        'teacher' => [
            'id'    => $teacher['id'],
            'name'  => $teacher['name'],
            'email' => $teacher['email']
        ]
    ]);

} catch (Exception $e) {
    sendJsonResponse(false, 'An unexpected server error occurred.', [], 500);
}
