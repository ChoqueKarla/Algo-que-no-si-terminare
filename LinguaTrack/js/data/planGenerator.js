/**
 * planGenerator.js
 * -----------------------------------------------------------------------
 * Motor que genera el plan de 365 días a partir del horario semanal
 * configurado por el usuario. No hay 365 días escritos a mano: se
 * generan combinando fase (A0-B2), tema del día y plantillas por
 * habilidad, todo rotando con desfases distintos por habilidad para
 * que las combinaciones no se repitan de forma idéntica día a día,
 * y con dificultad y duración creciendo con la fase.
 * -----------------------------------------------------------------------
 */
import { toISODate, addDays, weekdayKey, pick } from '../core/utils.js';
import { phaseForProgress, PHASES } from './phases.js';
import { LANGUAGES } from './languages.js';
import { buildSeedGrammar } from './grammarSeed.js';
import { getPhrasesForTheme } from './phraseBank.js';

const TOTAL_DAYS = 365;

/**
 * Cada entrada liga un TEMA del día con su(s) categoría(s) de vocabulario
 * correspondiente (de vocabularySeed.js), para que en un mismo día el
 * tema, el vocabulario y las 4 destrezas hablen siempre de lo mismo.
 * Ordenados de forma pedagógica: primero supervivencia (saludos,
 * presentaciones, números...), luego entorno cercano, y por último
 * temas más abstractos/técnicos.
 */
const THEMES = [
  { topic: 'Saludos y primer contacto', categories: ['Saludos'] },
  { topic: 'Presentarte a ti mismo', categories: ['Presentaciones'] },
  { topic: 'Números y datos personales', categories: ['Números'] },
  { topic: 'Colores y descripciones simples', categories: ['Colores'] },
  { topic: 'Tu rutina diaria y el tiempo', categories: ['Tiempo'] },
  { topic: 'Tu familia', categories: ['Familia'] },
  { topic: 'La casa', categories: ['Casa'] },
  { topic: 'Comida y bebidas', categories: ['Comida', 'Bebidas'] },
  { topic: 'Animales', categories: ['Animales'] },
  { topic: 'El clima', categories: ['Clima'] },
  { topic: 'Ropa', categories: ['Ropa'] },
  { topic: 'La ciudad y el transporte', categories: ['Ciudad', 'Transporte'] },
  { topic: 'De compras', categories: ['Compras'] },
  { topic: 'La universidad y el estudio', categories: ['Universidad'] },
  { topic: 'El trabajo', categories: ['Trabajo'] },
  { topic: 'Viajes y aeropuertos', categories: ['Viajes'] },
  { topic: 'Salud y el cuerpo humano', categories: ['Salud', 'Hospital', 'Cuerpo humano'] },
  { topic: 'Sentimientos y emociones', categories: ['Sentimientos'] },
  { topic: 'La naturaleza', categories: ['Naturaleza'] },
  { topic: 'Emergencias', categories: ['Emergencias'] },
  { topic: 'Deportes', categories: ['Deportes'] },
  { topic: 'Tecnología', categories: ['Tecnología'] },
  { topic: 'Computadoras y programación', categories: ['Computadoras', 'Programación'] },
  { topic: 'Internet y redes sociales', categories: ['Internet', 'Redes'] },
  { topic: 'Inteligencia artificial', categories: ['Inteligencia Artificial'] },
  { topic: 'Videojuegos', categories: ['Videojuegos'] },
  { topic: 'Música', categories: ['Música'] },
  { topic: 'Películas', categories: ['Películas'] },
  { topic: 'Negocios', categories: ['Negocios'] },
];


const LISTENING_TEMPLATES = [
  'Escuchar un audio corto (2-4 min) sobre "{topic}" y anotar 5 palabras nuevas',
  'Ver un video de 5 minutos sobre "{topic}" con subtítulos en el idioma meta',
  'Escuchar una canción relacionada con "{topic}" y transcribir el coro',
  'Escuchar un diálogo nativo sobre "{topic}" y responder 3 preguntas de comprensión',
  'Escuchar un podcast para principiantes sobre "{topic}"',
];

const SPEAKING_TEMPLATES = [
  'Grabarte hablando 1 minuto sobre "{topic}" usando el vocabulario nuevo',
  'Practicar un mini diálogo imaginario sobre "{topic}" en voz alta',
  'Responder en voz alta 5 preguntas típicas sobre "{topic}"',
  'Describir en voz alta una imagen relacionada con "{topic}"',
];

const READING_TEMPLATES = [
  'Leer un texto corto adaptado sobre "{topic}" y subrayar palabras desconocidas',
  'Leer un diálogo sobre "{topic}" y traducirlo mentalmente',
  'Leer titulares o frases simples relacionadas con "{topic}"',
  'Leer un fragmento de historia/cuento relacionado con "{topic}"',
];

const WRITING_TEMPLATES = [
  'Escribir 3 oraciones propias usando el vocabulario de "{topic}"',
  'Escribir un mini diario (3-5 líneas) relacionado con "{topic}"',
  'Escribir un diálogo corto imaginario sobre "{topic}"',
  'Responder por escrito 3 preguntas sobre "{topic}"',
];

const SHADOWING_TEMPLATES = [
  'Shadowing: repetir en simultáneo un audio de 1 minuto sobre "{topic}"',
  'Shadowing de una frase clave sobre "{topic}", repetir 10 veces',
  'Shadowing de un diálogo corto sobre "{topic}" imitando entonación',
];

const RESOURCES_POOL = [
  'Canal de YouTube para principiantes del idioma', 'App de repaso (Anki / la sección Repasos de esta app)',
  'Podcast recomendado para el nivel actual', 'Serie o película con subtítulos en el idioma meta',
  'Diccionario/traductor para dudas puntuales', 'Comunidad o intercambio de idiomas online',
];

const PRONUNCIATION_TARGETS = {
  en: ['th (think/this)', 'r vs l', 'vocales largas vs cortas', 'terminación -ed', 'acentuación de palabras', 'entonación de preguntas'],
  ko: ['ㄹ (r/l coreana)', 'consonantes tensas (ㄲㄸㅃㅆㅉ)', 'ㅓ vs ㅗ', 'batchim (consonante final)', 'entonación de oraciones', 'ㅢ (eu+i)'],
  zh: ['tono 1 vs tono 4', 'zh/ch/sh vs z/c/s', 'ü vs u', 'tono neutro', 'combinación de tonos 3+3', 'j/q/x'],
};

/**
 * PERSONALIZACIÓN POR IDIOMA SEGÚN SU COMPLEJIDAD
 * -----------------------------------------------------------------------
 * Un idioma por día, rotando según tu horario semanal (ej. lunes inglés,
 * martes coreano, miércoles chino...). Todas las sesiones duran 30
 * minutos fijos (pedido explícito). El inglés comparte el alfabeto
 * latino con el español: no necesita una fase separada para "aprender a
 * leer". El coreano (Hangul) y el chino (tonos + caracteres + pinyin) sí.
 *
 *  1) SCRIPT_TRACKS: bloque dedicado de 12 sesiones al INICIO de ko y zh
 *     para aprender a leer/oír antes de tocar vocabulario temático.
 *  2) MINI_EXAM_INTERVAL: los idiomas más demandantes se autoevalúan con
 *     más frecuencia (zh cada 6 sesiones, ko cada 7, en cada 8).
 * -----------------------------------------------------------------------
 */
const MINI_EXAM_INTERVAL = { en: 8, ko: 7, zh: 6 };


const KO_SCRIPT_TRACK = [
  {
    topic: 'Hangul: vocales básicas ㅏㅑㅓㅕ',
    objective: 'Reconocer y pronunciar las 4 primeras vocales del Hangul',
    vocabulary: 'Las vocales ㅏ (a), ㅑ (ya), ㅓ (eo), ㅕ (yeo)',
    listening: 'Escuchar la pronunciación de cada vocal y repetirla en voz alta 10 veces',
    speaking: 'Pronunciar en cadena "아 야 어 여" cinco veces seguidas',
    reading: 'Reconocer las 4 vocales en una tabla de Hangul sin mezclarlas con otras letras',
    writing: 'Trazar cada vocal 10 veces siguiendo el orden correcto de trazos (de arriba hacia abajo, de izquierda a derecha)',
    pronunciation: 'Diferenciar claramente ㅓ (eo, boca más abierta) de ㅗ (o, se ve mañana)',
    shadowing: 'Repetir un audio que pronuncia las 4 vocales en orden, imitando el tono',
    resources: ['Tabla de Hangul para imprimir', 'Video "Hangul vocales básicas" en YouTube'],
  },
  {
    topic: 'Hangul: vocales ㅗㅛㅜㅠ',
    objective: 'Sumar 4 vocales más a tu lectura del Hangul',
    vocabulary: 'ㅗ (o), ㅛ (yo), ㅜ (u), ㅠ (yu)',
    listening: 'Escuchar pares ㅓ/ㅗ y ㅜ/ㅠ para no confundirlos',
    speaking: 'Pronunciar en cadena "오 요 우 유" cinco veces seguidas',
    reading: 'Identificar estas 4 vocales mezcladas con las de ayer en una tabla',
    writing: 'Trazar cada vocal 10 veces',
    pronunciation: 'Redondear bien los labios en ㅗ y ㅜ (a diferencia del español)',
    shadowing: 'Repetir un audio con las 8 vocales aprendidas hasta ahora',
    resources: ['Tabla de Hangul para imprimir', 'App de trazos de Hangul'],
  },
  {
    topic: 'Hangul: vocales ㅡㅣㅐㅔ',
    objective: 'Completar el set de vocales básicas del Hangul',
    vocabulary: 'ㅡ (eu), ㅣ (i), ㅐ (ae), ㅔ (e)',
    listening: 'Escuchar la diferencia (sutil) entre ㅐ y ㅔ',
    speaking: 'Pronunciar en cadena "으 이 애 에" cinco veces seguidas',
    reading: 'Leer las 10 vocales básicas completas en orden alfabético',
    writing: 'Trazar cada vocal 10 veces',
    pronunciation: 'ㅡ no existe en español: labios estirados, sin redondear',
    shadowing: 'Repetir un audio con las 10 vocales básicas completas',
    resources: ['Tabla de Hangul para imprimir'],
  },
  {
    topic: 'Hangul: consonantes ㄱㄴㄷㄹ',
    objective: 'Aprender las primeras 4 consonantes del Hangul',
    vocabulary: 'ㄱ (g/k), ㄴ (n), ㄷ (d/t), ㄹ (r/l)',
    listening: 'Escuchar cada consonante combinada con la vocal ㅏ (가나다라)',
    speaking: 'Pronunciar en cadena "가 나 다 라"',
    reading: 'Reconocer estas 4 consonantes de forma aislada (sin vocal)',
    writing: 'Trazar cada consonante 10 veces',
    pronunciation: 'ㄹ es un sonido intermedio entre "r" y "l" del español',
    shadowing: 'Repetir un audio con las 4 consonantes + vocal ㅏ',
    resources: ['Tabla de Hangul para imprimir'],
  },
  {
    topic: 'Hangul: consonantes ㅁㅂㅅㅇ',
    objective: 'Sumar 4 consonantes más, incluida la especial ㅇ',
    vocabulary: 'ㅁ (m), ㅂ (b/p), ㅅ (s), ㅇ (muda al inicio de sílaba, "ng" al final)',
    listening: 'Escuchar por qué ㅇ no suena al inicio pero sí al final de un bloque',
    speaking: 'Pronunciar en cadena "마 바 사 아"',
    reading: 'Reconocer estas 4 consonantes mezcladas con las de ayer',
    writing: 'Trazar cada consonante 10 veces',
    pronunciation: 'ㅅ antes de ㅣ suena como "sh" suave, no como "s" pura',
    shadowing: 'Repetir un audio con las 8 consonantes aprendidas hasta ahora',
    resources: ['Tabla de Hangul para imprimir'],
  },
  {
    topic: 'Hangul: consonantes ㅈㅊㅋㅌㅍㅎ',
    objective: 'Completar el set de consonantes básicas del Hangul',
    vocabulary: 'ㅈ (j), ㅊ (ch), ㅋ (k), ㅌ (t), ㅍ (p), ㅎ (h)',
    listening: 'Escuchar la diferencia entre ㅈ (suave) y ㅊ (aspirada, con más aire)',
    speaking: 'Pronunciar en cadena "자 차 카 타 파 하"',
    reading: 'Leer las 14 consonantes básicas completas en orden',
    writing: 'Trazar cada consonante 10 veces',
    pronunciation: 'Las aspiradas (ㅊㅋㅌㅍ) llevan un golpe de aire extra: prueba con una mano frente a la boca',
    shadowing: 'Repetir un audio con las 14 consonantes básicas completas',
    resources: ['Tabla de Hangul para imprimir'],
  },
  {
    topic: 'Formación de bloques silábicos (consonante + vocal)',
    objective: 'Combinar por primera vez consonante + vocal en un bloque silábico',
    vocabulary: 'Bloques CV: 가 나 다 라 마 바 사 아 자 차 카 타 파 하',
    listening: 'Escuchar la fila completa de bloques 가-하 y repetir cada uno',
    speaking: 'Leer en voz alta toda la fila de bloques 가-하',
    reading: 'Leer en voz alta la fila completa de bloques (sin romanización de apoyo)',
    writing: 'Escribir cada bloque silábico 3 veces dentro de su cuadro imaginario',
    pronunciation: 'El bloque se arma siempre de arriba a abajo y de izquierda a derecha',
    shadowing: 'Repetir un audio que lee la fila 가-하 a velocidad normal',
    resources: ['Cuadrícula de práctica de bloques Hangul'],
  },
  {
    topic: 'Bloques con consonante final (batchim)',
    objective: 'Aprender a leer sílabas con una tercera letra al final (batchim)',
    vocabulary: 'Bloques CVC: 각 간 갈 감 갑 강',
    listening: 'Escuchar cómo cambia el sonido final según el batchim',
    speaking: 'Pronunciar en cadena "각 간 갈 감 갑 강" notando el cierre de cada sílaba',
    reading: 'Leer bloques con batchim y notar cómo se "corta" el sonido final',
    writing: 'Escribir 6 bloques con batchim, 2 veces cada uno',
    pronunciation: 'El batchim no se "abre" como una sílaba nueva: se corta seco',
    shadowing: 'Repetir un audio con los 6 bloques con batchim',
    resources: ['Cuadrícula de práctica de bloques Hangul'],
  },
  {
    topic: 'Consonantes tensas ㄲㄸㅃㅆㅉ',
    objective: 'Distinguir consonantes tensas de las simples y aspiradas',
    vocabulary: 'ㄲ (kk), ㄸ (tt), ㅃ (pp), ㅆ (ss), ㅉ (jj)',
    listening: 'Escuchar tríos 가/카/까, 다/타/따 y distinguir simple/aspirada/tensa',
    speaking: 'Pronunciar los 5 pares tensos con tensión en la garganta, sin aire extra',
    reading: 'Reconocer consonantes tensas dentro de palabras completas',
    writing: 'Trazar cada consonante tensa 8 veces (se escriben duplicando el trazo)',
    pronunciation: 'Diferenciar consonante tensa (ㄲ, sin aire, tensa) de aspirada (ㅋ, con aire) y simple (ㄱ)',
    shadowing: 'Repetir un audio con los 5 tríos simple/aspirada/tensa',
    resources: ['Audio comparativo de consonantes coreanas'],
  },
  {
    topic: 'Lectura de palabras reales en Hangul',
    objective: 'Aplicar todo lo aprendido leyendo palabras reales sin apoyo de romanización',
    vocabulary: 'Palabras de la categoría "Saludos" (ya guardadas en Vocabulario), ahora leídas directamente en Hangul: 안녕하세요, 감사합니다',
    listening: 'Escuchar las palabras y verificar tu lectura contra el audio',
    speaking: 'Leer en voz alta 5 palabras de la categoría Saludos tapando la romanización',
    reading: 'Leer sin romanización 5 palabras guardadas en la categoría "Saludos"',
    writing: 'Copiar cada palabra 2 veces de memoria, sin mirar',
    pronunciation: 'Enlazar sílabas de forma fluida, sin pausas entre bloques',
    shadowing: 'Repetir el audio de cada palabra intentando igualar el ritmo',
    resources: ['Tu propia lista en la sección Vocabulario > Saludos'],
  },
  {
    topic: 'Escritura a mano de Hangul',
    objective: 'Ganar fluidez escribiendo Hangul a mano, no solo leyéndolo',
    vocabulary: '15 palabras cortas ya vistas, para copiar a mano',
    listening: 'Escuchar cada palabra antes de escribirla (dictado simple)',
    speaking: 'Decir cada palabra en voz alta antes de escribirla',
    reading: 'Releer lo que escribiste y verificar contra el original',
    writing: 'Copiar a mano 15 palabras cortas en Hangul, cuidando el orden de trazos',
    pronunciation: 'Repasar mentalmente el sonido de cada bloque mientras lo escribes',
    shadowing: 'No aplica hoy: el foco es escritura manual',
    resources: ['Cuaderno o app de práctica de trazos'],
  },
  {
    topic: 'Repaso y examen de lectura de Hangul',
    objective: 'Confirmar que puedes leer cualquier bloque silábico de Hangul sin ayuda de romanización antes de avanzar a vocabulario temático',
    vocabulary: 'Repaso combinado de las 40 vocales/consonantes y bloques vistos esta semana y media',
    listening: 'Escuchar 10 palabras nuevas (no vistas antes) e intentar transcribirlas en Hangul',
    speaking: 'Leer en voz alta un texto corto de 3-4 líneas en Hangul',
    reading: 'Leer un texto corto de 3-4 líneas sin romanización',
    writing: 'Transcribir en Hangul las 10 palabras escuchadas',
    pronunciation: 'Autoevaluar qué letras todavía confundes y anotarlas en Notas',
    shadowing: 'Repetir el texto corto completo imitando el ritmo natural',
    resources: ['Mini examen de lectura de Hangul (sección Exámenes)'],
  },
];

const ZH_SCRIPT_TRACK = [
  {
    topic: 'Los 4 tonos del mandarín (tono 1 y 2)',
    objective: 'Distinguir auditivamente y producir el tono 1 (plano) y el tono 2 (ascendente)',
    vocabulary: 'mā (妈, 1er tono, "mamá") y má (麻, 2do tono, "cáñamo")',
    listening: 'Escuchar pares mínimos de tono 1 vs tono 2 y distinguirlos',
    speaking: 'Practicar en voz alta "mā-má-mā-má" exagerando la entonación',
    reading: 'Reconocer las marcas de tono (ā/á) sobre las vocales en pinyin',
    writing: 'Escribir 10 sílabas con tono 1 y 10 con tono 2 marcando el acento correctamente',
    pronunciation: 'Tono 1: plano y sostenido, como cantar una sola nota. Tono 2: sube como una pregunta corta',
    shadowing: 'Repetir un audio que alterna tono 1 y tono 2 en la misma sílaba',
    resources: ['Gráfico de los 4 tonos del mandarín', 'Video "Mandarin tones for beginners"'],
  },
  {
    topic: 'Los 4 tonos del mandarín (tono 3 y 4)',
    objective: 'Distinguir y producir el tono 3 (descendente-ascendente) y el tono 4 (descendente fuerte)',
    vocabulary: 'mǎ (马, 3er tono, "caballo") y mà (骂, 4to tono, "regañar")',
    listening: 'Escuchar pares mínimos de tono 3 vs tono 4 y distinguirlos',
    speaking: 'Practicar en voz alta "mǎ-mà-mǎ-mà"',
    reading: 'Reconocer las 4 marcas de tono juntas: ā á ǎ à',
    writing: 'Escribir 10 sílabas con tono 3 y 10 con tono 4',
    pronunciation: 'Tono 3: la voz cae y luego sube (como dudar). Tono 4: cae fuerte y rápido, como una orden',
    shadowing: 'Repetir un audio con los 4 tonos completos sobre "ma"',
    resources: ['Gráfico de los 4 tonos del mandarín'],
  },
  {
    topic: 'Combinación de los 4 tonos + tono neutro',
    objective: 'Practicar los 4 tonos combinados en palabras de 2 sílabas, más el tono neutro',
    vocabulary: 'māma (妈妈, mamá, tono1+neutro), yéye (爷爷, abuelo, tono2+neutro), 吗 (partícula de pregunta, tono neutro)',
    listening: 'Escuchar 8 palabras de 2 sílabas e identificar la combinación de tonos',
    speaking: 'Practicar māma y bàba (papá) cuidando que el segundo tono sea neutro (corto y sin énfasis)',
    reading: 'Leer 8 palabras marcadas con su combinación de tonos',
    writing: 'Transcribir en pinyin con tonos 8 palabras escuchadas',
    pronunciation: 'El tono neutro es corto, débil y sin marca; depende del tono anterior',
    shadowing: 'Repetir las 8 palabras de 2 sílabas imitando el ritmo tonal',
    resources: ['Lista de palabras comunes de 2 sílabas con tonos'],
  },
  {
    topic: 'Pinyin: iniciales b p m f d t n l',
    objective: 'Aprender a pronunciar y reconocer las primeras 8 iniciales del pinyin',
    vocabulary: 'bā pā mā fā, dā tā nā lā',
    listening: 'Escuchar cada inicial combinada con "a" y repetirla',
    speaking: 'Pronunciar en cadena las 8 iniciales con la vocal "a"',
    reading: 'Reconocer estas 8 iniciales en palabras de pinyin',
    writing: 'Escribir 8 sílabas combinando cada inicial con una vocal distinta',
    pronunciation: 'b/p y d/t se diferencian por aspiración (aire), no por sonoridad como en español',
    shadowing: 'Repetir un audio con las 8 iniciales en cadena',
    resources: ['Tabla de iniciales del pinyin'],
  },
  {
    topic: 'Pinyin: iniciales g k h j q x',
    objective: 'Sumar 6 iniciales más, incluidas las palatales j/q/x',
    vocabulary: 'gā kā hā, jī qī xī',
    listening: 'Escuchar la diferencia entre g/k (aspiración) y j/q/x (punto de articulación)',
    speaking: 'Pronunciar en cadena "gā kā hā jī qī xī"',
    reading: 'Reconocer estas 6 iniciales en palabras de pinyin',
    writing: 'Escribir 6 sílabas combinando cada inicial con una vocal',
    pronunciation: 'j/q/x se pronuncian con la lengua plana contra el paladar, sonido "suave"',
    shadowing: 'Repetir un audio con las 6 iniciales en cadena',
    resources: ['Tabla de iniciales del pinyin'],
  },
  {
    topic: 'Pinyin: iniciales retroflejas y sibilantes (zh ch sh r / z c s)',
    objective: 'Distinguir las iniciales más difíciles del pinyin para hispanohablantes',
    vocabulary: 'zhī chī shī rī, zī cī sī',
    listening: 'Escuchar pares zh/z, ch/c, sh/s y marcar cuál es cuál',
    speaking: 'Pronunciar "zhī chī shī rī" con la lengua curvada hacia atrás, luego "zī cī sī" con la lengua adelante',
    reading: 'Reconocer estas iniciales en palabras de pinyin sin confundirlas',
    writing: 'Escribir 6 sílabas combinando cada inicial con una vocal',
    pronunciation: 'Diferenciar zh/ch/sh (lengua hacia atrás, retrofleja) de z/c/s (lengua hacia adelante, dental)',
    shadowing: 'Repetir un audio que alterna ambos grupos varias veces',
    resources: ['Audio comparativo zh/ch/sh vs z/c/s'],
  },
  {
    topic: 'Pinyin: finales simples y compuestas (a o e i u ü)',
    objective: 'Completar el sistema de pinyin con las finales más comunes',
    vocabulary: 'ai ei ao ou an en ang eng',
    listening: 'Escuchar cada final y repetirla',
    speaking: 'Pronunciar en cadena las 8 finales compuestas',
    reading: 'Reconocer estas finales dentro de palabras completas de pinyin',
    writing: 'Escribir 8 sílabas usando cada final compuesta',
    pronunciation: 'ü no existe en español: labios redondeados como "u" pero lengua en posición de "i"',
    shadowing: 'Repetir un audio con las 8 finales compuestas',
    resources: ['Tabla completa de pinyin (iniciales x finales)'],
  },
  {
    topic: 'Trazos básicos de escritura de caracteres',
    objective: 'Aprender los trazos fundamentales con los que se construye cualquier carácter chino',
    vocabulary: 'Los 8 trazos básicos: horizontal 一, vertical 丨, punto 丶, gancho 亅, elevación 提, entre otros',
    listening: 'Ver un video que nombra cada trazo mientras se dibuja',
    speaking: 'Nombrar en voz alta cada trazo mientras lo trazas',
    reading: 'Identificar cada trazo dentro de caracteres simples (十, 人, 大)',
    writing: 'Practicar cada uno de los 8 trazos básicos 10 veces siguiendo el orden correcto (izquierda→derecha, arriba→abajo)',
    pronunciation: 'No aplica hoy: el foco es la escritura',
    shadowing: 'No aplica hoy: el foco es la escritura',
    resources: ['Video "Trazos básicos del chino" en YouTube', 'App de práctica de trazos (ej. Skritter)'],
  },
  {
    topic: 'Radicales comunes',
    objective: 'Reconocer los radicales (componentes) más frecuentes de los caracteres chinos',
    vocabulary: 'Radicales: 亻(persona), 氵(agua), 木(árbol), 口(boca), 女(mujer)',
    listening: 'Escuchar el nombre de cada radical y su significado asociado',
    speaking: 'Decir en voz alta el significado de cada radical al verlo',
    reading: 'Reconocer estos 5 radicales dentro de caracteres compuestos (他, 你, 河, 好)',
    writing: 'Escribir cada radical 8 veces de forma aislada',
    pronunciation: 'No aplica hoy: el foco es reconocimiento visual',
    shadowing: 'No aplica hoy: el foco es reconocimiento visual',
    resources: ['Tabla de los 20 radicales más comunes'],
  },
  {
    topic: 'Primeros caracteres: números',
    objective: 'Escribir y leer tus primeros caracteres completos: los números del 1 al 10',
    vocabulary: '一二三四五 (1-5) y 六七八九十 (6-10)',
    listening: 'Escuchar los números del 1 al 10 en mandarín y asociarlos al carácter',
    speaking: 'Contar en voz alta del 1 al 10 en mandarín',
    reading: 'Leer los 10 caracteres sin ayuda de pinyin',
    writing: 'Escribir del 1 al 10 en caracteres, 3 veces cada uno, respetando el orden de trazos',
    pronunciation: 'Cuidar especialmente el tono de sì (4°, tono 4) y qī (7, tono 1)',
    shadowing: 'Repetir el conteo del 1 al 10 imitando el ritmo del audio',
    resources: ['Video "Números en chino mandarín"'],
  },
  {
    topic: 'Primeros caracteres: personas y elementos básicos',
    objective: 'Sumar 6 caracteres de alta frecuencia a tu lectura',
    vocabulary: '人 (persona), 大 (grande), 小 (pequeño), 中 (medio/centro), 水 (agua), 火 (fuego)',
    listening: 'Escuchar cada carácter en una palabra común (中国 Zhōngguó = China)',
    speaking: 'Leer en voz alta cada carácter y una palabra donde aparece',
    reading: 'Reconocer estos 6 caracteres mezclados con los números ya vistos',
    writing: 'Escribir cada carácter 5 veces',
    pronunciation: 'Repasar el tono de cada carácter: rén(2), dà(4), xiǎo(3), zhōng(1), shuǐ(3), huǒ(3)',
    shadowing: 'Repetir un audio con los 6 caracteres en palabras de ejemplo',
    resources: ['Lista de los 20 caracteres más frecuentes del chino'],
  },
  {
    topic: 'Repaso y examen de tonos y caracteres básicos',
    objective: 'Confirmar dominio de los 4 tonos, el pinyin básico y ~20 caracteres antes de avanzar a vocabulario temático',
    vocabulary: 'Repaso combinado de tonos, iniciales, finales, radicales y los ~20 caracteres vistos esta semana y media',
    listening: 'Escuchar 10 sílabas sueltas e identificar su tono correctamente',
    speaking: 'Leer en voz alta los números del 1 al 10 y los 6 caracteres básicos',
    reading: 'Leer un mini texto de 3-4 líneas usando solo los caracteres ya vistos',
    writing: 'Escribir de memoria los 10 números y los 6 caracteres básicos',
    pronunciation: 'Autoevaluar qué tonos todavía confundes y anotarlo en Notas',
    shadowing: 'Repetir el mini texto completo imitando tonos y ritmo',
    resources: ['Mini examen de tonos y caracteres (sección Exámenes)'],
  },
];

const SCRIPT_TRACKS = { ko: KO_SCRIPT_TRACK, zh: ZH_SCRIPT_TRACK };


/** Devuelve true si esa fecha es el día semanal de repaso/consolidación configurado. */
function isReviewDay(reviewWeekday, date) {
  return weekdayKey(date) === (reviewWeekday || 'sun');
}

function fill(template, topic) { return template.replace('{topic}', topic); }

const LANG_CODES = ['en', 'ko', 'zh'];

/** Minutos fijos por idioma por día: 30 min cada uno, todos los días (pedido explícito). */
const DAILY_MINUTES = { en: 30, ko: 30, zh: 30 };

/**
 * Identificador de la forma/estructura del plan generado. Se guarda junto
 * al plan en Storage; si algún día cambia la estructura de los datos, se
 * sube este número y la app detecta automáticamente que hay que
 * regenerar el plan (ver core/state.js → migratePlanIfNeeded), sin que
 * el usuario tenga que hacer nada ni la app se rompa con datos viejos.
 */
export const PLAN_SCHEMA = 'three-per-day-v2'; // v2: agrega frases clave reales por día (keyPhrases)

/**
 * Genera el bloque de UN idioma para UN día concreto (contenido nuevo,
 * bloque de escritura, o repaso), usando el contador acumulado de
 * sesiones "de contenido" que lleva ese idioma (n).
 */
function buildLanguageBlock(lang, n, totalContentDays, grammarByLang, isReview) {
  const progress = totalContentDays ? Math.min(n, totalContentDays) / totalContentDays : 0;
  const phase = phaseForProgress(progress);
  const phaseIdx = PHASES.findIndex((p) => p.code === phase.code);
  const duration = DAILY_MINUTES[lang] || 30;

  if (isReview) {
    // Repasamos frases de un tema ya visto (rota según cuántas sesiones de
    // contenido lleva el idioma), no solo "vocabulario en general".
    const reviewTheme = pick(THEMES, n);
    const reviewPhrases = getPhrasesForTheme(lang, reviewTheme.topic, n, 3);
    return {
      language: lang,
      phase: phase.code,
      topic: `Repaso semanal de ${LANGUAGES[lang].name}: ${reviewTheme.topic}`,
      objective: `Consolidar el vocabulario, la gramática y las frases de ${LANGUAGES[lang].name} vistas en los últimos 6 días`,
      duration,
      level: phase.code,
      vocabulary: 'Repasar las palabras marcadas como "para repasar hoy" en la pantalla Repasos',
      keyPhrases: reviewPhrases,
      grammar: 'Repasar el último tema de gramática visto esta semana',
      grammarTopicId: null,
      listening: reviewPhrases.length ? 'Reescuchar las frases de repaso de hoy y repetirlas hasta que salgan sin pensar' : 'Reescuchar el audio más difícil de la semana en este idioma',
      speaking: 'Grabarte diciendo de memoria las frases de repaso de hoy, sin mirar la pantalla',
      reading: 'Releer tus notas y frases escritas esta semana',
      writing: 'Escribir un resumen corto (3-5 líneas) de lo aprendido esta semana usando alguna frase de repaso',
      pronunciation: 'Repetir los sonidos más difíciles marcados esta semana',
      shadowing: 'Shadowing libre de cualquier audio ya usado esta semana',
      review: true,
      scriptPhase: false,
      miniExam: false,
      resources: ['Tus propias notas de la semana', 'Sección Repasos de la app'],
      status: 'pendiente',
      notes: '',
    };
  }

  // ---- Bloque dedicado de sistema de escritura (solo ko/zh, primeras 12 sesiones) ----
  const scriptTrack = SCRIPT_TRACKS[lang];
  if (scriptTrack && n <= scriptTrack.length) {
    const sd = scriptTrack[n - 1];
    // A partir del día 7 del bloque de escritura ya se leen bloques/sílabas
    // reales, así que sumamos una frase real de saludo para no quedarse
    // solo en sonidos aislados (vocales/tonos) todos esos días.
    const scriptPhrases = n >= 7 ? getPhrasesForTheme(lang, 'Saludos y primer contacto', n, 1) : [];
    return {
      language: lang,
      phase: 'A0',
      topic: sd.topic,
      objective: sd.objective,
      duration,
      level: 'A0',
      vocabulary: sd.vocabulary,
      keyPhrases: scriptPhrases,
      grammar: 'Sistema de escritura (ver Gramática, fase A0)',
      grammarTopicId: null,
      listening: sd.listening,
      speaking: sd.speaking,
      reading: sd.reading,
      writing: sd.writing,
      pronunciation: sd.pronunciation,
      shadowing: sd.shadowing,
      review: false,
      scriptPhase: true,
      miniExam: n === scriptTrack.length,
      resources: sd.resources,
      status: 'pendiente',
      notes: '',
    };
  }

  // ---- Contenido temático normal ----
  const effectiveN = scriptTrack ? n - scriptTrack.length : n;
  const examInterval = MINI_EXAM_INTERVAL[lang] || 7;
  const themeEntry = pick(THEMES, effectiveN - 1);
  const topic = themeEntry.topic;
  const category = pick(themeEntry.categories, phaseIdx);

  const grammarTopics = grammarByLang[lang] || [];
  const grammarForPhase = grammarTopics.filter((t) => t.phase === phase.code);
  const grammarPool = grammarForPhase.length ? grammarForPhase : grammarTopics;
  const grammarTopic = grammarPool.length ? pick(grammarPool, effectiveN - 1) : null;

  const pronPool = PRONUNCIATION_TARGETS[lang] || [];
  // Frases completas y reales del tema de hoy (no solo vocabulario suelto):
  // esto es lo que hace que cada sesión sea conversacional de verdad.
  const keyPhrases = getPhrasesForTheme(lang, topic, effectiveN, 3);
  const phraseCount = keyPhrases.length;

  return {
    language: lang,
    phase: phase.code,
    topic,
    objective: `${phase.name}: usar frases completas sobre "${topic}" reforzando ${grammarTopic ? grammarTopic.title.toLowerCase() : 'el vocabulario del día'}`,
    duration,
    level: phase.code,
    vocabulary: `10-12 palabras nuevas de la categoría "${category}", combinadas en las frases clave de hoy`,
    keyPhrases,
    grammar: grammarTopic ? grammarTopic.title : 'Repaso libre de gramática ya vista',
    grammarTopicId: grammarTopic ? grammarTopic.id : null,
    listening: phraseCount
      ? `Escuchar las ${phraseCount} frases clave de hoy en audio nativo y repetirlas hasta pronunciarlas fluido`
      : fill(pick(LISTENING_TEMPLATES, effectiveN + 1), topic),
    speaking: phraseCount
      ? `Decir en voz alta las ${phraseCount} frases clave de hoy, luego adaptarlas cambiando 1-2 palabras (ej. otro nombre, otro número, otro lugar)`
      : fill(pick(SPEAKING_TEMPLATES, effectiveN + 2), topic),
    reading: phraseCount
      ? `Leer las frases clave de hoy en voz alta 3 veces cada una, primero despacio y luego a ritmo natural`
      : fill(pick(READING_TEMPLATES, effectiveN + 3), topic),
    writing: phraseCount
      ? `Escribir 3 variaciones propias de las frases clave de hoy, cambiando el sujeto o el contexto`
      : fill(pick(WRITING_TEMPLATES, effectiveN + 4), topic),
    pronunciation: pronPool.length ? `Sonido objetivo: ${pick(pronPool, effectiveN)}` : 'Practicar pronunciación del vocabulario nuevo',
    shadowing: phraseCount
      ? `Shadowing de las frases clave de hoy: repetirlas en simultáneo con el audio 10 veces cada una`
      : fill(pick(SHADOWING_TEMPLATES, effectiveN + 5), topic),
    review: false,
    scriptPhase: false,
    miniExam: effectiveN % examInterval === 0,
    resources: [pick(RESOURCES_POOL, effectiveN), pick(RESOURCES_POOL, effectiveN + 3)],
    status: 'pendiente',
    notes: '',
  };
}

/**
 * Genera el plan de 365 días: LOS 3 IDIOMAS TODOS LOS DÍAS, 30 minutos
 * cada uno (90 min/día en total), con un día semanal de repaso ligero
 * (por defecto domingo) donde no se introduce contenido nuevo.
 *
 * @param {string} startDateISO fecha de inicio en formato YYYY-MM-DD
 * @param {string} reviewWeekday día de la semana para el repaso: 'sun','mon',...
 */
export function generatePlan(startDateISO, reviewWeekday = 'sun') {
  const startDate = new Date(`${startDateISO}T00:00:00`);
  const dates = Array.from({ length: TOTAL_DAYS }, (_, i) => addDays(startDate, i));

  // Días de contenido nuevo por idioma = todos los días menos los de repaso semanal.
  // Como los 3 idiomas se estudian el mismo calendario, comparten el mismo total.
  const reviewDaysCount = dates.filter((d) => isReviewDay(reviewWeekday, d)).length;
  const totalContentDays = TOTAL_DAYS - reviewDaysCount;

  const grammarByLang = buildSeedGrammar();
  const langCounter = { en: 0, ko: 0, zh: 0 };
  const plan = [];

  dates.forEach((date, idx) => {
    const dayIndex = idx + 1;
    const dateISO = toISODate(date);
    const review = isReviewDay(reviewWeekday, date);

    const languages = LANG_CODES.map((lang) => {
      if (!review) langCounter[lang] += 1;
      const n = langCounter[lang];
      return buildLanguageBlock(lang, n, totalContentDays, grammarByLang, review);
    });

    const totalMinutes = languages.reduce((s, b) => s + b.duration, 0);

    plan.push({
      index: dayIndex,
      date: dateISO,
      isReviewDay: review,
      languages,
      totalMinutes,
      notes: '',
      status: 'pendiente',
    });
  });

  return plan;
}

export { TOTAL_DAYS };
