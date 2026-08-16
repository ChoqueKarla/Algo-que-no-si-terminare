/**
 * state.js
 * -----------------------------------------------------------------------
 * Punto único de acceso al "estado" de la aplicación. Se encarga de:
 *  1) Sembrar datos de ejemplo la primera vez que se abre la app.
 *  2) Exponer getters/setters de alto nivel sobre Storage.
 *  3) Calcular estadísticas derivadas (usadas por Dashboard, Estadísticas
 *     y Logros) en un solo lugar para no duplicar lógica.
 *
 * MODELO DE PLAN: cada uno de los 365 días tiene un bloque por cada uno
 * de los 3 idiomas (day.languages = [bloqueEn, bloqueKo, bloqueZh]), 30
 * minutos cada uno. Un día de repaso semanal (day.isReviewDay) sigue
 * teniendo los 3 bloques, pero en modo repaso en vez de contenido nuevo.
 *
 * MIGRACIÓN AUTOMÁTICA: el plan guardado incluye un "sello" de versión
 * de estructura (PLAN_SCHEMA, definido en planGenerator.js). Si cambia
 * en una futura versión de la app, el plan viejo se detecta y regenera
 * solo, sin romper la app ni requerir acción manual del usuario.
 * -----------------------------------------------------------------------
 */
import { Storage, KEYS } from './storage.js';
import { toISODate, addDays, daysBetween } from './utils.js';
import { generatePlan, PLAN_SCHEMA } from '../data/planGenerator.js';
import { buildSeedVocabulary } from '../data/vocabularySeed.js';
import { buildSeedGrammar } from '../data/grammarSeed.js';
import { ACHIEVEMENTS } from '../data/achievementsData.js';
import { LANGUAGES } from '../data/languages.js';

export const DEFAULT_REVIEW_WEEKDAY = 'sun';

const DEFAULT_SETTINGS = {
  theme: 'dark',
  appLanguage: 'es',
  dailyGoalMinutes: 90, // 30 (en) + 30 (ko) + 30 (zh)
  reviewWeekday: DEFAULT_REVIEW_WEEKDAY,
  goals: { targetLevel: 'B2', targetWords: 3000 },
  sidebarCollapsed: false,
  notificationsEnabled: true,
};

const DEFAULT_PROFILE = {
  name: 'Estudiante',
  bio: 'En camino a dominar inglés, coreano y chino mandarín en 365 días, estudiando los 3 todos los días.',
  joinDate: toISODate(new Date()),
  avatarInitial: 'E',
};

/** Siembra todos los datos iniciales SOLO si la app se abre por primera vez. */
export function ensureSeeded() {
  if (Storage.has(KEYS.SEEDED)) {
    migratePlanIfNeeded();
    return;
  }

  const profile = { ...DEFAULT_PROFILE };
  const settings = { ...DEFAULT_SETTINGS };
  Storage.set(KEYS.PROFILE, profile);
  Storage.set(KEYS.SETTINGS, settings);

  const plan = generatePlan(profile.joinDate, settings.reviewWeekday);
  Storage.set(KEYS.PLAN, plan);
  Storage.set(KEYS.PLAN_META, { startDate: profile.joinDate });
  Storage.set(KEYS.PLAN_SCHEMA, PLAN_SCHEMA);

  Storage.set(KEYS.VOCAB, buildSeedVocabulary());
  Storage.set(KEYS.GRAMMAR, buildSeedGrammar());
  Storage.set(KEYS.LOGS, { listening: [], speaking: [], reading: [], writing: [], pronunciation: [], shadowing: [] });
  Storage.set(KEYS.EXAMS, []);
  Storage.set(KEYS.ACHIEVEMENTS, []);
  Storage.set(KEYS.EVENTS, []);
  Storage.set(KEYS.PROGRESS, {});
  Storage.set(KEYS.SEEDED, true);
}

/**
 * Migración automática: si el plan guardado no tiene el "sello" de la
 * estructura de datos actual (PLAN_SCHEMA) —por ejemplo, quedó de una
 * versión anterior de la app con otra forma de datos—, se regenera solo,
 * sin pedir nada al usuario y sin tocar vocabulario, gramática, logros
 * ni sesiones registradas (eso vive aparte).
 */
function migratePlanIfNeeded() {
  const storedSchema = Storage.get(KEYS.PLAN_SCHEMA, null);
  const plan = Storage.get(KEYS.PLAN, []);
  if (storedSchema === PLAN_SCHEMA && plan.length === 365) return;

  const meta = Storage.get(KEYS.PLAN_META, { startDate: toISODate(new Date()) });
  const settings = Storage.get(KEYS.SETTINGS, DEFAULT_SETTINGS);
  if (!settings.reviewWeekday) settings.reviewWeekday = DEFAULT_REVIEW_WEEKDAY;
  Storage.set(KEYS.SETTINGS, settings);

  const newPlan = generatePlan(meta.startDate, settings.reviewWeekday);
  Storage.set(KEYS.PLAN, newPlan);
  Storage.set(KEYS.PLAN_META, meta);
  Storage.set(KEYS.PLAN_SCHEMA, PLAN_SCHEMA);
  Storage.set(KEYS.PROGRESS, {}); // el checklist día a día viejo ya no aplica a la estructura nueva
}

/** Regenera el plan completo (usado cuando cambia el día de repaso o la fecha de inicio). */
export function regeneratePlan(startDateISO, reviewWeekday) {
  const plan = generatePlan(startDateISO, reviewWeekday);
  Storage.set(KEYS.PLAN, plan);
  Storage.set(KEYS.PLAN_META, { startDate: startDateISO });
  Storage.set(KEYS.PLAN_SCHEMA, PLAN_SCHEMA);
  Storage.set(KEYS.PROGRESS, {});
  return plan;
}

/** ¿Están completados los 3 bloques de idioma de un día? */
export function isDayFullyComplete(day) {
  return !!day && day.languages.every((b) => b.status === 'completado');
}

/** Fracción (0-1) de bloques completados de un día, para barras/heatmap. */
export function dayCompletionFraction(day) {
  if (!day) return 0;
  const done = day.languages.filter((b) => b.status === 'completado').length;
  return done / day.languages.length;
}

// ----------------------------------------------------------------------
// Getters / setters de alto nivel
// ----------------------------------------------------------------------
export const State = {
  getProfile() { return Storage.get(KEYS.PROFILE, DEFAULT_PROFILE); },
  setProfile(p) { Storage.set(KEYS.PROFILE, p); },

  getSettings() { return Storage.get(KEYS.SETTINGS, DEFAULT_SETTINGS); },
  setSettings(s) { Storage.set(KEYS.SETTINGS, s); },

  getPlan() { return Storage.get(KEYS.PLAN, []); },
  setPlan(plan) { Storage.set(KEYS.PLAN, plan); },
  getPlanMeta() { return Storage.get(KEYS.PLAN_META, { startDate: toISODate(new Date()) }); },

  getProgress() { return Storage.get(KEYS.PROGRESS, {}); },
  setProgress(p) { Storage.set(KEYS.PROGRESS, p); },

  getVocabulary() { return Storage.get(KEYS.VOCAB, { en: [], ko: [], zh: [] }); },
  setVocabulary(v) { Storage.set(KEYS.VOCAB, v); },

  getGrammar() { return Storage.get(KEYS.GRAMMAR, { en: [], ko: [], zh: [] }); },
  setGrammar(g) { Storage.set(KEYS.GRAMMAR, g); },

  getLogs() { return Storage.get(KEYS.LOGS, { listening: [], speaking: [], reading: [], writing: [], pronunciation: [], shadowing: [] }); },
  setLogs(l) { Storage.set(KEYS.LOGS, l); },

  getExams() { return Storage.get(KEYS.EXAMS, []); },
  setExams(e) { Storage.set(KEYS.EXAMS, e); },

  getAchievements() { return Storage.get(KEYS.ACHIEVEMENTS, []); },
  setAchievements(a) { Storage.set(KEYS.ACHIEVEMENTS, a); },

  getEvents() { return Storage.get(KEYS.EVENTS, []); },
  setEvents(e) { Storage.set(KEYS.EVENTS, e); },

  /** Índice de día del plan (1-based) para la fecha de hoy, o null si hoy está fuera del rango del plan. */
  todayPlanIndex() {
    const meta = State.getPlanMeta();
    const diff = daysBetween(new Date(`${meta.startDate}T00:00:00`), new Date());
    return diff >= 0 && diff < 365 ? diff + 1 : null;
  },

  getDayByIndex(index) {
    return State.getPlan().find((d) => d.index === index) || null;
  },
  getDayByDate(dateISO) {
    return State.getPlan().find((d) => d.date === dateISO) || null;
  },

  getLanguageBlock(day, lang) {
    return day ? day.languages.find((b) => b.language === lang) : null;
  },

  /** Marca el bloque de UN idioma de UN día como completado/pendiente. */
  markLanguageStatus(index, lang, status) {
    const plan = State.getPlan();
    const day = plan.find((d) => d.index === index);
    if (!day) return;
    const block = day.languages.find((b) => b.language === lang);
    if (!block) return;
    block.status = status;
    day.status = isDayFullyComplete(day) ? 'completado' : 'pendiente';
    State.setPlan(plan);

    const progress = State.getProgress();
    if (!progress[index]) progress[index] = {};
    if (!progress[index][lang]) progress[index][lang] = { activities: {} };
    progress[index][lang].status = status;
    progress[index][lang].completedAt = status === 'completado' ? new Date().toISOString() : null;
    State.setProgress(progress);
  },

  /** Marca los 3 bloques de idioma de un día como completados de una vez. */
  markDayFullyComplete(index) {
    const plan = State.getPlan();
    const day = plan.find((d) => d.index === index);
    if (!day) return;
    day.languages.forEach((b) => { b.status = 'completado'; });
    day.status = 'completado';
    State.setPlan(plan);

    const progress = State.getProgress();
    if (!progress[index]) progress[index] = {};
    day.languages.forEach((b) => {
      if (!progress[index][b.language]) progress[index][b.language] = { activities: {} };
      progress[index][b.language].status = 'completado';
      progress[index][b.language].completedAt = new Date().toISOString();
    });
    State.setProgress(progress);
  },
};

// ----------------------------------------------------------------------
// Estadísticas derivadas (usadas por Dashboard / Estadísticas / Logros)
// ----------------------------------------------------------------------
export function computeStats() {
  const plan = State.getPlan();
  const vocab = State.getVocabulary();
  const grammar = State.getGrammar();
  const logs = State.getLogs();
  const exams = State.getExams();

  const allWords = Object.values(vocab).flat();
  const allGrammar = Object.values(grammar).flat();

  const daysCompleted = plan.filter((d) => d.status === 'completado').length;
  const languagesTouched = new Set(
    plan.flatMap((d) => d.languages.filter((b) => b.status === 'completado').map((b) => b.language))
  ).size;

  // Racha: días consecutivos completados (los 3 idiomas del día) terminando hoy o ayer.
  const sortedCompleted = plan
    .filter((d) => d.status === 'completado')
    .map((d) => d.date)
    .sort();
  let streak = 0;
  if (sortedCompleted.length) {
    const todayISO = toISODate(new Date());
    const set = new Set(sortedCompleted);
    let cursor = set.has(todayISO) ? new Date() : addDays(new Date(), -1);
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const iso = toISODate(cursor);
      if (set.has(iso)) { streak += 1; cursor = addDays(cursor, -1); } else break;
    }
  }

  const totalLoggedMinutes = Object.values(logs).flat().reduce((sum, l) => sum + (Number(l.minutes) || 0), 0);
  const totalPlanMinutes = plan
    .flatMap((d) => d.languages)
    .filter((b) => b.status === 'completado')
    .reduce((s, b) => s + (b.duration || 0), 0);
  const totalHours = Math.round(((totalLoggedMinutes + totalPlanMinutes) / 60) * 10) / 10;

  const stats = {
    daysCompleted,
    daysTotal: 365,
    streak,
    wordsLearned: allWords.filter((w) => w.status !== 'nuevo').length,
    wordsMastered: allWords.filter((w) => w.mastered).length,
    wordsTotal: allWords.length,
    grammarMastered: allGrammar.filter((g) => g.status === 'dominado').length,
    grammarTotal: allGrammar.length,
    listeningSessions: logs.listening.length,
    speakingSessions: logs.speaking.length,
    readingSessions: logs.reading.length,
    writingSessions: logs.writing.length,
    pronunciationSessions: logs.pronunciation.length,
    shadowingSessions: logs.shadowing.length,
    examsTaken: exams.length,
    examsAvgScore: exams.length ? Math.round(exams.reduce((s, e) => s + e.score, 0) / exams.length) : 0,
    totalHours,
    languagesTouched,
    perLanguage: {},
  };

  Object.keys(LANGUAGES).forEach((code) => {
    const blocks = plan.map((d) => d.languages.find((b) => b.language === code)).filter(Boolean);
    const completed = blocks.filter((b) => b.status === 'completado');
    const lastCompleted = completed[completed.length - 1];
    stats.perLanguage[code] = {
      totalDays: blocks.length,
      completedDays: completed.length,
      words: (vocab[code] || []).filter((w) => w.status !== 'nuevo').length,
      wordsTotal: (vocab[code] || []).length,
      grammarMastered: (grammar[code] || []).filter((g) => g.status === 'dominado').length,
      grammarTotal: (grammar[code] || []).length,
      currentPhase: lastCompleted ? lastCompleted.phase : (blocks[0] ? blocks[0].phase : 'A0'),
      totalHours: Math.round((blocks.filter((b) => b.status === 'completado').reduce((s, b) => s + b.duration, 0) / 60) * 10) / 10,
    };
  });

  return stats;
}

/** Revisa el catálogo de logros contra las stats actuales y desbloquea los nuevos. Devuelve los recién desbloqueados. */
export function evaluateAchievements() {
  const stats = computeStats();
  const unlocked = State.getAchievements();
  const unlockedIds = new Set(unlocked.map((a) => a.id));
  const fresh = [];
  ACHIEVEMENTS.forEach((a) => {
    if (!unlockedIds.has(a.id) && a.check(stats)) {
      const record = { id: a.id, unlockedAt: new Date().toISOString() };
      unlocked.push(record);
      fresh.push(a);
    }
  });
  if (fresh.length) State.setAchievements(unlocked);
  return fresh;
}
