<?php
require_once __DIR__ . '/../config/session.php';

clearQuizSparkSession();
header('Location: ' . getBaseUrl() . '/teacher/login.php');
exit;
