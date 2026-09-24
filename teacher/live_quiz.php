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
    $stmtAny = $pdo->prepare("SELECT * FROM `quizzes` WHERE `id` = :id");
    $stmtAny->execute(['id' => $quizId]);
    $quiz = $stmtAny->fetch();
    if ($quiz && $teacherId) {
        $pdo->prepare("UPDATE `quizzes` SET `teacher_id` = :teacher_id WHERE `id` = :id")->execute(['teacher_id' => $teacherId, 'id' => $quizId]);
    } else {
        header('Location: dashboard.php');
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Quiz Controller - QuizSpark</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/quiz.css">
  <link rel="stylesheet" href="../assets/css/leaderboard.css">
  <link rel="stylesheet" href="../assets/css/avatar.css">
  <script src="../assets/js/avatar-engine.js"></script>
</head>
<body>
  <div class="quiz-layout">
    <div class="quiz-header">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="brand-logo" style="font-size: 1.5rem;">QuizSpark</span>
        <span id="quizStatusBadge" class="badge badge-running">LIVE CONTROL</span>
      </div>
      <div>
        <span class="question-counter">Question <span id="qNumDisplay">1</span> of <span id="totalQDisplay">10</span></span>
      </div>
      <div class="timer-container">
        <div class="timer-circle" id="timerDisplay">10</div>
      </div>
    </div>

    <!-- Live Question Controller Display -->
    <div id="activeQuestionView">
      <div class="question-card animate-pop">
        <h2 class="question-text" id="qTextDisplay">Loading Question...</h2>
        <div id="qMediaContainer" style="display: none;" class="question-media-wrapper">
          <img id="qMediaImg" src="" alt="Question Image" class="question-media-img">
          <span id="qMediaError" class="question-media-error">This image could not be loaded.</span>
        </div>
        <div id="qAudioContainer" style="display: none;" class="question-audio-wrapper">
          <audio id="qAudioPlayer" class="question-audio-player" controls preload="metadata"></audio>
          <span id="qAudioError" class="question-media-error">This audio could not be loaded.</span>
        </div>
      </div>

      <!-- Live Answer Stats Bars -->
      <div class="stats-bars" id="statsBars">
        <div class="bar-col" id="colA">
          <span class="bar-count" id="countA">0</span>
          <div class="bar-fill btn-option-a" id="barA" style="height: 5%;"></div>
          <span class="option-shape" id="shapeLabelA" style="background: var(--color-opt-a); min-width: 48px;">▲</span>
        </div>
        <div class="bar-col" id="colB">
          <span class="bar-count" id="countB">0</span>
          <div class="bar-fill btn-option-b" id="barB" style="height: 5%;"></div>
          <span class="option-shape" id="shapeLabelB" style="background: var(--color-opt-b); min-width: 48px;">◆</span>
        </div>
        <div class="bar-col" id="colC">
          <span class="bar-count" id="countC">0</span>
          <div class="bar-fill btn-option-c" id="barC" style="height: 5%;"></div>
          <span class="option-shape" id="shapeLabelC" style="background: var(--color-opt-c); min-width: 48px;">●</span>
        </div>
        <div class="bar-col" id="colD">
          <span class="bar-count" id="countD">0</span>
          <div class="bar-fill btn-option-d" id="barD" style="height: 5%;"></div>
          <span class="option-shape" id="shapeLabelD" style="background: var(--color-opt-d); min-width: 48px;">■</span>
        </div>
      </div>

      <div style="text-align: center; color: var(--text-muted); font-size: 1.15rem; font-weight: 700; margin-bottom: 20px;">
        Total Answers Received: <span id="totalAnsDisplay" style="color: var(--accent-cyan);">0</span> / <span id="totalPlayersDisplay">0</span>
      </div>
    </div>

    <!-- Live Leaderboard Container (Toggled during leaderboard status) -->
    <div id="leaderboardView" style="display: none; margin-top: 20px;">
      <div class="leaderboard-header">
        <h2 class="leaderboard-title">🏆 CURRENT LEADERBOARD</h2>
        <div style="margin-top: 10px; padding: 12px 20px; background: rgba(241, 196, 15, 0.15); border: 1px solid var(--accent-yellow); border-radius: var(--radius-md); display: inline-block;">
          <span style="font-weight: 800; font-size: 1.1rem; color: var(--accent-yellow);">
            ⚡ Status: Leaderboard &mdash; Auto-advancing in <span id="leaderboardCountdown">5</span> seconds
          </span>
        </div>
      </div>
      <div id="leaderboardRows" class="leaderboard-list">
        <!-- Rendered dynamically -->
      </div>
    </div>

    <!-- Teacher Action Control Bar (NO Next Question button - Auto-advances!) -->
    <div class="card" style="margin-top: auto; padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
        <div style="display: flex; gap: 12px; align-items: center;">
          <button id="endQuestionBtn" class="btn btn-secondary">🛑 End Question Early</button>
          <span id="autoAdvanceHint" style="font-size: 0.95rem; color: var(--text-muted); font-weight: 600;">
            Questions advance automatically when all students answer or timer ends.
          </span>
        </div>
        <div>
          <button id="endQuizBtn" class="btn btn-danger">🏁 End Quiz</button>
        </div>
      </div>
    </div>
  </div>

  <script src="../assets/js/quiz.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const quizId = <?= $quizId ?>;

      const engine = new QuizEngine({
        quizId: quizId,
        role: 'teacher',
        pollIntervalMs: 800,
        onStateChange: (data) => {
          renderTeacherState(data);
        }
      });

      engine.start();
      let leaderboardSignature = '';

      function renderTeacherState(data) {
        const q = data.question;
        const qz = data.quiz;
        const stats = data.stats || { A: 0, B: 0, C: 0, D: 0, total: 0 };
        const statusBadge = document.getElementById('quizStatusBadge');
        const endQuestionBtn = document.getElementById('endQuestionBtn');

        document.getElementById('qNumDisplay').textContent = qz.current_question || 1;
        document.getElementById('totalQDisplay').textContent = qz.total_questions || 10;
        document.getElementById('totalPlayersDisplay').textContent = qz.participant_count || 0;

        if (q) {
          document.getElementById('qTextDisplay').textContent = q.question_text;

          // Question Image Display
          const mediaContainer = document.getElementById('qMediaContainer');
          const mediaImg = document.getElementById('qMediaImg');
          const mediaError = document.getElementById('qMediaError');
          const audioContainer = document.getElementById('qAudioContainer');
          const audioPlayer = document.getElementById('qAudioPlayer');
          const audioError = document.getElementById('qAudioError');
          mediaContainer.style.display = 'none';
          audioContainer.style.display = 'none';
          mediaImg.style.display = 'block';
          mediaImg.src = '';
          audioPlayer.removeAttribute('src');

          if (q.image_url) {
            mediaContainer.style.display = 'flex';
            mediaImg.onload = () => { mediaError.style.display = 'none'; mediaImg.style.display = 'block'; };
            mediaImg.onerror = () => { mediaError.style.display = 'block'; mediaImg.style.display = 'none'; };
            mediaImg.src = q.image_url;
          } else if (q.question_type === 'music' && q.audio_url) {
            audioContainer.style.display = 'block';
            audioPlayer.oncanplay = () => { audioError.style.display = 'none'; };
            audioPlayer.onerror = () => { audioError.style.display = 'block'; };
            audioPlayer.src = q.audio_url;
            audioPlayer.load();
          }

          // Question Type Handling for Stats Bars
          const colC = document.getElementById('colC');
          const colD = document.getElementById('colD');
          const shapeA = document.getElementById('shapeLabelA');
          const shapeB = document.getElementById('shapeLabelB');

          if (q.question_type === 'true_false') {
            colC.style.display = 'none';
            colD.style.display = 'none';
            shapeA.textContent = 'True';
            shapeB.textContent = 'False';
          } else {
            colC.style.display = '';
            colD.style.display = '';
            shapeA.textContent = '▲';
            shapeB.textContent = '◆';
          }

          const timerElem = document.getElementById('timerDisplay');
          const tRem = Math.ceil(q.time_remaining || 0);
          timerElem.textContent = tRem;

          if (tRem <= 3) {
            timerElem.className = 'timer-circle danger';
          } else if (tRem <= 5) {
            timerElem.className = 'timer-circle warning';
          } else {
            timerElem.className = 'timer-circle';
          }

          // Stats Bar Calculations
          const totalAnswers = stats.total || 0;
          document.getElementById('totalAnsDisplay').textContent = totalAnswers;

          document.getElementById('countA').textContent = stats.A || 0;
          document.getElementById('countB').textContent = stats.B || 0;
          document.getElementById('countC').textContent = stats.C || 0;
          document.getElementById('countD').textContent = stats.D || 0;

          const maxAns = Math.max(1, totalAnswers);
          document.getElementById('barA').style.height = `${Math.max(5, (stats.A / maxAns) * 100)}%`;
          document.getElementById('barB').style.height = `${Math.max(5, (stats.B / maxAns) * 100)}%`;
          document.getElementById('barC').style.height = `${Math.max(5, (stats.C / maxAns) * 100)}%`;
          document.getElementById('barD').style.height = `${Math.max(5, (stats.D / maxAns) * 100)}%`;
        }

        // Handle Leaderboard vs Question View Toggle
        const activeView = document.getElementById('activeQuestionView');
        const lbView = document.getElementById('leaderboardView');

        if (qz.current_question_status === 'leaderboard') {
          activeView.style.display = 'none';
          lbView.style.display = 'block';
          statusBadge.textContent = 'LEADERBOARD';
          statusBadge.className = 'badge badge-published';
          endQuestionBtn.disabled = true;
          endQuestionBtn.style.opacity = '0.5';

          updateLeaderboardCountdown(qz.leaderboard_remaining);
          if (data.leaderboard) {
            renderLeaderboardList(data.leaderboard);
          } else {
            fetchAndRenderLeaderboard();
          }
        } else {
          activeView.style.display = 'block';
          lbView.style.display = 'none';
          statusBadge.textContent = 'QUESTION ACTIVE';
          statusBadge.className = 'badge badge-running';
          endQuestionBtn.disabled = false;
          endQuestionBtn.style.opacity = '1';
          leaderboardSignature = '';
        }

        if (qz.status === 'completed') {
          engine.stop();
          window.location.href = `results.php?id=${quizId}`;
        }
      }

      function renderLeaderboardList(list) {
        const signature = JSON.stringify(list);
        if (signature === leaderboardSignature) return;
        leaderboardSignature = signature;
        const rowsContainer = document.getElementById('leaderboardRows');
        rowsContainer.innerHTML = list.map(p => `
          <div class="rank-row">
            <div class="rank-left">
              <span class="rank-num">#${p.rank}</span>
              <div class="rank-player-info">
                <div class="avatar-badge-wrapper badge-sm" id="t_lb_badge_${p.id}"></div>
                <span class="rank-player-name">${escapeHtml(p.name)}</span>
              </div>
            </div>
            <div class="rank-right">
              <span class="rank-pts">${p.total_score} pts</span>
              <span class="rank-time">${p.total_time}s</span>
            </div>
          </div>
        `).join('');

        list.forEach(p => {
          const bEl = document.getElementById(`t_lb_badge_${p.id}`);
          if (bEl) {
            AvatarEngine.mount(bEl, p.avatar_data, { mode: 'badge', animated: false });
          }
        });
      }

      async function fetchAndRenderLeaderboard() {
        try {
          const res = await fetch(`../api/student/leaderboard.php?quiz_id=${quizId}`);
          const data = await res.json();
          if (data.success && data.data && data.data.leaderboard) {
            renderLeaderboardList(data.data.leaderboard);
          }
        } catch(e) {}
      }

      function updateLeaderboardCountdown(secondsRemaining) {
        const seconds = Math.max(0, Number(secondsRemaining) || 0);
        const elem = document.getElementById('leaderboardCountdown');
        if (elem) {
          elem.textContent = seconds;
        }
      }

      // Bind Controller Action Buttons (No Next Question button)
      document.getElementById('endQuestionBtn').addEventListener('click', async () => {
        await callControlApi('end_question.php');
      });

      document.getElementById('endQuizBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to end the quiz session now?')) {
          callControlApi('end_quiz.php');
        }
      });

      async function callControlApi(endpoint) {
        try {
          const res = await fetch(`../api/live/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quiz_id: quizId })
          });
          const data = await res.json();
          if (data.data && data.data.redirect === 'end_quiz') {
            window.location.href = `results.php?id=${quizId}`;
          }
        } catch(e) {
          alert('Action error.');
        }
      }

      function escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
      }
    });
  </script>
</body>
</html>
