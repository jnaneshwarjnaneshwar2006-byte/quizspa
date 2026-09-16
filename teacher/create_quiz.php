<?php
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/security.php';

requireTeacherAuth();
$csrfToken = generateCsrfToken();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Create Quiz - QuizSpark</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/dashboard.css">
</head>
<body>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <a href="dashboard.php" class="brand-logo">QuizSpark <span class="brand-badge">TEACHER</span></a>
      </div>
      <ul class="sidebar-menu">
        <li class="menu-item"><a href="dashboard.php">📊 Dashboard</a></li>
        <li class="menu-item active"><a href="create_quiz.php">➕ Create Quiz</a></li>
        <li class="menu-item"><a href="quizzes.php">📚 My Quizzes</a></li>
        <li class="menu-item"><a href="results.php">🏆 Results</a></li>
      </ul>
      <div class="sidebar-footer">
        <a href="logout.php" class="btn btn-secondary btn-block">🚪 Logout</a>
      </div>
    </aside>

    <main class="main-content">
      <div class="top-bar">
        <div>
          <h1>Create New Live Quiz</h1>
          <p style="color: var(--text-muted);">Fill in the quiz metadata and add your interactive questions.</p>
        </div>
        <a href="dashboard.php" class="btn btn-secondary">← Back to Dashboard</a>
      </div>

      <div id="alertContainer"></div>

      <form id="quizForm">
        <!-- Quiz Metadata Card -->
        <div class="card" style="margin-bottom: 30px;">
          <h2 style="font-size: 1.3rem; margin-bottom: 20px;">1. Quiz Details</h2>
          <div class="form-group">
            <label class="form-label">Quiz Title *</label>
            <input type="text" id="title" class="form-control" placeholder="e.g., General Knowledge Trivia 2026" required>
          </div>
          <div class="form-group">
            <label class="form-label">Description (Optional)</label>
            <textarea id="description" class="form-control" rows="2" placeholder="Brief summary of what this quiz covers..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Category</label>
            <input type="text" id="category" class="form-control" value="General Knowledge" placeholder="e.g., Computer Science, History, Math">
          </div>
        </div>

        <!-- Questions Builder Card -->
        <div class="card" style="margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="font-size: 1.3rem;">2. Add Questions</h2>
            <button type="button" id="addQuestionBtn" class="btn btn-accent">➕ Add Another Question</button>
          </div>

          <div id="questionsContainer">
            <!-- Dynamic Questions appended here by dashboard.js -->
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 16px;">
          <a href="dashboard.php" class="btn btn-secondary btn-lg">Cancel</a>
          <button type="submit" class="btn btn-primary btn-lg">🚀 Save & Publish Quiz</button>
        </div>
      </form>
    </main>
  </div>

  <script src="../assets/js/dashboard.js"></script>
</body>
</html>
