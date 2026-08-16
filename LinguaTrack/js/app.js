/**
 * app.js — punto de entrada. Siembra datos, monta sidebar/navbar y
 * registra todas las rutas de la SPA.
 */
import { ensureSeeded, evaluateAchievements } from './core/state.js';
import { registerRoute, registerNotFound, startRouter } from './core/router.js';
import { renderSidebar } from './components/sidebar.js';
import { renderNavbar } from './components/navbar.js';

import { renderDashboard } from './pages/dashboard.js';
import { renderCalendar } from './pages/calendar.js';
import { renderPlanner } from './pages/planner.js';
import { renderProgress } from './pages/progress.js';
import { renderLevel } from './pages/level.js';
import { renderYearPlan } from './pages/yearPlan.js';
import { renderMonthPlan } from './pages/monthPlan.js';
import { renderWeekPlan } from './pages/weekPlan.js';
import { renderDayPlan } from './pages/dayPlan.js';
import { renderVocabulary } from './pages/vocabulary.js';
import { renderGrammar } from './pages/grammar.js';
import { renderListening } from './pages/listening.js';
import { renderSpeaking } from './pages/speaking.js';
import { renderReading } from './pages/reading.js';
import { renderWriting } from './pages/writing.js';
import { renderPronunciation } from './pages/pronunciation.js';
import { renderShadowing } from './pages/shadowing.js';
import { renderExams } from './pages/exams.js';
import { renderReviews } from './pages/reviews.js';
import { renderAchievements } from './pages/achievements.js';
import { renderStatistics } from './pages/statistics.js';
import { renderSettings } from './pages/settings.js';
import { renderProfile } from './pages/profile.js';
import { renderAbout } from './pages/about.js';

function boot() {
  try {
    ensureSeeded();
    evaluateAchievements();

    renderSidebar();
    renderNavbar();

    registerRoute('dashboard', renderDashboard);
    registerRoute('calendar', renderCalendar);
    registerRoute('planner', renderPlanner);
    registerRoute('progress', renderProgress);
    registerRoute('level', renderLevel);
    registerRoute('year-plan', renderYearPlan);
    registerRoute('month-plan', renderMonthPlan);
    registerRoute('week-plan', renderWeekPlan);
    registerRoute('day-plan', renderDayPlan);
    registerRoute('vocabulary', renderVocabulary);
    registerRoute('grammar', renderGrammar);
    registerRoute('listening', renderListening);
    registerRoute('speaking', renderSpeaking);
    registerRoute('reading', renderReading);
    registerRoute('writing', renderWriting);
    registerRoute('pronunciation', renderPronunciation);
    registerRoute('shadowing', renderShadowing);
    registerRoute('exams', renderExams);
    registerRoute('reviews', renderReviews);
    registerRoute('achievements', renderAchievements);
    registerRoute('statistics', renderStatistics);
    registerRoute('settings', renderSettings);
    registerRoute('profile', renderProfile);
    registerRoute('about', renderAbout);

    registerNotFound((container) => {
      container.innerHTML = `
        <div class="empty-state">
          <h3>Página no encontrada</h3>
          <p>Usa el menú lateral para navegar.</p>
        </div>
      `;
    });

    startRouter();

    // Cierra el sidebar móvil al hacer click fuera
    document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
      document.getElementById('app-shell').classList.remove('mobile-open');
    });
  } catch (err) {
    // Red de seguridad: si algo falla de forma inesperada al arrancar,
    // mostramos una pantalla de recuperación en vez de dejar la página
    // completamente en blanco sin ninguna explicación ni salida.
    console.error('Error al iniciar LinguaTrack:', err);
    document.body.innerHTML = `
      <div style="min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0b0d10; color:#f4f6f8; font-family:sans-serif; padding:24px;">
        <div style="max-width:520px; text-align:center;">
          <h1 style="font-size:1.6rem; margin-bottom:12px;">Algo salió mal al iniciar la app</h1>
          <p style="color:#8b93a1; margin-bottom:20px;">Esto suele pasar cuando quedan datos guardados de una versión anterior incompatible. Puedes intentar restablecer los datos guardados en este navegador (no afecta el archivo descargado, solo lo que está guardado localmente).</p>
          <pre style="text-align:left; background:#161a1f; padding:12px; border-radius:8px; font-size:12px; overflow:auto; margin-bottom:20px; color:#ef5b5b;">${(err && err.message) || err}</pre>
          <button id="recovery-reset-btn" style="background:#4c8dff; color:#07101f; border:none; padding:10px 20px; border-radius:8px; font-weight:700; cursor:pointer;">Restablecer datos y recargar</button>
        </div>
      </div>
    `;
    document.getElementById('recovery-reset-btn').addEventListener('click', () => {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('lla_'))
        .forEach((k) => localStorage.removeItem(k));
      location.reload();
    });
  }
}

document.addEventListener('DOMContentLoaded', boot);
