/**
 * router.js — enrutador hash muy ligero (#/ruta/param).
 * Cada página se registra con un nombre y una función render(container, params).
 */
const routes = new Map();
let notFoundHandler = null;
let currentRoute = null;
const onChangeCallbacks = [];

export function registerRoute(name, renderFn) {
  routes.set(name, renderFn);
}

export function registerNotFound(fn) { notFoundHandler = fn; }

export function onRouteChange(cb) { onChangeCallbacks.push(cb); }

export function navigate(hash) {
  if (location.hash === hash) {
    // Forzar re-render aunque sea la misma ruta (útil para refrescar datos)
    resolveRoute();
  } else {
    location.hash = hash;
  }
}

export function currentRouteName() { return currentRoute; }

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '') || 'dashboard';
  const [name, ...rest] = raw.split('/');
  const params = {};
  for (let i = 0; i < rest.length; i += 2) {
    if (rest[i]) params[rest[i]] = decodeURIComponent(rest[i + 1] ?? '');
  }
  return { name, params };
}

function resolveRoute() {
  const container = document.getElementById('page-content');
  const { name, params } = parseHash();
  currentRoute = name;
  const renderFn = routes.get(name) || notFoundHandler;
  container.innerHTML = '';
  container.classList.remove('page-enter');
  // eslint-disable-next-line no-void
  void container.offsetWidth; // reflow para reiniciar animación
  container.classList.add('page-enter');
  if (renderFn) renderFn(container, params);
  onChangeCallbacks.forEach((cb) => cb(name, params));
}

export function startRouter() {
  window.addEventListener('hashchange', resolveRoute);
  resolveRoute();
}
