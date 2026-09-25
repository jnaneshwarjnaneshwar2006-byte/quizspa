/**
 * QuizSpark - Live & Final Leaderboard Engine
 * Handles Game-Show Top 3 Winner Cards (with physically held trophy/medals) and Other Players list
 */

const QuizLeaderboard = (() => {
  let lastRenderSignature = '';

  /**
   * Safe HTML Escaper
   */
  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Smooth Score Count-Up Animation
   */
  function animateScore(elem, endVal, duration = 800) {
    if (!elem) return;
    const startVal = parseInt(elem.getAttribute('data-raw-score') || '0', 10);
    elem.setAttribute('data-raw-score', endVal);

    if (startVal === endVal) {
      elem.textContent = `${Number(endVal).toLocaleString()} pts`;
      return;
    }

    const startTime = performance.now();
    const diff = endVal - startVal;

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + diff * ease);

      elem.textContent = `${Number(current).toLocaleString()} pts`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        elem.textContent = `${Number(endVal).toLocaleString()} pts`;
      }
    }

    requestAnimationFrame(step);
  }

  /**
   * Mount 3D Avatar with graceful fallback and physical award in hand
   */
  function mountAvatarSafe(container, avatarData, mode = 'full', animated = true, heldAward = null) {
    if (!container || typeof AvatarEngine === 'undefined') return;

    let config = avatarData;
    if (typeof config === 'string') {
      try {
        config = JSON.parse(config);
      } catch (e) {
        config = null;
      }
    }
    if (!config || typeof config !== 'object') {
      config = AvatarEngine.getDefault ? AvatarEngine.getDefault('boy') : { baseModel: 'boy', skinColor: '#f5d0b5' };
    }

    try {
      AvatarEngine.mount(container, config, { mode, animated, heldAward });
    } catch (err) {
      console.warn('AvatarEngine mount error:', err);
    }
  }

  /**
   * =========================================================================
   * FINAL LEADERBOARD RENDERER (Winner Cards + Other Players List)
   * =========================================================================
   * 
   * @param {HTMLElement} container - DOM container element
   * @param {Array} list - Ranked array of participants (sorted total_score DESC)
   * @param {string|null} currentToken - Current student session token
   * @param {Object} options - Customization flags
   */
  function renderFinalLeaderboard(container, list = [], currentToken = null, options = {}) {
    if (!container) return;

    const signature = 'final_' + JSON.stringify(list.map(p => ({
      id: p.id,
      score: (p.points !== undefined ? p.points : p.total_score),
      rank: p.rank,
      name: p.name
    }))) + (currentToken || '');

    if (signature === lastRenderSignature && !options.force) {
      return;
    }
    lastRenderSignature = signature;

    if (!list || list.length === 0) {
      container.innerHTML = `
        <div class="final-leaderboard-container">
          <div class="final-lb-header">
            <h1 class="final-lb-title">🏆 FINAL LEADERBOARD</h1>
            <p class="final-lb-subtitle">Quiz Complete!</p>
          </div>
          <div style="text-align: center; padding: 40px 20px; background: rgba(24, 20, 42, 0.6); border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
            <p style="color: var(--text-muted); font-size: 1.15rem; font-weight: 700;">No player scores recorded for this quiz.</p>
          </div>
        </div>
      `;
      return;
    }

    // Top 3 Winners
    const p1 = list[0] || null; // 1st Place (Center)
    const p2 = list[1] || null; // 2nd Place (Left)
    const p3 = list[2] || null; // 3rd Place (Right)
    const otherPlayers = list.slice(3); // Positions 4+

    // Build Single Winner Card HTML
    function buildWinnerCard(p, rankNum, cardClass, badgeClass, labelClass, labelText) {
      if (!p) {
        return '';
      }

      const isCurrent = (currentToken && p.session_token === currentToken) || !!p.is_me;
      const avatarId = `win_av_${cardClass}_${p.id}_${Date.now()}`;
      const scoreId = `win_sc_${cardClass}_${p.id}`;
      const displayScore = (p.points !== undefined ? p.points : p.total_score) || 0;

      return `
        <div class="winner-card ${cardClass} ${isCurrent ? 'is-current-user' : ''}">
          <div class="card-rank-badge ${badgeClass}">${rankNum}</div>
          <div class="card-rank-label ${labelClass}">${labelText}</div>
          <div class="card-avatar-box" id="${avatarId}"></div>
          <span class="card-player-name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</span>
          <div class="card-player-score" id="${scoreId}" data-raw-score="0">${Number(displayScore).toLocaleString()} pts</div>
        </div>
      `;
    }

    let html = `
      <div class="final-leaderboard-container">
        <!-- Header -->
        <div class="final-lb-header">
          <h1 class="final-lb-title">🏆 FINAL LEADERBOARD</h1>
          <p class="final-lb-subtitle">Quiz Complete!</p>
        </div>

        <!-- Top 3 Winner Cards (2nd Left - 1st Center - 3rd Right) -->
        <div class="final-winners-cards">
          ${buildWinnerCard(p2, 2, 'card-2nd', 'rank-badge-2nd', 'rank-label-2nd', '2ND PLACE')}
          ${buildWinnerCard(p1, 1, 'card-1st', 'rank-badge-1st', 'rank-label-1st', '1ST PLACE')}
          ${buildWinnerCard(p3, 3, 'card-3rd', 'rank-badge-3rd', 'rank-label-3rd', '3RD PLACE')}
        </div>
    `;

    // Positions 4+ (OTHER PLAYERS)
    if (otherPlayers.length > 0) {
      html += `
        <div class="other-players-wrapper">
          <div class="other-players-header">
            <h3 class="other-players-title">
              <span>📊</span> OTHER PLAYERS
            </h3>
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted);">${otherPlayers.length} Participants</span>
          </div>
          <div class="other-players-scroll">
            ${otherPlayers.map(p => {
              const isCurrent = (currentToken && p.session_token === currentToken) || !!p.is_me;
              const badgeId = `other_av_${p.id}_${Date.now()}`;
              const scoreVal = (p.points !== undefined ? p.points : p.total_score) || 0;
              return `
                <div class="other-player-row ${isCurrent ? 'current-player' : ''}">
                  <div class="other-player-left">
                    <span class="other-player-rank">#${p.rank}</span>
                    <div class="other-player-info">
                      <div class="avatar-badge-wrapper badge-sm" id="${badgeId}"></div>
                      <span class="other-player-name">
                        ${escapeHtml(p.name)}
                        ${isCurrent ? '<span class="badge badge-published" style="margin-left: 8px; font-size: 0.72rem; padding: 2px 8px;">YOU</span>' : ''}
                      </span>
                    </div>
                  </div>
                  <div class="other-player-right">
                    <span class="other-player-pts">${Number(scoreVal).toLocaleString()} pts</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    html += `</div>`; // Close .final-leaderboard-container

    container.innerHTML = html;

    // Mount Top 3 Avatars with Held Trophy / Medals
    const winnerItems = [
      { p: p1, cardClass: 'card-1st', award: 'trophy_gold' },
      { p: p2, cardClass: 'card-2nd', award: 'medal_silver' },
      { p: p3, cardClass: 'card-3rd', award: 'medal_bronze' }
    ];

    winnerItems.forEach(item => {
      if (item.p) {
        const el = container.querySelector(`.${item.cardClass} .card-avatar-box`);
        if (el) {
          mountAvatarSafe(el, item.p.avatar_data, 'full', true, item.award);
        }
        const scoreEl = container.querySelector(`.${item.cardClass} .card-player-score`);
        if (scoreEl) {
          const targetScore = (item.p.points !== undefined ? item.p.points : item.p.total_score) || 0;
          animateScore(scoreEl, parseInt(targetScore, 10), 1000);
        }
      }
    });

    // Mount Badges for Other Players (Positions 4+)
    otherPlayers.forEach(p => {
      const bEl = container.querySelector(`[id^="other_av_${p.id}_"]`);
      if (bEl) {
        mountAvatarSafe(bEl, p.avatar_data, 'badge', false);
      }
    });
  }

  /**
   * =========================================================================
   * LIVE QUESTION PODIUM RENDERER (Used in live quiz between questions)
   * =========================================================================
   */
  function renderPodium(container, list = [], currentToken = null, options = {}) {
    if (!container) return;
    const signature = 'podium_' + JSON.stringify(list.map(p => ({
      id: p.id,
      score: (p.points !== undefined ? p.points : p.total_score),
      rank: p.rank,
      name: p.name
    }))) + (currentToken || '');

    if (signature === lastRenderSignature && !options.force) {
      return;
    }
    lastRenderSignature = signature;

    if (!list || list.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
          <p>No participant scores available yet.</p>
        </div>
      `;
      return;
    }

    const p1 = list[0] || null;
    const p2 = list[1] || null;
    const p3 = list[2] || null;
    const otherPlayers = list.slice(3);

    function buildPillar(p, rankNum, posClass, pedClass, crownIcon) {
      if (!p) {
        return `
          <div class="podium-pillar ${posClass}" style="opacity: 0.3;">
            <div class="podium-pedestal-wrapper">
              <div class="pedestal-block ${pedClass}">
                <div class="pedestal-rank-emblem">
                  <span class="pedestal-rank-number">${rankNum}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }
      const isCurrent = (currentToken && p.session_token === currentToken) || !!p.is_me;
      const avatarId = `pod_av_${posClass}_${p.id}_${Date.now()}`;
      const scoreVal = (p.points !== undefined ? p.points : p.total_score) || 0;

      return `
        <div class="podium-pillar ${posClass} ${isCurrent ? 'is-current-user' : ''}">
          <div class="podium-avatar-card">
            <div class="podium-crown-badge">${crownIcon}</div>
            <div class="podium-avatar-box" id="${avatarId}"></div>
            <span class="podium-player-name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</span>
            <div class="podium-player-score" data-raw-score="0">${Number(scoreVal).toLocaleString()} pts</div>
          </div>
          <div class="podium-pedestal-wrapper">
            <div class="pedestal-block ${pedClass}">
              <div class="pedestal-rank-emblem">
                <span class="pedestal-rank-number">${rankNum}</span>
                <span class="pedestal-rank-title">${rankNum === 1 ? '1ST' : rankNum === 2 ? '2ND' : '3RD'}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    let html = `
      <div class="podium-arena">
        <div class="podium-grid">
          ${buildPillar(p2, 2, 'pos-2nd', 'pedestal-2nd', '🥈')}
          ${buildPillar(p1, 1, 'pos-1st', 'pedestal-1st', '👑')}
          ${buildPillar(p3, 3, 'pos-3rd', 'pedestal-3rd', '🥉')}
        </div>
    `;

    if (otherPlayers.length > 0) {
      html += `
        <div class="podium-other-players">
          <div class="podium-other-title">
            <span>Standings (${otherPlayers.length} More)</span>
          </div>
          <div class="podium-other-list">
            ${otherPlayers.map(p => {
              const isCurrent = (currentToken && p.session_token === currentToken) || !!p.is_me;
              const badgeId = `pod_other_av_${p.id}_${Date.now()}`;
              const scoreVal = (p.points !== undefined ? p.points : p.total_score) || 0;
              return `
                <div class="podium-rank-row ${isCurrent ? 'current-player' : ''}">
                  <div class="podium-rank-left">
                    <span class="podium-rank-num">#${p.rank}</span>
                    <div class="podium-player-info">
                      <div class="avatar-badge-wrapper badge-sm" id="${badgeId}"></div>
                      <span class="podium-player-name">${escapeHtml(p.name)} ${isCurrent ? '<span class="badge badge-published" style="margin-left: 8px;">YOU</span>' : ''}</span>
                    </div>
                  </div>
                  <div class="podium-rank-right">
                    <span class="podium-player-pts">${Number(scoreVal).toLocaleString()} pts</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;

    // Mount avatars
    const winners = [
      { p: p1, posClass: 'pos-1st' },
      { p: p2, posClass: 'pos-2nd' },
      { p: p3, posClass: 'pos-3rd' }
    ];
    winners.forEach(w => {
      if (w.p) {
        const el = container.querySelector(`.${w.posClass} .podium-avatar-box`);
        if (el) mountAvatarSafe(el, w.p.avatar_data, 'full', true);
      }
    });

    otherPlayers.forEach(p => {
      const bEl = container.querySelector(`[id^="pod_other_av_${p.id}_"]`);
      if (bEl) mountAvatarSafe(bEl, p.avatar_data, 'badge', false);
    });
  }

  /**
   * Reset signature cache
   */
  function invalidate() {
    lastRenderSignature = '';
  }

  return {
    renderFinalLeaderboard,
    renderPodium,
    animateScore,
    invalidate,
    escapeHtml
  };
})();

// Attach to window
window.QuizLeaderboard = QuizLeaderboard;

// CSV Export Support
document.addEventListener('DOMContentLoaded', () => {
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      // 1. Check if table exists
      const table = document.querySelector('.data-table');
      if (table) {
        let csv = [];
        const rows = table.querySelectorAll('tr');
        for (let i = 0; i < rows.length; i++) {
          let row = [], cols = rows[i].querySelectorAll('td, th');
          for (let j = 0; j < cols.length; j++) {
            let text = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, ' ').replace(/"/g, '""').trim();
            row.push('"' + text + '"');
          }
          csv.push(row.join(','));
        }
        downloadCsvFile(csv.join('\n'));
        return;
      }

      // 2. Export from Final Leaderboard DOM if table doesn't exist
      const winnerCards = document.querySelectorAll('.winner-card');
      const otherRows = document.querySelectorAll('.other-player-row');
      if (winnerCards.length > 0 || otherRows.length > 0) {
        let csv = ['"Rank","Player","Points"'];
        
        // Collect winners
        winnerCards.forEach(c => {
          const rank = c.querySelector('.card-rank-badge')?.innerText.trim() || '';
          const name = c.querySelector('.card-player-name')?.innerText.trim() || '';
          const score = c.querySelector('.card-player-score')?.innerText.trim() || '';
          if (name && name !== '---') {
            csv.push(`"${rank}","${name.replace(/"/g, '""')}","${score.replace(/"/g, '""')}"`);
          }
        });

        // Collect other players
        otherRows.forEach(r => {
          const rank = r.querySelector('.other-player-rank')?.innerText.replace('#', '').trim() || '';
          const name = r.querySelector('.other-player-name')?.innerText.replace('YOU', '').trim() || '';
          const score = r.querySelector('.other-player-pts')?.innerText.trim() || '';
          if (name) {
            csv.push(`"${rank}","${name.replace(/"/g, '""')}","${score.replace(/"/g, '""')}"`);
          }
        });

        downloadCsvFile(csv.join('\n'));
      }
    });
  }

  function downloadCsvFile(content) {
    const csvFile = new Blob([content], { type: 'text/csv' });
    const downloadLink = document.createElement('a');
    downloadLink.download = `quizspark_final_leaderboard_${Date.now()}.csv`;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  }
});
