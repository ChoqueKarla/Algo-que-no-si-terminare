/**
 * exams.js — genera mini-exámenes de opción múltiple a partir del
 * vocabulario del idioma elegido (palabra → significado) y guarda el
 * historial de resultados por tipo de examen.
 */
import { State } from '../core/state.js';
import { LANGUAGE_LIST, LANGUAGES } from '../data/languages.js';
import { uid, toISODate, esc } from '../core/utils.js';
import { Icon } from '../components/icons.js';
import { openModal } from '../components/modal.js';
import { showToast, celebrate } from '../components/toast.js';

const EXAM_TYPES = { semanal: 'Semanal', mensual: 'Mensual', trimestral: 'Trimestral', final: 'Final' };

export function renderExams(container) {
  function draw() {
    const exams = State.getExams().slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const avg = exams.length ? Math.round(exams.reduce((s, e) => s + e.score, 0) / exams.length) : 0;

    container.innerHTML = `
      <div class="grid grid-3 mb-4">
        <div class="card stat-card"><div class="stat-icon">${Icon.fileText}</div><div class="stat-value">${exams.length}</div><div class="stat-label">Exámenes realizados</div></div>
        <div class="card stat-card"><div class="stat-icon">${Icon.target}</div><div class="stat-value">${avg}%</div><div class="stat-label">Promedio general</div></div>
        <div class="card stat-card"><div class="stat-icon">${Icon.trophy}</div><div class="stat-value">${exams.filter((e) => e.score >= 80).length}</div><div class="stat-label">Exámenes aprobados (≥80%)</div></div>
      </div>

      <div class="card">
        <div class="card-title">
          <h3>Historial de exámenes</h3>
          <button class="btn btn-primary" id="new-exam-btn">${Icon.plus} Nuevo examen</button>
        </div>
        ${exams.length === 0 ? `<div class="empty-state">${Icon.fileText}<h3>Todavía no rendiste exámenes</h3><p>Genera uno a partir de tu vocabulario guardado.</p></div>` : `
          <div class="table-wrap">
            <table>
              <thead><tr><th>Fecha</th><th>Idioma</th><th>Tipo</th><th>Preguntas</th><th>Resultado</th></tr></thead>
              <tbody>
                ${exams.map((e) => `
                  <tr>
                    <td>${e.date}</td>
                    <td><span class="badge ${LANGUAGES[e.language]?.badgeClass}">${LANGUAGES[e.language]?.flag} ${LANGUAGES[e.language]?.name}</span></td>
                    <td><span class="badge badge-accent">${EXAM_TYPES[e.type]}</span></td>
                    <td>${e.total}</td>
                    <td><span class="badge ${e.score >= 80 ? 'badge-success' : e.score >= 50 ? 'badge-warning' : 'badge-danger'}">${e.score}%</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;

    container.querySelector('#new-exam-btn').addEventListener('click', openConfigModal);
  }

  function openConfigModal() {
    const formId = 'exam-config-form';
    openModal({
      title: 'Configurar examen',
      bodyHTML: `
        <form id="${formId}">
          <div class="field"><label>Idioma</label>
            <select name="language">${LANGUAGE_LIST.map((l) => `<option value="${l.code}">${l.flag} ${l.name}</option>`).join('')}</select>
          </div>
          <div class="field"><label>Tipo de examen</label>
            <select name="type">${Object.entries(EXAM_TYPES).map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select>
          </div>
          <div class="field"><label>Cantidad de preguntas</label>
            <select name="count"><option value="5">5</option><option value="10" selected>10</option><option value="15">15</option><option value="20">20</option></select>
          </div>
        </form>
      `,
      actions: [
        { label: 'Cancelar', className: 'btn-ghost' },
        {
          label: 'Comenzar examen',
          className: 'btn-primary',
          onClick: () => {
            const data = Object.fromEntries(new FormData(document.getElementById(formId)).entries());
            const started = startExam(data.language, data.type, Number(data.count));
            return started !== false;
          },
        },
      ],
    });
  }

  function startExam(language, type, count) {
    const words = (State.getVocabulary()[language] || []);
    if (words.length < 4) {
      showToast('Necesitas al menos 4 palabras guardadas en ese idioma para generar un examen', 'danger');
      return false;
    }
    const questionWords = shuffle(words).slice(0, Math.min(count, words.length));
    const answers = {};
    let current = 0;

    function renderQuestion() {
      const w = questionWords[current];
      const distractors = shuffle(words.filter((x) => x.id !== w.id)).slice(0, 3).map((x) => x.meaning);
      const options = shuffle([w.meaning, ...distractors]);
      openModal({
        title: `Pregunta ${current + 1} / ${questionWords.length}`,
        bodyHTML: `
          <p class="text-muted">¿Qué significa esta palabra?</p>
          <h2 style="margin-bottom:16px;">${esc(w.word)}</h2>
          <div class="flex-col gap-2" id="exam-options">
            ${options.map((opt) => `<button type="button" class="btn btn-secondary" style="justify-content:flex-start; text-align:left;" data-opt="${esc(opt)}">${esc(opt)}</button>`).join('')}
          </div>
        `,
        actions: [{ label: 'Salir del examen', className: 'btn-ghost' }],
        onMount: (root) => {
          root.querySelectorAll('[data-opt]').forEach((btn) => btn.addEventListener('click', () => {
            answers[w.id] = btn.dataset.opt === w.meaning;
            current += 1;
            if (current < questionWords.length) renderQuestion();
            else finishExam();
          }));
        },
      });
    }

    function finishExam() {
      const correct = Object.values(answers).filter(Boolean).length;
      const score = Math.round((correct / questionWords.length) * 100);
      const exams = State.getExams();
      exams.push({ id: uid('exam'), date: toISODate(new Date()), language, type, total: questionWords.length, correct, score });
      State.setExams(exams);
      openModal({
        title: 'Resultado del examen',
        bodyHTML: `
          <div style="text-align:center;">
            <h1 style="font-size:3rem;">${score}%</h1>
            <p>${correct} de ${questionWords.length} respuestas correctas</p>
            <span class="badge ${score >= 80 ? 'badge-success' : score >= 50 ? 'badge-warning' : 'badge-danger'}" style="font-size:var(--fs-sm);">${score >= 80 ? '¡Excelente!' : score >= 50 ? 'Bien, sigue practicando' : 'Necesitas repasar más'}</span>
          </div>
        `,
        actions: [{ label: 'Cerrar', className: 'btn-primary' }],
      });
      if (score >= 80) celebrate();
      draw();
    }

    renderQuestion();
    return true;
  }

  function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

  draw();
}
