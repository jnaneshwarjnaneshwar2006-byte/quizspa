<?php
/**
 * Question Image Upload Endpoint
 * QuizSpark Live Quiz Application
 */

require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/security.php';

requireTeacherAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, 'Invalid request method.', [], 405);
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $errCode = $_FILES['image']['error'] ?? 'no_file';
    sendJsonResponse(false, 'No image file uploaded or upload error (' . $errCode . ').', [], 400);
}

$file = $_FILES['image'];

// Validate file size (max 5MB)
$maxSize = 5 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    sendJsonResponse(false, 'Image size exceeds maximum limit of 5MB.', [], 400);
}

// Validate MIME type safely using finfo
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$allowedMimes = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif'
];

if (!isset($allowedMimes[$mime])) {
    sendJsonResponse(false, 'Invalid image format. Allowed formats: JPG, PNG, WEBP, GIF.', [], 400);
}

$extension = $allowedMimes[$mime];

// Target directory
$targetDir = __DIR__ . '/../../uploads/questions';
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0777, true);
}
$targetDir = realpath($targetDir);

if (!$targetDir) {
    sendJsonResponse(false, 'Upload directory could not be resolved.', [], 500);
}

// Generate unique sanitized filename
$uniqueName = 'q_' . bin2hex(random_bytes(10)) . '_' . time() . '.' . $extension;
$destination = $targetDir . DIRECTORY_SEPARATOR . $uniqueName;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    sendJsonResponse(false, 'Failed to save uploaded image.', [], 500);
}

// Relative URL for storage and front-end consumption
$relativeUrl = '../uploads/questions/' . $uniqueName;

sendJsonResponse(true, 'Image uploaded successfully!', [
    'url'      => $relativeUrl,
    'filename' => $uniqueName
]);
