<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/security.php';

requireTeacherAuth();

$quizId = (int)($_GET['id'] ?? 0);
if (!$quizId) {
    header('Location: dashboard.php');
    exit;
}

$pdo = getDBConnection();
$teacherId = getTeacherId();

// Verify Quiz
$stmt = $pdo->prepare("SELECT * FROM `quizzes` WHERE `id` = :id AND `teacher_id` = :teacher_id");
$stmt->execute(['id' => $quizId, 'teacher_id' => $teacherId]);
$quiz = $stmt->fetch();

if (!$quiz) {
    header('Location: dashboard.php');
    exit;
}

// Auto-publish if draft
if (empty($quiz['join_code']) || $quiz['status'] === 'draft') {
    $joinCode = generateJoinCode();
    $joinUrl = getBaseUrl() . '/student/join.php?code=' . $joinCode;

    $upd = $pdo->prepare("UPDATE `quizzes` SET `status` = 'published', `join_code` = :code, `join_url` = :url, `published_at` = NOW() WHERE `id` = :id");
    $upd->execute(['code' => $joinCode, 'url' => $joinUrl, 'id' => $quizId]);

    $quiz['status'] = 'published';
    $quiz['join_code'] = $joinCode;
    $quiz['join_url'] = $joinUrl;
}

$joinUrl = $quiz['join_url'] ?: (getBaseUrl() . '/student/join.php?code=' . $quiz['join_code']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quiz Published - QuizSpark</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/lobby.css">
  <!-- QRCode JS CDN with fallback script -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
</head>
<body>
  <div class="app-container" style="max-width: 720px; margin-top: 40px;">
    <div class="card animate-pop" style="text-align: center; padding: 40px;">
      <div style="font-size: 3rem; margin-bottom: 10px;">🎉</div>
      <h1 style="color: var(--accent-cyan); font-size: 2.2rem;">QUIZ PUBLISHED</h1>
      <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 24px;">Your quiz is ready for students to join!</p>

      <div style="background: rgba(0,0,0,0.25); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 30px;">
        <h2 style="font-size: 1.5rem; margin-bottom: 8px;"><?= htmlspecialchars($quiz['title']) ?></h2>
        
        <p style="color: var(--text-muted); font-weight: 600;">JOIN CODE</p>
        <div class="join-code-badge" id="joinCodeText"><?= htmlspecialchars($quiz['join_code']) ?></div>

        <div style="margin: 20px 0;">
          <div class="qr-box">
            <div id="qrcode"></div>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 8px;">Students scan this QR code using their phone camera</p>
        </div>

        <div class="form-group" style="margin-top: 20px;">
          <label class="form-label">Student Join URL</label>
          <div style="display: flex; gap: 8px;">
            <input type="text" id="joinUrlInput" class="form-control" value="<?= htmlspecialchars($joinUrl) ?>" readonly style="font-family: monospace;">
            <button type="button" onclick="copyJoinUrl()" class="btn btn-secondary">📋 Copy</button>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
        <button onclick="copyJoinCode()" class="btn btn-secondary">🔢 Copy Code</button>
        <a href="live_lobby.php?id=<?= $quizId ?>" class="btn btn-primary btn-lg">🚀 Open Live Lobby</a>
        <a href="quizzes.php" class="btn btn-secondary btn-lg">Dashboard</a>
      </div>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const joinUrl = <?= json_encode($joinUrl) ?>;
      const qrcodeContainer = document.getElementById('qrcode');

      // Generate QR code using QRCode library or SVG fallback
      try {
        if (typeof QRCode !== 'undefined') {
          new QRCode(qrcodeContainer, {
            text: joinUrl,
            width: 180,
            height: 180,
            colorDark : "#0f0c1b",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
          });
        } else {
          renderFallbackQr(qrcodeContainer, joinUrl);
        }
      } catch(e) {
        renderFallbackQr(qrcodeContainer, joinUrl);
      }
    });

    function renderFallbackQr(container, text) {
      container.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(text)}" alt="QR Code" style="width: 180px; height: 180px;">`;
    }

    function copyJoinCode() {
      const code = document.getElementById('joinCodeText').innerText;
      navigator.clipboard.writeText(code);
      alert('Join code copied to clipboard: ' + code);
    }

    function copyJoinUrl() {
      const urlInput = document.getElementById('joinUrlInput');
      urlInput.select();
      navigator.clipboard.writeText(urlInput.value);
      alert('Join URL copied to clipboard!');
    }
  </script>
</body>
</html>
