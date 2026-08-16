/**
 * grammar.js — temas de gramática agrupados por fase, con explicación,
 * ejemplos, errores comunes, ejercicios, estado y progreso editable.
 */
import { State } from '../core/state.js';
import { LANGUAGE_LIST } from '../data/languages.js';
import { PHASES } from '../data/phases.js';
import { esc, uid, pct } from '../core/utils.js';
import { Icon } from '../components/icons.js';
import { openModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

const STATUS_LABELS = { pendiente: 'Pendiente', en_progreso: 'En progreso', dominado: 'Dominado' };

export function renderGrammar(container) {
  let activeLang = LANGUAGE_LIST[0].code;

  function getTopics() { return State.getGrammar()[activeLang] || []; }
  function saveTopics(topics) {
    const g = State.getGrammar();
    g[activeLang] = topics;
    State.setGrammar(g);
  }

  function draw() {
    const topics = getTopics();
    const mastered = topics.filter((t) => t.status === 'dominado').length;

    container.innerHTML = `
      <div class="tabs">
        ${LANGUAGE_LIST.map((l) => `<div class="tab ${activeLang === l.code ? 'active' : ''}" data-lang="${l.code}">${l.flag} ${l.name}</div>`).join('')}
      </div>

      <div class="card mb-4">
        <div class="flex-between mb-2"><span>Progreso general de gramática</span><span class="text-muted">${mastered}/${topics.length} dominados</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${pct(mastered, topics.length)}%"></div></div>
      </div>

      <div class="flex-between mb-3">
        <h3 style="margin:0;">Temas por fase</h3>
        <button class="btn btn-primary" id="add-topic-btn">${Icon.plus} Añadir tema</button>
      </div>

      <div class="flex-col gap-4">
        ${PHASES.map((phase) => {
          const phaseTopics = topics.filter((t) => t.phase === phase.code);
          if (!phaseTopics.length) return '';
          return `
          <div>
            <h4 style="color:var(--text-2); text-transform:uppercase; font-size:var(--fs-xs); letter-spacing:.05em; margin-bottom:8px;">${phase.name}</h4>
            <div class="flex-col gap-2">
              ${phaseTopics.map((t) => `
                <div class="card interactive" data-topic="${t.id}">
                  <div class="flex-between">
                    <strong>${esc(t.title)}</strong>
                    <span class="badge ${t.status === 'dominado' ? 'badge-success' : t.status === 'en_progreso' ? 'badge-accent' : ''}">${STATUS_LABELS[t.status]}</span>
                  </div>
                  <p class="text-muted" style="margin:6px 0 0;">${esc(t.explanation).slice(0, 110)}${t.explanation.length > 110 ? '…' : ''}</p>
                </div>
              `).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('[data-lang]').forEach((t) => t.addEventListener('click', () => { activeLang = t.dataset.lang; draw(); }));
    container.querySelector('#add-topic-btn').addEventListener('click', () => openTopicForm());
    container.querySelectorAll('[data-topic]').forEach((card) => card.addEventListener('click', () => openTopicDetail(card.dataset.topic)));
  }

  function openTopicDetail(id) {
    const topics = getTopics();
    const t = topics.find((x) => x.id === id);
    if (!t) return;
    openModal({
      title: t.title,
      wide: true,
      bodyHTML: `
        <div class="flex gap-2 mb-3"><span class="badge badge-accent">${t.phase}</span><span class="badge">${STATUS_LABELS[t.status]}</span></div>
        <p>${esc(t.explanation)}</p>
        <p style="font-weight:700; margin-bottom:4px;">Ejemplos</p>
        <ul>${t.examples.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
        <p style="font-weight:700; margin-bottom:4px;">Errores comunes</p>
        <ul>${t.commonErrors.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
        <p style="font-weight:700; margin-bottom:4px;">Ejercicios</p>
        <ul>${t.exercises.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
        <div class="field">
          <label>Estado</label>
          <select id="topic-status">
            ${Object.entries(STATUS_LABELS).map(([v, l]) => `<option value="${v}" ${t.status === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>
        <div class="field"><label>Progreso (%)</label><input id="topic-progress" type="range" min="0" max="100" value="${t.progress || 0}" /></div>
        <div class="field"><label>Notas</label><textarea id="topic-notes">${esc(t.notes || '')}</textarea></div>
      `,
      actions: [
        { label: 'Cerrar', className: 'btn-ghost' },
        {
          label: 'Guardar',
          className: 'btn-primary',
          onClick: () => {
            t.status = document.getElementById('topic-status').value;
            t.progress = Number(document.getElementById('topic-progress').value);
            t.notes = document.getElementById('topic-notes').value;
            if (t.status === 'dominado') t.progress = 100;
            saveTopics(topics);
            showToast('Tema actualizado', 'success');
            draw();
          },
        },
      ],
    });
  }

  function openTopicForm() {
    const formId = 'topic-form';
    openModal({
      title: 'Nuevo tema de gramática',
      bodyHTML: `
        <form id="${formId}">
          <div class="field"><label>Título</label><input name="title" required /></div>
          <div class="field"><label>Fase</label><select name="phase">${PHASES.map((p) => `<option value="${p.code}">${p.name}</option>`).join('')}</select></div>
          <div class="field"><label>Explicación</label><textarea name="explanation" required></textarea></div>
          <div class="field"><label>Ejemplos (uno por línea)</label><textarea name="examples" placeholder="Ejemplo 1&#10;Ejemplo 2"></textarea></div>
          <div class="field"><label>Errores comunes (uno por línea)</label><textarea name="commonErrors"></textarea></div>
          <div class="field"><label>Ejercicios (uno por línea)</label><textarea name="exercises"></textarea></div>
        </form>
      `,
      actions: [
        { label: 'Cancelar', className: 'btn-ghost' },
        {
          label: 'Añadir',
          className: 'btn-primary',
          onClick: () => {
            const form = document.getElementById(formId);
            const data = Object.fromEntries(new FormData(form).entries());
            const topics = getTopics();
            topics.push({
              id: uid('gram'),
              phase: data.phase,
              title: data.title,
              explanation: data.explanation,
              examples: data.examples.split('\n').filter(Boolean),
              commonErrors: data.commonErrors.split('\n').filter(Boolean),
              exercises: data.exercises.split('\n').filter(Boolean),
              status: 'pendiente',
              progress: 0,
              notes: '',
            });
            saveTopics(topics);
            showToast('Tema añadido', 'success');
            draw();
          },
        },
      ],
    });
  }

  draw();
}
