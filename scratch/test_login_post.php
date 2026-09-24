<?php
// Test POST login to http://localhost/q1/api/auth/login.php

function testLogin($url, $email, $password) {
    echo "Testing POST to $url with email: $email ...\n";
    $ch = curl_init($url);
    $payload = json_encode(['email' => $email, 'password' => $password, 'csrf_token' => 'test']);
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'X-Requested-With: XMLHttpRequest'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    
    echo "HTTP Code: $httpCode\n";
    echo "Curl Error: $err\n";
    echo "Response: $response\n";
    echo "----------------------------------------\n";
}

testLogin('http://localhost/q1/api/auth/login.php', 'jnanesh2006@gmail.com', '123456');
testLogin('http://localhost/q1/api/auth/login.php', 'jnanesh2006@gmail.com', 'wrongpassword');
testLogin('http://localhost/QuizSpark/api/auth/login.php', 'jnanesh2006@gmail.com', '123456');
