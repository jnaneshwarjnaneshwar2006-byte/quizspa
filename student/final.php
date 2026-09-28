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
  <title>Final Leaderboard - <?= htmlspecialchars($quiz['title'] ?? 'Quiz Complete') ?> - QuizSpark</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/leaderboard.css">
  <link rel="stylesheet" href="../assets/css/avatar.css">
</head>
<body class="leaderboard-page">
  <main class="leaderboard-main-wrapper" id="mainWrapper">
    <!-- Personal Result Box -->
    <div id="personalResultCard" class="personal-rank-card animate-pop" style="display: none; max-width: 500px; margin: 16px auto;">
      <h2 style="font-size: 1.4rem; color: #ffffff;" id="personalRankText">You finished #1!</h2>
      <div style="display: flex; justify-content: center; gap: 24px; margin-top: 6px; font-weight: 800;">
        <span>Score: <strong id="personalScore" style="color: #55efc4;">0</strong> pts</span>
        <span>Accuracy: <strong id="personalCorrect" style="color: var(--accent-cyan);">0</strong> Correct</span>
      </div>
    </div>

    <!-- Main Container where Final Leaderboard is rendered -->
    <div id="leaderboardContentMount">
      <div class="final-leaderboard-container">
        <div style="text-align: center; padding: 48px 20px; color: var(--text-muted); font-size: 1.1rem; font-weight: 700;">
          Loading official scores...
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-top: 36px; margin-bottom: 48px;">
      <a href="join.php" class="btn btn-primary" style="padding: 12px 28px; font-weight: 800; font-size: 1.05rem; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
        🏠 Back to Home
      </a>
    </div>
  </main>

  <script src="../assets/js/avatar-engine.js"></script>
  <script src="../assets/js/leaderboard.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', async () => {
      const quizId = <?= $quizId ?>;
      const studentToken = <?= json_encode($token) ?>;
      const mount = document.getElementById('leaderboardContentMount');

      try {
        const res = await fetch(`../api/student/leaderboard.php?quiz_id=${quizId}${studentToken ? `&token=${encodeURIComponent(studentToken)}` : ''}`);
        const data = await res.json();

        if (data.success && data.data) {
          const list = data.data.leaderboard || [];
          const myRank = data.data.my_rank || null;

          if (myRank) {
            const card = document.getElementById('personalResultCard');
            if (card) {
              card.style.display = 'block';
              document.getElementById('personalRankText').textContent = `🎉 You finished #${myRank.rank}! (${myRank.name})`;
              document.getElementById('personalScore').textContent = (myRank.total_score || 0).toLocaleString();
              document.getElementById('personalCorrect').textContent = myRank.correct_answers || 0;
            }
          }

          QuizLeaderboard.renderFinalLeaderboard(mount, list, studentToken);
        }
      } catch(e) {
        console.error("Leaderboard fetch error:", e);
      }
    });
  </script>
</body>
</html>
