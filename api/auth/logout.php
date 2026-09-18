<?php
/**
 * Teacher Logout API Endpoint
 * fahh Live Quiz Application
 */

require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/security.php';

clearQuizSparkSession();

if (isApiRequest()) {
    sendJsonResponse(true, 'Logged out successfully.');
} else {
    header('Location: ' . getBaseUrl() . '/teacher/login.php');
    exit;
}
