<?php

if (session_status() === PHP_SESSION_NONE) {
	session_start();
}

$_SESSION = array();

if (ini_get('session.use_cookies')) {
	$params = session_get_cookie_params();
	setcookie(
		session_name(),
		'',
		time() - 42000,
		$params['path'] ? $params['path'] : '/',
		isset($params['domain']) ? $params['domain'] : '',
		!empty($params['secure']),
		!empty($params['httponly'])
	);
}

if (session_status() === PHP_SESSION_ACTIVE) {
	session_destroy();
}

setcookie(
	'student_token',
	'',
	time() - 42000,
	'/',
	'',
	!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
	true
);

header('Location: login.php', true, 303);
exit;
