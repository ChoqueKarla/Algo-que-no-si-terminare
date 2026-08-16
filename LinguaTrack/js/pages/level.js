/**
 * level.js — muestra el recorrido A0→B2 de cada idioma con objetivos,
 * competencias y qué fase está activa según el avance real del plan.
 */
import { State, computeStats } from '../core/state.js';
import { LANGUAGE_LIST } from '../data/languages.js';
import { PHASES, phaseForProgress } from '../data/phases.js';
import { Icon } from '../components/icons.js';

export function renderLevel(container) {
  const stats = computeStats();
  let activeLang = LANGUAGE_LIST[0].code;

  function draw() {
    const p = stats.perLanguage[activeLang];
    const progress = p.totalDays ? p.completedDays / p.totalDays : 0;
    const currentPhase = phaseForProgress(progress);

    container.innerHTML = `
      <div class="tabs">
        ${LANGUAGE_LIST.map((l) => `<div class="tab ${activeLang === l.code ? 'active' : ''}" data-lang="${l.code}">${l.flag} ${l.name}</div>`).join('')}
      </div>

      <div class="card mb-4">
        <div class="card-title"><h3>Fase actual</h3><span class="badge badge-accent">${currentPhase.code}</span></div>
        <h2>${currentPhase.name}</h2>
        <div class="progress-track mb-3"><div class="progress-fill" style="width:${Math.round(progress * 100)}%"></div></div>
        <p class="text-muted">${p.completedDays} de ${p.totalDays} días de estudio completados en este idioma (${Math.round(progress * 100)}%)</p>
      </div>

      <div class="flex-col gap-3">
        ${PHASES.map((phase, i) => {
          const reached = progress >= phase.threshold;
          const isCurrent = phase.code === currentPhase.code;
          return `
          <div class="card" style="border-color:${isCurrent ? 'var(--accent)' : 'var(--border-1)'}; opacity:${reached ? '1' : '0.55'};">
            <div class="card-title">
              <h3>${phase.name}</h3>
              ${isCurrent ? '<span class="badge badge-accent">En curso</span>' : reached ? `<span class="badge badge-success">${Icon.check} Superada</span>` : '<span class="badge">Bloqueada</span>'}
            </div>
            <p style="font-weight:600; margin-bottom:4px;">Objetivos</p>
            <ul>${phase.objectives.map((o) => `<li>${o}</li>`).join('')}</ul>
            <p style="font-weight:600; margin-bottom:4px;">Competencias trabajadas</p>
            <div class="flex gap-2" style="flex-wrap:wrap;">
              ${phase.competencies.map((c) => `<span class="badge">${c}</span>`).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('[data-lang]').forEach((tab) => tab.addEventListener('click', () => { activeLang = tab.dataset.lang; draw(); }));
  }

  draw();
}
