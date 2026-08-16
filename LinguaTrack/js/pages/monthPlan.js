/**
 * monthPlan.js — lista los ~30 días del plan correspondientes al mes
 * seleccionado (mes 1 = días 1-31 del plan), mostrando los 3 bloques
 * de idioma de cada día.
 */
import { State } from '../core/state.js';
import { LANGUAGES } from '../data/languages.js';
import { pct } from '../core/utils.js';
import { navigate } from '../core/router.js';
import { Icon } from '../components/icons.js';

export function renderMonthPlan(container) {
  const plan = State.getPlan();
  const todayIdx = State.todayPlanIndex() || 1;
  let monthNum = Math.min(12, Math.ceil(todayIdx / 30.42));

  function draw() {
    const startIdx = Math.round((monthNum - 1) * 30.42) + 1;
    const endIdx = Math.min(365, Math.round(monthNum * 30.42));
    const days = plan.filter((d) => d.index >= startIdx && d.index <= endIdx);
    const completed = days.filter((d) => d.status === 'completado').length;

    container.innerHTML = `
      <div class="flex-between mb-4" style="flex-wrap:wrap; gap:10px;">
        <div class="flex gap-2" style="align-items:center;">
          <button class="icon-btn" id="prev-month-btn">${Icon.chevronLeft}</button>
          <h2 style="margin:0; min-width:120px; text-align:center;">Mes ${monthNum} / 12</h2>
          <button class="icon-btn" id="next-month-btn">${Icon.chevronRight}</button>
        </div>
      </div>

      <div class="card mb-4">
        <div class="flex-between mb-2"><span>Progreso del mes (días completos, 3 idiomas)</span><span class="text-muted">${completed}/${days.length} días</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${pct(completed, days.length)}%"></div></div>
      </div>

      <div class="flex-col gap-2 stagger">
        ${days.map((d) => `
          <div class="card interactive" data-index="${d.index}" style="padding:14px 18px;">
            <div class="flex-between mb-2">
              <div class="flex gap-2" style="align-items:center;">
                <span class="badge">Día ${d.index}</span>
                <span class="text-muted" style="font-size:var(--fs-xs);">${d.date} ${d.isReviewDay ? '· 🔁 repaso' : ''}</span>
              </div>
              <span class="badge ${d.status === 'completado' ? 'badge-success' : 'badge-warning'}">${d.status}</span>
            </div>
            <div class="grid grid-3 gap-2">
              ${d.languages.map((b) => `
                <div style="border-left:2px solid ${LANGUAGES[b.language].color}; padding-left:8px;">
                  <span class="badge ${LANGUAGES[b.language].badgeClass}" style="font-size:10px;">${LANGUAGES[b.language].flag} ${b.status === 'completado' ? '✓' : ''} ${b.miniExam ? '📝' : ''}</span>
                  <p style="font-size:12px; margin:4px 0 0; color:var(--text-1);">${b.topic}</p>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelector('#prev-month-btn').addEventListener('click', () => { monthNum = Math.max(1, monthNum - 1); draw(); });
    container.querySelector('#next-month-btn').addEventListener('click', () => { monthNum = Math.min(12, monthNum + 1); draw(); });
    container.querySelectorAll('[data-index]').forEach((card) => card.addEventListener('click', () => navigate(`#/day-plan/index/${card.dataset.index}`)));
  }

  draw();
}
