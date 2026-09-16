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
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Question - QuizSpark</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/quiz.css">
</head>
<body>
  <div class="quiz-layout">
    <div class="quiz-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 1.8rem;"><?= htmlspecialchars($student['emoji']) ?></span>
        <span style="font-weight: 800; font-size: 1.1rem;"><?= htmlspecialchars($student['name']) ?></span>
      </div>
      <div>
        <span class="question-counter">Question <span id="qNumDisplay">1</span> / <span id="totalQDisplay">10</span></span>
      </div>
      <div class="timer-container">
        <div class="timer-circle" id="timerDisplay">10</div>
      </div>
    </div>

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
      ✅ Answer submitted! Waiting for leaderboard...
    </div>
  </div>

  <script src="../assets/js/quiz.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const quizId = <?= $quizId ?>;
      let hasAnsweredCurrent = false;

      const answerBtns = document.querySelectorAll('.answer-btn');
      const feedbackBanner = document.getElementById('feedbackBanner');

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

        // Auto redirect to leaderboard when question ends or status is leaderboard
        if (qz.current_question_status === 'leaderboard' || qz.current_question_status === 'ended') {
          quizEngine.stop();
          window.location.href = `leaderboard.php?quiz_id=${quizId}`;
          return;
        }

        if (qz.status === 'completed') {
          quizEngine.stop();
          window.location.href = `final.php?quiz_id=${quizId}`;
          return;
        }

        document.getElementById('qNumDisplay').textContent = qz.current_question || 1;
        document.getElementById('totalQDisplay').textContent = qz.total_questions || 10;

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

          // Question Type Handling (Kahoot True/False vs Multiple Choice)
          const grid = document.getElementById('answersGrid');
          const btnA = document.getElementById('btnOptA');
          const btnB = document.getElementById('btnOptB');
          const btnC = document.getElementById('btnOptC');
          const btnD = document.getElementById('btnOptD');
          const shapeA = document.getElementById('shapeOptA');
          const shapeB = document.getElementById('shapeOptB');

          if (q.question_type === 'true_false') {
            grid.classList.add('true-false-grid');
            // Kahoot True is Blue Diamond, False is Red Triangle
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

        // Restore answered state if student already answered on server
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

          // Submit answer to server
          const res = await quizEngine.submitAnswer(selectedOpt, 0);
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

      function highlightSelectedButton(optionKey) {
        answerBtns.forEach(b => {
          if (b.dataset.option === optionKey) {
            b.classList.add('selected');
          } else {
            b.style.opacity = '0.4';
          }
        });
      }
    });
  </script>
</body>
</html>
