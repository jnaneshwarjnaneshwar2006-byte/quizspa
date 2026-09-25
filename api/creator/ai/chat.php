<?php
/**
 * AI Quiz Generator - Creator AI Assistant Chat API
 * POST /api/creator/ai/chat.php
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/session.php';
require_once __DIR__ . '/../../../config/security.php';
require_once __DIR__ . '/../../../config/ai.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendAiError('METHOD_NOT_ALLOWED', 'Invalid request method. POST required.', [], 405);
}

// 1. Authenticate Creator
$teacherId = requireCreatorAuth();

// 2. Validate CSRF
verifyAiCsrf();

// 3. Decode JSON Payload
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if ($input === null && !empty($rawInput)) {
    sendAiError('VALIDATION_ERROR', 'Invalid JSON request.', [], 400);
}
if (!is_array($input)) {
    sendAiError('VALIDATION_ERROR', 'Request body must be a JSON object.', [], 400);
}

$message = trim((string)($input['message'] ?? ''));
if ($message === '') {
    sendAiError('VALIDATION_ERROR', 'Message cannot be empty.', ['message' => 'Message is required.'], 400);
}
if (mb_strlen($message) > 2000) {
    sendAiError('VALIDATION_ERROR', 'Message exceeds 2000 characters limit.', ['message' => 'Too long.'], 400);
}

$quizId = !empty($input['quiz_id']) ? (int)$input['quiz_id'] : null;

$pdo = getDBConnection();

// 4. Rate Limiting (Chat: max 60/hr)
enforceRateLimit($pdo, $teacherId, 'chat');

// 5. Verify Quiz Ownership if quiz_id is provided
$quiz = null;
if ($quizId !== null && $quizId > 0) {
    $quiz = verifyQuizOwnership($pdo, $quizId, $teacherId, true);
}

// 6. Refuse Direct Publish through Chat (Prompt requirement Section 23)
if (preg_match('/\b(publish|make\s+live|start\s+quiz)\b/i', $message)) {
    sendAiResponse(true, 'Chat guidance provided.', [
        'message' => 'For security and quality control, quizzes cannot be published directly through chat. Please review your questions and use the explicit Publish button when ready.',
        'action'  => 'preview',
        'quiz_id' => $quizId
    ], 200);
}

// 7. Parse User Intent
$action = 'generate';
if (preg_match('/\b(regenerate|redo|replace|rewrite)\b/i', $message)) {
    $action = 'regenerate';
} elseif (preg_match('/\b(add|insert|include)\b/i', $message) && $quizId !== null) {
    $action = 'add';
} elseif (preg_match('/\b(edit|update|modify|change)\b/i', $message)) {
    $action = 'edit';
} elseif (preg_match('/\b(save|keep|store)\b/i', $message)) {
    $action = 'save';
} elseif (preg_match('/\b(preview|view|show\s+quiz)\b/i', $message)) {
    $action = 'preview';
}

// 8. Handle Actions
if ($action === 'preview') {
    sendAiResponse(true, 'Chat response generated.', [
        'message' => 'You can preview your draft quiz at any time using the preview screen.',
        'action'  => 'preview',
        'quiz_id' => $quizId
    ], 200);
}

if ($action === 'save') {
    sendAiResponse(true, 'Chat response generated.', [
        'message' => 'Your draft quiz is automatically saved and kept safe.',
        'action'  => 'save',
        'quiz_id' => $quizId
    ], 200);
}

// Action: Generate or Add
// Extract parameters from message if possible
$count = 5;
if (preg_match('/\b(\d+)\s*(?:questions|mcqs|items)?\b/i', $message, $m)) {
    $parsedCount = (int)$m[1];
    if ($parsedCount >= 1 && $parsedCount <= 50) {
        $count = $parsedCount;
    }
}

$difficulty = 'medium';
if (preg_match('/\b(easy|medium|hard)\b/i', $message, $m)) {
    $difficulty = strtolower($m[1]);
}

$topic = '';
if (preg_match('/(?:about|on|regarding|topic:?)\s+([a-zA-Z0-9\s,\-\._]+)/i', $message, $m)) {
    $topic = trim($m[1]);
}
if ($topic === '' && $quiz) {
    $topic = $quiz['topic'] ?? $quiz['title'] ?? 'General Knowledge';
}
if ($topic === '') {
    $topic = 'General Science & Technology';
}
$topic = mb_substr($topic, 0, 100);

if ($action === 'generate' && !$quizId) {
    // Generate new draft
    $title = ucwords($topic) . " Quiz";
    try {
        $pdo->beginTransaction();

        $quizStmt = $pdo->prepare("
            INSERT INTO `quizzes` 
            (`teacher_id`, `title`, `topic`, `difficulty`, `source`, `category`, `status`, `created_at`) 
            VALUES (:t_id, :title, :topic, :diff, 'ai', 'General', 'draft', NOW())
        ");
        $quizStmt->execute([
            't_id'  => $teacherId,
            'title' => $title,
            'topic' => $topic,
            'diff'  => $difficulty
        ]);
        $newQuizId = (int)$pdo->lastInsertId();

        // Generate questions using mock or service
        $mock = generateMockAiResponse("topic: {$topic}, question_count: {$count}, difficulty: {$difficulty}, question_type: mcq");
        $qStmt = $pdo->prepare("
            INSERT INTO `questions` 
            (`quiz_id`, `question_number`, `question_type`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `explanation`, `points`, `difficulty`, `time_limit`)
            VALUES (:quiz_id, :q_num, 'multiple_choice', :q_text, :opt_a, :opt_b, :opt_c, :opt_d, :correct, :explanation, 100, :diff, 10)
        ");

        foreach ($mock['data']['questions'] as $idx => $q) {
            $val = validateQuestionStructure($q, $idx + 1);
            $s = $val['sanitized'];
            $qStmt->execute([
                'quiz_id'     => $newQuizId,
                'q_num'       => $s['question_number'],
                'q_text'      => $s['question_text'],
                'opt_a'       => $s['option_a'],
                'opt_b'       => $s['option_b'],
                'opt_c'       => $s['option_c'],
                'opt_d'       => $s['option_d'],
                'correct'     => $s['correct_option'],
                'explanation' => $s['explanation'],
                'diff'        => $s['difficulty']
            ]);
        }

        $pdo->commit();

        logAiEvent($teacherId, 'chat_generate_success', ['quiz_id' => $newQuizId, 'count' => $count]);

        sendAiResponse(true, 'Chat action completed.', [
            'message' => "I have created a new draft quiz for you on '{$topic}' with {$count} {$difficulty} questions.",
            'action'  => 'generate',
            'quiz_id' => $newQuizId
        ], 200);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log("[QuizSpark AI Chat Generate DB Error] " . $e->getMessage());
        sendAiError('DATABASE_ERROR', 'Unable to generate quiz via chat. Please try again.', [], 500);
    }
} elseif ($quizId) {
    // Modify/Add to existing draft
    sendAiResponse(true, 'Chat action completed.', [
        'message' => "I understand your request for draft quiz #{$quizId}. Processing {$action} on {$topic}.",
        'action'  => $action,
        'quiz_id' => $quizId
    ], 200);
} else {
    sendAiResponse(true, 'Chat response generated.', [
        'message' => "I'm ready to help you generate or refine your quizzes! You can ask me to generate a new quiz by specifying a topic and question count.",
        'action'  => 'generate',
        'quiz_id' => null
    ], 200);
}
