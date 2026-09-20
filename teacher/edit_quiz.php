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
    header('Location: dashboard.php');
    exit;
}

$qStmt = $pdo->prepare("SELECT * FROM `questions` WHERE `quiz_id` = :quiz_id ORDER BY `question_number` ASC");
$qStmt->execute(['quiz_id' => $quizId]);
$questions = $qStmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Edit Quiz - QuizSpark</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/dashboard.css">
</head>
<body>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <a href="dashboard.php" class="brand-logo">QuizSpark <span class="brand-badge">CREATOR</span></a>
      </div>
      <ul class="sidebar-menu">
        <li class="menu-item"><a href="dashboard.php">📊 Dashboard</a></li>
        <li class="menu-item"><a href="create_quiz.php">➕ Create Quiz</a></li>
        <li class="menu-item active"><a href="quizzes.php">📚 My Quizzes</a></li>
        <li class="menu-item"><a href="results.php">🏆 Results</a></li>
      </ul>
      <div class="sidebar-footer">
        <a href="logout.php" class="btn btn-secondary btn-block">🚪 Logout</a>
      </div>
    </aside>

    <main class="main-content">
      <div class="top-bar">
        <div>
          <h1>Edit Quiz: <?= htmlspecialchars($quiz['title']) ?></h1>
          <p style="color: var(--text-muted);">Modify questions, options, or quiz metadata.</p>
        </div>
        <a href="quizzes.php" class="btn btn-secondary">← Back to My Quizzes</a>
      </div>

      <div id="alertContainer"></div>

      <form id="quizForm">
        <input type="hidden" id="quiz_id" value="<?= $quizId ?>">

        <div class="card" style="margin-bottom: 30px;">
          <h2 style="font-size: 1.3rem; margin-bottom: 20px;">1. Quiz Details</h2>
          <div class="form-group">
            <label class="form-label">Quiz Title *</label>
            <input type="text" id="title" class="form-control" value="<?= htmlspecialchars($quiz['title']) ?>" required>
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea id="description" class="form-control" rows="2"><?= htmlspecialchars($quiz['description'] ?? '') ?></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Category</label>
            <input type="text" id="category" class="form-control" value="<?= htmlspecialchars($quiz['category'] ?? 'General') ?>">
          </div>
        </div>

        <div class="card" style="margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="font-size: 1.3rem;">2. Questions</h2>
            <button type="button" id="addQuestionBtn" class="btn btn-accent">➕ Add Another Question</button>
          </div>

          <div id="questionsContainer">
            <!-- Populated via JS -->
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 16px;">
          <a href="quizzes.php" class="btn btn-secondary btn-lg">Cancel</a>
          <button type="submit" class="btn btn-primary btn-lg">💾 Update Quiz</button>
        </div>
      </form>
    </main>
  </div>

  <script src="../assets/js/dashboard.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const existingQuestions = <?= json_encode($questions, JSON_UNESCAPED_UNICODE) ?>;
      if (window.loadQuestionsForEdit && existingQuestions.length > 0) {
        window.loadQuestionsForEdit(existingQuestions);
      }
    });
  </script>
</body>
</html>
