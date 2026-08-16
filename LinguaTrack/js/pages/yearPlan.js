/**
 * yearPlan.js — vista de los 365 días completos como mapa de calor
 * (estilo contribuciones de GitHub). Cada celda se divide en 3 franjas
 * de color (una por idioma) y se atenúa según cuántos de los 3 bloques
 * de ese día ya completaste.
 */
import { State, dayCompletionFraction } from '../core/state.js';
import { LANGUAGES, LANGUAGE_LIST } from '../data/languages.js';
import { monthName } from '../core/utils.js';
import { navigate } from '../core/router.js';

export function renderYearPlan(container) {
  const plan = State.getPlan();
  const meta = State.getPlanMeta();
  const startDate = new Date(`${meta.startDate}T00:00:00`);

  const startOffset = startDate.getDay();
  const cells = [];
  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  plan.forEach((d) => cells.push(d));
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const monthMap = {};
  plan.forEach((d) => {
    const key = d.date.slice(0, 7);
    if (!monthMap[key]) monthMap[key] = { total: 0, completed: 0 };
    monthMap[key].total += 1;
    if (d.status === 'completado') monthMap[key].completed += 1;
  });

  container.innerHTML = `
    <div class="card mb-4">
      <div class="card-title"><h3>Mapa de calor · 365 días (3 idiomas/día)</h3></div>
      <div style="overflow-x:auto; padding-bottom:8px;">
        <div style="display:flex; gap:3px;">
          ${weeks.map((week) => `
            <div style="display:flex; flex-direction:column; gap:3px;">
              ${week.map((d) => {
                if (!d) return `<div style="width:12px; height:12px;"></div>`;
                const frac = dayCompletionFraction(d);
                const opacity = 0.22 + frac * 0.78;
                const bg = d.isReviewDay
                  ? 'var(--lang-review)'
                  : `linear-gradient(90deg, ${LANGUAGES.en.color} 0 33%, ${LANGUAGES.ko.color} 33% 66%, ${LANGUAGES.zh.color} 66% 100%)`;
                const tip = `Día ${d.index}: ${d.languages.map((b) => `${LANGUAGES[b.language].name} (${b.topic})`).join(' · ')}`;
                return `<div class="heat-cell" data-index="${d.index}" data-tip="${tip.replace(/"/g, '&quot;')}" style="width:12px; height:12px; border-radius:3px; background:${bg}; opacity:${opacity}; cursor:pointer;"></div>`;
              }).join('')}
            </div>
          `).join('')}
        </div>
      </div>
      <div class="flex gap-3 mt-3" style="flex-wrap:wrap;">
        ${LANGUAGE_LIST.map((l) => `<span class="badge ${l.badgeClass}">${l.flag} ${l.name}</span>`).join('')}
        <span class="badge">🔁 Repaso</span>
        <span class="text-muted" style="font-size:var(--fs-xs); align-self:center;">Opacidad = fracción del día completada</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title"><h3>Resumen por mes</h3></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Mes</th><th>Días</th><th>Días completos (3 idiomas)</th><th>Progreso</th></tr></thead>
          <tbody>
            ${Object.entries(monthMap).map(([key, m]) => {
              const [y, mo] = key.split('-');
              const percent = Math.round((m.completed / m.total) * 100);
              return `<tr>
                <td>${monthName(Number(mo) - 1)} ${y}</td>
                <td>${m.total}</td>
                <td>${m.completed}</td>
                <td style="min-width:160px;"><div class="progress-track thin"><div class="progress-fill" style="width:${percent}%"></div></div></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.querySelectorAll('.heat-cell').forEach((cell) => cell.addEventListener('click', () => navigate(`#/day-plan/index/${cell.dataset.index}`)));
}
