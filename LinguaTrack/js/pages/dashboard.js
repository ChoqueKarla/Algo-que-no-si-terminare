/**
 * dashboard.js — pantalla principal: estado del día (los 3 idiomas),
 * progreso anual, rachas, pendientes, últimos estudios y frase motivacional.
 */
import { State, computeStats, evaluateAchievements } from '../core/state.js';
import { LANGUAGES } from '../data/languages.js';
import { getDueWords } from '../core/spacedRepetition.js';
import { toISODate, formatLongDate, formatTime, pct, esc } from '../core/utils.js';
import { quoteForDay } from '../data/quotes.js';
import { drawProgressRing } from '../components/charts.js';
import { Icon } from '../components/icons.js';
import { navigate } from '../core/router.js';
import { showToast, celebrate } from '../components/toast.js';

export function renderDashboard(container) {
  const stats = computeStats();
  const plan = State.getPlan();
  const todayIdx = State.todayPlanIndex();
  const todayDay = todayIdx ? plan.find((d) => d.index === todayIdx) : null;
  const vocab = State.getVocabulary();
  const allWords = Object.values(vocab).flat();
  const dueToday = getDueWords(allWords, toISODate(new Date()));
  const logs = State.getLogs();
  const recentLogs = Object.entries(logs)
    .flatMap(([type, arr]) => arr.map((e) => ({ ...e, type })))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 6);
  const nextExamDay = plan.find((d) => d.status !== 'completado' && d.languages.some((b) => b.miniExam));
  const profile = State.getProfile();
  const now = new Date();
  const dailyGoal = State.getSettings().dailyGoalMinutes;

  const skillKeys = ['listening', 'speaking', 'reading', 'writing', 'pronunciation', 'shadowing'];
  const skillIcons = { listening: Icon.headphones, speaking: Icon.mic, reading: Icon.bookOpen, writing: Icon.pen, pronunciation: Icon.volume, shadowing: Icon.repeat };

  const todayDoneMinutes = todayDay ? todayDay.languages.filter((b) => b.status === 'completado').reduce((s, b) => s + b.duration, 0) : 0;

  container.innerHTML = `
    <div class="card mb-4" style="background: linear-gradient(135deg, var(--bg-2), var(--bg-3)); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px;">
      <div>
        <div class="text-muted" style="font-size:var(--fs-sm);">${formatLongDate(now)} · <span id="dash-clock">${formatTime(now)}</span></div>
        <h1 style="margin-top:6px;">Hola, ${profile.name} 👋</h1>
        <p style="max-width:560px;">${quoteForDay(todayIdx || 0)}</p>
      </div>
      <div class="flex-col" style="align-items:center;">
        <div class="ring-wrap"><canvas id="year-ring" width="110" height="110"></canvas>
          <div class="ring-label"><span class="ring-value">${pct(stats.daysCompleted, 365)}%</span><span class="ring-caption">del año</span></div>
        </div>
      </div>
    </div>

    <div class="grid grid-4 mb-4 stagger">
      <div class="card stat-card"><div class="stat-icon">${Icon.flame}</div><div class="stat-value">${stats.streak}</div><div class="stat-label">Racha de días (3 idiomas)</div></div>
      <div class="card stat-card"><div class="stat-icon">${Icon.clock}</div><div class="stat-value">${stats.totalHours}h</div><div class="stat-label">Horas estudiadas</div></div>
      <div class="card stat-card"><div class="stat-icon">${Icon.book}</div><div class="stat-value">${stats.wordsLearned}</div><div class="stat-label">Palabras aprendidas</div></div>
      <div class="card stat-card"><div class="stat-icon">${Icon.grammar}</div><div class="stat-value">${stats.grammarMastered}/${stats.grammarTotal}</div><div class="stat-label">Gramática completada</div></div>
    </div>

    <div class="grid split-main">
      <div class="flex-col gap-4">
        <div class="card">
          <div class="card-title"><h3>Hoy — Día ${todayDay ? todayDay.index : '—'}/365 ${todayDay?.isReviewDay ? '· 🔁 día de repaso' : ''}</h3>
            <span class="badge ${todayDay?.status === 'completado' ? 'badge-success' : 'badge-warning'}">${todayDay ? todayDay.status : '—'}</span>
          </div>
          <div id="today-blocks" class="flex-col gap-3"></div>
        </div>

        <div class="card">
          <div class="card-title"><h3>Habilidades — sesiones registradas</h3></div>
          <div class="grid grid-3 gap-3">
            ${skillKeys.map((k) => `
              <div class="flex gap-3" style="align-items:center;">
                <div class="stat-icon" style="margin-bottom:0;">${skillIcons[k]}</div>
                <div>
                  <div style="font-weight:700;">${logs[k]?.length || 0}</div>
                  <div class="text-muted" style="font-size:var(--fs-xs); text-transform:capitalize;">${k}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-title"><h3>Últimos estudios</h3></div>
          ${recentLogs.length === 0 ? '<p class="text-muted">Aún no registraste sesiones. ¡Empieza hoy!</p>' : recentLogs.map((l) => `
            <div class="list-item">
              <span>${skillIcons[l.type] || ''} <strong style="text-transform:capitalize;">${l.type}</strong> · ${LANGUAGES[l.language]?.name || l.language}</span>
              <span class="text-muted">${l.date} · ${l.minutes || 0} min</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="flex-col gap-4">
        <div class="card">
          <div class="card-title"><h3>Pendientes de hoy</h3></div>
          <div class="flex-col gap-2">
            ${todayDay && todayDay.status !== 'completado' ? `<div class="list-item"><span>📌 ${todayDay.languages.filter((b) => b.status !== 'completado').length} idioma(s) pendiente(s) hoy</span></div>` : `<div class="list-item"><span class="text-muted">✅ Los 3 idiomas de hoy completados</span></div>`}
            <div class="list-item"><span>🔁 ${dueToday.length} palabra(s) para repasar</span></div>
            ${nextExamDay ? `<div class="list-item"><span>📝 Próximo examen: día ${nextExamDay.index}</span></div>` : ''}
          </div>
        </div>

        <div class="card">
          <div class="card-title"><h3>Objetivo diario</h3></div>
          <p class="text-muted" style="margin-bottom:8px;">${todayDoneMinutes} / ${dailyGoal} minutos completados hoy</p>
          <div class="progress-track"><div class="progress-fill" style="width:${pct(todayDoneMinutes, dailyGoal)}%"></div></div>
        </div>

        <div class="card">
          <div class="card-title"><h3>Próximos 7 días</h3></div>
          <div class="flex-col gap-2">
            ${nextDays(7).map((d) => `
              <div class="list-item">
                <span>Día ${d.index} ${d.isReviewDay ? '· 🔁 Repaso' : `· ${d.languages.map((b) => LANGUAGES[b.language].flag).join(' ')}`}</span>
                <span class="badge ${d.status === 'completado' ? 'badge-success' : 'badge-warning'}">${d.status}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  drawProgressRing(document.getElementById('year-ring'), pct(stats.daysCompleted, 365), '#4c8dff');
  renderTodayBlocks(document.getElementById('today-blocks'), todayDay);

  function nextDays(n) {
    if (!todayIdx) return [];
    return plan.filter((d) => d.index >= todayIdx && d.index < todayIdx + n);
  }
}

function renderTodayBlocks(el, day) {
  if (!day) {
    el.innerHTML = `<div class="empty-state">${Icon.calendar}<h3>Fuera del plan de 365 días</h3><p>Ajusta la fecha de inicio en Configuración para ver el día correspondiente.</p></div>`;
    return;
  }

  el.innerHTML = day.languages.map((block) => {
    const lang = LANGUAGES[block.language];
    return `
      <div class="card" style="background:var(--bg-3);">
        <div class="flex-between mb-2">
          <span class="badge ${lang.badgeClass}">${lang.flag} ${lang.name}</span>
          <span class="badge ${block.status === 'completado' ? 'badge-success' : 'badge-warning'}">${block.status}</span>
        </div>
        <h3 style="margin-bottom:2px;">${block.topic}</h3>
        <p class="text-muted" style="margin-bottom:8px;">${block.objective}</p>
        ${block.keyPhrases && block.keyPhrases.length ? `
          <div style="background:var(--bg-2); border-radius:8px; padding:10px 12px; margin-bottom:10px;">
            <p style="font-weight:700; margin:0 0 2px;">${esc(block.keyPhrases[0][0])}</p>
            <p class="text-muted" style="margin:0; font-size:var(--fs-sm);">${esc(block.keyPhrases[0][2])}</p>
            ${block.keyPhrases.length > 1 ? `<p class="text-dim" style="margin:4px 0 0; font-size:var(--fs-xs);">+${block.keyPhrases.length - 1} frase(s) más en la ficha completa</p>` : ''}
          </div>
        ` : ''}
        <div class="flex gap-2 mb-3" style="flex-wrap:wrap;">
          <span class="badge">${Icon.clock} ${block.duration} min</span>
          <span class="badge badge-accent">${block.level}</span>
          ${block.miniExam ? `<span class="badge badge-warning">Mini examen hoy</span>` : ''}
          ${block.scriptPhase ? `<span class="badge">✍️ Sistema de escritura</span>` : ''}
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary btn-sm" data-goplan="${block.language}">Ver ficha completa</button>
          ${block.status !== 'completado' ? `<button class="btn btn-primary btn-sm" data-done="${block.language}">${Icon.check} Marcar completado</button>` : ''}
        </div>
      </div>
    `;
  }).join('');

  el.querySelectorAll('[data-goplan]').forEach((btn) => btn.addEventListener('click', () => navigate(`#/day-plan/index/${day.index}/lang/${btn.dataset.goplan}`)));
  el.querySelectorAll('[data-done]').forEach((btn) => btn.addEventListener('click', () => {
    State.markLanguageStatus(day.index, btn.dataset.done, 'completado');
    const fresh = evaluateAchievements();
    showToast('¡Sesión completada!', 'success');
    if (fresh.length) celebrate();
    navigate('#/dashboard');
  }));
}
