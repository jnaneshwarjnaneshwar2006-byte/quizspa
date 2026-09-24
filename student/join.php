<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/security.php';

$codeFromUrl = trim($_GET['code'] ?? '');
$quizTitle = '';

if (!empty($codeFromUrl) && preg_match('/^\d{6}$/', $codeFromUrl)) {
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
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Join Live Quiz - QuizSpark</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/auth.css">
  <link rel="stylesheet" href="../assets/css/lobby.css">
  <link rel="stylesheet" href="../assets/css/avatar.css">
</head>
<body>
  <div class="auth-wrapper">
    <div class="auth-card animate-pop" style="max-width: 520px; padding: 28px;">
      <div class="auth-header" style="margin-bottom: 20px;">
        <a href="../index.php" class="brand-logo" style="margin-bottom: 8px;">QuizSpark <span class="brand-badge">LIVE</span></a>
        <h1>Join Live Quiz</h1>
        <?php if ($quizTitle): ?>
          <p style="color: var(--accent-yellow); font-weight: 700; font-size: 1.15rem; margin-top: 6px;">
            <?= htmlspecialchars($quizTitle) ?>
          </p>
        <?php else: ?>
          <p>Customize your 3D avatar and enter your game PIN to play!</p>
        <?php endif; ?>
      </div>

      <div id="alertContainer"></div>

      <form id="joinForm" autocomplete="off">
        <div class="form-group">
          <label class="form-label" for="joinCode">6-Digit Join Code *</label>
          <input type="text" id="joinCode" class="form-control" placeholder="e.g. 240877" 
                 value="<?= htmlspecialchars($codeFromUrl) ?>" 
                 maxlength="6" inputmode="numeric" required pattern="[0-9]{6}"
                 style="font-size: 1.6rem; text-align: center; letter-spacing: 6px; font-weight: 900;" autofocus>
        </div>

        <div class="form-group">
          <label class="form-label" for="studentName">Your Display Name *</label>
          <input type="text" id="studentName" class="form-control" placeholder="Enter your display name..." maxlength="30" required>
        </div>

        <!-- 3D Full-Body Avatar System Preview Card -->
        <div class="avatar-preview-card">
          <label class="form-label" style="text-align: center; margin-bottom: 12px; font-size: 0.95rem; letter-spacing: 1px;">
            CHOOSE YOUR 3D AVATAR
          </label>

          <!-- Starting Style Pills -->
          <div class="style-selector-group" role="group" aria-label="Starting Avatar Style">
            <button type="button" class="style-pill-btn active" data-style="boy">👦 BOY</button>
            <button type="button" class="style-pill-btn" data-style="girl">👧 GIRL</button>
          </div>

          <!-- Curated Presets Strip -->
          <div class="presets-strip" id="presetsStrip" aria-label="Preset Outfits"></div>

          <!-- Large 3D Character Stage -->
          <div class="avatar-stage" id="avatarPreviewStage">
            <!-- Full-Body SVG Mounted by JS -->
          </div>

          <!-- Edit Avatar Modal Trigger -->
          <div>
            <button type="button" id="openEditorBtn" class="btn-edit-avatar">
              ✏️ EDIT AVATAR
            </button>
          </div>
        </div>

        <button type="submit" id="joinBtn" class="btn btn-primary btn-block btn-lg" style="font-size: 1.3rem; padding: 16px;">
          🚀 JOIN QUIZ
        </button>
      </form>
    </div>
  </div>

  <!-- Avatar Scripts -->
  <script src="../assets/js/avatar-engine.js"></script>
  <script src="../assets/js/avatar-editor.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      let currentStyle = 'boy';
      let currentAvatarConfig = null;

      // Clean numeric inputs on join code
      const joinCodeInput = document.getElementById('joinCode');
      joinCodeInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
      });

      // Load saved avatar from localStorage or initialize with default
      try {
        const saved = localStorage.getItem('quizspark_avatar_cfg');
        if (saved) {
          currentAvatarConfig = JSON.parse(saved);
          if (currentAvatarConfig && currentAvatarConfig.style) {
            if (currentAvatarConfig.style === 'neutral') {
              currentAvatarConfig = null;
              currentStyle = 'boy';
            } else {
              currentStyle = currentAvatarConfig.style;
            }
          }
        }
      } catch (e) {}

      if (!currentAvatarConfig) {
        currentAvatarConfig = AvatarEngine.getDefault(currentStyle);
      }

      const previewStage = document.getElementById('avatarPreviewStage');
      const presetsStrip = document.getElementById('presetsStrip');
      const styleBtns = document.querySelectorAll('.style-pill-btn');

      function renderPreview() {
        AvatarEngine.mount(previewStage, currentAvatarConfig, { mode: 'full', animated: true });
      }

      function renderPresets() {
        const presets = AvatarEngine.getPresets(currentStyle);
        presetsStrip.innerHTML = presets.map((p, idx) => `
          <button type="button" class="preset-chip ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
            ${p.name}
          </button>
        `).join('');

        presetsStrip.querySelectorAll('.preset-chip').forEach(btn => {
          btn.addEventListener('click', () => {
            presetsStrip.querySelectorAll('.preset-chip').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const idx = parseInt(btn.dataset.idx, 10);
            currentAvatarConfig = Object.assign({}, presets[idx].config);
            renderPreview();
          });
        });
      }

      // Initialize Editor Modal
      const editor = new AvatarEditor({
        initialConfig: currentAvatarConfig,
        onSave: (newConfig) => {
          currentAvatarConfig = newConfig;
          currentStyle = newConfig.style || 'boy';
          updateStylePills();
          renderPresets();
          renderPreview();
          try {
            localStorage.setItem('quizspark_avatar_cfg', JSON.stringify(currentAvatarConfig));
          } catch(e) {}
        }
      });

      document.getElementById('openEditorBtn').addEventListener('click', () => {
        editor.open(currentAvatarConfig);
      });

      // Style Selector Buttons
      function updateStylePills() {
        styleBtns.forEach(btn => {
          if (btn.dataset.style === currentStyle) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      }

      styleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          currentStyle = btn.dataset.style;
          updateStylePills();
          currentAvatarConfig = AvatarEngine.getDefault(currentStyle);
          renderPresets();
          renderPreview();
        });
      });

      // Initial Render
      updateStylePills();
      renderPresets();
      renderPreview();

      // Handle Form Submit
      const joinForm = document.getElementById('joinForm');
      const alertContainer = document.getElementById('alertContainer');
      const joinBtn = document.getElementById('joinBtn');

      joinForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const joinCode = joinCodeInput.value.trim();
        const name = document.getElementById('studentName').value.trim();

        if (!joinCode || joinCode.length !== 6 || !/^\d{6}$/.test(joinCode)) {
          showAlert('Please enter a valid 6-digit numeric join code.', 'danger');
          joinCodeInput.focus();
          return;
        }

        if (!name || name.length < 1 || name.length > 30) {
          showAlert('Please enter a valid display name (1-30 characters).', 'danger');
          document.getElementById('studentName').focus();
          return;
        }

        joinBtn.disabled = true;
        joinBtn.textContent = 'Joining Quiz...';
        alertContainer.innerHTML = '';

        try {
          const res = await fetch('../api/student/join.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              join_code: joinCode,
              name: name,
              avatar_data: currentAvatarConfig
            })
          });

          const data = await res.json();

          if (data && data.success) {
            try {
              localStorage.setItem('quizspark_avatar_cfg', JSON.stringify(currentAvatarConfig));
            } catch(e) {}

            showAlert('Joined successfully! Entering game lobby...', 'success');
            const targetQuizId = data.quiz_id || (data.data && data.data.quiz_id);
            const token = data.token || (data.data && (data.data.token || data.data.session_token)) || '';
            const redirectUrl = data.redirect || (data.data && data.data.redirect) || `lobby.php?quiz_id=${targetQuizId}&token=${encodeURIComponent(token)}`;
            setTimeout(() => {
              window.location.href = redirectUrl;
            }, 400);
          } else {
            const errorMsg = (data && data.message) ? data.message : 'Unable to join the quiz right now. Please try again.';
            showAlert(errorMsg, 'danger');
            joinBtn.disabled = false;
            joinBtn.textContent = '🚀 JOIN QUIZ';
          }
        } catch (err) {
          console.error('Join error:', err);
          showAlert('Network or server connection error. Please try again.', 'danger');
          joinBtn.disabled = false;
          joinBtn.textContent = '🚀 JOIN QUIZ';
        }
      });

      function showAlert(msg, type) {
        alertContainer.innerHTML = `
          <div class="alert alert-${type} animate-pop" style="margin-bottom: 16px;">
            <span>${msg}</span>
          </div>
        `;
      }
    });
  </script>
</body>
</html>
