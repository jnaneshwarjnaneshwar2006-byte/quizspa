<?php
require_once __DIR__ . '/config/session.php';
require_once __DIR__ . '/config/security.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QuizSpark - Real-Time Live Quiz Platform</title>
  <link rel="stylesheet" href="assets/css/style.css">
  <style>
    .hero-section {
      min-height: 85vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px 20px;
    }
    .hero-title {
      font-size: 4rem;
      font-weight: 900;
      line-height: 1.1;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #ffffff 0%, #a29bfe 50%, #fd79a8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-subtitle {
      font-size: 1.3rem;
      color: var(--text-muted);
      max-width: 680px;
      margin: 0 auto 36px auto;
    }
    .hero-buttons {
      display: flex;
      gap: 20px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-top: 60px;
      width: 100%;
      max-width: 1100px;
    }
    .feature-card {
      background: rgba(24, 20, 42, 0.6);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      padding: 30px;
      text-align: left;
      backdrop-filter: blur(10px);
      transition: transform var(--transition-bounce), border-color 0.2s ease;
    }
    .feature-card:hover {
      transform: translateY(-6px);
      border-color: var(--primary);
    }
    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 16px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <nav style="display: flex; justify-content: space-between; align-items: center; padding: 20px 0;">
      <a href="index.php" class="brand-logo">QuizSpark <span class="brand-badge">LIVE QUIZ</span></a>
      <div>
        <?php if (isTeacherLoggedIn()): ?>
          <a href="teacher/dashboard.php" class="btn btn-primary">📊 Teacher Dashboard</a>
        <?php else: ?>
          <a href="teacher/login.php" class="btn btn-secondary">Teacher Login</a>
        <?php endif; ?>
      </div>
    </nav>

    <div class="hero-section">
      <div class="brand-badge animate-pop" style="margin-bottom: 16px; font-size: 0.85rem; padding: 6px 16px;">
        ⚡ Instant Real-Time Live Quiz Platform
      </div>
      <h1 class="hero-title animate-pop">Engage Students Live with Instant Speed Quizzes</h1>
      <p class="hero-subtitle animate-pop">
        Host live quiz sessions, auto-generate QR codes and join codes, track responses in real time, and award speed-based points with zero latency.
      </p>

      <div class="hero-buttons animate-pop">
        <a href="teacher/login.php" class="btn btn-primary btn-lg" style="font-size: 1.3rem; padding: 18px 40px;">
          👨‍🏫 Host a Quiz (Teacher Login)
        </a>
      </div>

      <!-- Features Grid -->
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📲</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 8px;">Instant QR & Code Join</h3>
          <p style="color: var(--text-muted); font-size: 0.95rem;">
            Students scan a QR code or enter a unique 6-digit PIN from mobile/desktop without creating any user account.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 8px;">Real-Time Polling Engine</h3>
          <p style="color: var(--text-muted); font-size: 0.95rem;">
            Single-flight AJAX polling updates joined players, active question state, and live answer statistics every ~1 second.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🏆</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 8px;">Speed Scoring System</h3>
          <p style="color: var(--text-muted); font-size: 0.95rem;">
            Server-validated timing rewards fast correct responses with up to 1000 points, followed by animated 🥇🥈🥉 podium leaderboards.
          </p>
        </div>
      </div>
    </div>

    <footer class="app-footer">
      &copy; <?= date('Y') ?> <strong>QuizSpark</strong> Live Quiz Platform. Built with PHP 8, MySQL, and Vanilla Web Technologies.
    </footer>
  </div>
</body>
</html>
