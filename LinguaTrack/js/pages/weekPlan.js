/**
 * weekPlan.js — vista semanal tipo horario: 7 columnas (lun-dom), cada
 * una mostrando los 3 bloques de idioma de ese día del plan de 365 días.
 */
import { State } from '../core/state.js';
import { LANGUAGES } from '../data/languages.js';
import { toISODate, addDays, weekdayShort, formatShortDate } from '../core/utils.js';
import { navigate } from '../core/router.js';
import { Icon } from '../components/icons.js';

export function renderWeekPlan(container) {
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  let weekStart = addDays(today, -mondayOffset);

  function draw() {
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const planByDate = Object.fromEntries(State.getPlan().map((d) => [d.date, d]));

    container.innerHTML = `
      <div class="flex-between mb-4">
        <div class="flex gap-2" style="align-items:center;">
          <button class="icon-btn" id="prev-week">${Icon.chevronLeft}</button>
          <h2 style="margin:0;">${formatShortDate(days[0])} – ${formatShortDate(days[6])}</h2>
          <button class="icon-btn" id="next-week">${Icon.chevronRight}</button>
        </div>
        <button class="btn btn-secondary" id="this-week-btn">Esta semana</button>
      </div>

      <div class="grid" style="grid-template-columns:repeat(7,1fr); gap:10px;">
        ${days.map((date) => {
          const iso = toISODate(date);
          const d = planByDate[iso];
          const isToday = iso === toISODate(today);
          return `
          <div class="card interactive" data-index="${d ? d.index : ''}" style="min-height:250px; ${isToday ? 'border-color:var(--accent);' : ''}">
            <div class="text-muted" style="font-size:var(--fs-xs); font-weight:700; text-transform:uppercase;">${weekdayShort(date.getDay())}</div>
            <div style="font-weight:700; margin-bottom:8px;">${date.getDate()}</div>
            ${d ? `
              ${d.isReviewDay ? `<span class="badge" style="margin-bottom:6px;">🔁 Repaso</span>` : ''}
              <div class="flex-col gap-2">
                ${d.languages.map((b) => `
                  <div style="border-left:2px solid ${LANGUAGES[b.language].color}; padding-left:6px;">
                    <span class="badge ${LANGUAGES[b.language].badgeClass}" style="font-size:9px; padding:2px 6px;">${LANGUAGES[b.language].flag} ${b.status === 'completado' ? '✓' : ''}</span>
                    <p style="font-size:10px; margin:2px 0 0; color:var(--text-2); line-height:1.3;">${b.topic}</p>
                  </div>
                `).join('')}
              </div>
              <span class="badge ${d.status === 'completado' ? 'badge-success' : 'badge-warning'}" style="margin-top:8px;">${d.status}</span>
            ` : '<p class="text-muted" style="font-size:var(--fs-xs);">Fuera del plan</p>'}
          </div>`;
        }).join('')}
      </div>
    `;

    container.querySelector('#prev-week').addEventListener('click', () => { weekStart = addDays(weekStart, -7); draw(); });
    container.querySelector('#next-week').addEventListener('click', () => { weekStart = addDays(weekStart, 7); draw(); });
    container.querySelector('#this-week-btn').addEventListener('click', () => { weekStart = addDays(today, -mondayOffset); draw(); });
    container.querySelectorAll('[data-index]').forEach((card) => {
      if (card.dataset.index) card.addEventListener('click', () => navigate(`#/day-plan/index/${card.dataset.index}`));
    });
  }

  draw();
}
