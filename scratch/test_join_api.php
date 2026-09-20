<?php
function testJoin($payload) {
    $opts = [
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => json_encode($payload),
            'ignore_errors' => true
        ]
    ];
    $ctx = stream_context_create($opts);
    $response = file_get_contents('http://127.0.0.1:8000/api/student/join.php', false, $ctx);
    echo "Payload: " . json_encode($payload) . "\n";
    echo "Response: " . $response . "\n\n";
}

echo "--- TEST 1: PIN 240877 (Not in DB) ---\n";
testJoin(['join_code' => '240877', 'name' => 'Jnaneshwar', 'avatar_data' => ['style' => 'boy']]);

echo "--- TEST 2: Invalid PIN (5 digits) ---\n";
testJoin(['join_code' => '12345', 'name' => 'Jnaneshwar', 'avatar_data' => ['style' => 'boy']]);

echo "--- TEST 3: Completed Quiz PIN 413555 ---\n";
testJoin(['join_code' => '413555', 'name' => 'Jnaneshwar', 'avatar_data' => ['style' => 'boy']]);
