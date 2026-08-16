/**
 * planner.js — planificador tipo "to-do": desglosa cada bloque de idioma
 * del día en tareas accionables (vocabulario, gramática, las 4 destrezas,
 * pronunciación, shadowing) que se pueden marcar una a una, con pestañas
 * para moverte entre los 3 idiomas del mismo día.
 */
import { State, evaluateAchievements } from '../core/state.js';
import { LANGUAGES } from '../data/languages.js';
import { pct } from '../core/utils.js';
import { Icon } from '../components/icons.js';
import { showToast, celebrate } from '../components/toast.js';
import { navigate } from '../core/router.js';

const ACTIVITY_DEFS = [
  ['vocabulary', 'Vocabulario', Icon.book],
  ['grammar', 'Gramática', Icon.grammar],
  ['listening', 'Listening', Icon.headphones],
  ['speaking', 'Speaking', Icon.mic],
  ['reading', 'Reading', Icon.bookOpen],
  ['writing', 'Writing', Icon.pen],
  ['pronunciation', 'Pronunciación', Icon.volume],
  ['shadowing', 'Shadowing', Icon.repeat],
];

export function renderPlanner(container, params) {
  const todayIdx = State.todayPlanIndex();
  let selectedIndex = Number(params?.index) || todayIdx || 1;
  let activeLang = null;

  function getChecklist(index, lang) {
    const progress = State.getProgress();
    if (!progress[index]) progress[index] = {};
    if (!progress[index][lang]) progress[index][lang] = { activities: {} };
    if (!progress[index][lang].activities) progress[index][lang].activities = {};
    return progress[index][lang];
  }
  function saveProgress(progress) { State.setProgress(progress); }

  function draw() {
    const plan = State.getPlan();
    const day = plan.find((d) => d.index === selectedIndex);
    if (!day) {
      container.innerHTML = `<div class="empty-state">${Icon.calendar}<h3>Día fuera de rango</h3></div>`;
      return;
    }
    if (!activeLang || !day.languages.some((b) => b.language === activeLang)) activeLang = day.languages[0].language;

    const block = day.languages.find((b) => b.language === activeLang);
    const entry = getChecklist(selectedIndex, activeLang);
    const activities = block.review ? ACTIVITY_DEFS.filter(([k]) => ['listening', 'speaking', 'reading', 'writing'].includes(k)) : ACTIVITY_DEFS;
    const doneCount = activities.filter(([k]) => entry.activities[k]).length;

    container.innerHTML = `
      <div class="flex-between mb-4" style="flex-wrap:wrap; gap:10px;">
        <div class="flex gap-2" style="align-items:center;">
          <button class="icon-btn" id="prev-day">${Icon.chevronLeft}</button>
          <input type="number" id="day-index-input" min="1" max="365" value="${selectedIndex}" style="width:70px; background:var(--bg-2); border:1px solid var(--border-1); border-radius:6px; padding:8px; color:var(--text-0); text-align:center;" />
          <span class="text-muted">/ 365</span>
          <button class="icon-btn" id="next-day">${Icon.chevronRight}</button>
        </div>
        <button class="btn btn-secondary" id="go-today">Ir a hoy</button>
      </div>

      <div class="tabs">
        ${day.languages.map((b) => `<div class="tab ${activeLang === b.language ? 'active' : ''}" data-lang="${b.language}">${LANGUAGES[b.language].flag} ${LANGUAGES[b.language].name} ${b.status === 'completado' ? '✓' : ''}</div>`).join('')}
      </div>

      <div class="card mb-4">
        <div class="card-title">
          <h3>Día ${day.index} · ${day.date} ${day.isReviewDay ? '· 🔁 repaso' : ''}</h3>
          <span class="badge ${LANGUAGES[activeLang].badgeClass}">${LANGUAGES[activeLang].flag} ${LANGUAGES[activeLang].name}</span>
        </div>
        <h2>${block.topic}</h2>
        <p class="text-muted">${block.objective}</p>
        <div class="flex gap-2 mb-2" style="flex-wrap:wrap;">
          <span class="badge">${Icon.clock} ${block.duration} min</span>
          <span class="badge badge-accent">${block.level}</span>
          ${block.miniExam ? `<span class="badge badge-warning">Mini examen</span>` : ''}
        </div>
        <div class="progress-track mb-2"><div class="progress-fill" style="width:${pct(doneCount, activities.length)}%"></div></div>
        <p class="text-muted" style="margin:0;">${doneCount}/${activities.length} tareas completadas</p>
      </div>

      <div class="card">
        <div class="card-title"><h3>Tareas — ${LANGUAGES[activeLang].name}</h3></div>
        <div class="flex-col gap-2">
          ${activities.map(([key, label, icon]) => `
            <label class="list-item" style="cursor:pointer;">
              <span class="flex gap-3" style="align-items:center;">
                <input type="checkbox" data-key="${key}" ${entry.activities[key] ? 'checked' : ''} style="width:18px; height:18px; accent-color: var(--accent);" />
                <span class="stat-icon" style="margin-bottom:0; width:28px; height:28px;">${icon}</span>
                <span>
                  <strong>${label}</strong><br/>
                  <span class="text-muted" style="font-size:var(--fs-sm);">${block[key] || ''}</span>
                </span>
              </span>
            </label>
          `).join('')}
        </div>
        <hr class="divider" />
        <div class="flex gap-2">
          <button class="btn btn-secondary" id="go-day-plan-full">Ver ficha completa</button>
          <button class="btn btn-primary" id="complete-lang-btn" ${block.status === 'completado' ? 'disabled' : ''}>
            ${block.status === 'completado' ? `${Icon.check} Sesión completada` : 'Marcar sesión como completada'}
          </button>
        </div>
      </div>
    `;

    container.querySelector('#prev-day').addEventListener('click', () => { selectedIndex = Math.max(1, selectedIndex - 1); activeLang = null; draw(); });
    container.querySelector('#next-day').addEventListener('click', () => { selectedIndex = Math.min(365, selectedIndex + 1); activeLang = null; draw(); });
    container.querySelector('#go-today').addEventListener('click', () => { selectedIndex = todayIdx || 1; activeLang = null; draw(); });
    container.querySelector('#day-index-input').addEventListener('change', (e) => {
      selectedIndex = Math.min(365, Math.max(1, Number(e.target.value) || 1)); activeLang = null; draw();
    });
    container.querySelectorAll('[data-lang]').forEach((tab) => tab.addEventListener('click', () => { activeLang = tab.dataset.lang; draw(); }));
    container.querySelector('#go-day-plan-full').addEventListener('click', () => navigate(`#/day-plan/index/${day.index}/lang/${activeLang}`));

    container.querySelectorAll('[data-key]').forEach((cb) => cb.addEventListener('change', () => {
      const progress = State.getProgress();
      progress[selectedIndex][activeLang].activities[cb.dataset.key] = cb.checked;
      saveProgress(progress);
      draw();
    }));

    const completeBtn = container.querySelector('#complete-lang-btn');
    completeBtn.addEventListener('click', () => {
      State.markLanguageStatus(selectedIndex, activeLang, 'completado');
      const fresh = evaluateAchievements();
      showToast('¡Sesión completada! Sigue así 💪', 'success');
      if (fresh.length) celebrate();
      draw();
    });
  }

  draw();
}
