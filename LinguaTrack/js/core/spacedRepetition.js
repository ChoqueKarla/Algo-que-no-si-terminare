/**
 * spacedRepetition.js
 * -----------------------------------------------------------------------
 * Algoritmo de repetición espaciada con la progresión de intervalos
 * pedida en el brief: 1, 3, 7, 15, 30, 60, 90, 180, 365 días.
 * Al responder "la sé" se avanza un intervalo; al responder "no la sé"
 * se retrocede (mínimo al primer intervalo) y se marca como difícil.
 * -----------------------------------------------------------------------
 */
import { toISODate, addDays } from './utils.js';

export const INTERVALS = [1, 3, 7, 15, 30, 60, 90, 180, 365];

/** Inicializa el estado de repaso de una palabra recién aprendida. */
export function initReview(word, today = new Date()) {
  word.learnedDate = word.learnedDate || toISODate(today);
  word.interval = 0;
  word.repetitions = 0;
  word.status = 'aprendiendo';
  word.nextReview = toISODate(addDays(today, INTERVALS[0]));
  return word;
}

/**
 * Aplica el resultado de un repaso a una palabra y devuelve la palabra
 * actualizada (misma referencia, mutada).
 */
export function applyReview(word, remembered, today = new Date()) {
  if (!word.nextReview) initReview(word, today);

  if (remembered) {
    word.interval = Math.min(word.interval + 1, INTERVALS.length - 1);
    word.repetitions = (word.repetitions || 0) + 1;
    word.difficult = false;
    if (word.interval >= INTERVALS.length - 1 && word.repetitions >= INTERVALS.length) {
      word.mastered = true;
      word.status = 'dominada';
    } else {
      word.status = 'repasando';
    }
  } else {
    word.interval = 0;
    word.repetitions = Math.max(0, (word.repetitions || 0) - 1);
    word.difficult = true;
    word.mastered = false;
    word.status = 'repasando';
  }
  const days = INTERVALS[word.interval];
  word.nextReview = toISODate(addDays(today, days));
  return word;
}

/** Devuelve todas las palabras cuyo repaso ya vence (nextReview <= hoy) y no están dominadas-sin-vencimiento. */
export function getDueWords(words, todayISO) {
  return words.filter((w) => w.nextReview && w.nextReview <= todayISO && w.status !== 'nuevo');
}

/** Palabras que aún no han sido "aprendidas" (para introducir nuevas). */
export function getNewWords(words) {
  return words.filter((w) => w.status === 'nuevo');
}
