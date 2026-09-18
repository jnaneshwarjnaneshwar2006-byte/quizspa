<?php
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/security.php';

// If teacher is already logged in, redirect to dashboard
if (isTeacherLoggedIn()) {
    header('Location: ' . getBaseUrl() . '/teacher/dashboard.php');
    exit;
}

$csrfToken = generateCsrfToken();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teacher Login - QuizSpark Live Quiz</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/auth.css">
</head>
<body>
  <div class="auth-wrapper">
    <div class="auth-card animate-pop">
      <div class="auth-header">
        <a href="../index.php" class="brand-logo" style="margin-bottom: 12px;">QuizSpark <span class="brand-badge">PRO</span></a>
        <h1>Teacher Portal</h1>
        <p>Sign in to manage and launch live interactive quizzes</p>
      </div>

      <div id="alertContainer"></div>

      <form id="loginForm" autocomplete="off">
        <input type="hidden" id="csrfToken" value="<?= htmlspecialchars($csrfToken) ?>">
        
        <div class="form-group">
          <label class="form-label" for="email">Email Address</label>
          <input type="email" id="email" name="login_email" class="form-control" autocomplete="off" required readonly>
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input type="password" id="password" name="login_password" class="form-control" autocomplete="new-password" required readonly>
        </div>

        <button type="submit" id="loginBtn" class="btn btn-primary btn-block btn-lg" style="margin-top: 10px;">
          Login to Dashboard
        </button>
      </form>

      <div style="text-align: center; margin-top: 24px;">
        <a href="../index.php" style="color: var(--text-muted); text-decoration: none; font-size: 0.9rem;">← Back to Home</a>
      </div>
    </div>
  </div>

  <script src="../assets/js/auth.js"></script>
</body>
</html>
