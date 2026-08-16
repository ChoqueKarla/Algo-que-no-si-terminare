/**
 * reviews.js — muestra qué palabras tocan repasar hoy (repetición
 * espaciada: 1, 3, 7, 15, 30, 60, 90, 180, 365 días) y ofrece un modo
 * flashcard para repasarlas una por una.
 */
import { State, evaluateAchievements } from '../core/state.js';
import { LANGUAGE_LIST, LANGUAGES } from '../data/languages.js';
import { toISODate, esc, addDays } from '../core/utils.js';
import { getDueWords, applyReview, INTERVALS } from '../core/spacedRepetition.js';
import { Icon } from '../components/icons.js';
import { openModal } from '../components/modal.js';
import { showToast, celebrate } from '../components/toast.js';

export function renderReviews(container) {
  function allWordsFlat() {
    const vocab = State.getVocabulary();
    return LANGUAGE_LIST.flatMap((l) => (vocab[l.code] || []).map((w) => ({ ...w, language: l.code })));
  }

  function draw() {
    const todayISO = toISODate(new Date());
    const all = allWordsFlat();
    const due = getDueWords(all, todayISO);
    const upcoming = [1, 3, 7, 30].map((days) => ({
      label: `+${days}d`,
      count: all.filter((w) => w.nextReview && w.nextReview === toISODate(addDays(new Date(), days))).length,
    }));

    container.innerHTML = `
      <div class="grid grid-4 mb-4">
        <div class="card stat-card"><div class="stat-icon">${Icon.refresh}</div><div class="stat-value">${due.length}</div><div class="stat-label">Para repasar hoy</div></div>
        ${upcoming.map((u) => `<div class="card stat-card"><div class="stat-value">${u.count}</div><div class="stat-label">Vencen en ${u.label}</div></div>`).join('')}
      </div>

      <div class="card mb-4">
        <div class="card-title"><h3>Intervalos de repetición espaciada</h3></div>
        <div class="flex gap-2" style="flex-wrap:wrap;">
          ${INTERVALS.map((d) => `<span class="badge">${d} día${d > 1 ? 's' : ''}</span>`).join('')}
        </div>
        <p class="text-muted mt-3" style="margin-bottom:0;">Al responder "La sé" avanzas al siguiente intervalo. Al responder "No la sé" vuelves al primero.</p>
      </div>

      <div class="card">
        <div class="card-title">
          <h3>Cola de repaso de hoy</h3>
          ${due.length ? `<button class="btn btn-primary" id="start-review-btn">${Icon.repeat} Iniciar repaso (${due.length})</button>` : ''}
        </div>
        ${due.length === 0 ? `
          <div class="empty-state">${Icon.check}<h3>¡Todo al día!</h3><p>No tienes palabras pendientes de repaso hoy.</p></div>
        ` : `
          <div class="table-wrap">
            <table>
              <thead><tr><th>Palabra</th><th>Idioma</th><th>Significado</th><th>Repeticiones</th></tr></thead>
              <tbody>
                ${due.map((w) => `<tr>
                  <td><strong>${esc(w.word)}</strong></td>
                  <td><span class="badge ${LANGUAGES[w.language]?.badgeClass}">${LANGUAGES[w.language]?.flag}</span></td>
                  <td>${esc(w.meaning)}</td>
                  <td>${w.repetitions || 0}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;

    const startBtn = container.querySelector('#start-review-btn');
    if (startBtn) startBtn.addEventListener('click', () => startFlashcards(due));
  }

  function startFlashcards(queue) {
    let idx = 0;

    function renderCard() {
      const w = queue[idx];
      openModal({
        title: `Repaso ${idx + 1} / ${queue.length}`,
        bodyHTML: `
          <div style="text-align:center; padding:20px 0;">
            <span class="badge ${LANGUAGES[w.language]?.badgeClass}">${LANGUAGES[w.language]?.flag} ${LANGUAGES[w.language]?.name}</span>
            <h1 style="margin:16px 0;">${esc(w.word)}</h1>
            <p class="text-muted">${esc(w.pronunciation || '')}</p>
            <div id="reveal-area" style="min-height:40px; margin-top:12px;">
              <button class="btn btn-secondary" id="reveal-btn">Mostrar significado</button>
            </div>
          </div>
        `,
        actions: [{ label: 'Salir', className: 'btn-ghost' }],
        onMount: (root) => {
          root.querySelector('#reveal-btn').addEventListener('click', () => {
            root.querySelector('#reveal-area').innerHTML = `
              <p style="font-size:var(--fs-lg); font-weight:700;">${esc(w.meaning)}</p>
              <div class="flex gap-2" style="justify-content:center; margin-top:12px;">
                <button class="btn btn-danger" id="dont-know-btn">No la sé</button>
                <button class="btn btn-primary" id="know-btn">${Icon.check} La sé</button>
              </div>
            `;
            root.querySelector('#know-btn').addEventListener('click', () => submit(true));
            root.querySelector('#dont-know-btn').addEventListener('click', () => submit(false));
          });
        },
      });
    }

    function submit(remembered) {
      const w = queue[idx];
      const vocab = State.getVocabulary();
      const list = vocab[w.language];
      const target = list.find((x) => x.id === w.id);
      applyReview(target, remembered, new Date());
      State.setVocabulary(vocab);
      idx += 1;
      if (idx < queue.length) {
        renderCard();
      } else {
        const fresh = evaluateAchievements();
        showToast('Repaso completado 🎉', 'success');
        if (fresh.length) celebrate();
        draw();
      }
    }

    renderCard();
  }

  draw();
}
