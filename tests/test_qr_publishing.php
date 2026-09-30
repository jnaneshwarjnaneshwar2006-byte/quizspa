<?php
/**
 * Test Suite: QR Code in Quiz Published Success Message Verification
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/security.php';

echo "========================================================\n";
echo "=== TESTING QR CODE IN 'QUIZ PUBLISHED' MESSAGE BOX ===\n";
echo "========================================================\n\n";

$allPassed = true;

function assertCondition($name, $condition) {
    global $allPassed;
    if ($condition) {
        echo "[PASS] $name\n";
    } else {
        echo "[FAIL] $name\n";
        $allPassed = false;
    }
}

// 1. Verify getStudentJoinUrl format
$testCode = '482910';
$joinUrl = getStudentJoinUrl($testCode);
assertCondition("getStudentJoinUrl generates valid student join URL with PIN", strpos($joinUrl, '/student/join.php?code=482910') !== false);

// 2. Verify teacher/publish.php contents
$publishPhp = file_get_contents(__DIR__ . '/../teacher/publish.php');
assertCondition("teacher/publish.php contains qrcode.min.js script inclusion", strpos($publishPhp, 'assets/js/qrcode.min.js') !== false);
assertCondition("teacher/publish.php contains QUIZ PUBLISHED success heading", strpos($publishPhp, 'QUIZ PUBLISHED') !== false);
assertCondition("teacher/publish.php contains joinCodeText container", strpos($publishPhp, 'id="joinCodeText"') !== false);
assertCondition("teacher/publish.php contains QR code container", strpos($publishPhp, 'id="qrcode"') !== false);
assertCondition("teacher/publish.php contains 'Scan to Join' text", strpos($publishPhp, 'Scan to Join') !== false);
assertCondition("teacher/publish.php contains Student Join Link input", strpos($publishPhp, 'id="joinUrlInput"') !== false);
assertCondition("teacher/publish.php contains 'Copy Join Link' button", strpos($publishPhp, 'Copy Join Link') !== false || strpos($publishPhp, 'COPY JOIN LINK') !== false);
assertCondition("teacher/publish.php contains 'Download QR' button", strpos($publishPhp, 'Download QR') !== false);
assertCondition("teacher/publish.php contains QRCode client rendering with API fallback", strpos($publishPhp, 'api.qrserver.com') !== false && strpos($publishPhp, 'new QRCode') !== false);
assertCondition("teacher/publish.php contains downloadQrCode function", strpos($publishPhp, 'function downloadQrCode') !== false);

// 3. Verify teacher/ai_generator.php contents
$aiGenPhp = file_get_contents(__DIR__ . '/../teacher/ai_generator.php');
assertCondition("teacher/ai_generator.php contains qrcode.min.js script inclusion", strpos($aiGenPhp, 'assets/js/qrcode.min.js') !== false);
assertCondition("teacher/ai_generator.php contains publishModalOverlay modal", strpos($aiGenPhp, 'id="publishModalOverlay"') !== false);
assertCondition("teacher/ai_generator.php contains publishedJoinCodeDisplay", strpos($aiGenPhp, 'id="publishedJoinCodeDisplay"') !== false);
assertCondition("teacher/ai_generator.php contains publishModalQrCode container", strpos($aiGenPhp, 'id="publishModalQrCode"') !== false);
assertCondition("teacher/ai_generator.php contains 'Scan to Join' text", strpos($aiGenPhp, 'Scan to Join') !== false);
assertCondition("teacher/ai_generator.php contains publishedJoinUrlInput", strpos($aiGenPhp, 'id="publishedJoinUrlInput"') !== false);
assertCondition("teacher/ai_generator.php contains Copy Join Link button in modal", strpos($aiGenPhp, 'btnCopyModalUrl') !== false);
assertCondition("teacher/ai_generator.php contains Download QR button in modal", strpos($aiGenPhp, 'btnDownloadModalQr') !== false);
assertCondition("teacher/ai_generator.php contains renderQrCodeHelper invocation on publish", strpos($aiGenPhp, 'renderQrCodeHelper') !== false);
assertCondition("teacher/ai_generator.php contains downloadQrCode function", strpos($aiGenPhp, 'function downloadQrCode') !== false);

// 4. Verify assets/js/qrcode.min.js exists and is valid
$qrJs = file_get_contents(__DIR__ . '/../assets/js/qrcode.min.js');
assertCondition("assets/js/qrcode.min.js exists and defines QRCode", strpos($qrJs, 'QRCode') !== false);

echo "\n========================================================\n";
if ($allPassed) {
    echo "ALL QR CODE PUBLISHING VERIFICATION TESTS PASSED!\n";
} else {
    echo "SOME TESTS FAILED!\n";
    exit(1);
}
echo "========================================================\n";
