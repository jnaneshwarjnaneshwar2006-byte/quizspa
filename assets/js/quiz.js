/**
 * Real-Time Quiz & Question Sync Engine
 * fahh Live Quiz Application
 */

class QuizEngine {
  constructor(options = {}) {
    this.quizId = options.quizId || null;
    this.role = options.role || 'student'; // 'teacher' or 'student'
    this.pollIntervalMs = options.pollIntervalMs || 800;
    this.timerId = null;
    this.isFetching = false;
    this.currentQuestionNum = 0;
    this.currentQuestionStatus = '';
    this.hasAnsweredCurrent = false;
    this.onStateChange = options.onStateChange || null;
  }

  start() {
    this.stop();
    this.poll();
    this.timerId = setInterval(() => this.poll(), this.pollIntervalMs);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  async poll() {
    if (this.isFetching || !this.quizId) return;
    this.isFetching = true;

    const endpoint = this.role === 'teacher'
      ? `../api/live/get_state.php?quiz_id=${this.quizId}`
      : `../api/student/state.php?quiz_id=${this.quizId}`;

    try {
      const response = await fetch(endpoint, {
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (data.success && this.onStateChange) {
        // Detect question change to reset answer state
        if (data.data.quiz.current_question !== this.currentQuestionNum) {
          this.currentQuestionNum = data.data.quiz.current_question;
          this.hasAnsweredCurrent = false;
        }
        this.currentQuestionStatus = data.data.quiz.current_question_status;

        this.onStateChange(data.data);
      }
    } catch (err) {
      console.warn('Quiz state poll error:', err);
    } finally {
      this.isFetching = false;
    }
  }

  // Student answer submission
  async submitAnswer(selectedOption, timeTaken) {
    if (this.hasAnsweredCurrent) return { success: false, message: 'Already answered.' };

    this.hasAnsweredCurrent = true;

    try {
      const response = await fetch('../api/student/answer.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_id: this.quizId,
          question_number: this.currentQuestionNum,
          selected_option: selectedOption,
          time_taken: timeTaken
        })
      });

      return await response.json();
    } catch (err) {
      console.error('Answer submission error:', err);
      return { success: false, message: 'Network error submitting answer.' };
    }
  }
}

window.QuizEngine = QuizEngine;
