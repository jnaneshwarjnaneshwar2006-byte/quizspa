<?php
$payload = json_encode([
    'join_code'   => '428857',
    'name'        => 'Jnanesh',
    'avatar_data' => [
        'style'     => 'boy',
        'hair'      => 'hair_boy_fade',
        'top'       => 'top_tshirt',
        'topColor'  => 'blue'
    ]
]);

$ch = curl_init('http://localhost/q1/api/student/join.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$res = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response:\n$res\n";
