/**
 * dayPlan.js — ficha detallada de un día del plan: 3 pestañas (una por
 * idioma), cada una con objetivo, duración, nivel, tema, las 4 destrezas
 * + pronunciación + shadowing, mini examen, recursos y estado propio.
 */
import { State, evaluateAchievements } from '../core/state.js';
import { LANGUAGES } from '../data/languages.js';
import { esc } from '../core/utils.js';
import { Icon } from '../components/icons.js';
import { showToast, celebrate } from '../components/toast.js';
import { navigate } from '../core/router.js';

const ROWS = [
  ['vocabulary', 'Vocabulario', Icon.book],
  ['grammar', 'Gramática', Icon.grammar],
  ['listening', 'Listening', Icon.headphones],
  ['speaking', 'Speaking', Icon.mic],
  ['reading', 'Reading', Icon.bookOpen],
  ['writing', 'Writing', Icon.pen],
  ['pronunciation', 'Pronunciación', Icon.volume],
  ['shadowing', 'Shadowing', Icon.repeat],
];

export function renderDayPlan(container, params) {
  const index = Number(params.index) || State.todayPlanIndex() || 1;
  const day = State.getPlan().find((d) => d.index === index);

  if (!day) {
    container.innerHTML = `<div class="empty-state">${Icon.calendar}<h3>Día no encontrado</h3><p>Prueba con un índice entre 1 y 365.</p></div>`;
    return;
  }

  let activeLang = params.lang && day.languages.some((b) => b.language === params.lang) ? params.lang : day.languages[0].language;

  function draw() {
    const block = day.languages.find((b) => b.language === activeLang);
    const lang = LANGUAGES[activeLang];

    container.innerHTML = `
      <div class="flex-between mb-4" style="flex-wrap:wrap; gap:10px;">
        <div class="flex gap-2">
          <button class="btn btn-secondary" id="prev-btn" ${index <= 1 ? 'disabled' : ''}>${Icon.chevronLeft} Anterior</button>
          <button class="btn btn-secondary" id="next-btn" ${index >= 365 ? 'disabled' : ''}>Siguiente ${Icon.chevronRight}</button>
        </div>
        <span class="badge ${day.status === 'completado' ? 'badge-success' : 'badge-warning'}">Día ${day.index}/365 ${day.isReviewDay ? '· 🔁 repaso' : ''} · ${day.status}</span>
      </div>

      <div class="tabs">
        ${day.languages.map((b) => `<div class="tab ${activeLang === b.language ? 'active' : ''}" data-lang="${b.language}">${LANGUAGES[b.language].flag} ${LANGUAGES[b.language].name} ${b.status === 'completado' ? '✓' : ''}</div>`).join('')}
      </div>

      <div class="card mb-4">
        <div class="card-title">
          <h3>${day.date}</h3>
          <span class="badge ${block.status === 'completado' ? 'badge-success' : 'badge-warning'}">${block.status}</span>
        </div>
        <h1 style="margin-bottom:6px;">${esc(block.topic)}</h1>
        <p>${esc(block.objective)}</p>
        <div class="flex gap-2" style="flex-wrap:wrap;">
          <span class="badge">${Icon.clock} ${block.duration} min estimados</span>
          <span class="badge badge-accent">Nivel ${block.level}</span>
          ${block.miniExam ? `<span class="badge badge-warning">📝 Mini examen hoy</span>` : ''}
          ${block.review ? `<span class="badge">🔁 Repaso</span>` : ''}
          ${block.scriptPhase ? `<span class="badge">✍️ Sistema de escritura</span>` : ''}
        </div>
      </div>

      ${block.keyPhrases && block.keyPhrases.length ? `
        <div class="card mb-4" style="border-color:var(--accent);">
          <div class="card-title"><h3>${Icon.mic} Frases clave de hoy</h3><span class="badge badge-accent">Habla así con un nativo</span></div>
          <div class="flex-col gap-3">
            ${block.keyPhrases.map(([text, pron, translation]) => `
              <div class="list-item" style="display:block;">
                <p style="font-size:var(--fs-md); font-weight:700; margin:0;">${esc(text)}</p>
                ${pron ? `<p class="text-muted" style="margin:2px 0 0; font-style:italic;">${esc(pron)}</p>` : ''}
                <p style="margin:4px 0 0;">${esc(translation)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="grid grid-2 mb-4">
        ${ROWS.filter(([k]) => block[k]).map(([key, label, icon]) => `
          <div class="card">
            <div class="flex gap-3" style="align-items:flex-start;">
              <div class="stat-icon" style="margin-bottom:0;">${icon}</div>
              <div>
                <p style="font-weight:700; margin-bottom:2px;">${label}</p>
                <p class="text-muted" style="margin:0;">${esc(block[key])}</p>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="card mb-4">
        <div class="card-title"><h3>Recursos sugeridos</h3></div>
        <ul>${(block.resources || []).map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
      </div>

      <div class="card mb-4">
        <div class="card-title"><h3>Notas personales (${lang.name})</h3></div>
        <textarea id="day-notes" placeholder="Escribe aquí tus observaciones de esta sesión...">${esc(block.notes || '')}</textarea>
        <button class="btn btn-secondary mt-3" id="save-notes-btn">Guardar notas</button>
      </div>

      <div class="flex gap-2">
        <button class="btn btn-primary" id="mark-done-btn" ${block.status === 'completado' ? 'disabled' : ''}>${Icon.check} ${block.status === 'completado' ? 'Sesión completada' : 'Marcar sesión como completada'}</button>
        <button class="btn btn-secondary" id="go-planner-btn">Abrir en Planificador (checklist)</button>
      </div>
    `;

    container.querySelector('#prev-btn').addEventListener('click', () => navigate(`#/day-plan/index/${index - 1}/lang/${activeLang}`));
    container.querySelector('#next-btn').addEventListener('click', () => navigate(`#/day-plan/index/${index + 1}/lang/${activeLang}`));
    container.querySelector('#go-planner-btn').addEventListener('click', () => navigate(`#/planner/index/${index}`));
    container.querySelectorAll('[data-lang]').forEach((tab) => tab.addEventListener('click', () => { activeLang = tab.dataset.lang; draw(); }));

    container.querySelector('#save-notes-btn').addEventListener('click', () => {
      const plan = State.getPlan();
      const d = plan.find((x) => x.index === index);
      const b = d.languages.find((x) => x.language === activeLang);
      b.notes = container.querySelector('#day-notes').value;
      State.setPlan(plan);
      showToast('Notas guardadas', 'success');
    });

    const markBtn = container.querySelector('#mark-done-btn');
    if (markBtn) markBtn.addEventListener('click', () => {
      State.markLanguageStatus(index, activeLang, 'completado');
      const fresh = evaluateAchievements();
      showToast('¡Sesión completada!', 'success');
      if (fresh.length) celebrate();
      draw();
    });
  }

  draw();
}
