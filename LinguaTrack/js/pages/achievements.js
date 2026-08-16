/**
 * achievements.js — grilla de logros con estado desbloqueado/bloqueado.
 */
import { State, computeStats, evaluateAchievements } from '../core/state.js';
import { ACHIEVEMENTS } from '../data/achievementsData.js';
import { pct } from '../core/utils.js';
import { Icon } from '../components/icons.js';

export function renderAchievements(container) {
  evaluateAchievements();
  const unlocked = State.getAchievements();
  const unlockedIds = new Set(unlocked.map((a) => a.id));
  const stats = computeStats();

  container.innerHTML = `
    <div class="card mb-4">
      <div class="flex-between mb-2"><span>Logros desbloqueados</span><span class="text-muted">${unlocked.length}/${ACHIEVEMENTS.length}</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct(unlocked.length, ACHIEVEMENTS.length)}%"></div></div>
    </div>

    <div class="grid grid-4 stagger">
      ${ACHIEVEMENTS.map((a) => {
        const isUnlocked = unlockedIds.has(a.id);
        const record = unlocked.find((u) => u.id === a.id);
        return `
        <div class="card" style="text-align:center; opacity:${isUnlocked ? '1' : '0.45'};">
          <div style="font-size:2.4rem; margin-bottom:8px; filter:${isUnlocked ? 'none' : 'grayscale(1)'};">${a.icon}</div>
          <h3 style="font-size:var(--fs-base);">${a.title}</h3>
          <p class="text-muted" style="font-size:var(--fs-sm);">${a.desc}</p>
          ${isUnlocked
            ? `<span class="badge badge-success">${Icon.check} Desbloqueado ${record ? `· ${record.unlockedAt.slice(0, 10)}` : ''}</span>`
            : `<span class="badge">Bloqueado</span>`}
        </div>`;
      }).join('')}
    </div>
  `;
}
