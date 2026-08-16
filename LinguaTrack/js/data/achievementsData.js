/**
 * achievementsData.js — catálogo de logros. `check(stats)` recibe un
 * objeto de estadísticas agregadas (ver statsEngine en pages/statistics)
 * y devuelve true/false si el logro está desbloqueado.
 */
export const ACHIEVEMENTS = [
  { id: 'first_day', title: 'Primer paso', desc: 'Completaste tu primer día de estudio', icon: '🌱', check: (s) => s.daysCompleted >= 1 },
  { id: 'streak_7', title: 'Una semana firme', desc: '7 días de racha', icon: '🔥', check: (s) => s.streak >= 7 },
  { id: 'streak_30', title: 'Hábito construido', desc: '30 días de racha', icon: '🔥', check: (s) => s.streak >= 30 },
  { id: 'streak_100', title: 'Imparable', desc: '100 días de racha', icon: '🏆', check: (s) => s.streak >= 100 },
  { id: 'streak_365', title: 'Año perfecto', desc: '365 días de racha', icon: '👑', check: (s) => s.streak >= 365 },
  { id: 'days_100', title: 'Centenario', desc: '100 días completados en total', icon: '💯', check: (s) => s.daysCompleted >= 100 },
  { id: 'days_365', title: 'Misión cumplida', desc: 'Completaste el plan de 365 días', icon: '🎓', check: (s) => s.daysCompleted >= 365 },
  { id: 'words_100', title: 'Primeras 100 palabras', desc: '100 palabras aprendidas', icon: '📘', check: (s) => s.wordsLearned >= 100 },
  { id: 'words_500', title: '500 palabras', desc: '500 palabras aprendidas', icon: '📗', check: (s) => s.wordsLearned >= 500 },
  { id: 'words_1000', title: 'Vocabulario de oro', desc: '1000 palabras aprendidas', icon: '📙', check: (s) => s.wordsLearned >= 1000 },
  { id: 'first_exam', title: 'Primer examen', desc: 'Completaste tu primer examen', icon: '📝', check: (s) => s.examsTaken >= 1 },
  { id: 'first_listening', title: 'Oído entrenado', desc: 'Registraste tu primera sesión de listening', icon: '🎧', check: (s) => s.listeningSessions >= 1 },
  { id: 'first_conversation', title: 'Primera conversación', desc: 'Registraste tu primera práctica de speaking', icon: '💬', check: (s) => s.speakingSessions >= 1 },
  { id: 'grammar_10', title: 'Gramático', desc: '10 temas de gramática dominados', icon: '📐', check: (s) => s.grammarMastered >= 10 },
  { id: 'three_languages', title: 'Políglota en marcha', desc: 'Estudiaste los 3 idiomas al menos una vez', icon: '🌍', check: (s) => s.languagesTouched >= 3 },
  { id: 'hours_50', title: '50 horas de estudio', desc: 'Acumulaste 50 horas totales', icon: '⏱️', check: (s) => s.totalHours >= 50 },
  { id: 'hours_200', title: '200 horas de estudio', desc: 'Acumulaste 200 horas totales', icon: '⏱️', check: (s) => s.totalHours >= 200 },
];
