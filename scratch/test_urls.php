<?php
$paths = ['q1', 'quizspark', 'teacher/login.php', 'q1/teacher/login.php', 'api/auth/login.php', 'quizspark/api/auth/login.php', 'q1/api/auth/login.php'];
foreach ($paths as $p) {
    $url = 'http://localhost/' . $p;
    $headers = @get_headers($url);
    echo $p . ' => ' . ($headers ? $headers[0] : 'FAILED') . "\n";
}
