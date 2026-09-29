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
    $joinUrl = getStudentJoinUrl($joinCode);

    $upd = $pdo->prepare("UPDATE `quizzes` SET `status` = 'published', `join_code` = :code, `join_url` = :url, `published_at` = NOW() WHERE `id` = :id");
    $upd->execute(['code' => $joinCode, 'url' => $joinUrl, 'id' => $quizId]);

    $quiz['status'] = 'published';
    $quiz['join_code'] = $joinCode;
    $quiz['join_url'] = $joinUrl;
}

$joinUrl = getStudentJoinUrl($quiz['join_code']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quiz Published - QuizSpark</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/lobby.css">
  <!-- Local Standalone QRCode Library with CDN fallback -->
  <script src="../assets/js/qrcode.min.js"></script>
</head>
<body>
  <div class="app-container" style="max-width: 720px; margin-top: 40px; padding: 0 16px;">
    <div class="card animate-pop" style="text-align: center; padding: 36px 24px;">
      <div style="font-size: 3rem; margin-bottom: 8px;">🎉</div>
      <h1 style="color: var(--accent-cyan); font-size: 2.2rem; margin-bottom: 6px;">QUIZ PUBLISHED</h1>
      <p style="color: var(--text-muted); font-size: 1.05rem; margin-bottom: 24px;">Your quiz is ready for students to join!</p>

      <div style="background: rgba(0,0,0,0.28); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 28px;">
        <h2 style="font-size: 1.5rem; margin-bottom: 12px; color: #ffffff;"><?= htmlspecialchars($quiz['title']) ?></h2>
        
        <p style="color: var(--text-muted); font-weight: 700; letter-spacing: 1px; font-size: 0.85rem; margin-bottom: 6px;">GAME PIN / JOIN CODE</p>
        <div class="join-code-badge" id="joinCodeText"><?= htmlspecialchars($quiz['join_code']) ?></div>

        <div style="margin: 24px 0 16px;">
          <div class="qr-box" style="padding: 14px; background: #ffffff; border-radius: 12px; display: inline-block;">
            <div id="qrcode" style="min-width: 200px; min-height: 200px; display: flex; align-items: center; justify-content: center;"></div>
          </div>
          <div id="qrFallbackMsg" style="display: none; color: #e17055; font-size: 0.9rem; margin-top: 8px; font-weight: 600;">
            QR code could not be generated. Use the student join link below.
          </div>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 8px;">
            📱 Students scan this QR code using their phone camera to open the join page
          </p>
        </div>

        <div class="form-group" style="margin-top: 20px; text-align: left;">
          <label class="form-label" style="font-weight: 700; color: var(--text-muted);">Student Join Link</label>
          <div class="join-url-container">
            <input type="text" id="joinUrlInput" class="form-control join-url-input" value="<?= htmlspecialchars($joinUrl) ?>" readonly style="font-family: monospace; font-size: 0.95rem;">
            <button type="button" onclick="copyJoinUrl()" class="btn btn-primary" id="copyUrlBtn" style="white-space: nowrap;">📋 COPY JOIN LINK</button>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; width: 100%;">
        <button type="button" onclick="copyJoinCode()" class="btn btn-secondary btn-lg" id="copyCodeBtn">🔢 Copy Code</button>
        <a href="live_lobby.php?id=<?= $quizId ?>" class="btn btn-primary btn-lg">🚀 Open Live Lobby</a>
        <a href="quizzes.php" class="btn btn-secondary btn-lg">My Quizzes</a>
      </div>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const joinUrl = <?= json_encode($joinUrl) ?>;
      const qrcodeContainer = document.getElementById('qrcode');
      const fallbackMsg = document.getElementById('qrFallbackMsg');

      // Generate QR code using local QRCode library with remote API & SVG fallback
      try {
        if (typeof QRCode !== 'undefined') {
          new QRCode(qrcodeContainer, {
            text: joinUrl,
            width: 220,
            height: 220,
            colorDark : "#0f0c1b",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
          });
        } else {
          renderFallbackQr(qrcodeContainer, fallbackMsg, joinUrl);
        }
      } catch(e) {
        console.warn('Local QRCode generator error, falling back:', e);
        renderFallbackQr(qrcodeContainer, fallbackMsg, joinUrl);
      }
    });

    function renderFallbackQr(container, fallbackMsg, text) {
      if (!container) return;
      const img = document.createElement('img');
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(text)}`;
      img.alt = 'Student Join QR Code';
      img.style.width = '220px';
      img.style.height = '220px';
      img.style.display = 'block';
      img.onload = () => {
        container.innerHTML = '';
        container.appendChild(img);
      };
      img.onerror = () => {
        if (fallbackMsg) fallbackMsg.style.display = 'block';
        container.innerHTML = `<div style="padding: 20px; color: #2d3436; font-size: 0.85rem; font-weight: 700;">[ QR Code Unavailable ]</div>`;
      };
      container.innerHTML = '';
      container.appendChild(img);
    }

    function copyJoinCode() {
      const code = document.getElementById('joinCodeText').innerText.trim();
      navigator.clipboard.writeText(code).then(() => {
        const btn = document.getElementById('copyCodeBtn');
        const oldText = btn.innerHTML;
        btn.innerHTML = '✓ Copied Code!';
        setTimeout(() => { btn.innerHTML = oldText; }, 2000);
      }).catch(() => {
        alert('Join code: ' + code);
      });
    }

    function copyJoinUrl() {
      const urlInput = document.getElementById('joinUrlInput');
      urlInput.select();
      navigator.clipboard.writeText(urlInput.value).then(() => {
        const btn = document.getElementById('copyUrlBtn');
        const oldText = btn.innerHTML;
        btn.innerHTML = '✓ Copied Link!';
        setTimeout(() => { btn.innerHTML = oldText; }, 2000);
      }).catch(() => {
        alert('Join URL: ' + urlInput.value);
      });
    }
  </script>
</body>
</html>
