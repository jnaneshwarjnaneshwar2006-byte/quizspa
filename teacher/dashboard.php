<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/security.php';

requireTeacherAuth();

$pdo = getDBConnection();
$teacherId = getTeacherId();
$teacherName = $_SESSION['teacher_name'] ?? 'Creator';

// Fetch Summary Metrics
$mTotal = $pdo->prepare("SELECT COUNT(*) FROM `quizzes` WHERE `teacher_id` = :id");
$mTotal->execute(['id' => $teacherId]);
$totalQuizzes = (int)$mTotal->fetchColumn();

$mPub = $pdo->prepare("SELECT COUNT(*) FROM `quizzes` WHERE `teacher_id` = :id AND `status` = 'published'");
$mPub->execute(['id' => $teacherId]);
$publishedQuizzes = (int)$mPub->fetchColumn();

$mLive = $pdo->prepare("SELECT COUNT(*) FROM `quizzes` WHERE `teacher_id` = :id AND `status` IN ('lobby', 'running')");
$mLive->execute(['id' => $teacherId]);
$liveQuizzes = (int)$mLive->fetchColumn();

$mPart = $pdo->prepare("SELECT COUNT(DISTINCT p.id) FROM `participants` p JOIN `quizzes` q ON p.quiz_id = q.id WHERE q.teacher_id = :id");
$mPart->execute(['id' => $teacherId]);
$totalParticipants = (int)$mPart->fetchColumn();

// Fetch Recent Quizzes
$stmt = $pdo->prepare("
    SELECT 
        q.*, 
        COUNT(DISTINCT qs.id) as question_count,
        COUNT(DISTINCT p.id) as participant_count
    FROM `quizzes` q
    LEFT JOIN `questions` qs ON q.id = qs.quiz_id
    LEFT JOIN `participants` p ON q.id = p.quiz_id
    WHERE q.teacher_id = :id
    GROUP BY q.id
    ORDER BY q.created_at DESC
    LIMIT 10
");
$stmt->execute(['id' => $teacherId]);
$quizzes = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Creator Dashboard - QuizSpark</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/dashboard.css">
</head>
<body>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <a href="dashboard.php" class="brand-logo">QuizSpark <span class="brand-badge">CREATOR</span></a>
      </div>
      <ul class="sidebar-menu">
        <li class="menu-item active"><a href="dashboard.php">📊 Dashboard</a></li>
        <li class="menu-item"><a href="ai_generator.php" style="color: #a29bfe; font-weight: 800;">✨ AI Generator</a></li>
        <li class="menu-item"><a href="create_quiz.php">➕ Create Quiz</a></li>
        <li class="menu-item"><a href="quizzes.php">📚 My Quizzes</a></li>
        <li class="menu-item"><a href="results.php">🏆 Results</a></li>
      </ul>
      <div class="sidebar-footer">
        <a href="logout.php" class="btn btn-secondary btn-block" style="justify-content: flex-start;">🚪 Logout</a>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <div class="top-bar">
        <div>
          <h1 style="font-size: 2rem;">Welcome, <?= htmlspecialchars($teacherName) ?>!</h1>
          <p style="color: var(--text-muted);">Manage your live quizzes and view participant progress.</p>
        </div>
        <div class="user-profile" style="display: flex; gap: 10px;">
          <a href="ai_generator.php" class="btn btn-primary" style="background: linear-gradient(135deg, #6c5ce7, #a29bfe);">✨ Generate with AI</a>
          <a href="create_quiz.php" class="btn btn-secondary">➕ Manual Quiz</a>
        </div>
      </div>

      <!-- Metrics Cards Grid -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon metric-purple">📝</div>
          <div class="metric-info">
            <h3><?= $totalQuizzes ?></h3>
            <p>Total Quizzes</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon metric-cyan">📢</div>
          <div class="metric-info">
            <h3><?= $publishedQuizzes ?></h3>
            <p>Published Quizzes</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon metric-orange">⚡</div>
          <div class="metric-info">
            <h3><?= $liveQuizzes ?></h3>
            <p>Live Quizzes</p>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon metric-green">👥</div>
          <div class="metric-info">
            <h3><?= $totalParticipants ?></h3>
            <p>Total Participants</p>
          </div>
        </div>
      </div>

      <!-- Recent Quizzes Section -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="font-size: 1.4rem;">Recent Quizzes</h2>
          <a href="quizzes.php" style="color: var(--primary); text-decoration: none; font-weight: 700;">View All →</a>
        </div>

        <?php if (empty($quizzes)): ?>
          <div style="text-align: center; padding: 40px; color: var(--text-muted);">
            <p style="font-size: 1.1rem; margin-bottom: 16px;">You haven't created any quizzes yet!</p>
            <a href="create_quiz.php" class="btn btn-primary">Create Your First Quiz</a>
          </div>
        <?php else: ?>
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Questions</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <?php foreach ($quizzes as $q): ?>
                  <tr>
                    <td style="font-weight: 700;">
                      <?= htmlspecialchars($q['title']) ?>
                      <?php if ($q['join_code']): ?>
                        <br><span style="font-size: 0.8rem; color: #a29bfe;">Code: <strong><?= htmlspecialchars($q['join_code']) ?></strong></span>
                      <?php endif; ?>
                    </td>
                    <td><?= (int)$q['question_count'] ?> Qs</td>
                    <td><span class="badge badge-<?= htmlspecialchars($q['status']) ?>"><?= strtoupper($q['status']) ?></span></td>
                    <td style="color: var(--text-muted); font-size: 0.9rem;"><?= date('M j, Y g:i A', strtotime($q['created_at'])) ?></td>
                    <td>
                      <div class="actions-cell">
                        <?php if ($q['status'] === 'draft'): ?>
                          <a href="publish.php?id=<?= $q['id'] ?>" class="btn btn-accent btn-sm">Publish</a>
                          <a href="edit_quiz.php?id=<?= $q['id'] ?>" class="btn btn-secondary btn-sm">Edit</a>
                        <?php elseif ($q['status'] === 'published' || $q['status'] === 'lobby'): ?>
                          <a href="live_lobby.php?id=<?= $q['id'] ?>" class="btn btn-primary btn-sm">Open Lobby</a>
                        <?php elseif ($q['status'] === 'running'): ?>
                          <a href="live_quiz.php?id=<?= $q['id'] ?>" class="btn btn-danger btn-sm">Control Game</a>
                        <?php elseif ($q['status'] === 'completed'): ?>
                          <a href="results.php?id=<?= $q['id'] ?>" class="btn btn-success btn-sm">View Results</a>
                        <?php endif; ?>
                        <button onclick="deleteQuiz(<?= $q['id'] ?>)" class="btn btn-secondary btn-sm" style="color: #ff7675;">Delete</button>
                      </div>
                    </td>
                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        <?php endif; ?>
      </div>
    </main>
  </div>

  <script src="../assets/js/dashboard.js"></script>
</body>
</html>
