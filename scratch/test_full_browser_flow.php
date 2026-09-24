<?php
// Test full session browser flow for both http://localhost/q1 and http://localhost/QuizSpark

function testBrowserSessionFlow($baseUrl) {
    echo "==================================================\n";
    echo "Testing full browser session flow for: $baseUrl\n";
    echo "==================================================\n";
    
    $cookieFile = tempnam(sys_get_temp_dir(), 'cookie_');
    
    // Step 1: GET teacher/login.php to get session cookie & CSRF token
    $loginPageUrl = $baseUrl . '/teacher/login.php';
    echo "[1] GET $loginPageUrl ...\n";
    $ch = curl_init($loginPageUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_COOKIEJAR, $cookieFile);
    curl_setopt($ch, CURLOPT_COOKIEFILE, $cookieFile);
    $html = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "    HTML Response HTTP Code: $httpCode\n";
    
    // Extract CSRF token from HTML input
    if (preg_match('/id="csrfToken"\s+value="([^"]+)"/', $html, $matches)) {
        $csrfToken = $matches[1];
        echo "    Extracted CSRF Token: $csrfToken\n";
    } else {
        echo "    ERROR: Could not extract CSRF token from login page HTML!\n";
        return;
    }
    
    // Step 2: POST to api/auth/login.php with extracted CSRF token and cookie
    $apiUrl = $baseUrl . '/api/auth/login.php';
    echo "[2] POST $apiUrl ...\n";
    $ch = curl_init($apiUrl);
    $payload = json_encode([
        'email' => 'jnanesh2006@gmail.com',
        'password' => '123456',
        'csrf_token' => $csrfToken
    ]);
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_COOKIEJAR, $cookieFile);
    curl_setopt($ch, CURLOPT_COOKIEFILE, $cookieFile);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'X-Requested-With: XMLHttpRequest'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);
    
    echo "    API Response HTTP Code: $httpCode\n";
    echo "    Curl Error: $curlErr\n";
    echo "    API Raw Response: $response\n";
    
    @unlink($cookieFile);
}

testBrowserSessionFlow('http://localhost/q1');
testBrowserSessionFlow('http://localhost/QuizSpark');
testBrowserSessionFlow('http://localhost/quizspark');
