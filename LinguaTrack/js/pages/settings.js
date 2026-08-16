/**
 * settings.js — configuración del modo de estudio: los 3 idiomas se
 * estudian todos los días (30 min cada uno), así que lo único
 * configurable del calendario es qué día de la semana es tu día de
 * repaso/consolidación. También metas diarias, apariencia, y utilidades
 * de datos (exportar/importar/restablecer), todo persistido en LocalStorage.
 */
import { State, regeneratePlan } from '../core/state.js';
import { Storage } from '../core/storage.js';
import { LANGUAGE_LIST } from '../data/languages.js';
import { showToast } from '../components/toast.js';
import { openModal } from '../components/modal.js';
import { Icon } from '../components/icons.js';

const DAY_LABELS = { mon: 'Lunes', tue: 'Martes', wed: 'Miércoles', thu: 'Jueves', fri: 'Viernes', sat: 'Sábado', sun: 'Domingo' };

export function renderSettings(container) {
  function draw() {
    const settings = State.getSettings();
    const meta = State.getPlanMeta();

    container.innerHTML = `
      <div class="card mb-4">
        <div class="card-title"><h3>Modo de estudio: los 3 idiomas todos los días</h3></div>
        <p class="text-muted">Cada día del plan incluye una sesión de 30 min de ${LANGUAGE_LIST.map((l) => `${l.flag} ${l.name}`).join(', ')} (90 min/día en total). Lo único que puedes elegir es qué día de la semana es tu <strong>día de repaso</strong> (sin contenido nuevo, para consolidar).</p>
        <div class="field" style="max-width:280px;">
          <label>Día de repaso semanal</label>
          <select id="review-day-select">
            ${Object.entries(DAY_LABELS).map(([key, label]) => `<option value="${key}" ${settings.reviewWeekday === key ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </div>
        <div class="flex gap-2 mt-3">
          <button class="btn btn-primary" id="save-schedule-btn">Guardar y regenerar plan</button>
        </div>
        <p class="text-dim mt-2" style="margin:0;">Fecha de inicio del plan: <strong>${meta.startDate}</strong></p>
      </div>

      <div class="card mb-4">
        <div class="card-title"><h3>Minutos diarios por idioma</h3></div>
        <div class="grid grid-3">
          <div class="card stat-card"><div class="stat-value">30 min</div><div class="stat-label">🇬🇧 Inglés / día</div></div>
          <div class="card stat-card"><div class="stat-value">30 min</div><div class="stat-label">🇰🇷 Coreano / día</div></div>
          <div class="card stat-card"><div class="stat-value">30 min</div><div class="stat-label">🇨🇳 Chino / día</div></div>
        </div>
      </div>

      <div class="grid grid-2 mb-4">
        <div class="card">
          <div class="card-title"><h3>Metas de estudio</h3></div>
          <div class="field"><label>Minutos diarios objetivo (total, los 3 idiomas)</label><input type="number" id="daily-goal" min="15" value="${settings.dailyGoalMinutes}" /></div>
          <div class="field"><label>Nivel objetivo</label>
            <select id="target-level">${['A1', 'A2', 'B1', 'B2', 'C1'].map((l) => `<option ${settings.goals.targetLevel === l ? 'selected' : ''}>${l}</option>`).join('')}</select>
          </div>
          <div class="field"><label>Palabras objetivo (total)</label><input type="number" id="target-words" value="${settings.goals.targetWords}" /></div>
          <button class="btn btn-secondary" id="save-goals-btn">Guardar metas</button>
        </div>

        <div class="card">
          <div class="card-title"><h3>Apariencia</h3></div>
          <div class="field"><label>Tema</label>
            <select id="theme-select"><option value="dark" selected>Oscuro (Notion / GitHub / Discord)</option></select>
          </div>
          <p class="text-muted" style="margin-bottom:0;">Esta versión está optimizada para modo oscuro, tal como se solicitó en el diseño.</p>
          <div class="checkbox-row mt-3"><input type="checkbox" id="notif-toggle" ${settings.notificationsEnabled ? 'checked' : ''} /> Activar recordatorios de repaso y objetivos</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><h3>Datos</h3></div>
        <p class="text-muted">Toda tu información se guarda en el navegador (LocalStorage). Puedes exportarla como respaldo o restablecer la app.</p>
        <div class="flex gap-2" style="flex-wrap:wrap;">
          <button class="btn btn-secondary" id="export-btn">${Icon.download} Exportar datos (JSON)</button>
          <button class="btn btn-secondary" id="import-btn">${Icon.upload} Importar datos</button>
          <input type="file" id="import-file" accept="application/json" class="hidden" />
          <button class="btn btn-danger" id="reset-btn">${Icon.trash} Restablecer aplicación</button>
        </div>
      </div>
    `;

    container.querySelector('#save-schedule-btn').addEventListener('click', () => {
      const reviewWeekday = document.getElementById('review-day-select').value;
      const s = State.getSettings();
      s.reviewWeekday = reviewWeekday;
      State.setSettings(s);
      regeneratePlan(State.getPlanMeta().startDate, reviewWeekday);
      showToast('Día de repaso actualizado: plan de 365 días regenerado', 'success');
      draw();
    });

    container.querySelector('#save-goals-btn').addEventListener('click', () => {
      const s = State.getSettings();
      s.dailyGoalMinutes = Number(document.getElementById('daily-goal').value) || 90;
      s.goals.targetLevel = document.getElementById('target-level').value;
      s.goals.targetWords = Number(document.getElementById('target-words').value) || 3000;
      s.notificationsEnabled = document.getElementById('notif-toggle').checked;
      State.setSettings(s);
      showToast('Metas guardadas', 'success');
    });

    container.querySelector('#export-btn').addEventListener('click', () => {
      const data = Storage.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `linguatrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Datos exportados', 'success');
    });

    container.querySelector('#import-btn').addEventListener('click', () => document.getElementById('import-file').click());
    container.querySelector('#import-file').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          Storage.importAll(data);
          showToast('Datos importados correctamente. Recargando...', 'success');
          setTimeout(() => location.reload(), 1200);
        } catch (err) {
          showToast('El archivo no es un backup válido', 'danger');
        }
      };
      reader.readAsText(file);
    });

    container.querySelector('#reset-btn').addEventListener('click', () => {
      openModal({
        title: 'Restablecer aplicación',
        bodyHTML: '<p>Esto borrará <strong>todo</strong> tu progreso, vocabulario y configuración de este navegador. Esta acción no se puede deshacer.</p>',
        actions: [
          { label: 'Cancelar', className: 'btn-ghost' },
          { label: 'Sí, borrar todo', className: 'btn-danger', onClick: () => { Storage.clearAll(); location.reload(); } },
        ],
      });
    });
  }

  draw();
}
