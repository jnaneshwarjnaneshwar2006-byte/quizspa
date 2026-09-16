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

$stmt = $pdo->prepare("SELECT * FROM `quizzes` WHERE `id` = :id AND `teacher_id` = :teacher_id");
$stmt->execute(['id' => $quizId, 'teacher_id' => $teacherId]);
$quiz = $stmt->fetch();

if (!$quiz) {
    header('Location: dashboard.php');
    exit;
}

// Auto update status to 'lobby' if currently 'published'
if ($quiz['status'] === 'published') {
    $upd = $pdo->prepare("UPDATE `quizzes` SET `status` = 'lobby' WHERE `id` = :id");
    $upd->execute(['id' => $quizId]);
    $quiz['status'] = 'lobby';
}

$joinUrl = $quiz['join_url'] ?: (getBaseUrl() . '/student/join.php?code=' . $quiz['join_code']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Lobby - <?= htmlspecialchars($quiz['title']) ?> - QuizSpark</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/lobby.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
</head>
<body>
  <div class="lobby-container">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <a href="dashboard.php" class="brand-logo">QuizSpark <span class="brand-badge">LIVE LOBBY</span></a>
      <a href="dashboard.php" class="btn btn-secondary">Exit Lobby</a>
    </div>

    <!-- Header Banner -->
    <div class="lobby-header animate-pop">
      <p style="text-transform: uppercase; letter-spacing: 2px; color: var(--accent-cyan); font-weight: 800; font-size: 0.9rem;">
        ⚡ Live Quiz Session
      </p>
      <h1 style="font-size: 2.4rem; margin: 6px 0;"><?= htmlspecialchars($quiz['title']) ?></h1>

      <div style="display: flex; justify-content: center; align-items: center; gap: 30px; flex-wrap: wrap; margin-top: 15px;">
        <div>
          <p style="font-size: 0.85rem; color: var(--text-muted); font-weight: 700;">JOIN CODE</p>
          <div class="join-code-badge" style="margin: 5px 0; font-size: 3rem;"><?= htmlspecialchars($quiz['join_code']) ?></div>
        </div>

        <div class="qr-box" style="margin: 0;">
          <div id="qrcode"></div>
        </div>
      </div>

      <div class="lobby-meta-bar">
        <span style="font-size: 0.9rem; color: var(--text-muted);">
          🌐 Join URL: <code style="color: #a29bfe; font-size: 0.95rem;"><?= htmlspecialchars($joinUrl) ?></code>
        </span>
        <button type="button" onclick="copyJoinUrl()" class="btn btn-secondary btn-sm">📋 Copy Link</button>
      </div>
    </div>

    <!-- Players Counter & Live Grid -->
    <div class="card">
      <div class="players-counter">
        <span>👥 PLAYERS JOINED:</span>
        <span id="playerCountDisplay" style="font-size: 2rem; color: var(--accent-yellow);">0</span>
      </div>

      <div id="playersGrid" class="players-grid">
        <div style="grid-column: 1 / -1; color: var(--text-muted); padding: 30px;" id="emptyMsg">
          ⏳ Waiting for students to join using code <strong><?= htmlspecialchars($quiz['join_code']) ?></strong>...
        </div>
      </div>

      <div style="margin-top: 20px;">
        <button id="startQuizBtn" class="btn btn-primary btn-lg btn-block" style="font-size: 1.4rem; padding: 18px;" disabled>
          🚀 START QUIZ (0 Players)
        </button>
      </div>
    </div>
  </div>

  <script src="../assets/js/lobby.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const quizId = <?= $quizId ?>;
      const joinUrl = <?= json_encode($joinUrl) ?>;

      // Render QR
      const qrContainer = document.getElementById('qrcode');
      try {
        if (typeof QRCode !== 'undefined') {
          new QRCode(qrContainer, {
            text: joinUrl,
            width: 140,
            height: 140,
            colorDark : "#0f0c1b",
            colorLight : "#ffffff"
          });
        } else {
          qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(joinUrl)}" style="width: 140px; height: 140px;">`;
        }
      } catch(e) {
        qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(joinUrl)}" style="width: 140px; height: 140px;">`;
      }

      // Initialize Real-time Lobby Engine
      const lobbyEngine = new LobbyEngine({
        quizId: quizId,
        role: 'teacher',
        pollIntervalMs: 1000,
        onStateUpdate: (data) => {
          renderLobbyState(data);
        }
      });

      lobbyEngine.start();

      function renderLobbyState(data) {
        const countDisplay = document.getElementById('playerCountDisplay');
        const grid = document.getElementById('playersGrid');
        const startBtn = document.getElementById('startQuizBtn');

        const count = data.player_count || 0;
        countDisplay.textContent = count;

        if (count > 0) {
          startBtn.disabled = false;
          startBtn.innerHTML = `🚀 START QUIZ (${count} ${count === 1 ? 'Player' : 'Players'})`;
          
          grid.innerHTML = data.participants.map(p => `
            <div class="player-card animate-pop">
              <span class="player-emoji">${p.emoji || '😀'}</span>
              <span class="player-name">${escapeHtml(p.name)}</span>
            </div>
          `).join('');
        } else {
          startBtn.disabled = true;
          startBtn.innerHTML = '🚀 START QUIZ (0 Players)';
          grid.innerHTML = `
            <div style="grid-column: 1 / -1; color: var(--text-muted); padding: 30px;">
              ⏳ Waiting for students to join using code <strong><?= htmlspecialchars($quiz['join_code']) ?></strong>...
            </div>
          `;
        }

        // If quiz has already started, redirect teacher to control panel
        if (data.quiz && data.quiz.status === 'running') {
          lobbyEngine.stop();
          window.location.href = `live_quiz.php?id=${quizId}`;
        }
      }

      // Handle Start Quiz Button Click
      const startBtn = document.getElementById('startQuizBtn');
      startBtn.addEventListener('click', async () => {
        startBtn.disabled = true;
        startBtn.textContent = 'Starting Quiz...';

        try {
          const res = await fetch('../api/live/start_quiz.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quiz_id: quizId })
          });

          const resData = await res.json();
          if (resData.success) {
            lobbyEngine.stop();
            window.location.href = `live_quiz.php?id=${quizId}`;
          } else {
            alert(resData.message || 'Failed to start quiz.');
            startBtn.disabled = false;
          }
        } catch (err) {
          alert('Network error starting quiz.');
          startBtn.disabled = false;
        }
      });
    });

    function copyJoinUrl() {
      const url = <?= json_encode($joinUrl) ?>;
      navigator.clipboard.writeText(url);
      alert('Join URL copied to clipboard!');
    }

    function escapeHtml(text) {
      if (!text) return '';
      return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
  </script>
</body>
</html>
