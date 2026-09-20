<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/security.php';

requireTeacherAuth();

$pdo = getDBConnection();
$teacherId = getTeacherId();

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
");
$stmt->execute(['id' => $teacherId]);
$quizzes = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Quizzes - QuizSpark</title>
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
          <h1>My Quiz Library</h1>
          <p style="color: var(--text-muted);">Manage, edit, publish, or host live interactive sessions.</p>
        </div>
        <a href="create_quiz.php" class="btn btn-primary">➕ Create New Quiz</a>
      </div>

      <div class="card">
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
                  <th>Title & Code</th>
                  <th>Category</th>
                  <th>Questions</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <?php foreach ($quizzes as $q): ?>
                  <tr>
                    <td>
                      <strong style="font-size: 1.05rem;"><?= htmlspecialchars($q['title']) ?></strong>
                      <?php if ($q['join_code']): ?>
                        <br><span style="font-size: 0.85rem; color: #a29bfe;">Join Code: <strong><?= htmlspecialchars($q['join_code']) ?></strong></span>
                      <?php endif; ?>
                    </td>
                    <td><span class="badge" style="background: rgba(255,255,255,0.08);"><?= htmlspecialchars($q['category']) ?></span></td>
                    <td><?= (int)$q['question_count'] ?> Qs</td>
                    <td><span class="badge badge-<?= htmlspecialchars($q['status']) ?>"><?= strtoupper($q['status']) ?></span></td>
                    <td style="color: var(--text-muted); font-size: 0.85rem;"><?= date('M j, Y', strtotime($q['created_at'])) ?></td>
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
                          <a href="results.php?id=<?= $q['id'] ?>" class="btn btn-success btn-sm">Results</a>
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
