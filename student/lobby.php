<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/security.php';

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
</head>
<body>
  <div class="lobby-container">
    <div class="lobby-header animate-pop">
      <div style="font-size: 3rem; margin-bottom: 10px; animation: pulse 2s infinite;">⏳</div>
      <p style="color: var(--accent-cyan); font-weight: 800; font-size: 1.1rem;">YOU'RE IN!</p>
      <h1 style="font-size: 2.2rem; margin: 10px 0;"><?= htmlspecialchars($quiz['title']) ?></h1>
      <p style="color: var(--text-muted); font-size: 1rem;">Waiting for teacher to start the quiz...</p>

      <div style="margin-top: 24px; padding: 16px; background: rgba(108, 92, 231, 0.2); border-radius: var(--radius-md); display: inline-flex; align-items: center; gap: 14px;">
        <span style="font-size: 2.5rem;"><?= htmlspecialchars($student['emoji']) ?></span>
        <div style="text-align: left;">
          <div style="font-weight: 800; font-size: 1.2rem;"><?= htmlspecialchars($student['name']) ?></div>
          <div style="font-size: 0.85rem; color: #a29bfe;">Ready to play</div>
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

  <script src="../assets/js/lobby.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const quizId = <?= $quizId ?>;

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
        const student = data.student;

        // Auto-redirect to play page when teacher starts quiz
        if (qz && qz.status === 'running') {
          lobbyEngine.stop();
          window.location.href = `play.php?quiz_id=${quizId}`;
          return;
        }

        // Fetch & display live player list from server state
        fetchLivePlayers();
      }

      async function fetchLivePlayers() {
        try {
          const res = await fetch(`../api/live/get_state.php?quiz_id=${quizId}`);
          const data = await res.json();
          if (data.success && data.data) {
            document.getElementById('playerCountDisplay').textContent = data.data.quiz.participant_count || 1;
          }
        } catch(e) {}
      }
    });
  </script>
</body>
</html>
