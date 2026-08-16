/**
 * phases.js
 * -----------------------------------------------------------------------
 * Fases del plan de estudio, de A0 (cero absoluto) a B2 (avanzado).
 * `threshold` es el % acumulado de días de estudio de UN idioma en el
 * que arranca la fase (0 a 1). El generador de plan calcula primero
 * cuántos días totales tendrá cada idioma en el año y luego reparte
 * las fases proporcionalmente, así el sistema se adapta automáticamente
 * al horario semanal configurado por el usuario.
 * -----------------------------------------------------------------------
 */
export const PHASES = [
  {
    code: 'A0',
    name: 'A0 · Cero absoluto',
    threshold: 0,
    objectives: [
      'Reconocer el sistema de escritura y sonidos base del idioma',
      'Memorizar saludos, presentaciones y frases de supervivencia',
      'Entender y usar números, días y datos personales básicos',
    ],
    competencies: ['Alfabeto / sistema de escritura', 'Fonética básica', 'Vocabulario de supervivencia'],
  },
  {
    code: 'A1',
    name: 'A1 · Principiante',
    threshold: 0.08,
    objectives: [
      'Construir oraciones simples en presente',
      'Describir a tu familia, tu rutina y tu entorno cercano',
      'Comprender diálogos cortos y muy pausados',
    ],
    competencies: ['Gramática básica (presente, artículos, plural)', 'Vocabulario cotidiano', 'Comprensión auditiva guiada'],
  },
  {
    code: 'A2',
    name: 'A2 · Elemental',
    threshold: 0.25,
    objectives: [
      'Narrar eventos pasados y planes futuros simples',
      'Mantener conversaciones cortas sobre temas conocidos',
      'Leer textos breves adaptados (noticias simples, diálogos)',
    ],
    competencies: ['Pasado y futuro simple', 'Conectores básicos', 'Listening semi-natural'],
  },
  {
    code: 'B1',
    name: 'B1 · Intermedio',
    threshold: 0.45,
    objectives: [
      'Expresar opiniones y justificar decisiones',
      'Comprender la idea principal de audio/video no adaptado',
      'Escribir textos conectados de varios párrafos',
    ],
    competencies: ['Subordinadas', 'Registro formal/informal', 'Shadowing de contenido nativo'],
  },
  {
    code: 'B2',
    name: 'B2 · Intermedio alto',
    threshold: 0.70,
    objectives: [
      'Argumentar con fluidez temas abstractos',
      'Comprender la mayoría de medios nativos sin adaptar',
      'Producir textos y discursos complejos con pocos errores',
    ],
    competencies: ['Matices gramaticales', 'Idiomatic expressions', 'Producción oral fluida'],
  },
];

/** Dado un progreso 0..1 dentro del idioma, devuelve el objeto de fase correspondiente. */
export function phaseForProgress(progress) {
  let current = PHASES[0];
  for (const p of PHASES) {
    if (progress >= p.threshold) current = p;
  }
  return current;
}

export function phaseIndex(code) { return PHASES.findIndex((p) => p.code === code); }
