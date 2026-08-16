/**
 * calendar.js — calendario mensual navegable. Colorea cada día según el
 * idioma planificado, marca exámenes/repasos y permite añadir eventos
 * propios (citas, exámenes externos, recordatorios).
 */
import { State } from '../core/state.js';
import { LANGUAGES } from '../data/languages.js';
import { toISODate, monthName, weekdayShort, esc, uid } from '../core/utils.js';
import { Icon } from '../components/icons.js';
import { openModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../core/router.js';

export function renderCalendar(container) {
  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();

  function draw() {
    const plan = State.getPlan();
    const events = State.getEvents();
    const planByDate = Object.fromEntries(plan.map((d) => [d.date, d]));

    const firstDay = new Date(viewYear, viewMonth, 1);
    const startOffset = firstDay.getDay(); // 0=domingo
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startOffset; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);

    container.innerHTML = `
      <div class="card">
        <div class="flex-between mb-4">
          <div class="flex gap-2" style="align-items:center;">
            <button class="icon-btn" id="prev-month">${Icon.chevronLeft}</button>
            <h2 style="min-width:220px; text-align:center; margin:0;">${monthName(viewMonth)} ${viewYear}</h2>
            <button class="icon-btn" id="next-month">${Icon.chevronRight}</button>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-secondary" id="today-btn">Hoy</button>
            <button class="btn btn-primary" id="add-event-btn">${Icon.plus} Añadir evento</button>
          </div>
        </div>

        <div class="flex gap-3 mb-3" style="flex-wrap:wrap;">
          ${Object.values(LANGUAGES).map((l) => `<span class="badge ${l.badgeClass}">${l.flag} ${l.name}</span>`).join('')}
          <span class="badge">🔁 Repaso</span>
          <span class="badge badge-warning">📝 Examen</span>
        </div>

        <div class="cal-grid" style="display:grid; grid-template-columns:repeat(7,1fr); gap:6px;">
          ${[0,1,2,3,4,5,6].map((i) => `<div class="text-muted" style="text-align:center; font-size:var(--fs-xs); font-weight:700; padding:4px 0;">${weekdayShort(i).toUpperCase()}</div>`).join('')}
          ${cells.map((d) => {
            if (!d) return `<div></div>`;
            const dateISO = toISODate(new Date(viewYear, viewMonth, d));
            const planDay = planByDate[dateISO];
            const dayEvents = events.filter((e) => e.date === dateISO);
            const isToday = dateISO === toISODate(today);
            const anyMiniExam = planDay && planDay.languages.some((b) => b.miniExam);
            return `
              <div class="cal-cell" data-date="${dateISO}" style="min-height:86px; border:1px solid var(--border-1); border-radius:8px; padding:6px; cursor:pointer; background:${isToday ? 'var(--accent-soft)' : 'var(--bg-2)'}; transition:border-color .15s;">
                <div class="flex-between">
                  <span style="font-size:var(--fs-xs); font-weight:${isToday ? '800' : '600'}; color:${isToday ? 'var(--accent)' : 'var(--text-1)'};">${d}</span>
                  ${anyMiniExam ? `<span title="Mini examen" style="font-size:11px;">📝</span>` : ''}
                </div>
                ${planDay ? `<div class="flex gap-1 mt-2" style="flex-wrap:wrap;">${planDay.isReviewDay ? `<span class="badge" style="font-size:9px; padding:2px 5px;">🔁</span>` : planDay.languages.map((b) => `<span class="badge ${LANGUAGES[b.language].badgeClass}" style="font-size:9px; padding:2px 5px;">${LANGUAGES[b.language].flag}${b.status === 'completado' ? '✓' : ''}</span>`).join('')}</div>` : ''}
                ${dayEvents.map((e) => `<div style="font-size:10px; margin-top:3px; color:var(--text-2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">• ${esc(e.title)}</div>`).join('')}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    container.querySelector('#prev-month').addEventListener('click', () => { viewMonth -= 1; if (viewMonth < 0) { viewMonth = 11; viewYear -= 1; } draw(); });
    container.querySelector('#next-month').addEventListener('click', () => { viewMonth += 1; if (viewMonth > 11) { viewMonth = 0; viewYear += 1; } draw(); });
    container.querySelector('#today-btn').addEventListener('click', () => { viewYear = today.getFullYear(); viewMonth = today.getMonth(); draw(); });
    container.querySelector('#add-event-btn').addEventListener('click', () => openEventForm());
    container.querySelectorAll('.cal-cell').forEach((cell) => cell.addEventListener('click', () => openDayDetail(cell.dataset.date)));
  }

  function openDayDetail(dateISO) {
    const planDay = State.getPlan().find((d) => d.date === dateISO);
    const events = State.getEvents().filter((e) => e.date === dateISO);
    openModal({
      title: dateISO,
      bodyHTML: `
        ${planDay ? `
          ${planDay.isReviewDay ? '<p><strong>🔁 Día de repaso general</strong></p>' : ''}
          ${planDay.languages.map((b) => `
            <div class="list-item">
              <span><span class="badge ${LANGUAGES[b.language].badgeClass}">${LANGUAGES[b.language].flag} ${LANGUAGES[b.language].name}</span> ${esc(b.topic)}</span>
              <span class="badge ${b.status === 'completado' ? 'badge-success' : 'badge-warning'}">${b.status}</span>
            </div>
          `).join('')}
        ` : '<p class="text-muted">Este día está fuera del plan de 365 días.</p>'}
        <hr class="divider" />
        <p style="font-weight:700; margin-bottom:6px;">Eventos</p>
        ${events.length ? events.map((e) => `<div class="list-item"><span>${esc(e.title)}</span></div>`).join('') : '<p class="text-muted">Sin eventos.</p>'}
      `,
      actions: [
        ...(planDay ? [{ label: 'Ir al plan del día', className: 'btn-primary', onClick: () => navigate(`#/day-plan/index/${planDay.index}`) }] : []),
        { label: 'Cerrar', className: 'btn-ghost' },
      ],
    });
  }

  function openEventForm() {
    const formId = 'event-form';
    openModal({
      title: 'Añadir evento',
      bodyHTML: `
        <form id="${formId}">
          <div class="field"><label>Título</label><input type="text" name="title" required placeholder="Ej: Examen oficial TOPIK" /></div>
          <div class="field"><label>Fecha</label><input type="date" name="date" required value="${toISODate(new Date(viewYear, viewMonth, today.getDate()))}" /></div>
          <div class="field"><label>Tipo</label>
            <select name="type">
              <option value="evento">Evento</option>
              <option value="examen">Examen</option>
              <option value="repaso">Repaso</option>
            </select>
          </div>
        </form>
      `,
      actions: [
        { label: 'Cancelar', className: 'btn-ghost' },
        {
          label: 'Guardar',
          className: 'btn-primary',
          onClick: () => {
            const form = document.getElementById(formId);
            const data = Object.fromEntries(new FormData(form).entries());
            const events = State.getEvents();
            events.push({ id: uid('evt'), ...data });
            State.setEvents(events);
            showToast('Evento añadido', 'success');
            draw();
          },
        },
      ],
    });
  }

  draw();
}
