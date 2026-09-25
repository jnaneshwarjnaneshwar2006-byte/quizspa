<?php
/**
 * QuizSpark - Creator AI Quiz Generator & Assistant
 * Web UI connected to /api/creator/ai/ backend endpoints
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/security.php';

requireTeacherAuth();

$teacherId = getTeacherId();
$teacherName = $_SESSION['teacher_name'] ?? 'Creator';
$csrfToken = generateCsrfToken();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Quiz Generator - QuizSpark</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/dashboard.css">
  <style>
    .ai-hero-card {
      background: linear-gradient(135deg, rgba(108, 92, 231, 0.25) 0%, rgba(24, 20, 42, 0.95) 100%);
      border: 1px solid rgba(108, 92, 231, 0.4);
      border-radius: var(--radius-xl);
      padding: 24px;
      margin-bottom: 24px;
      position: relative;
      overflow: hidden;
    }
    .ai-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #a29bfe, #6c5ce7);
      color: #fff;
      font-size: 0.78rem;
      font-weight: 800;
      padding: 3px 10px;
      border-radius: var(--radius-full);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .tab-nav {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 12px;
    }
    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 1rem;
      font-weight: 700;
      padding: 8px 16px;
      cursor: pointer;
      border-radius: var(--radius-md);
      transition: all 0.2s;
    }
    .tab-btn.active {
      color: #fff;
      background: rgba(108, 92, 231, 0.25);
      border: 1px solid rgba(108, 92, 231, 0.5);
    }
    .chat-box {
      background: rgba(15, 12, 27, 0.7);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      height: 280px;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 14px;
    }
    .chat-msg {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      font-size: 0.95rem;
      line-height: 1.4;
    }
    .chat-msg.ai {
      background: rgba(108, 92, 231, 0.25);
      border: 1px solid rgba(108, 92, 231, 0.4);
      color: #e2e8f0;
      align-self: flex-start;
      border-bottom-left-radius: 2px;
    }
    .chat-msg.user {
      background: #6c5ce7;
      color: #fff;
      align-self: flex-end;
      border-bottom-right-radius: 2px;
    }
    .question-review-card {
      background: var(--bg-dark-card);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 20px;
      margin-bottom: 16px;
      transition: border-color 0.2s;
    }
    .question-review-card:hover {
      border-color: rgba(108, 92, 231, 0.4);
    }
    .option-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 8px 14px;
      margin-bottom: 6px;
      font-size: 0.92rem;
    }
    .option-pill.is-correct {
      background: rgba(0, 184, 148, 0.15);
      border-color: #00b894;
      color: #55efc4;
      font-weight: 700;
    }
    .explanation-box {
      margin-top: 10px;
      padding: 8px 12px;
      background: rgba(253, 203, 110, 0.1);
      border-left: 3px solid #fdcb6e;
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      font-size: 0.88rem;
      color: #ffeaa7;
    }
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }
    .modal-card {
      background: var(--bg-dark);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      max-width: 650px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      padding: 28px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
    }
  </style>
</head>
<body>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <a href="dashboard.php" class="brand-logo">QuizSpark <span class="brand-badge">CREATOR</span></a>
      </div>
      <ul class="sidebar-menu">
        <li class="menu-item"><a href="dashboard.php">📊 Dashboard</a></li>
        <li class="menu-item active"><a href="ai_generator.php">✨ AI Quiz Generator</a></li>
        <li class="menu-item"><a href="create_quiz.php">➕ Create Quiz</a></li>
        <li class="menu-item"><a href="quizzes.php">📚 My Quizzes</a></li>
        <li class="menu-item"><a href="results.php">🏆 Results</a></li>
      </ul>
      <div class="sidebar-footer">
        <a href="logout.php" class="btn btn-secondary btn-block">🚪 Logout</a>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <div class="top-bar">
        <div>
          <div class="ai-badge">⚡ AI-Powered Engine</div>
          <h1 style="font-size: 2rem; margin-top: 6px;">AI Quiz Generator & Assistant</h1>
          <p style="color: var(--text-muted);">Generate comprehensive, syllabus-accurate quizzes in seconds with structured AI verification.</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <a href="dashboard.php" class="btn btn-secondary">← Back to Dashboard</a>
        </div>
      </div>

      <input type="hidden" id="csrfToken" value="<?= htmlspecialchars($csrfToken) ?>">

      <div id="alertContainer"></div>

      <!-- Generator / Chat Tabs -->
      <div class="tab-nav">
        <button type="button" class="tab-btn active" id="tabGenBtn" onclick="switchTab('generator')">📝 Quick Generator</button>
        <button type="button" class="tab-btn" id="tabChatBtn" onclick="switchTab('chat')">💬 AI Assistant Chat</button>
      </div>

      <!-- Tab 1: Form Generator -->
      <div id="tabGeneratorSection">
        <div class="card" style="margin-bottom: 24px;">
          <h2 style="font-size: 1.3rem; margin-bottom: 16px;">Quiz Parameters</h2>
          <form id="aiGenerateForm">
            <div class="form-group">
              <label class="form-label" for="aiTopic">Topic / Subject *</label>
              <input type="text" id="aiTopic" class="form-control" placeholder="e.g., Java OOP Basics, Cell Biology, World History" required value="Java OOP Basics">
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
              <div class="form-group">
                <label class="form-label" for="aiQuestionCount">Number of Questions *</label>
                <input type="number" id="aiQuestionCount" class="form-control" min="1" max="50" value="5" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="aiDifficulty">Difficulty Level *</label>
                <select id="aiDifficulty" class="form-control">
                  <option value="easy">Easy</option>
                  <option value="medium" selected>Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="aiQuestionType">Question Type *</label>
                <select id="aiQuestionType" class="form-control">
                  <option value="mcq" selected>Multiple Choice (4 options)</option>
                  <option value="true_false">True / False</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="aiPoints">Points per Question</label>
                <input type="number" id="aiPoints" class="form-control" min="1" max="1000" value="100">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="aiInstructions">Custom Instructions (Optional)</label>
              <textarea id="aiInstructions" class="form-control" rows="2" placeholder="e.g. Focus on inheritance, polymorphism, and encapsulation concepts..."></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
              <button type="submit" id="btnSubmitGenerate" class="btn btn-primary btn-lg" style="display: inline-flex; align-items: center; gap: 8px;">
                <span>✨ Generate Quiz Draft</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Tab 2: Chat Assistant -->
      <div id="tabChatSection" style="display: none;">
        <div class="card" style="margin-bottom: 24px;">
          <h2 style="font-size: 1.3rem; margin-bottom: 12px;">QuizSpark AI Assistant</h2>
          <div class="chat-box" id="chatBox">
            <div class="chat-msg ai">
              Hello <?= htmlspecialchars($teacherName) ?>! I am your AI Quiz Creator. You can ask me to generate a new quiz draft (e.g. <em>"Create 5 medium questions about Java OOP Basics"</em>) or refine an existing draft.
            </div>
          </div>
          <form id="chatForm" style="display: flex; gap: 10px;">
            <input type="text" id="chatInput" class="form-control" placeholder="Ask AI to generate or adjust a quiz..." required>
            <button type="submit" id="chatSubmitBtn" class="btn btn-primary" style="white-space: nowrap;">Send ➔</button>
          </form>
        </div>
      </div>

      <!-- Generated Draft Section (Visible once a draft exists) -->
      <div id="draftReviewSection" style="display: none;">
        <div class="card" style="margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="badge badge-draft" id="draftStatusBadge">DRAFT</span>
                <span class="badge badge-lobby" id="draftDifficultyBadge">MEDIUM</span>
                <span class="badge badge-published" id="draftSourceBadge">AI</span>
              </div>
              <h2 id="draftQuizTitle" style="font-size: 1.6rem; margin-top: 8px; margin-bottom: 4px;">Quiz Title</h2>
              <p style="color: var(--text-muted); font-size: 0.95rem;">Topic: <strong id="draftQuizTopic">Topic</strong> &bull; <span id="draftQCount">5</span> Questions</p>
            </div>

            <!-- Draft Global Action Controls -->
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button type="button" onclick="openPreviewModal()" class="btn btn-secondary">👁️ Preview Quiz</button>
              <button type="button" onclick="saveDraftMetadata()" class="btn btn-secondary">💾 Save Draft</button>
              <button type="button" onclick="publishCurrentQuiz()" id="btnPublishQuiz" class="btn btn-primary" style="background: linear-gradient(135deg, #00b894, #00cec9); border-color: #00b894;">
                🚀 Publish Quiz
              </button>
            </div>
          </div>

          <!-- Questions List -->
          <div id="draftQuestionsContainer">
            <!-- Rendered by JS -->
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Modal: Edit Question -->
  <div class="modal-overlay" id="editModalOverlay">
    <div class="modal-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 1.3rem;">Edit Question</h3>
        <button type="button" onclick="closeEditModal()" class="btn btn-secondary btn-sm">&times;</button>
      </div>
      <form id="editQuestionForm">
        <input type="hidden" id="editQuestionId">
        <div class="form-group">
          <label class="form-label" for="editQText">Question Text *</label>
          <textarea id="editQText" class="form-control" rows="3" required></textarea>
        </div>

        <div id="editOptionsGroup">
          <label class="form-label">Answer Options * (Select Correct Answer)</label>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="radio" name="editCorrectChoice" value="A" id="choiceA" required>
              <input type="text" id="editOptA" class="form-control" placeholder="Option A" required>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="radio" name="editCorrectChoice" value="B" id="choiceB">
              <input type="text" id="editOptB" class="form-control" placeholder="Option B" required>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;" id="optCRow">
              <input type="radio" name="editCorrectChoice" value="C" id="choiceC">
              <input type="text" id="editOptC" class="form-control" placeholder="Option C">
            </div>
            <div style="display: flex; align-items: center; gap: 10px;" id="optDRow">
              <input type="radio" name="editCorrectChoice" value="D" id="choiceD">
              <input type="text" id="editOptD" class="form-control" placeholder="Option D">
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="form-group">
            <label class="form-label" for="editQPoints">Points</label>
            <input type="number" id="editQPoints" class="form-control" min="1" max="1000" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="editQDifficulty">Difficulty</label>
            <select id="editQDifficulty" class="form-control">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="editQExplanation">Explanation</label>
          <textarea id="editQExplanation" class="form-control" rows="2"></textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
          <button type="button" onclick="closeEditModal()" class="btn btn-secondary">Cancel</button>
          <button type="submit" id="btnSaveEditedQ" class="btn btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal: Preview Quiz -->
  <div class="modal-overlay" id="previewModalOverlay">
    <div class="modal-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
          <span class="badge badge-lobby" style="margin-bottom: 4px;">PREVIEW ONLY</span>
          <h3 id="previewModalTitle" style="font-size: 1.4rem;">Quiz Preview</h3>
        </div>
        <button type="button" onclick="closePreviewModal()" class="btn btn-secondary btn-sm">&times;</button>
      </div>

      <div id="previewQuestionsList" style="display: flex; flex-direction: column; gap: 14px; max-height: 60vh; overflow-y: auto;">
        <!-- Rendered preview questions -->
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; border-top: 1px solid var(--border-light); padding-top: 14px;">
        <span style="font-size: 0.88rem; color: var(--text-muted);">Status: <strong>DRAFT</strong> (Not accessible to students)</span>
        <button type="button" onclick="closePreviewModal()" class="btn btn-primary">Close Preview</button>
      </div>
    </div>
  </div>

  <!-- Modal: Publish Success -->
  <div class="modal-overlay" id="publishModalOverlay">
    <div class="modal-card" style="text-align: center; max-width: 480px;">
      <div style="font-size: 3.5rem; margin-bottom: 12px;">🎉</div>
      <h2 style="font-size: 1.8rem; margin-bottom: 6px;">Quiz Published!</h2>
      <p style="color: var(--text-muted); margin-bottom: 20px;">Students can now join using this game PIN:</p>

      <div style="background: rgba(255, 255, 255, 0.05); border: 2px dashed #00b894; border-radius: var(--radius-lg); padding: 18px; margin-bottom: 20px;">
        <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 700; display: block;">JOIN CODE</span>
        <div id="publishedJoinCodeDisplay" style="font-family: 'Outfit', sans-serif; font-size: 2.8rem; font-weight: 900; letter-spacing: 8px; color: #55efc4;">
          000000
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        <a id="btnGoToLobby" href="dashboard.php" class="btn btn-primary btn-lg" style="background: linear-gradient(135deg, #6c5ce7, #a29bfe);">
          ⚡ Open Live Lobby & Start
        </a>
        <a href="dashboard.php" class="btn btn-secondary">Return to Dashboard</a>
      </div>
    </div>
  </div>

  <script>
    let activeQuizId = null;
    let activeQuizData = null;
    const csrfToken = document.getElementById('csrfToken').value;

    function switchTab(tab) {
      document.getElementById('tabGenBtn').classList.toggle('active', tab === 'generator');
      document.getElementById('tabChatBtn').classList.toggle('active', tab === 'chat');
      document.getElementById('tabGeneratorSection').style.display = (tab === 'generator') ? 'block' : 'none';
      document.getElementById('tabChatSection').style.display = (tab === 'chat') ? 'block' : 'none';
    }

    function showAlert(type, msg) {
      const container = document.getElementById('alertContainer');
      const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
      container.innerHTML = `<div class="alert ${alertClass} animate-pop" style="margin-bottom: 20px;">${escapeHtml(msg)}</div>`;
      setTimeout(() => { container.innerHTML = ''; }, 6000);
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // 1. Submit Quick Generator Form
    document.getElementById('aiGenerateForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btnSubmitGenerate');
      btn.disabled = true;
      btn.innerHTML = '<span>⏳ Generating Quiz Draft...</span>';

      const payload = {
        topic: document.getElementById('aiTopic').value.trim(),
        question_count: parseInt(document.getElementById('aiQuestionCount').value, 10),
        difficulty: document.getElementById('aiDifficulty').value,
        question_type: document.getElementById('aiQuestionType').value,
        points_per_question: parseInt(document.getElementById('aiPoints').value, 10),
        instructions: document.getElementById('aiInstructions').value.trim()
      };

      try {
        const res = await fetch('../api/creator/ai/generate.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success && data.data) {
          activeQuizId = data.data.quiz.id;
          activeQuizData = data.data;
          renderDraftQuiz(data.data.quiz, data.data.questions);
          showAlert('success', 'Quiz draft generated successfully!');
          document.getElementById('draftReviewSection').scrollIntoView({ behavior: 'smooth' });
        } else {
          showAlert('error', data.error ? data.error.message : 'Generation failed. Please try again.');
        }
      } catch (err) {
        showAlert('error', 'Network error. Please try again.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>✨ Generate Quiz Draft</span>';
      }
    });

    // 2. Chatbot Assistant Form
    document.getElementById('chatForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('chatInput');
      const text = input.value.trim();
      if (!text) return;

      appendChatMessage('user', text);
      input.value = '';

      const submitBtn = document.getElementById('chatSubmitBtn');
      submitBtn.disabled = true;

      try {
        const res = await fetch('../api/creator/ai/chat.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({ message: text, quiz_id: activeQuizId })
        });
        const data = await res.json();

        if (data.success && data.data) {
          appendChatMessage('ai', data.data.message);
          if (data.data.quiz_id && data.data.quiz_id !== activeQuizId) {
            activeQuizId = data.data.quiz_id;
            loadDraft(activeQuizId);
          }
        } else {
          appendChatMessage('ai', data.error ? data.error.message : 'Unable to process chat request.');
        }
      } catch (err) {
        appendChatMessage('ai', 'Connection error. Please try again.');
      } finally {
        submitBtn.disabled = false;
      }
    });

    function appendChatMessage(role, text) {
      const box = document.getElementById('chatBox');
      const msg = document.createElement('div');
      msg.className = `chat-msg ${role}`;
      msg.innerHTML = escapeHtml(text);
      box.appendChild(msg);
      box.scrollTop = box.scrollHeight;
    }

    // 3. Render Draft Quiz
    function renderDraftQuiz(quiz, questions) {
      document.getElementById('draftReviewSection').style.display = 'block';
      document.getElementById('draftQuizTitle').textContent = quiz.title;
      document.getElementById('draftQuizTopic').textContent = quiz.topic || 'General';
      document.getElementById('draftQCount').textContent = questions.length;
      document.getElementById('draftStatusBadge').textContent = (quiz.status || 'draft').toUpperCase();
      document.getElementById('draftDifficultyBadge').textContent = (quiz.difficulty || 'medium').toUpperCase();

      const container = document.getElementById('draftQuestionsContainer');
      container.innerHTML = questions.map((q, idx) => {
        const qNum = idx + 1;
        return `
          <div class="question-review-card" id="qCard_${q.id}">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
              <div>
                <span style="font-weight: 800; color: var(--primary);">#${qNum}</span>
                <span class="badge badge-lobby" style="margin-left: 8px;">${(q.difficulty || 'medium').toUpperCase()}</span>
                <span class="badge" style="background: rgba(255,255,255,0.08); margin-left: 6px;">${q.points || 100} pts</span>
              </div>
              <div style="display: flex; gap: 8px;">
                <button type="button" onclick="openEditModal(${q.id})" class="btn btn-secondary btn-sm">✏️ Edit</button>
                <button type="button" onclick="regenerateQuestion(${q.id})" class="btn btn-secondary btn-sm">🔄 Regenerate</button>
              </div>
            </div>

            <h4 style="font-size: 1.15rem; margin-bottom: 12px; line-height: 1.4;">${escapeHtml(q.question_text)}</h4>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px;">
              ${(q.options || []).map((opt, oi) => {
                const isCorrect = (opt === q.correct_answer || ['A','B','C','D'][oi] === q.correct_option);
                return `
                  <div class="option-pill ${isCorrect ? 'is-correct' : ''}">
                    <span style="font-weight: 800; color: ${isCorrect ? '#55efc4' : 'var(--text-muted)'};">${String.fromCharCode(65 + oi)}.</span>
                    <span>${escapeHtml(opt)}</span>
                    ${isCorrect ? '<span style="margin-left: auto;">✓</span>' : ''}
                  </div>
                `;
              }).join('')}
            </div>

            ${q.explanation ? `<div class="explanation-box">💡 <strong>Explanation:</strong> ${escapeHtml(q.explanation)}</div>` : ''}
          </div>
        `;
      }).join('');
    }

    // 4. Load Draft
    async function loadDraft(quizId) {
      try {
        const res = await fetch(`../api/creator/ai/draft.php?id=${quizId}`);
        const data = await res.json();
        if (data.success && data.data) {
          activeQuizId = data.data.quiz.id;
          activeQuizData = data.data;
          renderDraftQuiz(data.data.quiz, data.data.questions);
        }
      } catch (err) {}
    }

    // 5. Open Edit Modal
    function openEditModal(qId) {
      if (!activeQuizData || !activeQuizData.questions) return;
      const q = activeQuizData.questions.find(item => item.id === qId);
      if (!q) return;

      document.getElementById('editQuestionId').value = q.id;
      document.getElementById('editQText').value = q.question_text;
      document.getElementById('editQPoints').value = q.points || 100;
      document.getElementById('editQDifficulty').value = q.difficulty || 'medium';
      document.getElementById('editQExplanation').value = q.explanation || '';

      const opts = q.options || [];
      document.getElementById('editOptA').value = opts[0] || '';
      document.getElementById('editOptB').value = opts[1] || '';
      document.getElementById('editOptC').value = opts[2] || '';
      document.getElementById('editOptD').value = opts[3] || '';

      // Set radio
      const radios = document.getElementsByName('editCorrectChoice');
      const correctIdx = opts.indexOf(q.correct_answer);
      const letter = correctIdx !== -1 ? ['A','B','C','D'][correctIdx] : (q.correct_option || 'A');
      for (const r of radios) {
        r.checked = (r.value === letter);
      }

      document.getElementById('editModalOverlay').style.display = 'flex';
    }

    function closeEditModal() {
      document.getElementById('editModalOverlay').style.display = 'none';
    }

    // 6. Submit Edit Question Form
    document.getElementById('editQuestionForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const qId = parseInt(document.getElementById('editQuestionId').value, 10);
      const checkedRadio = document.querySelector('input[name="editCorrectChoice"]:checked');
      const correctLetter = checkedRadio ? checkedRadio.value : 'A';

      const optA = document.getElementById('editOptA').value.trim();
      const optB = document.getElementById('editOptB').value.trim();
      const optC = document.getElementById('editOptC').value.trim();
      const optD = document.getElementById('editOptD').value.trim();
      const options = [optA, optB, optC, optD];

      const letterMap = { 'A': optA, 'B': optB, 'C': optC, 'D': optD };
      const correctAnswer = letterMap[correctLetter] || optA;

      const payload = {
        quiz_id: activeQuizId,
        question_id: qId,
        question_text: document.getElementById('editQText').value.trim(),
        options: options,
        correct_answer: correctAnswer,
        explanation: document.getElementById('editQExplanation').value.trim(),
        points: parseInt(document.getElementById('editQPoints').value, 10),
        difficulty: document.getElementById('editQDifficulty').value
      };

      try {
        const res = await fetch('../api/creator/ai/question.php', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success && data.data) {
          closeEditModal();
          showAlert('success', 'Question updated successfully!');
          // Reload draft to verify persistence
          await loadDraft(activeQuizId);
        } else {
          alert(data.error ? data.error.message : 'Failed to update question.');
        }
      } catch (err) {
        alert('Network error while updating question.');
      }
    });

    // 7. Regenerate Question
    async function regenerateQuestion(qId) {
      if (!confirm('Regenerate this question with AI?')) return;
      try {
        const res = await fetch('../api/creator/ai/regenerate.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({ quiz_id: activeQuizId, question_id: qId })
        });
        const data = await res.json();
        if (data.success && data.data) {
          showAlert('success', 'Question regenerated successfully!');
          await loadDraft(activeQuizId);
        } else {
          showAlert('error', data.error ? data.error.message : 'Regeneration failed.');
        }
      } catch (err) {
        showAlert('error', 'Network error.');
      }
    }

    // 8. Save Draft Metadata
    async function saveDraftMetadata() {
      if (!activeQuizId) return;
      try {
        const res = await fetch('../api/creator/ai/save.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({ quiz_id: activeQuizId })
        });
        const data = await res.json();
        if (data.success) {
          showAlert('success', 'Draft saved successfully!');
        }
      } catch(err) {}
    }

    // 9. Open Preview Modal
    async function openPreviewModal() {
      if (!activeQuizId) return;
      try {
        const res = await fetch('../api/creator/ai/preview.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({ quiz_id: activeQuizId })
        });
        const data = await res.json();
        if (data.success && data.data) {
          const list = document.getElementById('previewQuestionsList');
          document.getElementById('previewModalTitle').textContent = data.data.quiz.title;
          list.innerHTML = (data.data.questions || []).map((q, idx) => `
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 14px;">
              <p style="font-weight: 800; margin-bottom: 8px;">#${idx + 1}. ${escapeHtml(q.question_text)} (${q.points} pts)</p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                ${(q.options || []).map(opt => `
                  <div style="background: rgba(255,255,255,0.05); padding: 6px 10px; border-radius: var(--radius-sm); font-size: 0.9rem;">
                    ${escapeHtml(opt)}
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('');
          document.getElementById('previewModalOverlay').style.display = 'flex';
        }
      } catch(err) {
        showAlert('error', 'Unable to load preview.');
      }
    }

    function closePreviewModal() {
      document.getElementById('previewModalOverlay').style.display = 'none';
    }

    // 10. Publish Quiz
    async function publishCurrentQuiz() {
      if (!activeQuizId) return;
      if (!confirm('Are you ready to publish this quiz? Once published, students can join via game PIN.')) return;

      const btn = document.getElementById('btnPublishQuiz');
      btn.disabled = true;

      try {
        const res = await fetch('../api/creator/ai/publish.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({ quiz_id: activeQuizId })
        });
        const data = await res.json();

        if (data.success && data.data) {
          const joinCode = data.data.join_code;
          document.getElementById('publishedJoinCodeDisplay').textContent = joinCode;
          document.getElementById('btnGoToLobby').href = `live_lobby.php?id=${activeQuizId}`;
          document.getElementById('publishModalOverlay').style.display = 'flex';
          showAlert('success', 'Quiz published successfully!');
        } else {
          showAlert('error', data.error ? data.error.message : 'Publishing failed.');
        }
      } catch (err) {
        showAlert('error', 'Network error during publish.');
      } finally {
        btn.disabled = false;
      }
    }
  </script>
</body>
</html>
