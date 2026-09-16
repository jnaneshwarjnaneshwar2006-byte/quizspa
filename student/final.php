<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/security.php';

$quizId = (int)($_GET['quiz_id'] ?? 0);
$token = getStudentToken();

if (!$quizId) {
    header('Location: join.php');
    exit;
}

$pdo = getDBConnection();
$qzStmt = $pdo->prepare("SELECT * FROM `quizzes` WHERE `id` = :id LIMIT 1");
$qzStmt->execute(['id' => $quizId]);
$quiz = $qzStmt->fetch();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Final Podium - QuizSpark</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/leaderboard.css">
</head>
<body>
  <div class="leaderboard-container">
    <div class="leaderboard-header animate-pop">
      <div style="font-size: 3.5rem; margin-bottom: 10px;">👑</div>
      <h1 class="leaderboard-title">FINAL PODIUM</h1>
      <p style="color: var(--accent-yellow); font-weight: 700; font-size: 1.2rem; margin-top: 8px;">
        <?= htmlspecialchars($quiz['title'] ?? 'Quiz Completed') ?>
      </p>
    </div>

    <!-- 🥇🥈🥉 Podium Block -->
    <div class="podium" id="podiumContainer">
      <!-- 2nd Place -->
      <div class="podium-step" id="step2nd" style="visibility: hidden;">
        <div class="podium-avatar" id="avatar2nd">🥈</div>
        <div class="podium-name" id="name2nd">Player 2</div>
        <div class="podium-score" id="score2nd">0 pts</div>
        <div class="podium-block podium-2nd">2</div>
      </div>

      <!-- 1st Place -->
      <div class="podium-step" id="step1st" style="visibility: hidden;">
        <div class="podium-avatar" id="avatar1st">🥇</div>
        <div class="podium-name" id="name1st">Player 1</div>
        <div class="podium-score" id="score1st">0 pts</div>
        <div class="podium-block podium-1st">1</div>
      </div>

      <!-- 3rd Place -->
      <div class="podium-step" id="step3rd" style="visibility: hidden;">
        <div class="podium-avatar" id="avatar3rd">🥉</div>
        <div class="podium-name" id="name3rd">Player 3</div>
        <div class="podium-score" id="score3rd">0 pts</div>
        <div class="podium-block podium-3rd">3</div>
      </div>
    </div>

    <!-- Personal Result Box -->
    <div id="personalResultCard" class="personal-rank-card animate-pop" style="display: none; margin-bottom: 30px;">
      <h2 style="font-size: 1.6rem; color: #ffffff;" id="personalRankText">You finished #1!</h2>
      <div style="display: flex; justify-content: center; gap: 30px; margin-top: 14px; font-weight: 800; font-size: 1.1rem;">
        <span>Final Score: <strong id="personalScore" style="color: #55efc4;">0</strong> pts</span>
        <span>Accuracy: <strong id="personalCorrect" style="color: var(--accent-cyan);">0</strong> Correct</span>
      </div>
    </div>

    <!-- Full Final Standings List -->
    <div class="card">
      <h3 style="margin-bottom: 16px;">Complete Final Standings</h3>
      <div id="leaderboardList" class="leaderboard-list">
        <!-- Rendered via JS -->
      </div>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="join.php" class="btn btn-primary btn-lg">🎮 Join Another Quiz</a>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', async () => {
      const quizId = <?= $quizId ?>;

      try {
        const res = await fetch(`../api/student/leaderboard.php?quiz_id=${quizId}`);
        const data = await res.json();

        if (data.success && data.data) {
          renderPodium(data.data.leaderboard, data.data.my_rank);
        }
      } catch(e) {}

      function renderPodium(list, myRank) {
        // Render 1st, 2nd, 3rd place podium elements
        if (list[0]) {
          document.getElementById('step1st').style.visibility = 'visible';
          document.getElementById('avatar1st').textContent = list[0].emoji || '🥇';
          document.getElementById('name1st').textContent = list[0].name;
          document.getElementById('score1st').textContent = `${list[0].total_score} pts`;
        }
        if (list[1]) {
          document.getElementById('step2nd').style.visibility = 'visible';
          document.getElementById('avatar2nd').textContent = list[1].emoji || '🥈';
          document.getElementById('name2nd').textContent = list[1].name;
          document.getElementById('score2nd').textContent = `${list[1].total_score} pts`;
        }
        if (list[2]) {
          document.getElementById('step3rd').style.visibility = 'visible';
          document.getElementById('avatar3rd').textContent = list[2].emoji || '🥉';
          document.getElementById('name3rd').textContent = list[2].name;
          document.getElementById('score3rd').textContent = `${list[2].total_score} pts`;
        }

        // Render Personal Summary
        if (myRank) {
          const card = document.getElementById('personalResultCard');
          card.style.display = 'block';
          document.getElementById('personalRankText').textContent = `🎉 You finished #${myRank.rank}! (${myRank.emoji} ${myRank.name})`;
          document.getElementById('personalScore').textContent = myRank.total_score;
          document.getElementById('personalCorrect').textContent = myRank.correct_answers;
        }

        // Render Standings List
        const container = document.getElementById('leaderboardList');
        container.innerHTML = list.map(p => `
          <div class="rank-row ${p.is_me ? 'current-player' : ''} animate-pop">
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

      function escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
      }
    });
  </script>
</body>
</html>
