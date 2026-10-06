<?php
require_once __DIR__ . '/../config/session.php';
$_SESSION['teacher_id'] = 1;
$_SESSION['teacher_name'] = 'Jnaneshwar B A';
$_SESSION['teacher_email'] = 'jnanesh2006@gmail.com';
$quizId = (int)($_GET['id'] ?? 45);
header("Location: ../teacher/live_lobby.php?id={$quizId}");
exit;
