<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/security.php';

requireTeacherAuth();

$pdo = getDBConnection();
$teacherId = getTeacherId();
$quizId = (int)($_GET['id'] ?? 0);

// Fetch all completed quizzes for dropdown filter
$qListStmt = $pdo->prepare("SELECT id, title, status FROM `quizzes` WHERE `teacher_id` = :id ORDER BY created_at DESC");
$qListStmt->execute(['id' => $teacherId]);
$allQuizzes = $qListStmt->fetchAll();

if (!$quizId && !empty($allQuizzes)) {
    $quizId = (int)$allQuizzes[0]['id'];
}

$results = [];
$selectedQuiz = null;

if ($quizId) {
    $sqStmt = $pdo->prepare("SELECT * FROM `quizzes` WHERE `id` = :id AND `teacher_id` = :teacher_id");
    $sqStmt->execute(['id' => $quizId, 'teacher_id' => $teacherId]);
    $selectedQuiz = $sqStmt->fetch();

    if ($selectedQuiz) {
        $resStmt = $pdo->prepare("
            SELECT 
                r.*, 
                p.name, p.emoji
            FROM `quiz_results` r
            JOIN `participants` p ON r.participant_id = p.id
            WHERE r.quiz_id = :quiz_id
            ORDER BY r.rank ASC
        ");
        $resStmt->execute(['quiz_id' => $quizId]);
        $results = $resStmt->fetchAll();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quiz Results - QuizSpark</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/dashboard.css">
  <link rel="stylesheet" href="../assets/css/leaderboard.css">
</head>
<body>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <a href="dashboard.php" class="brand-logo">QuizSpark <span class="brand-badge">TEACHER</span></a>
      </div>
      <ul class="sidebar-menu">
        <li class="menu-item"><a href="dashboard.php">📊 Dashboard</a></li>
        <li class="menu-item"><a href="create_quiz.php">➕ Create Quiz</a></li>
        <li class="menu-item"><a href="quizzes.php">📚 My Quizzes</a></li>
        <li class="menu-item active"><a href="results.php">🏆 Results</a></li>
      </ul>
      <div class="sidebar-footer">
        <a href="logout.php" class="btn btn-secondary btn-block">🚪 Logout</a>
      </div>
    </aside>

    <main class="main-content">
      <div class="top-bar">
        <div>
          <h1>Quiz Results & Leaderboard</h1>
          <p style="color: var(--text-muted);">View detailed student accuracy, speed, and export report files.</p>
        </div>
        <button type="button" id="exportCsvBtn" class="btn btn-primary" <?= empty($results) ? 'disabled' : '' ?>>
          📥 Export CSV Report
        </button>
      </div>

      <!-- Quiz Selector Header -->
      <div class="card" style="margin-bottom: 24px; padding: 20px;">
        <form method="GET" action="results.php" style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
          <label class="form-label" style="margin: 0; font-size: 1rem;">Select Quiz Session:</label>
          <select name="id" class="form-control" style="max-width: 400px;" onchange="this.form.submit()">
            <?php foreach ($allQuizzes as $qz): ?>
              <option value="<?= $qz['id'] ?>" <?= $qz['id'] == $quizId ? 'selected' : '' ?>>
                <?= htmlspecialchars($qz['title']) ?> (<?= strtoupper($qz['status']) ?>)
              </option>
            <?php endforeach; ?>
          </select>
        </form>
      </div>

      <div class="card">
        <?php if (!$selectedQuiz || empty($results)): ?>
          <div style="text-align: center; padding: 40px; color: var(--text-muted);">
            <p style="font-size: 1.1rem;">No results found for this quiz session yet.</p>
          </div>
        <?php else: ?>
          <div style="margin-bottom: 20px;">
            <h2><?= htmlspecialchars($selectedQuiz['title']) ?></h2>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Total Participants: <strong><?= count($results) ?></strong>
            </p>
          </div>

          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student Name</th>
                  <th>Total Score</th>
                  <th>Correct Answers</th>
                  <th>Accuracy</th>
                  <th>Total Time</th>
                </tr>
              </thead>
              <tbody>
                <?php foreach ($results as $r): 
                  $accuracy = $r['total_questions'] > 0 ? round(($r['correct_answers'] / $r['total_questions']) * 100, 1) : 0;
                ?>
                  <tr>
                    <td style="font-weight: 800; font-size: 1.1rem;">
                      <?php 
                        if ($r['rank'] == 1) echo '🥇 #1';
                        elseif ($r['rank'] == 2) echo '🥈 #2';
                        elseif ($r['rank'] == 3) echo '🥉 #3';
                        else echo '#' . $r['rank'];
                      ?>
                    </td>
                    <td style="font-weight: 700;">
                      <span style="font-size: 1.4rem; vertical-align: middle; margin-right: 8px;"><?= htmlspecialchars($r['emoji']) ?></span>
                      <?= htmlspecialchars($r['name']) ?>
                    </td>
                    <td style="color: #55efc4; font-weight: 800; font-size: 1.1rem;"><?= (int)$r['total_score'] ?> pts</td>
                    <td><?= (int)$r['correct_answers'] ?> / <?= (int)$r['total_questions'] ?></td>
                    <td>
                      <span class="badge" style="background: rgba(0, 206, 201, 0.15); color: var(--accent-cyan);">
                        <?= $accuracy ?>%
                      </span>
                    </td>
                    <td style="color: var(--text-muted);"><?= number_format($r['total_time'], 2) ?>s</td>
                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        <?php endif; ?>
      </div>
    </main>
  </div>

  <script src="../assets/js/leaderboard.js"></script>
</body>
</html>
