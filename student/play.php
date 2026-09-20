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
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Question - QuizSpark</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/quiz.css">
  <link rel="stylesheet" href="../assets/css/leaderboard.css">
  <link rel="stylesheet" href="../assets/css/avatar.css">
</head>
<body>
  <div class="quiz-layout">
    <div class="quiz-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div id="headerAvatarBadge" class="avatar-badge-wrapper badge-sm"></div>
        <span style="font-weight: 800; font-size: 1.1rem;"><?= htmlspecialchars($student['name']) ?></span>
      </div>
      <div>
        <span class="question-counter">Question <span id="qNumDisplay">1</span> / <span id="totalQDisplay">10</span></span>
      </div>
      <div class="timer-container">
        <div class="timer-circle" id="timerDisplay">10</div>
      </div>
    </div>

    <!-- Active Question View -->
    <div id="activeQuestionView">
      <!-- Question Card -->
      <div class="question-card animate-pop">
        <h2 class="question-text" id="qTextDisplay">Loading question...</h2>
        <div id="qMediaContainer" style="display: none;" class="question-media-wrapper">
          <img id="qMediaImg" src="" alt="Question Media" class="question-media-img">
          <span id="qMediaError" class="question-media-error">This image could not be loaded.</span>
        </div>
        <div id="qAudioContainer" style="display: none;" class="question-audio-wrapper">
          <audio id="qAudioPlayer" class="question-audio-player" controls preload="metadata"></audio>
          <span id="qAudioError" class="question-media-error">This audio could not be loaded.</span>
        </div>
      </div>

      <!-- Kahoot-style Answer Buttons -->
      <div class="answers-grid" id="answersGrid">
        <button type="button" class="answer-btn btn-option-a" id="btnOptA" data-option="A">
          <span class="option-shape" id="shapeOptA">▲</span>
          <span class="option-text" id="textOptA">Option A</span>
        </button>
        <button type="button" class="answer-btn btn-option-b" id="btnOptB" data-option="B">
          <span class="option-shape" id="shapeOptB">◆</span>
          <span class="option-text" id="textOptB">Option B</span>
        </button>
        <button type="button" class="answer-btn btn-option-c" id="btnOptC" data-option="C">
          <span class="option-shape">●</span>
          <span class="option-text" id="textOptC">Option C</span>
        </button>
        <button type="button" class="answer-btn btn-option-d" id="btnOptD" data-option="D">
          <span class="option-shape">■</span>
          <span class="option-text" id="textOptD">Option D</span>
        </button>
      </div>

      <!-- Answer Feedback Banner -->
      <div id="feedbackBanner" style="display: none;" class="submitted-banner animate-pop">
        ✓ Answer submitted! Waiting for question result...
      </div>
    </div>

    <!-- Seamless In-Page Leaderboard View (Shown during LEADERBOARD state) -->
    <div id="leaderboardView" style="display: none; width: 100%; max-width: 800px; margin: 0 auto;">
      <div class="leaderboard-header animate-pop">
        <h1 class="leaderboard-title">🏆 LEADERBOARD</h1>
        <p id="leaderboardCountdown" style="color: var(--accent-yellow); font-weight: 700; font-size: 1.25rem; margin-top: 8px;">
          Next question in 5 seconds
        </p>
      </div>

      <!-- Student Personal Rank Card -->
      <div id="personalRankContainer" class="personal-rank-card animate-pop" style="display: none; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 14px;">
          <div id="personalRankAvatar" class="avatar-badge-wrapper badge-lg"></div>
          <div>
            <h2 style="font-size: 1.4rem; color: #ffffff;" id="personalRankText">You are #1</h2>
            <div style="margin-top: 4px; font-weight: 800;">
              <span>Score: <strong id="personalScore" style="color: #55efc4;">0</strong> pts</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Ranked Players List -->
      <div class="card" style="margin-bottom: 20px;">
        <div id="leaderboardList" class="leaderboard-list">
          <!-- Rendered via JS -->
        </div>
      </div>
    </div>
  </div>

  <script src="../assets/js/avatar-engine.js"></script>
  <script src="../assets/js/quiz.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const quizId = <?= $quizId ?>;
      const myAvatarConfig = <?= json_encode($studentAvatar, JSON_UNESCAPED_UNICODE) ?>;
      
      // Render Header Avatar Badge
      const headerBadge = document.getElementById('headerAvatarBadge');
      if (headerBadge) {
        AvatarEngine.mount(headerBadge, myAvatarConfig, { mode: 'badge', animated: false });
      }

      let hasAnsweredCurrent = false;
      let activeQuestionNum = 0;
      let targetAdvanceTimestamp = null;
      let countdownTickerId = null;
      let leaderboardSignature = '';

      const answerBtns = document.querySelectorAll('.answer-btn');
      const feedbackBanner = document.getElementById('feedbackBanner');
      const activeQuestionView = document.getElementById('activeQuestionView');
      const leaderboardView = document.getElementById('leaderboardView');
      const countdownElem = document.getElementById('leaderboardCountdown');

      const quizEngine = new QuizEngine({
        quizId: quizId,
        role: 'student',
        pollIntervalMs: 800,
        onStateChange: (data) => {
          renderStudentPlayState(data);
        }
      });

      quizEngine.start();

      function renderStudentPlayState(data) {
        const qz = data.quiz;
        const q = data.question;
        const myAns = data.my_answer;

        // 1. If Quiz Finished, redirect to final podium
        if (qz.status === 'completed' || qz.state === 'QUIZ_FINISHED') {
          quizEngine.stop();
          if (countdownTickerId) clearInterval(countdownTickerId);
          window.location.href = `final.php?quiz_id=${quizId}`;
          return;
        }

        const serverQNum = Number(qz.current_question || qz.question_number || 1);
        document.getElementById('qNumDisplay').textContent = serverQNum;
        document.getElementById('totalQDisplay').textContent = qz.total_questions || 1;

        // 2. Handle State Transitions: LEADERBOARD vs ACTIVE QUESTION
        if (qz.current_question_status === 'leaderboard' || qz.state === 'LEADERBOARD') {
          // Switch to In-Page Leaderboard
          activeQuestionView.style.display = 'none';
          leaderboardView.style.display = 'block';

          // Synchronize countdown deadline based strictly on server timestamps
          const serverTime = Number(qz.server_time || (Date.now() / 1000));
          const nextAt = Number(qz.next_question_at || 0);

          if (nextAt > 0) {
            const secondsLeft = Math.max(0, nextAt - serverTime);
            targetAdvanceTimestamp = Date.now() + (secondsLeft * 1000);
          } else {
            const fallbackLeft = Number(qz.leaderboard_remaining || 5);
            targetAdvanceTimestamp = Date.now() + (fallbackLeft * 1000);
          }

          startCountdownTicker(serverQNum >= (qz.total_questions || 1));

          // Render Leaderboard data if provided in state
          if (data.leaderboard && data.leaderboard.length > 0) {
            renderLeaderboard(data.leaderboard, data.my_rank);
          } else {
            fetchLeaderboardData();
          }
          return;
        }

        // 3. Question is Active
        activeQuestionView.style.display = 'block';
        leaderboardView.style.display = 'none';
        if (countdownTickerId) {
          clearInterval(countdownTickerId);
          countdownTickerId = null;
        }

        // Detect if Question Changed: Reset answer state and enable buttons
        if (serverQNum !== activeQuestionNum) {
          activeQuestionNum = serverQNum;
          hasAnsweredCurrent = false;
          resetAnswerButtons();
          feedbackBanner.style.display = 'none';
          feedbackBanner.className = 'submitted-banner animate-pop';
          feedbackBanner.innerHTML = '✓ Answer submitted! Waiting for question result...';
          leaderboardSignature = '';
        }

        // Render Current Question Details
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

          // Question Type Handling (True/False vs Multiple Choice)
          const grid = document.getElementById('answersGrid');
          const btnA = document.getElementById('btnOptA');
          const btnB = document.getElementById('btnOptB');
          const btnC = document.getElementById('btnOptC');
          const btnD = document.getElementById('btnOptD');
          const shapeA = document.getElementById('shapeOptA');
          const shapeB = document.getElementById('shapeOptB');

          if (q.question_type === 'true_false') {
            grid.classList.add('true-false-grid');
            btnA.className = 'answer-btn btn-option-b';
            shapeA.textContent = '◆';
            document.getElementById('textOptA').textContent = 'True';

            btnB.className = 'answer-btn btn-option-a';
            shapeB.textContent = '▲';
            document.getElementById('textOptB').textContent = 'False';

            btnC.style.display = 'none';
            btnD.style.display = 'none';
          } else {
            grid.classList.remove('true-false-grid');
            btnA.className = 'answer-btn btn-option-a';
            shapeA.textContent = '▲';
            document.getElementById('textOptA').textContent = q.option_a;

            btnB.className = 'answer-btn btn-option-b';
            shapeB.textContent = '◆';
            document.getElementById('textOptB').textContent = q.option_b;

            btnC.style.display = 'flex';
            btnD.style.display = 'flex';
            document.getElementById('textOptC').textContent = q.option_c;
            document.getElementById('textOptD').textContent = q.option_d;
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
        }

        // Restore answered state if participant already answered on server
        if (myAns && !hasAnsweredCurrent) {
          hasAnsweredCurrent = true;
          disableAllAnswerButtons();
          highlightSelectedButton(myAns.selected_option);
          feedbackBanner.style.display = 'block';
        }
      }

      // Handle Answer Button Clicks
      answerBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
          if (hasAnsweredCurrent) return;

          const selectedOpt = btn.dataset.option;
          hasAnsweredCurrent = true;

          // Immediate visual feedback
          highlightSelectedButton(selectedOpt);
          disableAllAnswerButtons();
          feedbackBanner.style.display = 'block';
          feedbackBanner.innerHTML = '✓ Answer submitted! Waiting for question result...';

          // Submit answer to server
          const res = await quizEngine.submitAnswer(selectedOpt, 0, activeQuestionNum);
          if (!res.success && res.message !== 'Already answered.') {
            feedbackBanner.innerHTML = `⚠️ ${res.message}`;
            feedbackBanner.style.borderColor = '#e74c3c';
            feedbackBanner.style.color = '#e74c3c';
          }
        });
      });

      function disableAllAnswerButtons() {
        answerBtns.forEach(b => b.disabled = true);
      }

      function resetAnswerButtons() {
        answerBtns.forEach(b => {
          b.disabled = false;
          b.classList.remove('selected');
          b.style.opacity = '1';
        });
      }

      function highlightSelectedButton(optionKey) {
        answerBtns.forEach(b => {
          if (b.dataset.option === optionKey) {
            b.classList.add('selected');
            b.style.opacity = '1';
          } else {
            b.style.opacity = '0.35';
          }
        });
      }

      function startCountdownTicker(isFinalQuestion = false) {
        if (countdownTickerId) return;

        function tick() {
          const now = Date.now();
          const msLeft = Math.max(0, targetAdvanceTimestamp - now);
          const secondsLeft = Math.ceil(msLeft / 1000);

          if (secondsLeft <= 0) {
            countdownElem.textContent = isFinalQuestion
              ? 'Loading final results...'
              : 'Next question starting...';
          } else {
            const suffix = secondsLeft === 1 ? 'second' : 'seconds';
            countdownElem.textContent = isFinalQuestion
              ? `Final results in ${secondsLeft} ${suffix}`
              : `Next question in ${secondsLeft} ${suffix}`;
          }
        }

        tick();
        countdownTickerId = setInterval(tick, 250);
      }

      async function fetchLeaderboardData() {
        try {
          const res = await fetch(`../api/student/leaderboard.php?quiz_id=${quizId}`);
          const data = await res.json();
          if (data.success && data.data) {
            renderLeaderboard(data.data.leaderboard, data.data.my_rank);
          }
        } catch(e) {}
      }

      function renderLeaderboard(list, myRank) {
        const signature = JSON.stringify({ list, myRank });
        if (signature === leaderboardSignature) return;
        leaderboardSignature = signature;

        const container = document.getElementById('leaderboardList');
        const personalCard = document.getElementById('personalRankContainer');
        const personalRankAvatar = document.getElementById('personalRankAvatar');

        if (myRank) {
          personalCard.style.display = 'block';
          document.getElementById('personalRankText').textContent =
            `You are #${myRank.rank} ${myRank.name}`;
          document.getElementById('personalScore').textContent = myRank.total_score;
          if (personalRankAvatar) {
            AvatarEngine.mount(personalRankAvatar, myRank.avatar_data || myAvatarConfig, { mode: 'badge', animated: false });
          }
        }

        container.innerHTML = list.map(p => `
          <div class="rank-row ${p.is_me ? 'current-player' : ''}">
            <div class="rank-left">
              <span class="rank-num">#${p.rank}</span>
              <div class="rank-player-info">
                <div class="avatar-badge-wrapper badge-sm" id="lb_badge_${p.id}"></div>
                <span class="rank-player-name">${escapeHtml(p.name)} ${p.is_me ? '<span class="badge badge-published" style="margin-left:8px;">YOU</span>' : ''}</span>
              </div>
            </div>
            <div class="rank-right">
              <span class="rank-pts">${p.total_score} pts</span>
              <span class="rank-time">${p.total_time}s</span>
            </div>
          </div>
        `).join('');

        // Mount 3D Avatar Badges for each player
        list.forEach(p => {
          const el = document.getElementById(`lb_badge_${p.id}`);
          if (el) {
            AvatarEngine.mount(el, p.avatar_data || myAvatarConfig, { mode: 'badge', animated: false });
          }
        });
      }

      function escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
      }
    });
  </script>
</body>
</html>
