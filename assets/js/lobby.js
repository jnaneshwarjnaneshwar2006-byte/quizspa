/**
 * Real-Time Lobby Polling Engine
 * fahh Live Quiz Application
 */

class LobbyEngine {
  constructor(options = {}) {
    this.quizId = options.quizId || null;
    this.role = options.role || 'student'; // 'teacher' or 'student'
    this.pollIntervalMs = options.pollIntervalMs || 1000;
    this.timerId = null;
    this.isFetching = false;
    this.consecutiveFailures = 0;
    this.onStateUpdate = options.onStateUpdate || null;
  }

  start() {
    this.stop();
    this.poll(); // immediate initial fetch
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
      ? `../api/live/get_lobby.php?quiz_id=${this.quizId}`
      : `../api/student/state.php?quiz_id=${this.quizId}`;

    try {
      const response = await fetch(endpoint, {
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      this.consecutiveFailures = 0;
      this.hideReconnectBanner();

      if (data.success && this.onStateUpdate) {
        this.onStateUpdate(data.data);
      }
    } catch (err) {
      this.consecutiveFailures++;
      console.warn(`Lobby polling attempt failed (${this.consecutiveFailures}):`, err);
      if (this.consecutiveFailures >= 3) {
        this.showReconnectBanner();
      }
    } finally {
      this.isFetching = false;
    }
  }

  showReconnectBanner() {
    let banner = document.getElementById('reconnectBanner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'reconnectBanner';
      banner.className = 'reconnect-banner';
      banner.innerHTML = '⚡ Reconnecting to quiz lobby...';
      document.body.appendChild(banner);
    }
  }

  hideReconnectBanner() {
    const banner = document.getElementById('reconnectBanner');
    if (banner) banner.remove();
  }
}

// Global initialization helper
window.LobbyEngine = LobbyEngine;
