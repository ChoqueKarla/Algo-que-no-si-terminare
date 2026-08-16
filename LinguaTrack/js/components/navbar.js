/**
 * navbar.js — barra superior con título de la página actual, reloj en
 * vivo, buscador global de vocabulario y accesos a notificaciones/perfil.
 */
import { Icon } from './icons.js';
import { onRouteChange, navigate } from '../core/router.js';
import { State } from '../core/state.js';
import { getDueWords } from '../core/spacedRepetition.js';
import { toISODate, formatTime, formatLongDate, cap } from '../core/utils.js';
import { openModal } from './modal.js';

const PAGE_META = {
  dashboard: ['Dashboard', 'Tu resumen de aprendizaje de hoy'],
  calendar: ['Calendario', 'Visualiza tu año de estudio completo'],
  planner: ['Planificador', 'Qué toca estudiar hoy'],
  progress: ['Mi progreso', 'Avance general en tus 3 idiomas'],
  level: ['Mi nivel', 'De A0 a B2 en cada idioma'],
  'year-plan': ['Plan anual', 'Los 365 días de un vistazo'],
  'month-plan': ['Plan mensual', 'Tu mes de estudio'],
  'week-plan': ['Plan semanal', 'Tu semana de estudio'],
  'day-plan': ['Plan diario', 'Detalle de un día del plan'],
  vocabulary: ['Vocabulario', 'Tu banco de palabras'],
  grammar: ['Gramática', 'Temas gramaticales por fase'],
  listening: ['Listening', 'Registro de comprensión auditiva'],
  speaking: ['Speaking', 'Registro de práctica oral'],
  reading: ['Reading', 'Registro de lectura'],
  writing: ['Writing', 'Registro de escritura'],
  pronunciation: ['Pronunciación', 'Sonidos difíciles y su progreso'],
  shadowing: ['Shadowing', 'Registro de shadowing'],
  exams: ['Exámenes', 'Semanales, mensuales, trimestrales y finales'],
  reviews: ['Repasos', 'Repetición espaciada del vocabulario'],
  achievements: ['Logros', 'Tus medallas desbloqueadas'],
  statistics: ['Estadísticas', 'Gráficos de tu evolución'],
  settings: ['Configuración', 'Personaliza tu plan de estudio'],
  profile: ['Perfil', 'Tu información personal'],
  about: ['Acerca de', 'Sobre esta aplicación'],
};

export function renderNavbar() {
  const root = document.getElementById('navbar');
  root.innerHTML = `
    <div class="navbar-left">
      <button class="icon-btn mobile-toggle" id="mobile-menu-btn">${Icon.menu}</button>
      <div>
        <div id="page-title">Dashboard</div>
        <div id="page-subtitle" class="text-muted"></div>
      </div>
    </div>
    <div class="navbar-right">
      <div class="navbar-search">
        ${Icon.search}
        <input type="text" id="global-search" placeholder="Buscar vocabulario..." />
      </div>
      <div id="live-clock" class="text-muted" style="font-family:var(--font-mono); font-size:var(--fs-sm); min-width:64px; text-align:center;">--:--</div>
      <button class="icon-btn" id="notif-btn" data-tip="Repasos pendientes">${Icon.bell}<span class="dot hidden" id="notif-dot"></span></button>
      <div class="avatar-chip" id="avatar-chip">
        <div class="avatar" id="avatar-initial">E</div>
        <span id="avatar-name" style="font-size:var(--fs-sm); font-weight:600;">Estudiante</span>
      </div>
    </div>
  `;

  document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('app-shell').classList.toggle('mobile-open');
  });

  document.getElementById('avatar-chip').addEventListener('click', () => navigate('#/profile'));

  document.getElementById('notif-btn').addEventListener('click', () => showNotifications());

  document.getElementById('global-search').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      navigate(`#/vocabulary/q/${encodeURIComponent(e.target.value.trim())}`);
    }
  });

  updateProfileChip();
  updateClock();
  setInterval(updateClock, 1000 * 30);
  updateNotifDot();

  onRouteChange((name) => {
    const meta = PAGE_META[name] || [cap(name), ''];
    document.getElementById('page-title').textContent = meta[0];
    document.getElementById('page-subtitle').textContent = meta[1];
    updateNotifDot();
  });

  // Set initial title
  const initial = PAGE_META[location.hash.replace('#/', '').split('/')[0]] || PAGE_META.dashboard;
  document.getElementById('page-title').textContent = initial[0];
  document.getElementById('page-subtitle').textContent = initial[1];
}

export function updateProfileChip() {
  const profile = State.getProfile();
  const nameEl = document.getElementById('avatar-name');
  const initEl = document.getElementById('avatar-initial');
  if (nameEl) nameEl.textContent = profile.name;
  if (initEl) initEl.textContent = (profile.avatarInitial || profile.name[0] || 'E').toUpperCase();
}

function updateClock() {
  const el1 = document.getElementById('live-clock');
  if (el1) el1.textContent = formatTime(new Date());
}

function updateNotifDot() {
  const vocab = State.getVocabulary();
  const all = Object.values(vocab).flat();
  const due = getDueWords(all, toISODate(new Date()));
  const dot = document.getElementById('notif-dot');
  if (dot) dot.classList.toggle('hidden', due.length === 0);
}

function showNotifications() {
  const vocab = State.getVocabulary();
  const all = Object.values(vocab).flat();
  const due = getDueWords(all, toISODate(new Date()));
  const plan = State.getPlan();
  const todayIdx = State.todayPlanIndex();
  const todayDay = todayIdx ? plan.find((d) => d.index === todayIdx) : null;
  const upcomingExam = plan.find((d) => d.status !== 'completado' && d.languages.some((b) => b.miniExam));

  openModal({
    title: 'Notificaciones',
    bodyHTML: `
      <div class="flex-col gap-3">
        ${todayDay && todayDay.status === 'pendiente' ? `<div class="list-item"><span>📌 Tienes el plan de hoy pendiente</span></div>` : ''}
        <div class="list-item"><span>🔁 ${due.length} palabra(s) para repasar hoy</span></div>
        ${upcomingExam ? `<div class="list-item"><span>📝 Próximo mini examen: Día ${upcomingExam.index} (${upcomingExam.date})</span></div>` : '<div class="list-item"><span>📝 No hay exámenes pendientes por ahora</span></div>'}
      </div>
    `,
    actions: [{ label: 'Ir a Repasos', className: 'btn-primary', onClick: () => navigate('#/reviews') }],
  });
}
