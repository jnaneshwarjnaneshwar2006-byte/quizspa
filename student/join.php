<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/security.php';

$codeFromUrl = trim($_GET['code'] ?? '');
$quizTitle = '';

if (!empty($codeFromUrl)) {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT title, status FROM `quizzes` WHERE `join_code` = :code LIMIT 1");
        $stmt->execute(['code' => $codeFromUrl]);
        $quiz = $stmt->fetch();
        if ($quiz) {
            $quizTitle = $quiz['title'];
        }
    } catch(Exception $e) {}
}

$emojis = ['😀', '😎', '🤓', '🥳', '😁', '😍', '🤩', '🧠', '🚀', '🔥', '👑', '🎯', '🐼', '🦁', '🐯', '🐸'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Join Quiz - QuizSpark</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/auth.css">
  <link rel="stylesheet" href="../assets/css/lobby.css">
</head>
<body>
  <div class="auth-wrapper">
    <div class="auth-card animate-pop" style="max-width: 480px;">
      <div class="auth-header">
        <a href="../index.php" class="brand-logo" style="margin-bottom: 10px;">QuizSpark <span class="brand-badge">LIVE</span></a>
        <h1>Join Live Quiz</h1>
        <?php if ($quizTitle): ?>
          <p style="color: var(--accent-yellow); font-weight: 700; font-size: 1.1rem; margin-top: 6px;">
            <?= htmlspecialchars($quizTitle) ?>
          </p>
        <?php else: ?>
          <p>Enter your code and name to jump into the game!</p>
        <?php endif; ?>
      </div>

      <div id="alertContainer"></div>

      <form id="joinForm">
        <div class="form-group">
          <label class="form-label">6-Digit Join Code *</label>
          <input type="text" id="joinCode" class="form-control" placeholder="e.g. 482731" 
                 value="<?= htmlspecialchars($codeFromUrl) ?>" 
                 maxlength="6" required pattern="[0-9]{6}"
                 style="font-size: 1.5rem; text-align: center; letter-spacing: 6px; font-weight: 800;">
        </div>

        <div class="form-group">
          <label class="form-label">Your Name *</label>
          <input type="text" id="studentName" class="form-control" placeholder="Enter your display name..." maxlength="30" required autofocus>
        </div>

        <div class="form-group">
          <label class="form-label">Choose Avatar Emoji *</label>
          <div class="emoji-selector" id="emojiContainer">
            <?php foreach ($emojis as $idx => $em): ?>
              <div class="emoji-option <?= $idx === 0 ? 'selected' : '' ?>" data-emoji="<?= $em ?>">
                <?= $em ?>
              </div>
            <?php endforeach; ?>
          </div>
        </div>

        <button type="submit" id="joinBtn" class="btn btn-primary btn-block btn-lg" style="font-size: 1.25rem;">
          🚀 JOIN QUIZ
        </button>
      </form>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      let selectedEmoji = '😀';

      // Emoji Selection
      const emojiOptions = document.querySelectorAll('.emoji-option');
      emojiOptions.forEach(opt => {
        opt.addEventListener('click', () => {
          emojiOptions.forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
          selectedEmoji = opt.dataset.emoji;
        });
      });

      const joinForm = document.getElementById('joinForm');
      const alertContainer = document.getElementById('alertContainer');
      const joinBtn = document.getElementById('joinBtn');

      joinForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const joinCode = document.getElementById('joinCode').value.trim();
        const name = document.getElementById('studentName').value.trim();

        if (!joinCode || joinCode.length !== 6) {
          showAlert('Please enter a valid 6-digit numeric join code.', 'danger');
          return;
        }

        if (!name) {
          showAlert('Please enter your name.', 'danger');
          return;
        }

        joinBtn.disabled = true;
        joinBtn.textContent = 'Joining Quiz...';

        try {
          const res = await fetch('../api/student/join.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              join_code: joinCode,
              name: name,
              emoji: selectedEmoji
            })
          });

          const data = await res.json();

          if (data.success) {
            showAlert('Joined successfully! Redirecting to lobby...', 'success');
            setTimeout(() => {
              window.location.href = `lobby.php?quiz_id=${data.data.quiz_id}`;
            }, 800);
          } else {
            showAlert(data.message || 'Failed to join quiz.', 'danger');
            joinBtn.disabled = false;
            joinBtn.textContent = '🚀 JOIN QUIZ';
          }
        } catch (err) {
          console.error('Join error:', err);
          showAlert('Network error joining quiz.', 'danger');
          joinBtn.disabled = false;
          joinBtn.textContent = '🚀 JOIN QUIZ';
        }
      });

      function showAlert(msg, type) {
        alertContainer.innerHTML = `
          <div class="alert alert-${type} animate-pop">
            <span>${msg}</span>
          </div>
        `;
      }
    });
  </script>
</body>
</html>
