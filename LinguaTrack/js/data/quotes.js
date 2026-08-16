export const QUOTES = [
  'Un idioma nuevo es una vida nueva. — Proverbio persa',
  'Los límites de mi idioma son los límites de mi mundo. — Wittgenstein',
  'Aprender un idioma es tener una ventana más desde la que ver el mundo. — Chino, adaptado',
  'La constancia vence lo que la dicha no alcanza.',
  'Cada palabra que aprendes hoy es un puente hacia mañana.',
  'No se trata de ser perfecto, se trata de no rendirte.',
  'La fluidez se construye un día a la vez.',
  'El error es parte del camino, no el final del camino.',
  'Hoy no necesitas motivación, necesitas 20 minutos.',
  'Pequeños pasos diarios superan a grandes esfuerzos esporádicos.',
  '365 días, un idioma nuevo, una mejor versión de ti.',
  'Escuchar, hablar, leer, escribir: repite y confía en el proceso.',
  'La disciplina es el puente entre metas y logros. — Jim Rohn',
  'Practica como si nunca hubieras ganado, actúa como si nunca hubieras perdido.',
  'Un poco cada día es mucho en un año.',
];

export function quoteForDay(dayIndex) {
  return QUOTES[dayIndex % QUOTES.length];
}
