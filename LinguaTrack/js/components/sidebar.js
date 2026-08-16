/**
 * sidebar.js — barra lateral de navegación, agrupada por secciones.
 */
import { Icon } from './icons.js';
import { onRouteChange, currentRouteName, navigate } from '../core/router.js';
import { State } from '../core/state.js';

const NAV_GROUPS = [
  {
    title: 'General',
    items: [
      ['dashboard', 'Dashboard', Icon.dashboard],
      ['calendar', 'Calendario', Icon.calendar],
      ['planner', 'Planificador', Icon.planner],
      ['progress', 'Mi progreso', Icon.progress],
      ['level', 'Mi nivel', Icon.level],
    ],
  },
  {
    title: 'Plan de estudio',
    items: [
      ['year-plan', 'Plan anual', Icon.calendar],
      ['month-plan', 'Plan mensual', Icon.calendar],
      ['week-plan', 'Plan semanal', Icon.calendar],
      ['day-plan', 'Plan diario', Icon.planner],
    ],
  },
  {
    title: 'Habilidades',
    items: [
      ['vocabulary', 'Vocabulario', Icon.book],
      ['grammar', 'Gramática', Icon.grammar],
      ['listening', 'Listening', Icon.headphones],
      ['speaking', 'Speaking', Icon.mic],
      ['reading', 'Reading', Icon.bookOpen],
      ['writing', 'Writing', Icon.pen],
      ['pronunciation', 'Pronunciación', Icon.volume],
      ['shadowing', 'Shadowing', Icon.repeat],
    ],
  },
  {
    title: 'Evaluación',
    items: [
      ['exams', 'Exámenes', Icon.fileText],
      ['reviews', 'Repasos', Icon.refresh],
      ['achievements', 'Logros', Icon.trophy],
      ['statistics', 'Estadísticas', Icon.barChart],
    ],
  },
  {
    title: 'Cuenta',
    items: [
      ['settings', 'Configuración', Icon.sliders],
      ['profile', 'Perfil', Icon.user],
      ['about', 'Acerca de', Icon.info],
    ],
  },
];

export function renderSidebar() {
  const root = document.getElementById('sidebar');
  const settings = State.getSettings();

  root.innerHTML = `
    <div class="sidebar-brand">
      <div class="brand-mark">L</div>
      <span class="brand-text">LinguaTrack</span>
    </div>
    <nav class="sidebar-nav">
      ${NAV_GROUPS.map((group) => `
        <div class="nav-section-title">${group.title}</div>
        ${group.items.map(([route, label, icon]) => `
          <div class="nav-item" data-route="${route}" data-tip="${label}">
            <span class="nav-icon">${icon}</span>
            <span class="nav-label">${label}</span>
          </div>
        `).join('')}
      `).join('')}
    </nav>
    <div class="sidebar-footer">
      <button class="collapse-btn" id="sidebar-collapse-btn" title="Colapsar/expandir">${Icon.chevronLeft}</button>
    </div>
  `;

  root.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      navigate(`#/${item.dataset.route}`);
      document.getElementById('app-shell').classList.remove('mobile-open');
    });
  });

  document.getElementById('sidebar-collapse-btn').addEventListener('click', () => {
    const shell = document.getElementById('app-shell');
    shell.classList.toggle('sidebar-collapsed');
    const s = State.getSettings();
    s.sidebarCollapsed = shell.classList.contains('sidebar-collapsed');
    State.setSettings(s);
  });

  if (settings.sidebarCollapsed) {
    document.getElementById('app-shell').classList.add('sidebar-collapsed');
  }

  highlightActive();
  onRouteChange(highlightActive);
}

function highlightActive() {
  const active = currentRouteName();
  document.querySelectorAll('#sidebar .nav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.route === active);
  });
}
