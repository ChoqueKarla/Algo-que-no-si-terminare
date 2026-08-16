/**
 * skillLogFactory.js
 * -----------------------------------------------------------------------
 * Página genérica reutilizada por Listening, Speaking, Reading, Writing,
 * Pronunciación y Shadowing. Cada una define su propia configuración de
 * campos (config.fields) pero comparte toda la lógica de listar, crear,
 * editar, borrar, filtrar y mostrar estadísticas — así evitamos duplicar
 * 6 páginas casi idénticas.
 * -----------------------------------------------------------------------
 */
import { State } from '../core/state.js';
import { LANGUAGE_LIST, LANGUAGES } from '../data/languages.js';
import { uid, toISODate, esc, minutesToHM, formatShortDate } from '../core/utils.js';
import { openModal, closeModal } from './modal.js';
import { showToast } from './toast.js';
import { Icon } from './icons.js';

export function renderSkillLogPage(container, config) {
  let langFilter = 'all';
  let search = '';

  function getEntries() {
    const logs = State.getLogs();
    return logs[config.type] || [];
  }
  function saveEntries(entries) {
    const logs = State.getLogs();
    logs[config.type] = entries;
    State.setLogs(logs);
  }

  function draw() {
    const entries = getEntries().slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const totalMinutes = entries.reduce((s, e) => s + (Number(e.minutes) || 0), 0);
    const filtered = entries.filter((e) => (langFilter === 'all' || e.language === langFilter)
      && (!search || JSON.stringify(e).toLowerCase().includes(search.toLowerCase())));

    container.innerHTML = `
      <div class="grid grid-4 mb-4">
        <div class="card stat-card">
          <div class="stat-icon">${config.icon}</div>
          <div class="stat-value">${entries.length}</div>
          <div class="stat-label">Sesiones registradas</div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon">${Icon.clock}</div>
          <div class="stat-value">${minutesToHM(totalMinutes)}</div>
          <div class="stat-label">Tiempo total</div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon">${Icon.calendar}</div>
          <div class="stat-value">${entries.filter((e) => e.date === toISODate(new Date())).length}</div>
          <div class="stat-label">Sesiones hoy</div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon">${Icon.target}</div>
          <div class="stat-value">${entries.length ? Math.round(totalMinutes / entries.length) : 0} min</div>
          <div class="stat-label">Promedio por sesión</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <h3>${config.title} · Historial</h3>
          <button class="btn btn-primary" id="add-entry-btn">${Icon.plus} Registrar sesión</button>
        </div>
        <div class="flex-between mb-3" style="flex-wrap:wrap; gap:8px;">
          <div class="flex gap-2" id="lang-filters" style="flex-wrap:wrap;">
            <button class="filter-chip ${langFilter === 'all' ? 'active' : ''}" data-lang="all">Todos</button>
            ${LANGUAGE_LIST.map((l) => `<button class="filter-chip ${langFilter === l.code ? 'active' : ''}" data-lang="${l.code}">${l.flag} ${l.name}</button>`).join('')}
          </div>
          <div class="search-bar" style="margin:0; width:220px;">
            ${Icon.search}
            <input type="text" id="entry-search" placeholder="Buscar..." value="${esc(search)}" />
          </div>
        </div>

        ${filtered.length === 0 ? `
          <div class="empty-state">
            ${Icon.fileText}
            <h3>Todavía no hay sesiones</h3>
            <p>Registra tu primera sesión de ${config.title.toLowerCase()} con el botón de arriba.</p>
          </div>
        ` : `
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th>Fecha</th><th>Idioma</th>
                ${config.fields.map((f) => `<th>${f.label}</th>`).join('')}
                <th>Minutos</th><th>Notas</th><th></th>
              </tr></thead>
              <tbody>
                ${filtered.map((e) => `
                  <tr>
                    <td>${formatShortDate(new Date(`${e.date}T00:00:00`))}</td>
                    <td><span class="badge ${LANGUAGES[e.language]?.badgeClass || ''}">${LANGUAGES[e.language]?.flag || ''} ${LANGUAGES[e.language]?.name || e.language}</span></td>
                    ${config.fields.map((f) => `<td>${esc(formatFieldValue(f, e[f.key]))}</td>`).join('')}
                    <td>${e.minutes || 0}</td>
                    <td style="max-width:200px; white-space:normal;">${esc(e.notes || '')}</td>
                    <td>
                      <div class="flex gap-2">
                        <button class="icon-btn btn-sm" data-edit="${e.id}">${Icon.edit}</button>
                        <button class="icon-btn btn-sm" data-del="${e.id}">${Icon.trash}</button>
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

    container.querySelectorAll('[data-lang]').forEach((btn) => btn.addEventListener('click', () => { langFilter = btn.dataset.lang; draw(); }));
    container.querySelector('#entry-search').addEventListener('input', (e) => { search = e.target.value; draw(); });
    container.querySelector('#add-entry-btn').addEventListener('click', () => openEntryForm());
    container.querySelectorAll('[data-edit]').forEach((btn) => btn.addEventListener('click', () => {
      const entry = getEntries().find((e) => e.id === btn.dataset.edit);
      openEntryForm(entry);
    }));
    container.querySelectorAll('[data-del]').forEach((btn) => btn.addEventListener('click', () => {
      const entries = getEntries().filter((e) => e.id !== btn.dataset.del);
      saveEntries(entries);
      showToast('Sesión eliminada', 'default');
      draw();
    }));
  }

  function formatFieldValue(field, value) {
    if (field.type === 'rating') return value ? `${'★'.repeat(value)}${'☆'.repeat(5 - value)}` : '—';
    if (field.type === 'select') {
      const opt = field.options.find((o) => o.value === value);
      return opt ? opt.label : (value || '—');
    }
    return value || '—';
  }

  function openEntryForm(existing) {
    const isEdit = !!existing;
    const formId = 'skilllog-form';
    const bodyHTML = `
      <form id="${formId}">
        <div class="field-row">
          <div class="field">
            <label>Fecha</label>
            <input type="date" name="date" value="${existing?.date || toISODate(new Date())}" required />
          </div>
          <div class="field">
            <label>Idioma</label>
            <select name="language" required>
              ${LANGUAGE_LIST.map((l) => `<option value="${l.code}" ${existing?.language === l.code ? 'selected' : ''}>${l.flag} ${l.name}</option>`).join('')}
            </select>
          </div>
        </div>
        ${config.fields.map((f) => renderField(f, existing)).join('')}
        <div class="field">
          <label>Minutos dedicados</label>
          <input type="number" min="1" name="minutes" value="${existing?.minutes || 15}" required />
        </div>
        <div class="field">
          <label>Notas</label>
          <textarea name="notes" placeholder="Observaciones, dificultades, aprendizajes...">${existing?.notes || ''}</textarea>
        </div>
      </form>
    `;

    openModal({
      title: isEdit ? `Editar sesión de ${config.title}` : `Registrar sesión de ${config.title}`,
      bodyHTML,
      actions: [
        { label: 'Cancelar', className: 'btn-ghost' },
        {
          label: isEdit ? 'Guardar cambios' : 'Registrar',
          className: 'btn-primary',
          onClick: () => {
            const form = document.getElementById(formId);
            const data = Object.fromEntries(new FormData(form).entries());
            const entries = getEntries();
            if (isEdit) {
              const idx = entries.findIndex((e) => e.id === existing.id);
              entries[idx] = { ...existing, ...data, minutes: Number(data.minutes) };
            } else {
              entries.push({ id: uid(config.type), ...data, minutes: Number(data.minutes) });
            }
            saveEntries(entries);
            showToast(isEdit ? 'Sesión actualizada' : 'Sesión registrada', 'success');
            draw();
          },
        },
      ],
    });
  }

  function renderField(f, existing) {
    const value = existing ? existing[f.key] : '';
    if (f.type === 'select') {
      return `<div class="field"><label>${f.label}</label>
        <select name="${f.key}">
          ${f.options.map((o) => `<option value="${o.value}" ${value === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
        </select></div>`;
    }
    if (f.type === 'rating') {
      return `<div class="field"><label>${f.label} (1-5)</label>
        <select name="${f.key}">
          ${[1, 2, 3, 4, 5].map((n) => `<option value="${n}" ${String(value) === String(n) ? 'selected' : ''}>${'★'.repeat(n)}${'☆'.repeat(5 - n)}</option>`).join('')}
        </select></div>`;
    }
    if (f.type === 'textarea') {
      return `<div class="field"><label>${f.label}</label><textarea name="${f.key}">${value || ''}</textarea></div>`;
    }
    if (f.type === 'number') {
      return `<div class="field"><label>${f.label}</label><input type="number" name="${f.key}" value="${value || 0}" /></div>`;
    }
    return `<div class="field"><label>${f.label}</label><input type="text" name="${f.key}" value="${esc(value || '')}" /></div>`;
  }

  draw();
}
