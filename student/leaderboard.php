<?php
/**
 * QuizSpark - Final Leaderboard & Live Question Standings
 * Game-show style 3D winner cards with physically held awards and Other Players list
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/security.php';

$quizId = (int)($_GET['quiz_id'] ?? 0);
$token = getStudentToken();
if (!$token && !empty($_GET['token'])) {
    $token = trim((string)$_GET['token']);
    setStudentToken($token);
}

if (!$quizId) {
    header('Location: join.php');
    exit;
}

$isCompleted = false;
$quizTitle = 'QuizSpark';
try {
    $pdo = getDBConnection();
    $qzStmt = $pdo->prepare("SELECT id, title, status, current_question_status FROM quizzes WHERE id = :id LIMIT 1");
    $qzStmt->execute(['id' => $quizId]);
    $quiz = $qzStmt->fetch();
    if ($quiz) {
        $quizTitle = $quiz['title'] ?? 'QuizSpark';
        $isCompleted = ($quiz['status'] === 'completed' || $quiz['current_question_status'] === 'completed');
    }
} catch (Throwable $e) {
    error_log("[QuizSpark Leaderboard DB Error] " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= $isCompleted ? 'Final Leaderboard' : 'Leaderboard' ?> - <?= htmlspecialchars($quizTitle) ?></title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/leaderboard.css">
  <link rel="stylesheet" href="../assets/css/avatar.css">
</head>
<body class="leaderboard-page">
  <main class="leaderboard-main-wrapper" id="mainWrapper">
    <!-- Live Countdown Pill (Active only during in-between live quiz questions) -->
    <div id="liveCountdownWrapper" style="<?= $isCompleted ? 'display: none;' : '' ?> text-align: center; padding-top: 16px;">
      <div class="leaderboard-countdown-pill" id="leaderboardCountdownPill">
        ⏳ <span id="leaderboardCountdown">Next question in 5 seconds</span>
      </div>
    </div>

    <!-- Personal Rank Notice (if student token present and live podium active) -->
    <div id="personalRankContainer" class="personal-rank-card animate-pop" style="display: none; max-width: 500px; margin: 16px auto;">
      <h2 style="font-size: 1.4rem; color: #ffffff;" id="personalRankText">You are #1</h2>
      <div style="display: flex; justify-content: center; gap: 24px; margin-top: 6px; font-weight: 800;">
        <span>Score: <strong id="personalScore" style="color: #55efc4;">0</strong> pts</span>
      </div>
    </div>

    <!-- Main Container where Final Leaderboard or Live Podium is rendered -->
    <div id="leaderboardContentMount">
      <!-- Loading Skeleton / Placeholder -->
      <div class="final-leaderboard-container" id="leaderboardSkeleton">
        <div class="final-lb-header">
          <h1 class="final-lb-title">🏆 FINAL LEADERBOARD</h1>
          <p class="final-lb-subtitle">Quiz Complete!</p>
        </div>
        <div style="text-align: center; padding: 48px 20px; color: var(--text-muted); font-size: 1.1rem; font-weight: 700;">
          <div class="spinner" style="margin: 0 auto 16px auto; width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #f1c40f; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
          Loading official scores...
        </div>
      </div>
    </div>

    <!-- Final Action Buttons (Visible on Final Leaderboard) -->
    <div id="finalActionsWrapper" style="<?= $isCompleted ? 'display: flex;' : 'display: none;' ?> text-align: center; margin-top: 36px; margin-bottom: 48px; gap: 16px; justify-content: center; flex-wrap: wrap;">
      <a href="../index.php" class="btn btn-primary" style="padding: 12px 28px; font-weight: 800; font-size: 1.05rem; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
        🏠 Back to Home
      </a>
      <button id="exportCsvBtn" class="btn btn-secondary" style="padding: 12px 24px; font-weight: 700; font-size: 1rem; display: inline-flex; align-items: center; gap: 8px;">
        📥 Export Results
      </button>
    </div>
  </main>

  <style>
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>

  <script src="../assets/js/avatar-engine.js"></script>
  <script src="../assets/js/leaderboard.js"></script>
  <script src="../assets/js/quiz.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const quizId = <?= $quizId ?>;
      const studentToken = <?= json_encode($token) ?>;
      let isFinalState = <?= $isCompleted ? 'true' : 'false' ?>;

      const mount = document.getElementById('leaderboardContentMount');
      const livePill = document.getElementById('liveCountdownWrapper');
      const personalCard = document.getElementById('personalRankContainer');
      const finalActions = document.getElementById('finalActionsWrapper');

      // Fetch immediately
      fetchLeaderboardData(isFinalState);

      // Initialize Real-time Engine
      const engine = new QuizEngine({
        quizId: quizId,
        role: 'student',
        token: studentToken,
        pollIntervalMs: 1200,
        onStateChange: (data) => {
          const qz = data.quiz;

          // 1. Next question active: redirect back to play page
          if (qz.current_question_status === 'active' || qz.state === 'QUESTION_ACTIVE') {
            engine.stop();
            window.location.href = `play.php?quiz_id=${quizId}`;
            return;
          }

          // 2. Quiz Finished: Render Final Leaderboard (Do NOT redirect to final.php!)
          if (qz.status === 'completed' || qz.state === 'QUIZ_FINISHED' || qz.current_question_status === 'completed') {
            isFinalState = true;
            if (livePill) livePill.style.display = 'none';
            if (personalCard) personalCard.style.display = 'none';
            if (finalActions) finalActions.style.display = 'flex';

            if (data.leaderboard && data.leaderboard.length > 0) {
              QuizLeaderboard.renderFinalLeaderboard(mount, data.leaderboard, studentToken);
            } else {
              fetchLeaderboardData(true);
            }
            return;
          }

          // 3. In-between live quiz questions
          if (!isFinalState) {
            if (livePill) livePill.style.display = 'block';
            if (finalActions) finalActions.style.display = 'none';

            const secondsLeft = (qz.next_question_at && qz.server_time)
              ? Math.max(0, Math.ceil(qz.next_question_at - qz.server_time))
              : (qz.leaderboard_remaining || 0);

            updateLeaderboardCountdown(secondsLeft);

            if (data.my_rank && personalCard) {
              personalCard.style.display = 'block';
              document.getElementById('personalRankText').textContent = `You are #${data.my_rank.rank} ${data.my_rank.name}`;
              document.getElementById('personalScore').textContent = (data.my_rank.total_score || 0).toLocaleString();
            }

            if (data.leaderboard) {
              QuizLeaderboard.renderPodium(mount, data.leaderboard, studentToken);
            } else {
              fetchLeaderboardData(false);
            }
          }
        }
      });

      engine.start();

      async function fetchLeaderboardData(isFinal) {
        try {
          const url = `../api/student/leaderboard.php?quiz_id=${quizId}${studentToken ? `&token=${encodeURIComponent(studentToken)}` : ''}`;
          const res = await fetch(url);
          const json = await res.json();

          if (json.success && json.data) {
            const list = json.data.leaderboard || [];
            const myRank = json.data.my_rank || null;
            const quizStatus = json.data.quiz ? json.data.quiz.status : null;

            if (isFinal || quizStatus === 'completed') {
              isFinalState = true;
              if (livePill) livePill.style.display = 'none';
              if (personalCard) personalCard.style.display = 'none';
              if (finalActions) finalActions.style.display = 'flex';

              QuizLeaderboard.renderFinalLeaderboard(mount, list, studentToken);
            } else {
              if (myRank && personalCard) {
                personalCard.style.display = 'block';
                document.getElementById('personalRankText').textContent = `You are #${myRank.rank} ${myRank.name}`;
                document.getElementById('personalScore').textContent = (myRank.total_score || 0).toLocaleString();
              }
              QuizLeaderboard.renderPodium(mount, list, studentToken);
            }
          } else {
            mount.innerHTML = `
              <div class="final-leaderboard-container">
                <div class="final-lb-header">
                  <h1 class="final-lb-title">🏆 FINAL LEADERBOARD</h1>
                  <p class="final-lb-subtitle">Quiz Complete!</p>
                </div>
                <div style="text-align: center; padding: 40px 20px; color: var(--text-muted); font-size: 1.1rem; font-weight: 700;">
                  ${escapeHtml(json.message || 'Unable to load leaderboard. Please try again.')}
                </div>
              </div>
            `;
          }
        } catch(e) {
          console.error("Leaderboard fetch error:", e);
          mount.innerHTML = `
            <div class="final-leaderboard-container">
              <div class="final-lb-header">
                <h1 class="final-lb-title">🏆 FINAL LEADERBOARD</h1>
                <p class="final-lb-subtitle">Quiz Complete!</p>
              </div>
              <div style="text-align: center; padding: 40px 20px; color: #ff7675; font-size: 1.1rem; font-weight: 700;">
                Unable to load leaderboard. Please try again.
              </div>
            </div>
          `;
        }
      }

      function updateLeaderboardCountdown(secondsRemaining) {
        const seconds = Math.max(0, Number(secondsRemaining) || 0);
        const suffix = seconds === 1 ? 'second' : 'seconds';
        const el = document.getElementById('leaderboardCountdown');
        if (el) {
          el.textContent = `Next question in ${seconds} ${suffix}`;
        }
      }

      function escapeHtml(text) {
        if (!text) return '';
        return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
    });
  </script>
</body>
</html>
