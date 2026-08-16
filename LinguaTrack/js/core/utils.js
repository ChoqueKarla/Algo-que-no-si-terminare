/**
 * utils.js — helpers genéricos usados en toda la aplicación.
 */

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function pad2(n) { return String(n).padStart(2, '0'); }

/** Formatea una Date a 'YYYY-MM-DD' (clave canónica de día usada en toda la app). */
export function toISODate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function daysBetween(a, b) {
  const MS = 1000 * 60 * 60 * 24;
  const d1 = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const d2 = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((d2 - d1) / MS);
}

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
export function weekdayKey(date) { return WEEKDAY_KEYS[date.getDay()]; }

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const WEEKDAYS_ES = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const WEEKDAYS_ES_SHORT = ['dom','lun','mar','mié','jue','vie','sáb'];

export function formatLongDate(date) {
  return `${WEEKDAYS_ES[date.getDay()]} ${date.getDate()} de ${MONTHS_ES[date.getMonth()]}, ${date.getFullYear()}`;
}
export function formatShortDate(date) {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}
export function monthName(i) { return MONTHS_ES[i]; }
export function weekdayShort(i) { return WEEKDAYS_ES_SHORT[i]; }

export function formatTime(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

export function pct(part, total) {
  if (!total) return 0;
  return clamp(Math.round((part / total) * 100), 0, 100);
}

export function minutesToHM(mins) {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h <= 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/** Debounce simple para inputs de búsqueda. */
export function debounce(fn, wait = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/** Escapa texto para insertarlo de forma segura en innerHTML. */
export function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Crea un elemento a partir de un string HTML (para insertar nodos sueltos). */
export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

/** Elige aleatoriamente un elemento de un array (determinista si se pasa seed). */
export function pick(arr, i) { return arr[i % arr.length]; }

/** Capitaliza la primera letra. */
export function cap(str) { return str ? str[0].toUpperCase() + str.slice(1) : str; }
