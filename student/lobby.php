<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../config/avatar.php';

$quizId = (int)($_GET['quiz_id'] ?? 0);
$token = getStudentToken();

if (!$quizId || !$token) {
    header('Location: join.php');
    exit;
}

$pdo = getDBConnection();
$pStmt = $pdo->prepare("SELECT * FROM `participants` WHERE `session_token` = :token AND `quiz_id` = :quiz_id LIMIT 1");
$pStmt->execute(['token' => $token, 'quiz_id' => $quizId]);
$student = $pStmt->fetch();

if (!$student) {
    header('Location: join.php');
    exit;
}

$studentAvatar = getParticipantAvatarData($student);

$qzStmt = $pdo->prepare("SELECT title, status FROM `quizzes` WHERE `id` = :id LIMIT 1");
$qzStmt->execute(['id' => $quizId]);
$quiz = $qzStmt->fetch();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Waiting Lobby - QuizSpark</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/lobby.css">
  <link rel="stylesheet" href="../assets/css/avatar.css">
</head>
<body>
  <div class="lobby-container">
    <div class="lobby-header animate-pop">
      <div style="font-size: 3rem; margin-bottom: 10px; animation: pulse 2s infinite;">⏳</div>
      <p style="color: var(--accent-cyan); font-weight: 800; font-size: 1.1rem;">YOU'RE IN!</p>
      <h1 style="font-size: 2.2rem; margin: 10px 0;"><?= htmlspecialchars($quiz['title']) ?></h1>
      <p style="color: var(--text-muted); font-size: 1rem;">Waiting for the creator to start the quiz...</p>

      <!-- Student 3D Avatar Ready Card -->
      <div style="margin-top: 24px; padding: 14px 22px; background: rgba(108, 92, 231, 0.2); border: 1px solid rgba(108, 92, 231, 0.4); border-radius: var(--radius-lg); display: inline-flex; align-items: center; gap: 16px;">
        <div id="myAvatarBadge" class="avatar-badge-wrapper badge-lg"></div>
        <div style="text-align: left;">
          <div style="font-weight: 800; font-size: 1.3rem; color: #ffffff;"><?= htmlspecialchars($student['name']) ?></div>
          <div style="font-size: 0.85rem; color: var(--accent-cyan); font-weight: 700;">Ready to play ⚡</div>
        </div>
      </div>
    </div>

    <!-- Live Joined Players Grid -->
    <div class="card">
      <div class="players-counter">
        <span>👥 LIVE PLAYERS:</span>
        <span id="playerCountDisplay" style="color: var(--accent-yellow);">1</span>
      </div>

      <div id="playersGrid" class="players-grid">
        <!-- Rendered via JS polling -->
      </div>
    </div>
  </div>

  <script src="../assets/js/avatar-engine.js"></script>
  <script src="../assets/js/lobby.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const quizId = <?= $quizId ?>;
      const myAvatarConfig = <?= json_encode($studentAvatar, JSON_UNESCAPED_UNICODE) ?>;

      // Mount student's personal 3D avatar badge
      const myBadge = document.getElementById('myAvatarBadge');
      if (myBadge) {
        AvatarEngine.mount(myBadge, myAvatarConfig, { mode: 'badge', animated: true });
      }

      const lobbyEngine = new LobbyEngine({
        quizId: quizId,
        role: 'student',
        pollIntervalMs: 1000,
        onStateUpdate: (data) => {
          renderStudentLobby(data);
        }
      });

      lobbyEngine.start();

      function renderStudentLobby(data) {
        const qz = data.quiz;

        // Auto-redirect to play page when creator starts quiz
        if (qz && qz.status === 'running') {
          lobbyEngine.stop();
          window.location.href = `play.php?quiz_id=${quizId}`;
          return;
        }

        fetchLivePlayers();
      }

      let lastGridData = '';

      async function fetchLivePlayers() {
        try {
          const res = await fetch(`../api/live/get_lobby.php?quiz_id=${quizId}`);
          const data = await res.json();
          if (data.success && data.data) {
            document.getElementById('playerCountDisplay').textContent = data.data.player_count || 1;
            
            const participants = data.data.participants || [];
            const sig = JSON.stringify(participants);
            if (sig === lastGridData) return;
            lastGridData = sig;

            const grid = document.getElementById('playersGrid');
            grid.innerHTML = participants.map(p => `
              <div class="player-card animate-pop">
                <div class="avatar-badge-wrapper badge-lg" id="p_badge_${p.id}"></div>
                <span class="player-name">${escapeHtml(p.name)}</span>
              </div>
            `).join('');

            // Mount avatar SVGs
            participants.forEach(p => {
              const el = document.getElementById(`p_badge_${p.id}`);
              if (el) {
                AvatarEngine.mount(el, p.avatar_data || myAvatarConfig, { mode: 'badge', animated: false });
              }
            });
          }
        } catch(e) {}
      }

      function escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
      }
    });
  </script>
</body>
</html>
