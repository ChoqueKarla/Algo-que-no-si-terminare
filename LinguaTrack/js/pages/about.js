/**
 * about.js — página estática con información de la app.
 */
import { LANGUAGE_LIST } from '../data/languages.js';
import { Icon } from '../components/icons.js';

export function renderAbout(container) {
  container.innerHTML = `
    <div class="card mb-4">
      <h1>LinguaTrack</h1>
      <p>Sistema personal de seguimiento de aprendizaje de idiomas, construido 100% con HTML5, CSS3 y JavaScript vanilla (ES6+ con módulos), sin frameworks ni dependencias externas. Toda la información se guarda en LocalStorage, directamente en tu navegador.</p>
      <div class="flex gap-2" style="flex-wrap:wrap;">
        ${LANGUAGE_LIST.map((l) => `<span class="badge ${l.badgeClass}">${l.flag} ${l.name}</span>`).join('')}
      </div>
    </div>

    <div class="grid grid-3 mb-4">
      <div class="card"><div class="stat-icon">${Icon.calendar}</div><h3>Plan de 365 días</h3><p class="text-muted">Generado algorítmicamente a partir de tu horario semanal, con dificultad progresiva de A0 a B2.</p></div>
      <div class="card"><div class="stat-icon">${Icon.repeat}</div><h3>Repetición espaciada</h3><p class="text-muted">Intervalos de 1, 3, 7, 15, 30, 60, 90, 180 y 365 días para el vocabulario.</p></div>
      <div class="card"><div class="stat-icon">${Icon.barChart}</div><h3>Estadísticas reales</h3><p class="text-muted">Gráficos en Canvas nativo, sin librerías, calculados a partir de tus datos guardados.</p></div>
    </div>

    <div class="card">
      <div class="card-title"><h3>Arquitectura</h3></div>
      <p>La app sigue una arquitectura modular: <code>core/</code> (estado, router, utilidades, LocalStorage), <code>data/</code> (idiomas, fases, generador del plan, semillas), <code>components/</code> (sidebar, navbar, modal, toasts, gráficos) y <code>pages/</code> (una por cada sección). Añadir un idioma nuevo requiere solo una entrada en <code>data/languages.js</code>.</p>
    </div>
  `;
}
