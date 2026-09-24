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

// Auto update status to 'lobby' if currently 'published' or 'draft'
if (in_array($quiz['status'], ['published', 'draft'], true)) {
    $upd = $pdo->prepare("UPDATE `quizzes` SET `status` = 'lobby' WHERE `id` = :id");
    $upd->execute(['id' => $quizId]);
    $quiz['status'] = 'lobby';
}

$joinUrl = $quiz['join_url'] ?: (getBaseUrl() . '/student/join.php?code=' . $quiz['join_code']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Lobby - <?= htmlspecialchars($quiz['title']) ?> - QuizSpark</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/lobby.css">
  <link rel="stylesheet" href="../assets/css/avatar.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="../assets/js/avatar-engine.js"></script>
  <script src="../assets/js/earth-lobby.js"></script>
  <script src="../assets/js/lobby.js"></script>
</head>
<body>
  <div class="earth-lobby-wrapper">
    <!-- Top Navigation -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <a href="dashboard.php" class="brand-logo">QuizSpark <span class="brand-badge">LIVE LOBBY</span></a>
      <div style="display: flex; gap: 10px;">
        <button type="button" onclick="copyJoinUrl()" class="btn btn-secondary btn-sm">📋 Copy Link</button>
        <a href="dashboard.php" class="btn btn-secondary btn-sm">Exit Lobby</a>
      </div>
    </div>

    <!-- Header Banner -->
    <div class="lobby-header animate-pop" style="padding: 20px 24px; margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="text-align: left;">
          <p style="text-transform: uppercase; letter-spacing: 2px; color: var(--accent-cyan); font-weight: 800; font-size: 0.85rem; margin-bottom: 4px;">
            ⚡ Live Quiz Session
          </p>
          <h1 style="font-size: 1.9rem; margin: 0; line-height: 1.2;"><?= htmlspecialchars($quiz['title']) ?></h1>
        </div>

        <div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap;">
          <div>
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; display: block;">GAME PIN</span>
            <div class="join-code-badge" style="margin: 0; font-size: 2.2rem; padding: 4px 18px; letter-spacing: 8px;">
              <?= htmlspecialchars($quiz['join_code']) ?>
            </div>
          </div>

          <div class="qr-box" style="margin: 0; padding: 6px;">
            <div id="qrcode"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main 3D Earth Live Grid -->
    <div class="live-lobby-grid">
      <!-- Left: Interactive 3D Earth Stage -->
      <div class="earth-stage-card">
        <!-- 3D Canvas Target -->
        <div id="earthCanvasContainer" class="earth-canvas-container"></div>

        <!-- Stage Header Overlay -->
        <div class="earth-stage-overlay-header">
          <div class="earth-stage-badge">
            <span style="color: #20bf6b; animation: pulse 1.5s infinite;">●</span> 3D LIVE EARTH LOBBY
          </div>
          <div class="earth-instructions-tag">
            👆 Click a player on globe or list to inspect
          </div>
        </div>

        <!-- Controls Toolbar Overlay -->
        <div class="earth-controls-bar">
          <div style="display: flex; gap: 8px;">
            <button type="button" id="toggleRotateBtn" class="earth-ctrl-btn">
              <span id="rotateIcon">🔄</span> Auto-Rotate: ON
            </button>
            <button type="button" id="resetCameraBtn" class="earth-ctrl-btn">
              🎯 Center View
            </button>
          </div>
          <div class="earth-instructions-tag">
            🖱️ Drag to rotate • 🔍 Scroll to zoom
          </div>
        </div>
      </div>

      <!-- Right: Participants Sidebar -->
      <div class="lobby-sidebar-card">
        <div class="lobby-sidebar-header">
          <div style="text-align: left;">
            <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Joined Players</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: var(--accent-yellow);">
              <span id="playerCountDisplay">0</span> <span style="font-size: 1rem; color: var(--text-muted); font-weight: 600;">online</span>
            </div>
          </div>
          <span style="background: rgba(32, 191, 107, 0.15); color: #20bf6b; border: 1px solid rgba(32, 191, 107, 0.3); padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 800;">
            ● Ready
          </span>
        </div>

        <!-- Scrollable Player List -->
        <div id="sidebarPlayersList" class="sidebar-players-scroll">
          <div id="emptyMsg" style="text-align: center; color: var(--text-muted); padding: 40px 10px; font-size: 0.95rem;">
            ⏳ Waiting for students to join with PIN <strong><?= htmlspecialchars($quiz['join_code']) ?></strong>...
          </div>
        </div>

        <!-- Host Start Action Footer -->
        <div style="margin-top: auto; padding-top: 14px; border-top: 1px solid var(--border-light);">
          <button id="startQuizBtn" class="btn btn-primary btn-lg btn-block" style="font-size: 1.25rem; padding: 16px;" disabled>
            🚀 START QUIZ (0 Players)
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Player Details Modal Window -->
  <div id="playerDetailModal" class="player-modal-backdrop" role="dialog" aria-modal="true" aria-hidden="true">
    <div class="player-modal-card">
      <button type="button" class="player-modal-close" id="closePlayerModalBtn" aria-label="Close">&times;</button>
      
      <div style="font-size: 0.8rem; color: var(--accent-cyan); font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
        Player Details
      </div>
      <h2 id="modalPlayerName" style="font-size: 1.6rem; margin: 4px 0 12px; color: #ffffff;">Student Name</h2>

      <!-- Character Stage Preview -->
      <div id="modalAvatarStage" class="player-modal-avatar-stage">
        <!-- SVG Mounted by AvatarEngine -->
      </div>

      <!-- Real Data Info Grid -->
      <div class="player-modal-info-grid">
        <div class="player-info-pill">
          <div class="player-info-label">Status</div>
          <div class="player-info-val" style="color: #20bf6b;">🟢 In Lobby</div>
        </div>
        <div class="player-info-pill">
          <div class="player-info-label">Current Score</div>
          <div class="player-info-val" id="modalPlayerScore">0 pts</div>
        </div>
        <div class="player-info-pill">
          <div class="player-info-label">Avatar Style</div>
          <div class="player-info-val" id="modalPlayerStyle">Custom</div>
        </div>
        <div class="player-info-pill">
          <div class="player-info-label">Joined At</div>
          <div class="player-info-val" id="modalPlayerJoined" style="font-size: 0.85rem;">Just now</div>
        </div>
      </div>

      <button type="button" id="closeModalBtn2" class="btn btn-secondary btn-block">
        Close
      </button>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const quizId = <?= $quizId ?>;
      const joinUrl = <?= json_encode($joinUrl) ?>;

      // 1. Render QR Code
      const qrContainer = document.getElementById('qrcode');
      try {
        if (typeof QRCode !== 'undefined') {
          new QRCode(qrContainer, {
            text: joinUrl,
            width: 72,
            height: 72,
            colorDark : "#0f0c1b",
            colorLight : "#ffffff"
          });
        } else {
          qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=72x72&data=${encodeURIComponent(joinUrl)}" style="width: 72px; height: 72px;">`;
        }
      } catch(e) {
        qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=72x72&data=${encodeURIComponent(joinUrl)}" style="width: 72px; height: 72px;">`;
      }

      // 2. Initialize 3D Rotating Earth Lobby
      let earthLobby = null;
      try {
        earthLobby = new EarthLobby('earthCanvasContainer', {
          globeRadius: 82,
          autoRotate: true,
          onPlayerClick: (participant) => {
            showPlayerModal(participant);
          }
        });
      } catch(err) {
        console.warn('WebGL / Three.js 3D earth failed, using 2D fallback:', err);
        const container = document.getElementById('earthCanvasContainer');
        container.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-muted);">
            <div style="font-size: 6rem; animation: pulse 3s infinite;">🌍</div>
            <p style="margin-top: 10px; font-weight: 700; color: var(--accent-cyan);">Live Quiz Lobby Active</p>
          </div>
        `;
      }

      // 3. Earth Controls
      const toggleRotateBtn = document.getElementById('toggleRotateBtn');
      if (toggleRotateBtn && earthLobby) {
        toggleRotateBtn.addEventListener('click', () => {
          const isRotating = earthLobby.toggleAutoRotate();
          toggleRotateBtn.innerHTML = isRotating 
            ? '<span id="rotateIcon">🔄</span> Auto-Rotate: ON' 
            : '<span id="rotateIcon">⏸️</span> Auto-Rotate: OFF';
        });
      }

      const resetCameraBtn = document.getElementById('resetCameraBtn');
      if (resetCameraBtn && earthLobby) {
        resetCameraBtn.addEventListener('click', () => {
          earthLobby.targetRotationX = 0.15;
          earthLobby.targetRotationY = 0;
          earthLobby.targetCameraDistance = 310;
        });
      }

      // 4. Modal Handlers
      const modal = document.getElementById('playerDetailModal');
      const closeModalBtn = document.getElementById('closePlayerModalBtn');
      const closeModalBtn2 = document.getElementById('closeModalBtn2');

      function showPlayerModal(p) {
        if (!p) return;
        document.getElementById('modalPlayerName').textContent = p.name || 'Student';
        document.getElementById('modalPlayerScore').textContent = (p.total_score || 0) + ' pts';
        
        const style = (p.avatar_data && p.avatar_data.style) ? (p.avatar_data.style.toUpperCase()) : 'BOY';
        document.getElementById('modalPlayerStyle').textContent = style;
        
        let joinTime = 'Joined';
        if (p.joined_at) {
          try {
            const d = new Date(p.joined_at);
            joinTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } catch(e) {}
        }
        document.getElementById('modalPlayerJoined').textContent = joinTime;

        // Mount Full Character SVG
        const stage = document.getElementById('modalAvatarStage');
        AvatarEngine.mount(stage, p.avatar_data, { mode: 'full', animated: true });

        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
      }

      function hidePlayerModal() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
      }

      if (closeModalBtn) closeModalBtn.addEventListener('click', hidePlayerModal);
      if (closeModalBtn2) closeModalBtn2.addEventListener('click', hidePlayerModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) hidePlayerModal();
      });

      // 5. Initialize Real-Time Lobby Polling Engine
      const lobbyEngine = new LobbyEngine({
        quizId: quizId,
        role: 'teacher',
        pollIntervalMs: 1000,
        onStateUpdate: (data) => {
          renderLobbyState(data);
        }
      });

      lobbyEngine.start();

      let lastParticipantsSignature = '';

      function renderLobbyState(data) {
        const countDisplay = document.getElementById('playerCountDisplay');
        const list = document.getElementById('sidebarPlayersList');
        const startBtn = document.getElementById('startQuizBtn');

        const participants = data.participants || [];
        const count = data.player_count || participants.length || 0;
        countDisplay.textContent = count;

        // Update 3D Earth with participants
        if (earthLobby) {
          earthLobby.updateParticipants(participants);
        }

        const sig = JSON.stringify(participants);
        if (sig !== lastParticipantsSignature) {
          lastParticipantsSignature = sig;

          if (count > 0) {
            startBtn.disabled = false;
            startBtn.innerHTML = `🚀 START QUIZ (${count} ${count === 1 ? 'Player' : 'Players'})`;

            list.innerHTML = participants.map(p => `
              <div class="player-card animate-pop" data-pid="${p.id}" id="player_card_${p.id}">
                <div class="avatar-badge-wrapper badge-sm" id="sidebar_badge_${p.id}"></div>
                <span class="player-name">${escapeHtml(p.name)}</span>
                <span style="font-size: 0.75rem; color: #20bf6b;">●</span>
              </div>
            `).join('');

            // Mount avatar badges & click handlers
            participants.forEach(p => {
              const bEl = document.getElementById(`sidebar_badge_${p.id}`);
              if (bEl) {
                AvatarEngine.mount(bEl, p.avatar_data, { mode: 'badge', animated: false });
              }

              const cardEl = document.getElementById(`player_card_${p.id}`);
              if (cardEl) {
                cardEl.addEventListener('click', () => {
                  if (earthLobby) {
                    earthLobby.highlightPlayer(p.id);
                  }
                  showPlayerModal(p);
                });
              }
            });
          } else {
            startBtn.disabled = true;
            startBtn.innerHTML = '🚀 START QUIZ (0 Players)';
            list.innerHTML = `
              <div id="emptyMsg" style="text-align: center; color: var(--text-muted); padding: 40px 10px; font-size: 0.95rem;">
                ⏳ Waiting for students to join with PIN <strong><?= htmlspecialchars($quiz['join_code']) ?></strong>...
              </div>
            `;
          }
        }

        // If quiz is running, navigate to live quiz control panel
        if (data.quiz && data.quiz.status === 'running') {
          lobbyEngine.stop();
          if (earthLobby) earthLobby.destroy();
          window.location.href = `live_quiz.php?id=${quizId}`;
        }
      }

      // 6. Handle Start Quiz Button Click
      const startBtn = document.getElementById('startQuizBtn');
      startBtn.addEventListener('click', async () => {
        startBtn.disabled = true;
        startBtn.textContent = 'Starting Quiz...';

        try {
          const res = await fetch('../api/live/start_quiz.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quiz_id: quizId })
          });

          const resData = await res.json();
          if (resData.success) {
            lobbyEngine.stop();
            if (earthLobby) earthLobby.destroy();
            window.location.href = `live_quiz.php?id=${quizId}`;
          } else {
            alert(resData.message || 'Failed to start quiz.');
            startBtn.disabled = false;
          }
        } catch (err) {
          alert('Network error starting quiz.');
          startBtn.disabled = false;
        }
      });
    });

    function copyJoinUrl() {
      const url = <?= json_encode($joinUrl) ?>;
      navigator.clipboard.writeText(url);
      alert('Join URL copied to clipboard!');
    }

    function escapeHtml(text) {
      if (!text) return '';
      return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
  </script>
</body>
</html>

