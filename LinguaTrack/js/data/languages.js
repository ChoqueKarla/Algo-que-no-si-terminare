/**
 * languages.js
 * -----------------------------------------------------------------------
 * Registro central de idiomas. Para añadir un idioma nuevo en el futuro
 * basta con agregar una entrada aquí (y opcionalmente vocabulario /
 * gramática semilla en vocabularySeed.js y grammarSeed.js). El resto de
 * la app (plan de 365 días, dashboard, vocabulario, gramática...) lee
 * este registro dinámicamente, no hay nada hardcodeado por idioma.
 * -----------------------------------------------------------------------
 */
export const LANGUAGES = {
  en: {
    code: 'en',
    name: 'Inglés',
    flag: '🇬🇧',
    color: 'var(--lang-en)',
    badgeClass: 'badge-en',
    script: 'latin',
    pronunciationSystem: 'IPA',
  },
  ko: {
    code: 'ko',
    name: 'Coreano',
    flag: '🇰🇷',
    color: 'var(--lang-ko)',
    badgeClass: 'badge-ko',
    script: 'hangul',
    pronunciationSystem: 'Romanización revisada',
  },
  zh: {
    code: 'zh',
    name: 'Chino Mandarín',
    flag: '🇨🇳',
    color: 'var(--lang-zh)',
    badgeClass: 'badge-zh',
    script: 'hanzi',
    pronunciationSystem: 'Pinyin + tonos',
  },
};

export const LANGUAGE_LIST = Object.values(LANGUAGES);

export function getLanguage(code) {
  return LANGUAGES[code] || null;
}
