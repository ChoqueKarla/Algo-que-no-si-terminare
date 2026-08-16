/**
 * progress.js — vista consolidada del avance en cada idioma y habilidad.
 */
import { State, computeStats } from '../core/state.js';
import { LANGUAGE_LIST, LANGUAGES } from '../data/languages.js';
import { pct } from '../core/utils.js';
import { Icon } from '../components/icons.js';
import { drawProgressRing } from '../components/charts.js';
import { phaseForProgress } from '../data/phases.js';

export function renderProgress(container) {
  const stats = computeStats();
  const logs = State.getLogs();
  const skillKeys = ['listening', 'speaking', 'reading', 'writing', 'pronunciation', 'shadowing'];

  container.innerHTML = `
    <div class="grid grid-3 mb-4">
      <div class="card stat-card"><div class="stat-icon">${Icon.progress}</div><div class="stat-value">${pct(stats.daysCompleted, 365)}%</div><div class="stat-label">Avance total del año</div></div>
      <div class="card stat-card"><div class="stat-icon">${Icon.book}</div><div class="stat-value">${stats.wordsMastered}/${stats.wordsTotal}</div><div class="stat-label">Palabras dominadas</div></div>
      <div class="card stat-card"><div class="stat-icon">${Icon.trophy}</div><div class="stat-value">${State.getAchievements().length}</div><div class="stat-label">Logros desbloqueados</div></div>
    </div>

    <div class="grid grid-3 mb-4">
      ${LANGUAGE_LIST.map((l, i) => {
        const p = stats.perLanguage[l.code];
        const percent = pct(p.completedDays, p.totalDays);
        const phase = phaseForProgress(p.totalDays ? p.completedDays / p.totalDays : 0);
        return `
        <div class="card">
          <div class="card-title"><h3>${l.flag} ${l.name}</h3><span class="badge badge-accent">${phase.code}</span></div>
          <div class="flex" style="align-items:center; gap:16px;">
            <div class="ring-wrap"><canvas id="ring-${l.code}" width="86" height="86"></canvas>
              <div class="ring-label"><span class="ring-value" style="font-size:var(--fs-md);">${percent}%</span></div>
            </div>
            <div>
              <p style="margin:0;">${p.completedDays}/${p.totalDays} días completados</p>
              <p class="text-muted" style="margin:0;">${p.words}/${p.wordsTotal} palabras · ${p.grammarMastered}/${p.grammarTotal} gramática</p>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>

    <div class="card">
      <div class="card-title"><h3>Progreso por habilidad</h3></div>
      <div class="flex-col gap-3">
        ${skillKeys.map((k) => {
          const count = logs[k]?.length || 0;
          const percent = pct(count, 60); // referencia visual: 60 sesiones = barra llena
          return `
          <div>
            <div class="flex-between mb-2"><span style="text-transform:capitalize; font-weight:600;">${k}</span><span class="text-muted">${count} sesiones</span></div>
            <div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;

  const rootStyles = getComputedStyle(document.documentElement);
  LANGUAGE_LIST.forEach((l) => {
    const p = stats.perLanguage[l.code];
    const match = l.color.match(/var\((--[\w-]+)\)/);
    const resolvedColor = match ? rootStyles.getPropertyValue(match[1]).trim() : l.color;
    drawProgressRing(document.getElementById(`ring-${l.code}`), pct(p.completedDays, p.totalDays), resolvedColor || '#4c8dff');
  });
}
