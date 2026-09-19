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
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Leaderboard - QuizSpark</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/leaderboard.css">
</head>
<body>
  <div class="leaderboard-container">
    <div class="leaderboard-header">
      <h1 class="leaderboard-title">🏆 LEADERBOARD</h1>
      <p id="leaderboardCountdown" style="color: var(--accent-yellow); font-weight: 700;">Next question in 5 seconds</p>
    </div>

    <!-- Student Personal Rank Card -->
    <div id="personalRankContainer" class="personal-rank-card animate-pop" style="display: none;">
      <h2 style="font-size: 1.6rem; color: #ffffff;" id="personalRankText">You are #1</h2>
      <div style="display: flex; justify-content: center; gap: 30px; margin-top: 10px; font-weight: 800;">
        <span>Score: <strong id="personalScore" style="color: #55efc4;">0</strong> pts</span>
      </div>
    </div>

    <!-- Ranked Players List Table -->
    <div class="card">
      <div id="leaderboardList" class="leaderboard-list">
        <!-- Rendered via JS -->
      </div>
    </div>
  </div>

  <script src="../assets/js/quiz.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const quizId = <?= $quizId ?>;

      const engine = new QuizEngine({
        quizId: quizId,
        role: 'student',
        pollIntervalMs: 1000,
        onStateChange: (data) => {
          const qz = data.quiz;

          // Auto redirect to play page when next question starts
          if (qz.current_question_status === 'active' || qz.state === 'QUESTION_ACTIVE') {
            engine.stop();
            window.location.href = `play.php?quiz_id=${quizId}`;
            return;
          }

          if (qz.status === 'completed' || qz.state === 'QUIZ_FINISHED') {
            engine.stop();
            window.location.href = `final.php?quiz_id=${quizId}`;
            return;
          }

          const secondsLeft = (qz.next_question_at && qz.server_time)
            ? Math.max(0, Math.ceil(qz.next_question_at - qz.server_time))
            : (qz.leaderboard_remaining || 0);

          updateLeaderboardCountdown(secondsLeft);
          if (data.leaderboard) {
            renderLeaderboard(data.leaderboard, data.my_rank);
          } else {
            fetchLeaderboardData();
          }
        }
      });

      engine.start();
      let leaderboardSignature = '';

      async function fetchLeaderboardData() {
        try {
          const res = await fetch(`../api/student/leaderboard.php?quiz_id=${quizId}`);
          const data = await res.json();

          if (data.success && data.data) {
            const signature = JSON.stringify({ leaderboard: data.data.leaderboard, myRank: data.data.my_rank });
            if (signature === leaderboardSignature) return;
            leaderboardSignature = signature;
            renderLeaderboard(data.data.leaderboard, data.data.my_rank);
          }
        } catch(e) {}
      }

      function renderLeaderboard(list, myRank) {
        const container = document.getElementById('leaderboardList');
        const personalCard = document.getElementById('personalRankContainer');

        if (myRank) {
          personalCard.style.display = 'block';
          document.getElementById('personalRankText').textContent = `You are #${myRank.rank} ${myRank.emoji} ${myRank.name}`;
          document.getElementById('personalScore').textContent = myRank.total_score;
        }

        container.innerHTML = list.map(p => `
          <div class="rank-row ${p.is_me ? 'current-player' : ''}">
            <div class="rank-left">
              <span class="rank-num">#${p.rank}</span>
              <div class="rank-player-info">
                <span style="font-size: 1.5rem;">${p.emoji}</span>
                <span class="rank-player-name">${escapeHtml(p.name)} ${p.is_me ? '<span class="badge badge-published" style="margin-left:8px;">YOU</span>' : ''}</span>
              </div>
            </div>
            <div class="rank-right">
              <span class="rank-pts">${p.total_score} pts</span>
              <span class="rank-time">${p.total_time}s</span>
            </div>
          </div>
        `).join('');
      }

      function updateLeaderboardCountdown(secondsRemaining) {
        const seconds = Math.max(0, Number(secondsRemaining) || 0);
        const suffix = seconds === 1 ? 'second' : 'seconds';
        document.getElementById('leaderboardCountdown').textContent =
          `Next question in ${seconds} ${suffix}`;
      }

      function escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
      }
    });
  </script>
</body>
</html>
