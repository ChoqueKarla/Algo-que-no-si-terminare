/**
 * vocabulary.js — CRUD completo de vocabulario por idioma, con
 * categorías, favoritos, marcado de difícil/dominada e inicio del
 * ciclo de repetición espaciada.
 */
import { State } from '../core/state.js';
import { LANGUAGE_LIST, LANGUAGES } from '../data/languages.js';
import { VOCAB_CATEGORIES } from '../data/vocabularySeed.js';
import { esc, uid, debounce } from '../core/utils.js';
import { initReview } from '../core/spacedRepetition.js';
import { Icon } from '../components/icons.js';
import { openModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

const STATUS_LABELS = { nuevo: 'Nuevo', aprendiendo: 'Aprendiendo', repasando: 'Repasando', dominada: 'Dominada' };

export function renderVocabulary(container, params) {
  let activeLang = LANGUAGE_LIST[0].code;
  let categoryFilter = 'all';
  let statusFilter = 'all';
  let search = params?.q ? decodeURIComponent(params.q) : '';
  let onlyFavorites = false;

  function getWords() { return State.getVocabulary()[activeLang] || []; }
  function saveWords(words) {
    const vocab = State.getVocabulary();
    vocab[activeLang] = words;
    State.setVocabulary(vocab);
  }

  function draw() {
    const words = getWords();
    const filtered = words.filter((w) => (categoryFilter === 'all' || w.category === categoryFilter)
      && (statusFilter === 'all' || w.status === statusFilter)
      && (!onlyFavorites || w.favorite)
      && (!search || `${w.word} ${w.meaning} ${w.category}`.toLowerCase().includes(search.toLowerCase())));

    const categoriesInUse = VOCAB_CATEGORIES;

    container.innerHTML = `
      <div class="tabs">
        ${LANGUAGE_LIST.map((l) => `<div class="tab ${activeLang === l.code ? 'active' : ''}" data-lang="${l.code}">${l.flag} ${l.name} <span class="text-muted">(${(State.getVocabulary()[l.code] || []).length})</span></div>`).join('')}
      </div>

      <div class="grid grid-4 mb-4">
        <div class="card stat-card"><div class="stat-value">${words.length}</div><div class="stat-label">Palabras totales</div></div>
        <div class="card stat-card"><div class="stat-value">${words.filter((w) => w.status !== 'nuevo').length}</div><div class="stat-label">En proceso de aprendizaje</div></div>
        <div class="card stat-card"><div class="stat-value">${words.filter((w) => w.mastered).length}</div><div class="stat-label">Dominadas</div></div>
        <div class="card stat-card"><div class="stat-value">${words.filter((w) => w.difficult).length}</div><div class="stat-label">Marcadas como difíciles</div></div>
      </div>

      <div class="card">
        <div class="card-title">
          <h3>Banco de palabras</h3>
          <button class="btn btn-primary" id="add-word-btn">${Icon.plus} Añadir palabra</button>
        </div>

        <div class="search-bar"><input id="vocab-search" type="text" placeholder="Buscar palabra o significado..." value="${esc(search)}" />${Icon.search}</div>

        <div class="flex gap-2 mb-4" style="flex-wrap:wrap;">
          <select id="category-filter" style="background:var(--bg-3); border:1px solid var(--border-1); color:var(--text-0); border-radius:6px; padding:7px 10px;">
            <option value="all">Todas las categorías</option>
            ${categoriesInUse.map((c) => `<option value="${c}" ${categoryFilter === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
          ${['all', 'nuevo', 'aprendiendo', 'repasando', 'dominada'].map((s) => `<button class="filter-chip ${statusFilter === s ? 'active' : ''}" data-status="${s}">${s === 'all' ? 'Todas' : STATUS_LABELS[s]}</button>`).join('')}
          <button class="filter-chip ${onlyFavorites ? 'active' : ''}" id="fav-filter">★ Favoritas</button>
        </div>

        ${filtered.length === 0 ? `
          <div class="empty-state">${Icon.book}<h3>No hay palabras que coincidan</h3><p>Ajusta los filtros o añade una palabra nueva.</p></div>
        ` : `
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th></th><th>Palabra</th><th>Pronunciación</th><th>Significado</th><th>Categoría</th>
                <th>Estado</th><th>Próx. repaso</th><th></th>
              </tr></thead>
              <tbody>
                ${filtered.map((w) => `
                  <tr>
                    <td><button class="icon-btn btn-sm" data-fav="${w.id}" style="color:${w.favorite ? 'var(--warning)' : 'var(--text-3)'};">${Icon.star}</button></td>
                    <td><strong>${esc(w.word)}</strong>${w.difficult ? ' 🔥' : ''}</td>
                    <td class="text-muted">${esc(w.pronunciation || '')}</td>
                    <td>${esc(w.meaning)}</td>
                    <td><span class="badge">${esc(w.category)}</span></td>
                    <td><span class="badge ${statusBadge(w.status)}">${STATUS_LABELS[w.status] || w.status}</span></td>
                    <td class="text-muted">${w.nextReview || '—'}</td>
                    <td>
                      <div class="flex gap-2">
                        ${w.status === 'nuevo' ? `<button class="btn btn-sm btn-secondary" data-learn="${w.id}">Empezar</button>` : ''}
                        <button class="icon-btn btn-sm" data-edit="${w.id}">${Icon.edit}</button>
                        <button class="icon-btn btn-sm" data-del="${w.id}">${Icon.trash}</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;

    container.querySelectorAll('[data-lang]').forEach((t) => t.addEventListener('click', () => { activeLang = t.dataset.lang; draw(); }));
    container.querySelector('#category-filter').addEventListener('change', (e) => { categoryFilter = e.target.value; draw(); });
    container.querySelectorAll('[data-status]').forEach((b) => b.addEventListener('click', () => { statusFilter = b.dataset.status; draw(); }));
    container.querySelector('#fav-filter').addEventListener('click', () => { onlyFavorites = !onlyFavorites; draw(); });
    container.querySelector('#vocab-search').addEventListener('input', debounce((e) => { search = e.target.value; draw(); }, 200));
    container.querySelector('#add-word-btn').addEventListener('click', () => openWordForm());

    container.querySelectorAll('[data-fav]').forEach((btn) => btn.addEventListener('click', () => {
      const words = getWords();
      const w = words.find((x) => x.id === btn.dataset.fav);
      w.favorite = !w.favorite;
      saveWords(words);
      draw();
    }));
    container.querySelectorAll('[data-learn]').forEach((btn) => btn.addEventListener('click', () => {
      const words = getWords();
      const w = words.find((x) => x.id === btn.dataset.learn);
      initReview(w);
      saveWords(words);
      showToast(`"${w.word}" añadida al ciclo de repaso`, 'success');
      draw();
    }));
    container.querySelectorAll('[data-edit]').forEach((btn) => btn.addEventListener('click', () => {
      openWordForm(getWords().find((x) => x.id === btn.dataset.edit));
    }));
    container.querySelectorAll('[data-del]').forEach((btn) => btn.addEventListener('click', () => {
      saveWords(getWords().filter((x) => x.id !== btn.dataset.del));
      showToast('Palabra eliminada', 'default');
      draw();
    }));
  }

  function statusBadge(status) {
    return { nuevo: '', aprendiendo: 'badge-accent', repasando: 'badge-warning', dominada: 'badge-success' }[status] || '';
  }

  function openWordForm(existing) {
    const isEdit = !!existing;
    const formId = 'word-form';
    openModal({
      title: isEdit ? 'Editar palabra' : `Añadir palabra (${LANGUAGES[activeLang].name})`,
      bodyHTML: `
        <form id="${formId}">
          <div class="field-row">
            <div class="field"><label>Palabra</label><input name="word" required value="${esc(existing?.word || '')}" /></div>
            <div class="field"><label>Pronunciación</label><input name="pronunciation" value="${esc(existing?.pronunciation || '')}" /></div>
          </div>
          <div class="field"><label>Significado</label><input name="meaning" required value="${esc(existing?.meaning || '')}" /></div>
          <div class="field-row">
            <div class="field"><label>Categoría</label>
              <select name="category">${VOCAB_CATEGORIES.map((c) => `<option value="${c}" ${existing?.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
            </div>
            <div class="field"><label>Nivel</label>
              <select name="level">${['A0', 'A1', 'A2', 'B1', 'B2'].map((l) => `<option ${existing?.level === l ? 'selected' : ''}>${l}</option>`).join('')}</select>
            </div>
          </div>
          <div class="field"><label>Notas</label><textarea name="notes">${esc(existing?.notes || '')}</textarea></div>
          <div class="checkbox-row"><input type="checkbox" name="difficult" ${existing?.difficult ? 'checked' : ''} /> Marcar como difícil</div>
        </form>
      `,
      actions: [
        { label: 'Cancelar', className: 'btn-ghost' },
        {
          label: isEdit ? 'Guardar cambios' : 'Añadir',
          className: 'btn-primary',
          onClick: () => {
            const form = document.getElementById(formId);
            const fd = new FormData(form);
            const data = Object.fromEntries(fd.entries());
            data.difficult = fd.get('difficult') === 'on';
            const words = getWords();
            if (isEdit) {
              const idx = words.findIndex((w) => w.id === existing.id);
              words[idx] = { ...existing, ...data };
            } else {
              words.push({
                id: uid('word'), ...data, status: 'nuevo', learnedDate: null, nextReview: null,
                interval: 0, repetitions: 0, favorite: false, mastered: false,
              });
            }
            saveWords(words);
            showToast(isEdit ? 'Palabra actualizada' : 'Palabra añadida', 'success');
            draw();
          },
        },
      ],
    });
  }

  draw();
}
