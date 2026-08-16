/**
 * storage.js
 * -----------------------------------------------------------------------
 * Capa única de acceso a LocalStorage. Todo el resto de la app SIEMPRE
 * lee/escribe datos a través de este módulo (nunca llama a localStorage
 * directamente), para que sea trivial cambiar el backend en el futuro
 * (por ejemplo a IndexedDB o a una API remota).
 * -----------------------------------------------------------------------
 */
const STORAGE_PREFIX = 'lla_'; // Language Learning App

export const KEYS = {
  PROFILE: 'profile',
  SETTINGS: 'settings',
  PLAN: 'plan',
  PLAN_META: 'plan_meta',
  PLAN_SCHEMA: 'plan_schema',
  PROGRESS: 'progress',
  VOCAB: 'vocabulary',
  GRAMMAR: 'grammar',
  LOGS: 'logs',
  EXAMS: 'exams',
  ACHIEVEMENTS: 'achievements',
  EVENTS: 'events',
  SEEDED: 'seeded_v1',
};

function k(key) { return STORAGE_PREFIX + key; }

export const Storage = {
  /** Lee y parsea JSON. Devuelve fallback si no existe o falla el parseo. */
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(k(key));
      if (raw === null || raw === undefined) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`[Storage] Error leyendo "${key}":`, e);
      return fallback;
    }
  },

  /** Serializa y guarda. Devuelve true/false según éxito. */
  set(key, value) {
    try {
      localStorage.setItem(k(key), JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[Storage] Error guardando "${key}":`, e);
      return false;
    }
  },

  remove(key) { localStorage.removeItem(k(key)); },

  has(key) { return localStorage.getItem(k(key)) !== null; },

  /** Elimina TODOS los datos de la app (usado en Configuración > Restablecer). */
  clearAll() {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  },

  /** Exporta todo el estado de la app como un objeto plano (para backup). */
  exportAll() {
    const out = {};
    Object.keys(localStorage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .forEach((key) => {
        try { out[key.replace(STORAGE_PREFIX, '')] = JSON.parse(localStorage.getItem(key)); }
        catch { /* ignore corrupt entry */ }
      });
    return out;
  },

  /** Importa un objeto previamente exportado con exportAll(). */
  importAll(data) {
    Object.entries(data).forEach(([key, value]) => Storage.set(key, value));
  },
};
